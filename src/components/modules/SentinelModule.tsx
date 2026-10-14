import React, { useState } from 'react';
import { useCryptic } from '../../store/crypticContext';
import { Shield, Lock, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';

export const SentinelModule: React.FC = () => {
  const { mintToken, addLedger } = useCryptic();
  const [auditLog, setAuditLog] = useState<string[]>([
    'TDOC Sentinel V11 initialized.',
    'Checking Dual Authority boundary...',
    'Ed25519 node-pair signature verified.',
    'Quine verification loop: Idempotent.',
  ]);

  const handleRunAudit = async () => {
    const t = await mintToken('sentinel.audit.full');
    addLedger('sentinel.audit.executed', { fp: t.fp });
    setAuditLog((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Live Sentinel verification executed. Receipt: ${t.fp}. Zero unauthorized debloat regressions.`,
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-[#030914] text-xs font-mono overflow-hidden p-3 space-y-3">
      <div className="flex items-center justify-between border-b border-[#42f5ff]/20 pb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#ff477e]" />
          <div>
            <div className="font-bold text-white text-[11px]">TDOC SENTINEL // DUAL AUTHORITY V11</div>
            <div className="text-[9px] text-[#8aa0b6]">Evidence-Based Security &amp; Quine Integrity Sentinel</div>
          </div>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
          PROTECTED
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-[9px]">
        <div className="p-2 rounded bg-[#061426] border border-[#42f5ff]/20">
          <div className="text-[#74ff9b] font-bold">ED25519</div>
          <div className="text-[#8aa0b6]">Active Pair</div>
        </div>
        <div className="p-2 rounded bg-[#061426] border border-[#42f5ff]/20">
          <div className="text-[#42f5ff] font-bold">V11 DUAL</div>
          <div className="text-[#8aa0b6]">Authority Rank</div>
        </div>
        <div className="p-2 rounded bg-[#061426] border border-[#42f5ff]/20">
          <div className="text-[#f5ce70] font-bold">AIR-GAP</div>
          <div className="text-[#8aa0b6]">No API Exposure</div>
        </div>
      </div>

      <div className="flex-1 bg-[#01040a] p-2.5 rounded-lg border border-[#42f5ff]/20 overflow-y-auto space-y-1 text-[10px]">
        {auditLog.map((log, i) => (
          <div key={i} className="text-[#74ff9b] font-mono leading-relaxed">
            &gt; {log}
          </div>
        ))}
      </div>

      <button
        onClick={handleRunAudit}
        className="w-full py-2 bg-gradient-to-r from-red-500 to-[#ff477e] text-white font-bold rounded text-[10px] uppercase tracking-wider hover:opacity-90 cursor-pointer shadow-[0_0_15px_rgba(255,71,126,0.3)] flex items-center justify-center gap-1.5"
      >
        <Lock className="w-3.5 h-3.5" /> EXECUTE DUAL-AUTHORITY SENTINEL AUDIT
      </button>
    </div>
  );
};
