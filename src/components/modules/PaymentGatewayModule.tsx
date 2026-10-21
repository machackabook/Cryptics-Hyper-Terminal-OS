import React, {useCallback,useEffect,useState} from 'react';
import {CreditCard,RefreshCw,ShieldAlert,Archive} from 'lucide-react';
import {useCryptic} from '../../store/crypticContext';
type Account={id:string;provider:string;name:string;balance:number;currency:string};
type PaymentRecord={id:string;provider:string;amount:number;currency:string;status:string;created?:number;timestamp?:string};
/**
 * Payment Gateway is observational, not a fake money mover.
 * An authenticated payment provider must be implemented before displaying
 * financially authoritative balances, payouts or execution controls.
 */
export const PaymentGatewayModule:React.FC=()=>{
 const {addTerminalLine,addLedger}=useCryptic();
 const [status,setStatus]=useState('CHECKING');
 const [accounts,setAccounts]=useState<Account[]>([]);
 const [transactions,setTransactions]=useState<PaymentRecord[]>([]);
 const [loading,setLoading]=useState(false);
 const sync=useCallback(async()=>{
   setLoading(true);
   try{
     const [accRes,txRes]=await Promise.all([
       fetch('/api/payment/accounts',{cache:'no-store'}),
       fetch('/api/payment/transactions',{cache:'no-store'})
     ]);
     const [a,t]=await Promise.all([accRes.json(),txRes.json()]);
     const valid=accRes.ok&&txRes.ok&&a.success===true&&t.success===true
       &&Array.isArray(a.accounts)&&Array.isArray(t.transactions);
     if(!valid){
       setStatus(a.status||t.status||'NOT_CONFIGURED');
       setAccounts([]);setTransactions([]);
       return;
     }
     // This is transport validation only: provider-bound proofs must still
     // be implemented before these can be described as live provider balances.
     setStatus('BACKEND_RESPONSE_UNVERIFIED');
     setAccounts(a.accounts);setTransactions(t.transactions);
   }catch{
     setAccounts([]);setTransactions([]);setStatus('UNREACHABLE');
   }finally{setLoading(false)}
 },[]);
 useEffect(()=>{
   sync();
   addLedger('payment.readonly.loaded',{classification:'PROVIDER_VERIFICATION_REQUIRED',moneyMovement:false});
   addTerminalLine('[FINANCIAL GATEWAY] Provider proof required. Synthetic balances and fabricated charge handlers have been retired.','system');
 },[]);
 return <section className="flex flex-col gap-3 h-full overflow-y-auto p-4 bg-[#020814] text-slate-200 text-xs font-mono">
   <header className="border-b border-cyan-900 pb-3 flex items-center justify-between">
     <div><h2 className="font-bold text-cyan-300 text-sm">CRYPTIC FINANCIAL GATEWAY · READ-ONLY</h2>
       <p className="text-slate-400 mt-1">Real accounts only when validated against provider-origin evidence</p></div>
     <button type="button" onClick={sync} disabled={loading} className="px-2 py-2 rounded border border-cyan-900 text-cyan-300 flex items-center gap-2"><RefreshCw className="w-3 h-3"/>Refresh</button>
   </header>
   <div role="status" className="flex gap-2 border border-amber-700 rounded p-3 text-amber-300">
     <ShieldAlert className="w-4 h-4 shrink-0"/>
     <div><strong>{status}</strong>
       <p className="mt-1">A displayed number is not a bank statement. No Stripe charge, Cash App transfer or payout can be made from this module.</p>
     </div>
   </div>
   <div className="grid md:grid-cols-2 gap-3">
     <div className="border border-cyan-900 rounded p-3">
       <h3 className="text-cyan-300 font-bold flex items-center gap-2"><CreditCard className="w-4 h-4"/>Available provider records</h3>
       {accounts.length===0?<p className="text-slate-400 mt-2">No verified account balance source connected to this dashboard.</p>:
        accounts.map(a=><p key={a.id} className="mt-2">{a.provider} · {a.name} · {Number.isFinite(a.balance)?a.balance.toFixed(2):'unavailable'} {a.currency}
          <span className="block text-amber-300">Backend response; provider-source proof pending</span></p>)}
     </div>
     <div className="border border-cyan-900 rounded p-3">
       <h3 className="text-cyan-300 font-bold flex items-center gap-2"><Archive className="w-4 h-4"/>Transaction records</h3>
       {transactions.length===0?<p className="text-slate-400 mt-2">No provider-attested transactions available.</p>:
         transactions.slice(0,25).map(t=><p className="mt-2" key={t.id}>{t.provider}: {t.amount} {t.currency} · {t.status}
           <span className="block text-amber-300">Backend record; settlement not independently verified</span></p>)}
     </div>
   </div>
   <p className="text-slate-400">For arbitrage calculations, use Golden Forge. Paper simulations are never added to account balances or paid transaction ledgers.</p>
 </section>;
};
