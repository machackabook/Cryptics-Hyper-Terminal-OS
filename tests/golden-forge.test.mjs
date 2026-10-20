import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeQuote,computeRoute,computeBestRoute,validateQuote} from '../src/forge/engine.mjs';
import {parseMarketMessage} from '../src/forge/marketFeed.mjs';

const t=Date.parse('2026-10-20T12:00:00.000Z');
const Q=(venue,bid,ask,additional={})=>normalizeQuote({venue,symbol:'BTC/USD',bid,ask,receivedAt:t,...additional});

test('public venue quotes use valid same-asset bid and ask',()=>{
 const q=Q('kraken','100','101');
 assert.equal(q.bid,100);
 assert.equal(q.ask,101);
 assert.ok(Object.isFrozen(q));
 assert.throws(()=>Q('kraken',110,100),/invalid_bid_ask/);
 assert.throws(()=>normalizeQuote({venue:'other',symbol:'BTC/USD',bid:100,ask:101}),/unsupported/);
});

test('paper P&L subtracts both venue fees, slippage and transfer allowance',()=>{
 const buy=Q('kraken',99,100),sell=Q('coinbase',105,106);
 const r=computeRoute(buy,sell,{quantity:1,buyFeeRate:0.001,sellFeeRate:0.001,
  slippageBpsPerLeg:0,transferCostUsd:0,now:t});
 assert.equal(r.grossUsd,5);
 assert.equal(r.feesUsd,0.21);
 assert.equal(r.estimatedNetUsd,4.8);
 assert.equal(r.status,'CANDIDATE_NOT_EXECUTABLE');
 assert.equal(r.realizedProfitUsd,null);
 assert.equal(r.canExecute,false);
 const withCosts=computeRoute(buy,sell,{quantity:1,buyFeeRate:0.006,sellFeeRate:0.006,
  slippageBpsPerLeg:10,transferCostUsd:2,now:t});
 assert.ok(withCosts.estimatedNetUsd<4.8);
 assert.equal(withCosts.transferReserveUsd,2);
});

test('stale or future source timestamps are rejected without calculating P&L',()=>{
 const old=normalizeQuote({venue:'kraken',symbol:'BTC/USD',bid:100,ask:101,receivedAt:t-8100});
 assert.equal(validateQuote(old,t).ok,false);
 assert.equal(computeRoute(old,Q('coinbase',104,105),{now:t}).status,'UNVERIFIED_QUOTE');
 const future=normalizeQuote({venue:'kraken',symbol:'BTC/USD',bid:100,ask:101,receivedAt:t,sourceTime:t+40000});
 assert.equal(validateQuote(future,t).ok,false);
});
test('no same-venue or unsupported cross-instrument trading',()=>{
 assert.equal(computeRoute(Q('kraken',99,100),Q('kraken',105,106),{now:t}).status,'INVALID_ROUTE');
 assert.equal(computeBestRoute([Q('kraken',99,100)],{now:t}).length,0);
});

test('known insufficient top-of-book quantity blocks candidate flag',()=>{
 const buy=Q('kraken',99,100,{askQty:0.05}),sell=Q('coinbase',105,106,{bidQty:0.05});
 const r=computeRoute(buy,sell,{now:t,quantity:1,buyFeeRate:0,sellFeeRate:0,slippageBpsPerLeg:0,transferCostUsd:0});
 assert.equal(r.status,'INSUFFICIENT_TOP_BOOK');
 assert.equal(r.canExecute,false);
});

test('Coinbase ticker message parsed as publicly sourced quote, without fabricated depth',()=>{
 const a=parseMarketMessage('coinbase',{type:'ticker',product_id:'BTC-USD',best_bid:'105',best_ask:'106',
 time:'2026-10-20T12:00:00.000Z'},t);
 assert.equal(a.length,1);assert.equal(a[0].venue,'coinbase');assert.equal(a[0].bid,105);
 assert.equal(a[0].bidQty,null);
});
test('Kraken v2 ticker message parses level 1 bid and ask including offered size',()=>{
 const a=parseMarketMessage('kraken',{channel:'ticker',type:'snapshot',data:[
  {symbol:'BTC/USD',bid:99,ask:100,bid_qty:4,ask_qty:2,timestamp:'2026-10-20T12:00:00.000Z'}
 ]},t);
 assert.equal(a.length,1);assert.equal(a[0].venue,'kraken');assert.equal(a[0].askQty,2);
});
test('bogus WebSocket frames do not create quotes',()=>{
 assert.equal(parseMarketMessage('kraken',{channel:'ticker',data:[{symbol:'BTC/USD',bid:100,ask:99}]},t).length,0);
 assert.equal(parseMarketMessage('coinbase',{type:'heartbeat'},t).length,0);
});
