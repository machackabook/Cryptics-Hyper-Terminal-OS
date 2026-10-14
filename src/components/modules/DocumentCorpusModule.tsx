import React, { useState } from 'react';
import { FileText, Search, BookOpen, ExternalLink, Shield } from 'lucide-react';

export const DocumentCorpusModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const documents = [
    { title: 'GAIA-URL-ASSIMILATION-v1.md', category: 'Specification', desc: 'Publication contract, gatekeeping, and review-safe evidence pipeline.' },
    { title: 'CRYPTIC-SSH-IDENTITY-LACE.md', category: 'Security Architecture', desc: 'Ed25519 node-pairing, dual-authority verification, and debloat status.' },
    { title: 'DEVTOOLS-MESSAGE-BUS.md', category: 'IPC & Bus', desc: 'Local loopback, edge relay, and broadcast message routes specification.' },
    { title: 'MAGIC-WINDOW-LINEAGE.md', category: 'Core Engine', desc: 'Polymorphic surface rendering and 3D celestial skybox integration.' },
    { title: 'PUBLIC-SECURITY-REVIEW.md', category: 'Security Audit', desc: 'Threat model, boundary enforcement, and zero-trust perimeter analysis.' },
  ];

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#030914] text-xs font-mono overflow-hidden p-3 space-y-3">
      <div className="flex items-center justify-between border-b border-[#42f5ff]/20 pb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#38bdf8]" />
          <div>
            <div className="font-bold text-white text-[11px]">SOVEREIGN PDF &amp; DOCUMENT CORPUS</div>
            <div className="text-[9px] text-[#8aa0b6]">Continuity Receipts &amp; Architectural Specifications</div>
          </div>
        </div>
        <span className="text-[9px] text-[#74ff9b]">5 CORE SPECS</span>
      </div>

      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#8aa0b6]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search architectural documents & specifications..."
          className="w-full bg-[#061426] border border-[#42f5ff]/30 rounded pl-8 pr-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-[#42f5ff]"
        />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {filtered.map((doc, idx) => (
          <div key={idx} className="p-2.5 rounded-lg bg-[#061426] border border-[#42f5ff]/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#38bdf8] text-[10px] flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-[#38bdf8]" />
                {doc.title}
              </span>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#42f5ff]/15 text-[#42f5ff] font-semibold">
                {doc.category}
              </span>
            </div>
            <div className="text-[9px] text-[#8aa0b6]">{doc.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
