/**
 * ADAM Agent Fabric: deterministic logical paths and durable local transport.
 * 6,000 slots are addressable without spawning 6,000 processes.
 * No network transmission or host filesystem permissions are implied.
 */
export const AGENT_COUNT = 6000;
export type ReceiptState = 'queued' | 'delivered' | 'degraded' | 'failed';
export type TransportReceipt = {
  id: string; agentId: string; source: string; destination: string;
  state: ReceiptState; at: string; attempts: number; checksum: string; error?: string;
};
export type TransportRequest = { agent: number; source: string; destination: string; payload: string };
const PREFIX = 'adam-agent-fabric:v1:';
const PAD = (n: number) => String(n).padStart(4,'0');
export function agentIdentity(slot: number) {
  if (!Number.isInteger(slot) || slot < 1 || slot > AGENT_COUNT) throw Error('Agent slot must be 1..6000');
  const id = 'agent-'+PAD(slot), shard='shard-'+PAD(Math.floor((slot-1)/100)+1);
  return { id, slot, shard, root:'/agents/'+shard+'/'+id,
    inbox:'/agents/'+shard+'/'+id+'/inbox',
    outbox:'/agents/'+shard+'/'+id+'/outbox',
    ledger:'/agents/'+shard+'/'+id+'/ledger',
    quarantine:'/agents/'+shard+'/'+id+'/quarantine' };
}
function validatePath(path: string) {
  if (!path.startsWith('/') || path.includes('\\') || path.split('/').some(p=>p==='..'||p==='.'||p==='__proto__'||p==='constructor'||p==='prototype')) throw Error('Invalid VFS path');
  return path;
}
function checksum(s: string) {
  // Non-cryptographic integrity hint only; do not treat as security proof.
  let hash=2166136261; for(let i=0;i<s.length;i++){hash^=s.charCodeAt(i);hash=Math.imul(hash,16777619)}
  return (hash>>>0).toString(16).padStart(8,'0');
}
export function dispatchAgentTransfer(req:TransportRequest, write:(path:string,content:string)=>void):TransportReceipt {
  const agent=agentIdentity(req.agent),source=validatePath(req.source),destination=validatePath(req.destination);
  if(typeof req.payload!=='string') throw Error('Payload must be text');
  const id=agent.id+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,10);
  const receipt:TransportReceipt={id,agentId:agent.id,source,destination,state:'queued',at:new Date().toISOString(),attempts:0,checksum:checksum(req.payload)};
  const persist=(r:TransportReceipt)=>{localStorage.setItem(PREFIX+'receipt:'+r.id,JSON.stringify(r))};
  // Persist intent before attempting delivery. If quota fails, do not claim durable enqueue.
  localStorage.setItem(PREFIX+'payload:'+id,req.payload);
  try { persist(receipt) } catch(e) {localStorage.removeItem(PREFIX+'payload:'+id);throw e}
  for(const target of [destination,agent.outbox+'/'+id+'.txt',agent.quarantine+'/'+id+'.txt']) {
    receipt.attempts++;
    try {
      write(target,req.payload);
      receipt.state=target===destination?'delivered':'degraded';
      if(target!==destination)receipt.error='Primary delivery failed; retained at '+target;
      persist(receipt);
      return receipt;
    } catch(e) { receipt.error=String(e) }
  }
  receipt.state='failed';
  try { persist(receipt) } catch { /* original persisted receipt remains queued */ }
  return receipt;
}
export function readAgentReceipt(id:string):TransportReceipt | undefined {
  if(!/^agent-\d{4}-[\w-]+$/.test(id))throw Error('Invalid receipt id');
  const raw=localStorage.getItem(PREFIX+'receipt:'+id);
  return raw?JSON.parse(raw) as TransportReceipt:undefined;
}
export function agentFabricManifest(){
  return {version:1,slots:AGENT_COUNT,shards:60,slotsPerShard:100,mode:'logical-on-demand',
    persistence:'browser-localStorage',transport:'local VFS',hostExecution:false,
    statuses:['queued','delivered','degraded','failed']};
}
