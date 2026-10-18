import type { MCPToolDefinition, MCPResource } from '../types';
export interface JSONRPCRequest {jsonrpc:'2.0';id:string|number;method:string;params?:Record<string,any>;}
export interface JSONRPCResponse {jsonrpc:'2.0';id:string|number;result?:any;error?:{code:number;message:string;data?:any};}
export interface MCPBridgeState {connected:boolean;serverUrl:string;activeTransport:'stdio'|'sse'|'websocket'|'local-bridge';registeredToolsCount:number;activeResourcesCount:number;lastMessageTimestamp:string;}
// Real discovery and calls belong to the native broker and SYNAPSE gateway.
export const builtinMCPTools:MCPToolDefinition[]=[];
export const builtinMCPResources:MCPResource[]=[];
export const getMCPBridgeState=async():Promise<MCPBridgeState>=>({connected:false,serverUrl:'',activeTransport:'local-bridge',registeredToolsCount:0,activeResourcesCount:0,lastMessageTimestamp:''});
export const dispatchMCPRequest=async(request:JSONRPCRequest):Promise<JSONRPCResponse>=>({jsonrpc:'2.0',id:request.id,error:{code:-32001,message:'Not connected. Use the native broker with a fresh SYNAPSE capability. No tool, token or model call was executed.'}});
export const testMCPConnection=async()=>({success:false,latencyMs:0,message:'Native gateway connection is not configured for this public page.'});
