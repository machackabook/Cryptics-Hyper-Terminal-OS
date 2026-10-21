import React,{useEffect,useRef,useState} from 'react';
import {Download,Terminal,X} from 'lucide-react';
import {polyquineVfs as vfs} from '../services/polyquineVfs';
import {agentIdentity,agentFabricManifest,dispatchAgentTransfer} from '../services/adamAgentFabric';
import {makeAgentCard,saveAgentCard,getAgentCard,recordAgentOutcome,routeModel,AgentKind} from '../services/adamAgentCards';
type Entry={kind:'input'|'output'|'error',text:string};
export const PolyquineHyperTerminal:React.FC<{onClose:()=>void}>=({onClose})=>{
 const [cwd,setCwd]=useState('/root'),[input,setInput]=useState(''),[lines,setLines]=useState<Entry[]>([{kind:'output',text:'POLYQUINE // Browser VFS terminal. Commands: help, pwd, ls, cd, cat, mkdir, write, append, rm, clear, quine export, logs. No host OS execution.'}]);
 const output=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(output.current)output.current.scrollTop=output.current.scrollHeight},[lines]);
 const emit=(kind:Entry['kind'],text:string)=>setLines(old=>[...old,{kind,text}].slice(-500));
 const download=(name:string,value:string)=>{const url=URL.createObjectURL(new Blob([value],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 const submit=(event:React.FormEvent)=>{event.preventDefault();const raw=input.trim();if(!raw)return;setInput('');emit('input',raw);
 try{
  const [command,...rest]=raw.split(/\s+/),arg=rest[0];
  switch(command.toLowerCase()){
   case 'help':emit('output','help, pwd, ls [path], cd [path], cat <path>, mkdir <path>, write <path> <text>, append <path> <text>, rm <path>, agent manifest, agent path <1..6000>, agent send <slot> <destination> <text>, card create <slot> <kind> <host> <runtimeKey>, card show <slot>, card outcome <slot> <ok|fail>, logs, quine export, clear');break;
   case 'pwd':emit('output',cwd);break;
   case 'ls':emit('output',vfs.ls(cwd,arg).join('   ')||'(empty)');break;
   case 'cd':setCwd(vfs.cd(cwd,arg));break;
   case 'cat':if(!arg)throw Error('Missing filename');emit('output',vfs.cat(cwd,arg));break;
   case 'mkdir':if(!arg)throw Error('Missing path');emit('output',vfs.mkdir(cwd,arg));break;
   case 'write':case 'append':if(!arg)throw Error('Missing path');vfs.write(cwd,arg,rest.slice(1).join(' '),command.toLowerCase()==='append');emit('output','Saved '+vfs.normalize(cwd,arg));break;
   case 'rm':if(!arg)throw Error('Missing path');vfs.rm(cwd,arg);emit('output','Removed '+arg);break;
   case 'agent': {
     if(arg==='manifest') emit('output',JSON.stringify(agentFabricManifest(),null,2));
     else if(arg==='path') emit('output',JSON.stringify(agentIdentity(Number(rest[1])),null,2));
     else if(arg==='send') {
       const slot=Number(rest[1]),destination=rest[2],payload=rest.slice(3).join(' ');
       if(!destination||!payload)throw Error('Usage: agent send <slot> <destination> <text>');
       const identity=agentIdentity(slot);
       const receipt=dispatchAgentTransfer({agent:slot,source:identity.inbox,destination,payload},(path,text)=>{
         const parts=path.split('/');parts.pop();vfs.mkdir('/',parts.join('/')||'/');vfs.write('/',path,text);
       });
       emit(receipt.state==='failed'?'error':'output',JSON.stringify(receipt,null,2));
     } else throw Error('Usage: agent manifest | agent path <slot> | agent send <slot> <destination> <text>');
     break;
   }
   case 'card': {
     if(arg==='create'){
       const slot=Number(rest[1]),kind=rest[2] as AgentKind,host=rest[3],runtimeKey=rest[4];
       if(!['process','program','function','junction','service-worker','packet-handler','event'].includes(kind)||!host||!runtimeKey)throw Error('Usage: card create <slot> <kind> <host> <runtimeKey>');
       const card=makeAgentCard({slot,kind,host,runtimeKey,displayName:runtimeKey,owner:'local-operator'});
       const location=saveAgentCard(card);emit('output',JSON.stringify({card,location},null,2));
     }else if(arg==='show'){
       const card=getAgentCard(Number(rest[1]));if(!card)throw Error('Agent card not registered');emit('output',JSON.stringify({...card,routing:routeModel(card)},null,2));
     }else if(arg==='outcome'){
       if(!['ok','fail'].includes(rest[2]))throw Error('Usage: card outcome <slot> <ok|fail>');
       emit('output',JSON.stringify(recordAgentOutcome(Number(rest[1]),rest[2]==='ok'),null,2));
     }else throw Error('Usage: card create|show|outcome');break;
   }
   case 'logs':emit('output','Local browser session only. This command does not certify legal or AI compliance.');break;
   case 'quine':if(arg!=='export')throw Error('Usage: quine export');download('polyquine-vfs-snapshot.json',vfs.export());emit('output','VFS snapshot exported. This is a state export, not an executable self-replicating quine.');break;
   case 'clear':setLines([]);break;
   default:emit('error','Unsupported command: '+command+'. No host execution performed.');
  }
 }catch(error){emit('error',error instanceof Error?error.message:String(error))}
 };
 return <section role="dialog" aria-label="Polyquine HyperTerminal" className="fixed inset-x-3 bottom-10 sm:left-1/2 sm:-translate-x-1/2 sm:w-[min(900px,94vw)] z-40 h-[min(520px,80vh)] flex flex-col rounded-2xl bg-slate-950/95 border border-cyan-500/60 shadow-2xl text-slate-100 font-mono">
 <header className="flex items-center justify-between border-b border-cyan-700/50 px-4 py-2 text-xs"><span className="flex items-center gap-2 text-cyan-300"><Terminal size={16}/> HYPERTERMINAL // POLYQUINE LOCAL SANDBOX</span><div className="flex gap-3"><button title="Export VFS" onClick={()=>download('polyquine-vfs-snapshot.json',vfs.export())}><Download size={16}/></button><button title="Close terminal" onClick={onClose}><X size={17}/></button></div></header>
 <div ref={output} className="flex-1 overflow-y-auto p-4 text-xs space-y-2">{lines.map((line,i)=><div key={i} className={'whitespace-pre-wrap break-words '+(line.kind==='error'?'text-red-400':line.kind==='input'?'text-cyan-300':'text-slate-200')}>{line.kind==='input'?'$ ':''}{line.text}</div>)}</div>
 <form onSubmit={submit} className="flex items-center gap-2 border-t border-cyan-700/50 px-4 py-3 text-xs"><label htmlFor="polyquine-command" className="text-cyan-300">{cwd} $</label><input id="polyquine-command" autoFocus autoComplete="off" value={input} onChange={e=>setInput(e.target.value)} className="min-w-0 flex-1 bg-transparent outline-none text-white" placeholder="Type help..." /><button className="rounded bg-cyan-600 px-3 py-1 font-bold text-black" type="submit">RUN</button></form>
 </section>;
};
