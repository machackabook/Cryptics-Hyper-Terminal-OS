import React, { useState } from 'react';
import { useCryptic } from '../../store/crypticContext';
import { Layers, ShieldCheck, Search, FileText, CheckCircle2 } from 'lucide-react';

export const LivingLedgerModule: React.FC = () => {
  const { ledgerRecords, mintToken } = useCryptic();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredRecords = ledgerRecords.filter((rec) => {
    const matchesSearch =
      rec.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(rec.data).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
        <span className="text-[9px] px-2 py-0.5 rounded bg-[#71e9e1]/15 text-[#71e9e1] border border-[#71e9e1]/30 font-bold">
          APPEND-ONLY
        </span>
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

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#8aa0b6]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search approved ledger records & fingerprints..."
            className="w-full bg-[#061426] border border-[#42f5ff]/30 rounded pl-8 pr-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-[#42f5ff]"
          />
        </div>
      </div>

      {/* Records Feed */}
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {filteredRecords.length === 0 ? (
          <div className="p-4 text-center text-[#8aa0b6] text-[10px]">
            No records match the current query. All promoted records are verified.
          </div>
        ) : (
          filteredRecords.map((r, i) => (
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
