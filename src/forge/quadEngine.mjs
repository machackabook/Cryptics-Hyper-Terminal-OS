/**
 * Golden Forge — QUAD financial research fabric v18.
 * Four independent strategies, mathematical observability, no order placement.
 * The outputs are PAPER estimates/signals; realized P&L is ALWAYS null.
 */
import {computeBestRoute,validateQuote} from './engine.mjs';

const finite=(x)=>typeof x==='number'&&Number.isFinite(x);
const valid=(x,min,max)=>finite(x)&&x>=min&&x<=max;
const frozen=(lane,status,detail={})=>Object.freeze({
 lane,status,classification:'RESEARCH_ONLY',canExecute:false,realizedProfitUsd:null,...detail
});
const round=(n)=>Math.round((n+Number.EPSILON)*1e6)/1e6;
const quote=(quotes,venue,symbol,now)=>{
 const q=quotes.find(x=>x.venue===venue&&x.symbol===symbol);
 return validateQuote(q,now).ok?q:null;
};

// I: classical simultaneous cross-venue spot bid/ask arbitrage
export function laneCrossVenue(input={}){
 const {quotes=[],settings={},now=Date.now()}=input;
 if(!Array.isArray(quotes))return frozen('CROSS_VENUE','INVALID_INPUT');
 const validRows=quotes.filter(q=>validateQuote(q,now).ok&&q.symbol==='BTC/USD');
 if(validRows.length<2)return frozen('CROSS_VENUE','MISSING_INDEPENDENT_QUOTES');
 try{
  const routes=computeBestRoute(validRows,{now,
   quantity:settings.quantity??0.01,buyFeeRate:settings.buyFeeRate??0.006,
   sellFeeRate:settings.sellFeeRate??0.006,
   slippageBpsPerLeg:settings.slippageBpsPerLeg??10,
   transferCostUsd:settings.transferCostUsd??2});
  if(!routes.length)return frozen('CROSS_VENUE','NO_CROSS_VENUE_ROUTE');
  const top=routes[0];
  return frozen('CROSS_VENUE',top.status,{
   estimateUsd:top.estimatedNetUsd??null,route:top,
   prerequisites:['Prefunded balances on both venues','Confirmed order book depth',
    'Verified fees and withdrawal paths','Two-leg execution/fill receipts']});
 }catch(e){return frozen('CROSS_VENUE','INVALID_INPUT',{reason:String(e.message||e)})}
}

// II: USD->BTC->ETH->USD and its reverse, same venue; each leg uses real bid/ask.
export function laneTriangular(input={}){
 const {quotes=[],settings={},now=Date.now()}=input;
 const venue=settings.triangleVenue||'coinbase';
 const startUsd=settings.triangleStartUsd??1000;
 const fee=settings.triangleFeeRate??0.006;
 const slipBps=settings.triangleSlippageBps??10;
 if(!valid(startUsd,0.01,1e9)||!valid(fee,0,0.1)||!valid(slipBps,0,1000))
  return frozen('TRIANGULAR','INVALID_ASSUMPTIONS');
 if(!Array.isArray(quotes))return frozen('TRIANGULAR','INVALID_INPUT');
 const btc=quote(quotes,venue,'BTC/USD',now),eth=quote(quotes,venue,'ETH/USD',now),cross=quote(quotes,venue,'ETH/BTC',now);
 if(!btc||!eth||!cross)return frozen('TRIANGULAR','MISSING_THREE_FRESH_BOOKS',{
  venue,requiredMarkets:['BTC/USD','ETH/USD','ETH/BTC']
 });
 const factor=(1-fee)*(1-slipBps/10000);
 // Forward: spend USD to buy BTC, spend BTC to buy ETH, sell ETH for USD.
 const boughtBtc=(startUsd/btc.ask)*factor;
 const boughtEth=(boughtBtc/cross.ask)*factor;
 const forwardUsd=(boughtEth*eth.bid)*factor;
 // Reverse: spend USD to buy ETH, sell ETH for BTC, sell BTC for USD.
 const reverseEth=(startUsd/eth.ask)*factor;
 const reverseBtc=(reverseEth*cross.bid)*factor;
 const reverseUsd=(reverseBtc*btc.bid)*factor;
 const outcomes=[
  {direction:'USD_BTC_ETH_USD',outUsd:round(forwardUsd),netUsd:round(forwardUsd-startUsd),
   quantities:{btc:boughtBtc,eth:boughtEth},
   sizeVerified:[btc.askQty,cross.askQty,eth.bidQty].every(x=>finite(x))&&
    btc.askQty>=boughtBtc&&cross.askQty>=boughtEth&&eth.bidQty>=boughtEth},
  {direction:'USD_ETH_BTC_USD',outUsd:round(reverseUsd),netUsd:round(reverseUsd-startUsd),
   quantities:{eth:reverseEth,btc:reverseBtc},
   sizeVerified:[eth.askQty,cross.bidQty,btc.bidQty].every(x=>finite(x))&&
    eth.askQty>=reverseEth&&cross.bidQty>=reverseEth&&btc.bidQty>=reverseBtc}
 ];
 const best=outcomes.sort((a,b)=>b.netUsd-a.netUsd)[0];
 return frozen('TRIANGULAR',best.netUsd>0?'PAPER_POSITIVE_NOT_EXECUTABLE':'PAPER_NEGATIVE',{
  venue,initialUsd:startUsd,bestDirection:best.direction,
  estimateUsd:best.netUsd,afterCycleUsd:best.outUsd,topBookSizeVerified:best.sizeVerified,
  // A best-quote size is not evidence of guaranteed execution on three legs.
  prerequisites:['Verified three-leg depth','Independent venue account permissions','Atomicity unavailable','Execution latency']});
}

