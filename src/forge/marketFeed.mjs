import {normalizeQuote} from './engine.mjs';

/**
 * Public venue WebSocket quotes only. Venue feeds are external and can be stale,
 * blocked, throttled or unavailable. No secret, account or trade permissions.
 * Local receive time is separate from optional provider timestamp.
 */
const CHANNELS=[
 {id:'coinbase',url:'wss://ws-feed.exchange.coinbase.com',subscribe:{
   type:'subscribe',product_ids:['BTC-USD','ETH-USD','SOL-USD'],channels:['ticker']
 }},
 {id:'kraken',url:'wss://ws.kraken.com/v2',subscribe:{
   method:'subscribe',params:{channel:'ticker',symbol:['BTC/USD','ETH/USD','SOL/USD'],event_trigger:'bbo',snapshot:true}
 }}
];
export function parseMarketMessage(venue,json,receivedAt=Date.now()){
 const rows=[];
 if(venue==='coinbase'&&json?.type==='ticker'&&typeof json.product_id==='string'){
  const market=json.product_id.replace('-','/');
  rows.push({venue,symbol:market,bid:json.best_bid,ask:json.best_ask,
    // Coinbase ticker does not prove top-of-book executable quantity
    bidQty:null,askQty:null,sourceTime:json.time||null,receivedAt});
 }
 if(venue==='kraken'&&json?.channel==='ticker'&&Array.isArray(json.data)){
   for(const row of json.data)rows.push({venue,symbol:row.symbol,bid:row.bid,ask:row.ask,
     bidQty:row.bid_qty,askQty:row.ask_qty,sourceTime:row.timestamp||null,receivedAt});
 }
 return rows.flatMap(row=>{
   try{return [normalizeQuote(row)]}catch{return []}
 });
}
export function startLiveQuotes(onQuote,onStatus){
 if(typeof WebSocket!=='function')throw new Error('websocket_unavailable');
 let closed=false,attempts={},timers=new Set();
 const sockets=new Map();
 const connect=cfg=>{
  if(closed)return;
  onStatus(cfg.id,'CONNECTING');
  let ws;
  try{ws=new WebSocket(cfg.url)}catch{onStatus(cfg.id,'UNREACHABLE');return}
  sockets.set(cfg.id,ws);
  ws.onopen=()=>{
    attempts[cfg.id]=0;
    onStatus(cfg.id,'CONNECTED');
    ws.send(JSON.stringify(cfg.subscribe));
  };
  ws.onmessage=e=>{
    try{const quotes=parseMarketMessage(cfg.id,JSON.parse(e.data),Date.now());
      for(const quote of quotes)onQuote(quote)
    }catch{onStatus(cfg.id,'MALFORMED_FRAME')}
  };
  ws.onerror=()=>onStatus(cfg.id,'SOCKET_ERROR');
  ws.onclose=()=>{
    sockets.delete(cfg.id);
    if(closed)return;
    onStatus(cfg.id,'DISCONNECTED');
    const n=Math.min(6,(attempts[cfg.id]||0)+1);
    attempts[cfg.id]=n;
    const timer=setTimeout(()=>{timers.delete(timer);connect(cfg)},Math.min(30000,500*2**n));
    timers.add(timer);
  };
 };
 for(const cfg of CHANNELS)connect(cfg);
 return ()=>{
   closed=true;
   for(const t of timers)clearTimeout(t);
   timers.clear();
   for(const ws of sockets.values()){ws.onclose=null;ws.close()}
   sockets.clear();
 };
}
