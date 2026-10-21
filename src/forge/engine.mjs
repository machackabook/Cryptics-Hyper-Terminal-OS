/* Golden Forge Financial Singularity v17 — read-only public-market math.
 * No trades, payouts or accounts are created; prices are not an order-fill guarantee.
 */
export const QUOTE_MAX_AGE_MS=8000;
const MARKETS=new Set(['BTC/USD','ETH/USD','SOL/USD']);
const VENUES=new Set(['coinbase','kraken']);
export function normalizeQuote({venue,symbol,bid,ask,bidQty=null,askQty=null,sourceTime=null,receivedAt=Date.now()}){
 if(!VENUES.has(venue)||!MARKETS.has(symbol))throw new TypeError('unsupported_market_or_venue');
 const b=Number(bid),a=Number(ask),ts=Number(receivedAt);
 if(![b,a,ts].every(Number.isFinite)||b<=0||a<=0||b>a)throw new TypeError('invalid_bid_ask');
 let quotedAt=null;
 if(sourceTime!=null){
   const candidate=typeof sourceTime==='number'?sourceTime:Date.parse(String(sourceTime));
   if(!Number.isFinite(candidate))throw new TypeError('invalid_provider_timestamp');
   quotedAt=candidate;
 }
 return Object.freeze({venue,symbol,bid:b,ask:a,bidQty:positiveOrNull(bidQty),askQty:positiveOrNull(askQty),quotedAt,receivedAt:ts});
}
function positiveOrNull(v){const n=Number(v);return v!=null && Number.isFinite(n)&&n>0?n:null}
export function validateQuote(q,now=Date.now(),maxAgeMs=QUOTE_MAX_AGE_MS){
 if(!q)return {ok:false,reason:'MISSING_QUOTE'};
 if(!Number.isFinite(q.bid)||!Number.isFinite(q.ask)||q.bid<=0||q.ask<=0||q.bid>q.ask)return {ok:false,reason:'INVALID_PRICE'};
 if(q.receivedAt>now+1000 || now-q.receivedAt>maxAgeMs)return {ok:false,reason:'STALE_OR_FUTURE_RECEIVE_TIME'};
 if(q.quotedAt!=null&&(q.quotedAt>now+30000||now-q.quotedAt>maxAgeMs))return {ok:false,reason:'STALE_PROVIDER_TIMESTAMP'};
 return {ok:true,reason:'FRESH_QUOTE'};
}
function checked(n,label,min,max){const x=Number(n);if(!Number.isFinite(x)||x<min||x>max)throw new RangeError('invalid_'+label);return x}
export function computeRoute(buy,sell,{
 quantity=0.01,buyFeeRate=0.006,sellFeeRate=0.006,slippageBpsPerLeg=10,
 transferCostUsd=2,now=Date.now(),maxAgeMs=QUOTE_MAX_AGE_MS
}={}){
 const qty=checked(quantity,'quantity',0.000001,1000);
 const fb=checked(buyFeeRate,'buy_fee',0,0.1),fs=checked(sellFeeRate,'sell_fee',0,0.1);
 const slip=checked(slippageBpsPerLeg,'slippage',0,1000);
 const transfer=checked(transferCostUsd,'transfer_cost',0,100000);
 const sameAsset=buy?.symbol===sell?.symbol&&buy?.symbol!=null;
 const independent=buy?.venue!==sell?.venue;
 const b=validateQuote(buy,now,maxAgeMs),s=validateQuote(sell,now,maxAgeMs);
 const common={buyVenue:buy?.venue??null,sellVenue:sell?.venue??null,symbol:buy?.symbol??null,
   quantity:qty,method:'QUOTE_ONLY_PAPER_ESTIMATE',realizedProfitUsd:null,canExecute:false};
 if(!sameAsset||!independent)return {...common,status:'INVALID_ROUTE',reason:'Must compare the same asset on different venues'};
 if(!b.ok||!s.ok)return {...common,status:'UNVERIFIED_QUOTE',reason:!b.ok?b.reason:s.reason};
 const buyNotional=qty*buy.ask, sellNotional=qty*sell.bid;
 const gross=sellNotional-buyNotional;
 const fees=buyNotional*fb+sellNotional*fs;
 const slippage=(buyNotional+sellNotional)*slip/10000;
 const net=gross-fees-slippage-transfer;
 const buyQtyOK=buy.askQty==null?null:buy.askQty>=qty;
 const sellQtyOK=sell.bidQty==null?null:sell.bidQty>=qty;
 let status=net>0?'CANDIDATE_NOT_EXECUTABLE':'NEGATIVE_ESTIMATE';
 if(buyQtyOK===false||sellQtyOK===false)status='INSUFFICIENT_TOP_BOOK';
 const round=n=>Math.round((n+Number.EPSILON)*100)/100;
 return {...common,status,reason:'Quote-only estimate; fill probability, available balances, venue access, transfer delays and order-book depth unverified',
   buyAsk:buy.ask,sellBid:sell.bid,buyNotionalUsd:round(buyNotional),sellNotionalUsd:round(sellNotional),
   grossUsd:round(gross),feesUsd:round(fees),slippageReserveUsd:round(slippage),transferReserveUsd:round(transfer),
   estimatedNetUsd:round(net),netSpreadPct:round(100*net/Math.max(buyNotional,0.01)),
   knownTopOfBookSize:buyQtyOK!==null&&sellQtyOK!==null,quantityWithinKnownTopBook:buyQtyOK!==false&&sellQtyOK!==false,
   quoteAgeMs:{buy:Math.max(0,now-buy.receivedAt),sell:Math.max(0,now-sell.receivedAt)}};
}
export function computeBestRoute(quotes,opts={}){
 if(!Array.isArray(quotes))throw new TypeError('quotes_required');
 const candidates=[];
 for(const buy of quotes)for(const sell of quotes){
   if(buy.venue===sell.venue||buy.symbol!==sell.symbol)continue;
   candidates.push(computeRoute(buy,sell,opts));
 }
 candidates.sort((a,b)=>(b.estimatedNetUsd??-Infinity)-(a.estimatedNetUsd??-Infinity));
 return candidates;
}