// III: fixed-expiry cash-and-carry basis (no perp funding promises).
// Futures order data is absent until a separate authenticated futures market adapter.
export function laneBasis(input={}){
 const {basis=null,settings={},now=Date.now()}=input;
 if(!basis||!basis.provenance||basis.provenance.verified!==true)
  return frozen('CASH_FUTURES_BASIS','FUTURES_FEED_NOT_CONFIGURED');
 const {spotAsk,futureBid,qty,expiryAt,sourceReceivedAt,venue,contract}=basis;
 if(![spotAsk,futureBid,qty,expiryAt,sourceReceivedAt].every(finite)||
    spotAsk<=0||futureBid<=0||qty<=0||expiryAt<=now||sourceReceivedAt>now+1000||now-sourceReceivedAt>8000)
  return frozen('CASH_FUTURES_BASIS','INVALID_OR_STALE_FUTURES_EVIDENCE');
 const days=(expiryAt-now)/86400000;
 const holdingRate=settings.basisHoldingRateAnnual??0.08;
 const roundTripFeeRate=settings.basisRoundTripFeeRate??0.008;
 const reserve=settings.basisSettlementReserveUsd??10;
 if(!valid(holdingRate,0,5)||!valid(roundTripFeeRate,0,0.2)||!valid(reserve,0,1e6))
  return frozen('CASH_FUTURES_BASIS','INVALID_ASSUMPTIONS');
 const gross=(futureBid-spotAsk)*qty;
 const holding=(spotAsk*qty)*holdingRate*days/365;
 const fees=roundTripFeeRate*(spotAsk+futureBid)*qty;
 const est=gross-holding-fees-reserve;
 return frozen('CASH_FUTURES_BASIS',est>0?'PAPER_POSITIVE_NOT_EXECUTABLE':'PAPER_NEGATIVE',{
  contract,venue,daysToExpiry:round(days),grossUsd:round(gross),
  costsUsd:round(holding+fees+reserve),estimateUsd:round(est),
  annualizedIndicativePct:round(100*(futureBid-spotAsk)/spotAsk*365/days),
  prerequisites:['Verified regulated futures access','Margin/liquidation stress','Hedge mismatch and borrow costs','Expiry & settlement confirmation']});
}

