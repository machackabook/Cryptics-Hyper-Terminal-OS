import type {ForgeQuote} from './engine.mjs';
export function parseMarketMessage(venue:'coinbase'|'kraken',json:any,receivedAt?:number):ForgeQuote[];
export function startLiveQuotes(onQuote:(quote:ForgeQuote)=>void,onStatus:(venue:string,status:string)=>void):()=>void;
