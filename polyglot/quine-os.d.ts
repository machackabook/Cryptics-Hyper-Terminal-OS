export const HYPERTERMINAL_VERSION: string;
export const HYPERTERMINAL_ID: string;
export interface PolyglotResult {
 handled: boolean; kind?: string; message?: string; value?: unknown;
}
export function describeHyperterminal(): Record<string, unknown>;
export function dispatchHyperterminal(raw: string): Promise<PolyglotResult>;