// IV: pairs/stat-arb z-score from real timestamped historical closes.
// A z-score is not a cointegration test and never authorizes a short.
export function laneStatistical(input={}){
 const {history=null,settings={},now=Date.now()}=input;
 const minPts=settings.minStatObservations??60;
 const minSpan=settings.minStatSpanMs??3600000;
 const threshold=settings.statZThreshold??2;
 if(!valid(minPts,30,20000)||!valid(minSpan,60000,365*86400000)||!valid(threshold,0.5,10))
  return frozen('STATISTICAL_PAIRS','INVALID_ASSUMPTIONS');
 if(!Array.isArray(history)||history.length<minPts)
  return frozen('STATISTICAL_PAIRS','INSUFFICIENT_HISTORICAL_DATA',{count:history?.length??0,minimum:minPts});
 const samples=history.slice(-minPts);
 if(samples.some(x=>!finite(x.at)||!finite(x.assetA)||!finite(x.assetB)||x.assetA<=0||x.assetB<=0))
  return frozen('STATISTICAL_PAIRS','INVALID_HISTORY');
 for(let i=1;i<samples.length;i++)if(samples[i].at<=samples[i-1].at)return frozen('STATISTICAL_PAIRS','UNORDERED_HISTORY');
 if(samples.at(-1).at>now+1000||now-samples.at(-1).at>8000)
  return frozen('STATISTICAL_PAIRS','STALE_LAST_SAMPLE');
 if(samples.at(-1).at-samples[0].at<minSpan)return frozen('STATISTICAL_PAIRS','HISTORY_SPAN_TOO_SHORT',{
   spanMs:samples.at(-1).at-samples[0].at,minSpanMs:minSpan});
 const xs=samples.map(x=>Math.log(x.assetA)),ys=samples.map(x=>Math.log(x.assetB));
 const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
 const mx=mean(xs),my=mean(ys);
 const den=xs.reduce((s,x)=>s+(x-mx)**2,0);
 if(den<=1e-15)return frozen('STATISTICAL_PAIRS','DEGENERATE_SERIES');
 const beta=xs.reduce((s,x,i)=>s+(x-mx)*(ys[i]-my),0)/den;
 const residuals=ys.map((y,i)=>y-(my-beta*mx)-beta*xs[i]);
 const mr=mean(residuals);
 const sigma=Math.sqrt(mean(residuals.map(x=>(x-mr)**2)));
 if(sigma<1e-12)return frozen('STATISTICAL_PAIRS','DEGENERATE_RESIDUAL');
 const z=(residuals.at(-1)-mr)/sigma;
 return frozen('STATISTICAL_PAIRS',Math.abs(z)>=threshold?'RESEARCH_DEVIATION':'NO_DEVIATION',{
  observations:minPts,zScore:round(z),hedgeBeta:round(beta),estimateUsd:null,
  cointegrationVerified:false,borrowVerified:false,
  prerequisites:['Out-of-sample validation','Engle-Granger / ADF residual stationarity test',
   'Verified borrow inventory, short costs and executable spreads','Risk-neutral sized legs']});
}

export const QUAD_LANES=Object.freeze(['CROSS_VENUE','TRIANGULAR','CASH_FUTURES_BASIS','STATISTICAL_PAIRS']);
export function evaluateLane(lane,input={}){
 switch(lane){
  case 'CROSS_VENUE':return laneCrossVenue(input);
  case 'TRIANGULAR':return laneTriangular(input);
  case 'CASH_FUTURES_BASIS':return laneBasis(input);
  case 'STATISTICAL_PAIRS':return laneStatistical(input);
  default:throw new RangeError('unknown_quad_lane');
 }
}
// Simultaneous orchestration only; the UI runs each lane in its own module Worker.
export async function evaluateQuad(input={}){
 return Promise.all(QUAD_LANES.map(async lane=>{
  try{return evaluateLane(lane,input)}catch(e){return frozen(lane,'COMPUTATION_ERROR',{reason:String(e.message||e)})}
 }));
}
// Compounding is strictly an illustrative scenario; no synthetic ledger credits.
export function projectCompounding(initialUsd,periodNetRates=[]){
 if(!valid(initialUsd,0,1e12)||!Array.isArray(periodNetRates)||periodNetRates.length>10000)
  throw new TypeError('invalid_compounding_input');
 let amount=initialUsd;
 for(const r of periodNetRates){
  if(!valid(r,-1,5))throw new TypeError('invalid_period_rate');
  amount*=1+r;
  if(!Number.isFinite(amount)||amount>1e15)throw new RangeError('compounding_overflow');
 }
 return Object.freeze({kind:'HYPOTHETICAL_ONLY',initialUsd,projectedUsd:round(amount),
  netChangeUsd:round(amount-initialUsd),realizedProfitUsd:null,withdrawableUsd:null});
}
