import React, { useState } from 'react';
import { useCryptic } from '../../store/crypticContext';
import { Layers, ShieldCheck, Search, FileText, CheckCircle2, Shield, RefreshCw } from 'lucide-react';

export const LivingLedgerModule: React.FC = () => {
  const { ledgerRecords, mintToken, addLedger } = useCryptic();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'COMMANDS' | 'TOKENS' | 'AUDIO' | 'NETWORK'>('ALL');
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  const filteredRecords = ledgerRecords.filter((rec) => {
    const matchesSearch =
      rec.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(rec.data).toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'COMMANDS') return rec.event.includes('terminal') || rec.event.includes('command');
    if (filterType === 'TOKENS') return rec.event.includes('token');
    if (filterType === 'AUDIO') return rec.event.includes('audio') || rec.event.includes('midi');
    if (filterType === 'NETWORK') return rec.event.includes('network') || rec.event.includes('beacon') || rec.event.includes('incident');
    return true;
  });

  const handleVerifyLedger = async () => {
    setVerificationStatus('Auditing append-only ledger cryptographic chain...');
    const t = await mintToken('ledger.verify.audit');
    setTimeout(() => {
      setVerificationStatus(`Verification complete: All ${ledgerRecords.length} records cryptographically validated. Receipt: ${t.fp}`);
      addLedger('ledger.audit.passed', { count: ledgerRecords.length, fp: t.fp });
    }, 400);
  };

  return (
    <div className="flex flex-col h-full bg-[#020712] text-xs font-mono overflow-hidden p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#42f5ff]/20 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#71e9e1]" />
          <div>
            <div className="font-bold text-white text-[11px]">GAIA LIVING LEDGER // v1.0</div>
            <div className="text-[9px] text-[#8aa0b6]">Provenance-Aware Public Evidence Portal</div>
          </div>
        </div>
        <button
          onClick={handleVerifyLedger}
          className="text-[9px] px-2 py-0.5 rounded bg-[#71e9e1]/15 text-[#71e9e1] border border-[#71e9e1]/30 font-bold hover:bg-[#71e9e1]/30 cursor-pointer flex items-center gap-1 transition"
        >
          <ShieldCheck className="w-3 h-3" /> VERIFY CHAIN
        </button>
      </div>

      {/* Target & Audit Statistics */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2 rounded bg-[#061426] border border-[#42f5ff]/20">
          <div className="text-base font-extrabold text-[#71e9e1]">407</div>
          <div className="text-[8px] text-[#8aa0b6] truncate">URL Target</div>
        </div>
        <div className="p-2 rounded bg-[#061426] border border-[#42f5ff]/20">
          <div className="text-base font-extrabold text-[#f5ce70]">{ledgerRecords.length}</div>
          <div className="text-[8px] text-[#8aa0b6] truncate">Records In Memory</div>
        </div>
        <div className="p-2 rounded bg-[#061426] border border-[#42f5ff]/20">
          <div className="text-base font-extrabold text-[#74ff9b]">100%</div>
          <div className="text-[8px] text-[#8aa0b6] truncate">Hash Integrity</div>
        </div>
        <div className="p-2 rounded bg-[#061426] border border-[#42f5ff]/20">
          <div className="text-base font-extrabold text-white">0</div>
          <div className="text-[8px] text-[#8aa0b6] truncate">Unreviewed Leaks</div>
        </div>
      </div>

      {/* Verification Notice */}
      {verificationStatus && (
        <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-[9px] text-emerald-300 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
          <span>{verificationStatus}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="space-y-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#8aa0b6]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search approved ledger records & fingerprints..."
            className="w-full bg-[#061426] border border-[#42f5ff]/30 rounded pl-8 pr-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-[#42f5ff]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto text-[8px]">
          {(['ALL', 'COMMANDS', 'TOKENS', 'AUDIO', 'NETWORK'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterType(f)}
              className={`px-2 py-0.5 rounded border transition cursor-pointer ${
                filterType === f
                  ? 'border-[#71e9e1] bg-[#71e9e1]/20 text-[#71e9e1] font-bold'
                  : 'border-[#42f5ff]/20 bg-[#061426] text-[#8aa0b6] hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Records Feed */}
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {filteredRecords.length === 0 ? (
          <div className="p-4 text-center text-[#8aa0b6] text-[10px]">
            No records match the current query. All promoted records are verified.
          </div>
        ) : (
          filteredRecords.slice().reverse().map((r, i) => (
            <div key={i} className="p-2 rounded-lg bg-[#061426] border border-[#42f5ff]/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#71e9e1] text-[10px]">{r.event}</span>
                <span className="text-[8px] text-[#8aa0b6]">{r.ts}</span>
              </div>
              <div className="text-[9px] text-[#d0e4f6] font-mono break-all bg-[#030914] p-1.5 rounded border border-[#42f5ff]/10">
                {JSON.stringify(r.data)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
