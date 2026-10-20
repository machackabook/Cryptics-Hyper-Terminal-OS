import React, {useMemo,useState,useEffect,useCallback} from 'react';
import {Activity, Shield, RefreshCw, BrainCircuit, FileCheck, CircleOff, Pause, Play} from 'lucide-react';
import {useCryptic} from '../../store/crypticContext';
import {computeBestRoute} from '../../forge/engine.mjs';
import {startLiveQuotes} from '../../forge/marketFeed.mjs';
import type {ForgeQuote,ForgeRoute} from '../../forge/engine.mjs';

const markets=['BTC/USD','ETH/USD','SOL/USD'] as const;
const venues=['coinbase','kraken'] as const;
const money=(n:number|undefined)=>typeof n==='number'&&Number.isFinite(n)
  ?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n):'UNAVAILABLE';
const num=(n:number)=>Number.isFinite(n)?n.toLocaleString('en-US',{maximumFractionDigits:2}):'—';

/** Mounted by the historical FinancialArbitrageModule and ArbitrageMonitor views. */
export const GoldenForgeFinancialModule:React.FC=()=>{
 const {addLedger,addTerminalLine}=useCryptic();
 const [enabled,setEnabled]=useState(true);
 const [quotes,setQuotes]=useState<Record<string,ForgeQuote>>({});
 const [connections,setConnections]=useState<Record<string,string>>({coinbase:'DISCONNECTED',kraken:'DISCONNECTED'});
 const [now,setNow]=useState(Date.now());
 const [symbol,setSymbol]=useState<(typeof markets)[number]>('BTC/USD');
 const [qty,setQty]=useState('0.01');
 const [buyFee,setBuyFee]=useState('0.60');
 const [sellFee,setSellFee]=useState('0.60');
 const [slippage,setSlippage]=useState('10');
 const [transfer,setTransfer]=useState('2.00');
 const [aiState,setAiState]=useState<'IDLE'|'REQUESTING'|'DONE'|'UNAVAILABLE'|'ERROR'>('IDLE');
 const [aiText,setAiText]=useState('');
 const [aiModel,setAiModel]=useState('');
 const [receipt,setReceipt]=useState('');
 useEffect(()=>{
   const timer=setInterval(()=>setNow(Date.now()),1000);
   return ()=>clearInterval(timer);
 },[]);
 useEffect(()=>{
   if(!enabled){setConnections({coinbase:'PAUSED',kraken:'PAUSED'});setQuotes({});return}
   let cancel=()=>{};
   try{cancel=startLiveQuotes(q=>setQuotes(prev=>({...prev,[q.venue+':'+q.symbol]:q})),
     (venue,status)=>setConnections(prev=>({...prev,[venue]:status})))}
   catch{setConnections({coinbase:'UNAVAILABLE',kraken:'UNAVAILABLE'})}
   return ()=>cancel();
 },[enabled]);
 const q=Number(qty), f1=Number(buyFee)/100,f2=Number(sellFee)/100,slip=Number(slippage),tr=Number(transfer);
 const inputsValid=Number.isFinite(q)&&q>=0.000001&&q<=1000&&[f1,f2,slip,tr].every(Number.isFinite)
   &&f1>=0&&f1<=0.1&&f2>=0&&f2<=0.1&&slip>=0&&slip<=1000&&tr>=0&&tr<=100000;
 const snapshots=Object.values(quotes);
 const routes:ForgeRoute[]=useMemo(()=>{
   if(!inputsValid)return [];
   return computeBestRoute(snapshots.filter(v=>v.symbol===symbol),
      {quantity:q,buyFeeRate:f1,sellFeeRate:f2,slippageBpsPerLeg:slip,transferCostUsd:tr,now});
 },[snapshots.length,Object.keys(quotes).map(k=>quotes[k].receivedAt).join(','),symbol,q,f1,f2,slip,tr,now,inputsValid]);
 const best=routes[0]||null;
 const browserFresh=snapshots.filter(v=>v.symbol===symbol&&now-v.receivedAt>=0&&now-v.receivedAt<=8000);
 const proof=useCallback(async()=>{
   if(!best||!('estimatedNetUsd' in best)||!globalThis.crypto?.subtle){setReceipt('UNVERIFIED — needs fresh quote and browser WebCrypto');return}
   const evidence={kind:'PAPER_SCENARIO',symbol,buyVenue:best.buyVenue,sellVenue:best.sellVenue,
     quotedAt:Date.now(),estNetUsd:best.estimatedNetUsd,realizedUsd:null,
     rawQuotes:snapshots.filter(v=>v.symbol===symbol),inputs:{q,f1,f2,slip,tr},status:best.status};
   const canonical=JSON.stringify(evidence);
   const bytes=new TextEncoder().encode(canonical);
   const digest=await crypto.subtle.digest('SHA-256',bytes);
   const fp=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
   addLedger('forge.paper.evidence',{symbol,fp,estimateUsd:best.estimatedNetUsd??null,
      execution:false,source:'COINBASE_KRAKEN_PUBLIC_QUOTES',classification:'PAPER'});
   addTerminalLine('[GOLDEN FORGE] Paper-only SHA-256 evidence '+fp.slice(0,16)+'. No financial transaction executed.','good');
   setReceipt(fp);
 },[best,snapshots,symbol,q,f1,f2,slip,tr,addLedger,addTerminalLine]);
 const analyze=async()=>{
   setAiState('REQUESTING');setAiText('');
   try{
     const res=await fetch('/api/forge/analyze',{method:'POST',headers:{'Content-Type':'application/json'},
       body:JSON.stringify({symbol,quotes:browserFresh,scenarios:routes.slice(0,2),
         question:'Identify evidence gaps, economic risks, latency and settlement assumptions. Do not recommend guaranteed profit.'})});
     const data=await res.json();
     if(!res.ok){setAiState('UNAVAILABLE');setAiText(data.error||data.status||'AI adapter not connected');return}
     setAiModel(data.model||'Google Gemini');setAiText(String(data.analysis||''));setAiState('DONE');
   }catch{setAiState('ERROR');setAiText('Google analysis endpoint unreachable. No analysis produced.')}
 };
 const field=(label:string,value:string,set:(x:string)=>void,step:string)=>(
   <label className="text-slate-400 text-[10px] flex flex-col gap-1">{label}
     <input type="number" min="0" step={step} value={value} onChange={e=>set(e.target.value)}
       className="bg-[#030a14] border border-cyan-900 rounded p-2 text-slate-100 w-full"/>
   </label>);
 return <section className="w-full h-full min-h-0 overflow-y-auto bg-[#030814] p-4 text-sm text-slate-100 font-mono space-y-4" aria-label="Golden Forge Financial Singularity">
   <header className="border-b border-amber-500/30 pb-3 flex flex-wrap justify-between gap-3 items-center">
     <div><h2 className="font-bold text-amber-300 tracking-wider">✦ GOLDEN FORGE · FINANCIAL SINGULARITY</h2>
       <p className="text-[11px] text-slate-400 mt-1">Exchange market data → risk-aware math → ADAM evidence → optional Google Gemini interpretation</p></div>
     <button onClick={()=>setEnabled(v=>!v)} className="text-xs border border-cyan-700 rounded px-3 py-2 flex items-center gap-2">
       {enabled?<Pause className="w-3 h-3"/>:<Play className="w-3 h-3"/>}{enabled?'Pause market feeds':'Connect public feeds'}
     </button>
   </header>
   <div className="flex gap-3 text-[11px] flex-wrap">
     {venues.map(v=><span key={v} className="text-cyan-300">{v.toUpperCase()}: {connections[v]||'UNVERIFIED'}</span>)}
     <span className="text-amber-300">MODE: READ-ONLY / PAPER · REALIZED P&L: UNVERIFIED</span>
   </div>
   <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
     <div className="lg:col-span-2 border border-cyan-900/70 p-3 rounded-xl">
       <div className="flex gap-3 justify-between items-center mb-3">
         <strong className="text-cyan-300">Live public bid / ask</strong>
         <select className="bg-[#030a14] p-1 border border-cyan-900 text-cyan-200" value={symbol}
          onChange={e=>setSymbol(e.target.value as (typeof markets)[number])}>
          {markets.map(m=><option key={m}>{m}</option>)}
         </select>
       </div>
       <table className="w-full text-left text-[11px]"><thead className="text-slate-400">
         <tr><th className="py-2">Venue</th><th>Best bid</th><th>Best ask</th><th>Feed age</th><th>Evidence</th></tr>
       </thead><tbody>{venues.map(v=>{
         const x=quotes[v+':'+symbol],age=x?now-x.receivedAt:Infinity;
         return <tr key={v} className="border-t border-slate-800">
           <td className="py-2">{v}</td><td>{x?money(x.bid):'—'}</td><td>{x?money(x.ask):'—'}</td>
           <td>{Number.isFinite(age)?num(age/1000)+' s':'NO DATA'}</td>
           <td className={x&&age<=8000?'text-cyan-300':'text-amber-300'}>{x&&age<=8000?'FRESH · QUOTE-ONLY':'MISSING / STALE'}</td>
         </tr>
       })}</tbody></table>
       <p className="text-[10px] mt-3 text-slate-400">Market quotes arrive from the venues' public WebSocket endpoints. No custody, executable depth, funding or settlement is inferred.</p>
     </div>
     <div className="border border-cyan-900/70 p-3 rounded-xl space-y-2">
       <strong className="text-cyan-300">Economic assumptions (editable)</strong>
       <div className="grid grid-cols-2 gap-2">
        {field('Base quantity',qty,setQty,'0.001')}
        {field('Buy fee (%)',buyFee,setBuyFee,'0.01')}
        {field('Sell fee (%)',sellFee,setSellFee,'0.01')}
        {field('Slippage / leg (bps)',slippage,setSlippage,'1')}
        {field('Transfer reserve (USD)',transfer,setTransfer,'0.25')}
       </div>
       {!inputsValid&&<p className="text-red-300 text-[11px]">Invalid or out-of-range assumption.</p>}
     </div>
   </div>
   <div className="border border-amber-800/70 p-3 rounded-xl space-y-3">
     <h3 className="text-amber-300 font-bold">Golden Forge · bid/ask opportunities (NOT TRADES)</h3>
     {!best?<p className="text-amber-200 text-xs">No validated cross-venue quote pair. Waiting for live observations.</p>:
       <div className="grid sm:grid-cols-2 gap-2 text-xs">
         <p>Buy: <strong>{best.buyVenue}</strong> · Sell: <strong>{best.sellVenue}</strong></p>
         <p>Status: <strong className="text-amber-300">{best.status}</strong></p>
         <p>Gross spread for {qty} {symbol.split('/')[0]}: <strong>{money(best.grossUsd)}</strong></p>
         <p>Estimated fees: <strong>{money(best.feesUsd)}</strong></p>
         <p>Slippage reserve: <strong>{money(best.slippageReserveUsd)}</strong></p>
         <p>Transfer reserve: <strong>{money(best.transferReserveUsd)}</strong></p>
         <p>After-cost paper estimate: <strong>{money(best.estimatedNetUsd)}</strong></p>
         <p>Realized proceeds: <strong className="text-amber-300">NOT VERIFIED / NO EXECUTION</strong></p>
       </div>}
     <p className="text-[11px] text-slate-400">Book depth, latency, exchange rules, slippage beyond reserve, custody, and two-leg fill probability remain unverified. An apparent spread is not risk-free.</p>
     <div className="flex flex-wrap gap-2">
       <button disabled={!best||best.estimatedNetUsd==null} onClick={proof} className="px-3 py-2 border border-emerald-700 text-emerald-300 rounded disabled:opacity-40 flex gap-2 items-center">
         <FileCheck className="w-4 h-4"/>Hash paper scenario
       </button>
       <span className="self-center text-xs text-slate-400">{receipt?('SHA-256: '+receipt.slice(0,20)+'…'):'No paper evidence captured yet'}</span>
     </div>
   </div>
   <div className="border border-purple-900/60 rounded-xl p-3 space-y-3">
     <div className="flex flex-wrap gap-2 justify-between items-center">
       <div><strong className="text-purple-300">Google Gemini · Financial Analysis Peer</strong>
         <p className="text-[10px] text-slate-400">Analysis only · never source of price quotes or order instructions</p></div>
       <button onClick={analyze} disabled={aiState==='REQUESTING'||browserFresh.length<2} className="px-3 py-2 border border-purple-700 text-purple-200 rounded disabled:opacity-40 flex gap-2">
         <BrainCircuit className="w-4 h-4"/>{aiState==='REQUESTING'?'Reasoning…':'Analyze grounded quotes'}
       </button>
     </div>
     <p className="text-[11px] text-purple-200">{aiState==='IDLE'?'NOT_REQUESTED':aiState} {aiModel&&'· '+aiModel}</p>
     {aiText&&<p className="text-[11px] whitespace-pre-wrap break-words select-text">{aiText}</p>}
   </div>
   <footer className="text-[10px] text-slate-500 flex flex-wrap gap-2 items-center">
     <Shield className="w-3 h-3"/> ADAM: browser/quote checks are measurable; exchange account funding and realized P&L remain UNVERIFIED.
     <CircleOff className="w-3 h-3"/> No live trading, Stripe charges, Cash App transfers, or authenticated balances.
   </footer>
 </section>;
};
