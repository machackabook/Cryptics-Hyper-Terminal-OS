import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, ShieldAlert } from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';

// AgentTerminal now uses the SAME command fabric as the primary HyperTerminal.
// It never manufactures deployment receipts, GPU inference, agent counts or audit passes.
export const AgentTerminal: React.FC = () => {
  const { terminalLines, execCommand } = useCryptic();
  const [input,setInput]=useState('');
  const bottomRef=useRef<HTMLDivElement>(null);
  useEffect(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}),[terminalLines.length]);
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();
    const cmd=input.trim();
    if(!cmd)return;
    setInput('');
    await execCommand(cmd);
  };
  return <section className="p-4 rounded-xl bg-[#061224] border border-[#42f5ff]/30 space-y-3 font-mono" aria-label="Polyglot agent terminal">
    <div className="flex items-center gap-2 border-b border-[#42f5ff]/20 pb-2">
      <Terminal className="w-4 h-4 text-cyan-400"/>
      <div><h3 className="font-bold text-cyan-300 text-xs">Æ // HYPERTERMINAL POLYGLOT QUINE OS</h3>
      <p className="text-[10px] text-zinc-400">Shared command interpreter · agent operations require authenticated adapters</p></div>
    </div>
    <div className="flex items-center gap-2 text-amber-300 text-[10px]"><ShieldAlert className="w-3.5 h-3.5"/>No inferred swarm or device connection</div>
    <div className="bg-[#030a14] border border-zinc-800 rounded-xl p-3 h-56 overflow-y-auto space-y-2 text-[10px]" role="log" aria-live="polite">
      {terminalLines.slice(-60).map(line=><div key={line.id} className="whitespace-pre-wrap break-words">
        <span className="text-cyan-600 mr-2">[{line.time}]</span>
        <span className={line.type==='bad'?'text-red-300':line.type==='good'?'text-emerald-300':line.type==='warn'?'text-amber-300':'text-slate-200'}>{line.text}</span>
      </div>)}<div ref={bottomRef}/>
    </div>
    <form onSubmit={submit} className="flex gap-2">
      <input value={input} onChange={e=>setInput(e.target.value)} aria-label="Polyglot agent command" placeholder="os status | quine verify | peer aeon" className="flex-1 min-w-0 bg-[#030a14] border border-cyan-900 rounded px-3 py-2 text-xs text-white"/>
      <button type="submit" className="px-3 py-2 bg-cyan-900 text-cyan-100 rounded flex items-center gap-1"><Send className="w-3 h-3"/>RUN</button>
    </form>
  </section>;
};
