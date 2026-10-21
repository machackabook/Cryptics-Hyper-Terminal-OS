// Same-origin HyperTerminal tabs only. No arbitrary code or cross-origin messaging.
export const BUS_NAME='gaia-hyperterminal-v1';
const allowed=new Set(['node.hello','node.status','job.receipt','capability.changed']);
export function createGaiaTabBus(onMessage){
 const channel=new BroadcastChannel(BUS_NAME);
 channel.onmessage=event=>{
  const data=event.data;
  if(!data||data.schema!=='gaia.tab.v1'||!allowed.has(data.type)||typeof data.source!=='string')return;
  onMessage(data);
 };
 return {
  publish(type,payload={}){
   if(!allowed.has(type))throw Error('Unsupported bus message');
   channel.postMessage({schema:'gaia.tab.v1',type,source:'hyperterminal',timestamp:new Date().toISOString(),payload});
  },
  close(){channel.close()}
 };
}
