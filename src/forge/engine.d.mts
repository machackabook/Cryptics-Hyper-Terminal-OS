export type ForgeQuote = {
 venue:'coinbase'|'kraken';symbol:'BTC/USD'|'ETH/USD'|'SOL/USD';
 bid:number;ask:number;bidQty:number|null;askQty:number|null;
 quotedAt:number|null;receivedAt:number;
};
export type ForgeRoute = {
 buyVenue:string|null;sellVenue:string|null;symbol:string|null;quantity:number;
 method:string;realizedProfitUsd:null;canExecute:false;
 status:string;reason:string;estimatedNetUsd?:number;netSpreadPct?:number;
 grossUsd?:number;feesUsd?:number;slippageReserveUsd?:number;transferReserveUsd?:number;
 quoteAgeMs?:{buy:number;sell:number};buyAsk?:number;sellBid?:number;knownTopOfBookSize?:boolean;
 quantityWithinKnownTopBook?:boolean;
};
export const QUOTE_MAX_AGE_MS:number;
export function normalizeQuote(input:Record<string,unknown>):ForgeQuote;
export function validateQuote(q:ForgeQuote|null,now?:number,maxAgeMs?:number):{ok:boolean;reason:string};
export function computeRoute(buy:ForgeQuote,sell:ForgeQuote,params?:Record<string,number>):ForgeRoute;
export function computeBestRoute(quotes:ForgeQuote[],params?:Record<string,number>):ForgeRoute[];
