import React,{useState} from 'react';

const capabilities=[
 ['browser.assist','AI browser assistance'],['screen.observe','Screen observation'],
 ['panel.context','Context-aware side panel'],['editor.edit','Editor automation'],
 ['model.infer','Local or connected model inference']
] as const;
const endpoint='http://127.0.0.1:43187';
export function OmniCapabilityPanel({onClose}:{onClose:()=>void}){
 const [token,setToken]=useState('');
 const [user,setUser]=useState('local-user');
 const [device,setDevice]=useState('this-device');
 const [enabled,setEnabled]=useState<Record<string,boolean>>({});
 const [status,setStatus]=useState('Connect your own local GAIA service to manage optional capabilities.');
 async function request(method:'GET'|'POST'|'DELETE',body?:object){
  const response=await fetch(endpoint+(method==='GET'?'/health':'/agreements'),{
   method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
   ...(body?{body:JSON.stringify(body)}:{})
  });
  const result=await response.json();
  if(!response.ok)throw Error(result.error||'Request failed');
  return result;
 }
 async function toggle(capability:string){
  try{
   if(!token||!user.trim()||!device.trim())throw Error('Enter your local session token, user and device.');
   const next=!enabled[capability];
   await request(next?'POST':'DELETE',{user,device,capability,...(next?{expiresAt:new Date(Date.now()+60*60*1000).toISOString()}: {})});
   setEnabled(old=>({...old,[capability]:next}));
   setStatus(next?'Enabled for one hour. Revoke anytime.':'Capability revoked.');
  }catch(e){setStatus(String(e))}
 }
 return <aside role="dialog" aria-label="OmniApp capability panel" className="fixed right-3 top-16 bottom-12 z-50 w-[min(92vw,390px)] overflow-y-auto rounded-xl border border-cyan-400/60 bg-slate-950 p-4 text-cyan-100 shadow-2xl">
  <header className="flex justify-between items-center"><h2 className="font-bold">OMNIAPP · GOD Protocol</h2><button onClick={onClose} aria-label="Close capability panel">✕</button></header>
  <p className="text-xs my-3 text-slate-300">Optional capabilities are user-controlled. ADAM is not consulted for routine actions.</p>
  <label className="block text-xs my-2">Local service session token<input type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2" /></label>
  <label className="block text-xs my-2">User<input value={user} onChange={e=>setUser(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2" /></label>
  <label className="block text-xs my-2">Device<input value={device} onChange={e=>setDevice(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2" /></label>
  <button className="rounded border border-cyan-500 px-3 py-1 text-sm my-2" onClick={async()=>{try{await request('GET');setStatus('Local service connected.')}catch(e){setStatus(String(e))}}}>Check local connection</button>
  {capabilities.map(([capability,label])=><div key={capability} className="flex justify-between gap-2 border-t border-slate-800 py-3 text-sm"><div><div>{label}</div><div className="text-xs text-slate-400">{capability}</div></div><button aria-label={(enabled[capability]?'Revoke ':'Enable ')+label} className="border border-cyan-500 rounded px-2" onClick={()=>toggle(capability)}>{enabled[capability]?'Revoke':'Enable'}</button></div>)}
  <p role="status" className="text-xs mt-3 text-amber-200">{status}</p>
 </aside>
}
