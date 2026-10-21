import React from 'react';
import { Terminal, ShieldAlert } from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';

/** AXS is a backend capability, never a synthetic Linux command executor. */
export const AXSModule: React.FC = () => {
  const {execCommand}=useCryptic();
  return <section className="flex flex-col h-full bg-[#020610] text-xs font-mono p-3 gap-3" aria-label="AXS native terminal state">
    <div className="flex items-center gap-2 border-b border-[#42f5ff]/20 pb-2">
      <Terminal className="w-4 h-4 text-cyan-400"/>
      <h3 className="text-cyan-200 font-bold">AXS // POLYGLOT NATIVE ADAPTER</h3>
    </div>
    <div className="p-3 rounded border border-amber-700 bg-amber-950/30 text-amber-300" role="status">
      <ShieldAlert className="inline w-3.5 h-3.5 mr-1"/>
      NOT_CONNECTED — No PTY session, local shell, or device attestation has been established by this page.
    </div>
    <p className="text-slate-300 leading-relaxed">
      On an authorized device, start and authenticate the separate loopback AXS backend using its documented pairing procedure.
      The browser must not invent stdout or claim an active socket. Native execution is disabled until a real adapter is attached.
    </p>
    <button type="button" onClick={()=>execCommand('os capabilities')} className="p-2 border border-cyan-900 rounded text-cyan-200 text-left">Inspect verified browser capabilities</button>
  </section>;
};
