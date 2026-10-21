// GAIA browser/AI worker registry. Node 22+, no external dependencies.
// Browser adapters run in separately installed, authorized worker processes.
// ADAM certification occurs at deployment/promotion, never as a per-request dependency.
// Runtime authorization and capability matching remain local to the worker router.
export const CAPABILITIES=Object.freeze({
 playwright:['browser.navigate','browser.inspect','browser.test'],
 stagehand:['browser.assist','browser.inspect'],
 selenium:['browser.navigate','browser.test'],
 shiftedit:['editor.open','editor.edit'],
 screenshare:['screen.observe'],
 sidepanel:['panel.open','panel.context'],
 ollama:['model.infer'],
 gemini:['model.infer']
});
export function resolveWorker(request, workers){
 if(!request || typeof request.capability!=='string')throw Error('Missing capability');
 const eligible=workers.filter(w=>w.enabled===true && w.authorized===true &&
  CAPABILITIES[w.kind]?.includes(request.capability) &&
  Array.isArray(w.capabilities) && w.capabilities.includes(request.capability));
 return eligible.sort((a,b)=>(a.priority??100)-(b.priority??100))[0]??null;
}
export function validateOperation(op){
 if(!op || typeof op.id!=='string'||!/^[a-zA-Z0-9._-]{1,100}$/.test(op.id))throw Error('Invalid operation id');
 if(typeof op.capability!=='string'||!Object.values(CAPABILITIES).some(c=>c.includes(op.capability)))throw Error('Unsupported capability');
 if(typeof op.authority!=='string'||!op.authority.trim())throw Error('Missing authority');
 return Object.freeze({...op});
}
export async function executeWithReceipt(operation,workers,executor){
 const op=validateOperation(operation);
 const worker=resolveWorker(op,workers);
 const receipt={schema:'gaia.execution.receipt.v1',operationId:op.id,capability:op.capability,
  workerId:worker?.id??null,status:'queued',certification:worker?.certification?.status??'not_recorded',timestamp:new Date().toISOString()};
 if(!worker)return {...receipt,status:'remedy_required',reason:'No authorized worker with matching capability'};
 try{
  const result=await executor(worker,op);
  return {...receipt,status:'completed',result};
 }catch(e){return {...receipt,status:'remedy_required',reason:String(e?.message??e)}}
}
