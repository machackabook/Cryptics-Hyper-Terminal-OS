export const HYPERTERMINAL_VERSION: string;
export const HYPERTERMINAL_ID: string;
export type PolyglotResult =
  | {handled:true;kind:'good'|'warn'|'system';message:string;value:unknown}
  | {handled:false;kind?:never;message?:never;value?:never};
export function describeHyperterminal(): Record<string, unknown>;
export function dispatchHyperterminal(raw: string): Promise<PolyglotResult>;
