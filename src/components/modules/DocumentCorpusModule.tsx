import React, { useState } from 'react';
import { FileText, Search, BookOpen, ExternalLink, Shield, Check, Copy } from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';

export const DocumentCorpusModule: React.FC = () => {
  const { mintToken } = useCryptic();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const documents = [
    {
      title: 'GAIA-URL-ASSIMILATION-v1.md',
      category: 'Specification',
      desc: 'Publication contract, gatekeeping, and review-safe evidence pipeline.',
      content: `# GAIA URL Assimilation Contract v1.0
- Baseline: Never promote unreviewed raw bearer tokens or private host credentials.
- Ingestion Boundary: Ingestion passes through normalization, fingerprint verification, and review gate.
- Provenance Guarantee: Every entry requires verified SHA-256 evidence.`,
    },
    {
      title: 'CRYPTIC-SSH-IDENTITY-LACE.md',
      category: 'Security Architecture',
      desc: 'Ed25519 node-pairing, dual-authority verification, and debloat status.',
      content: `# Cryptic SSH Identity // HULE-LACE Specification
- OpenSSH format standard with Ed25519 public key normalization.
- Reversible zlib/base64url envelope for presentation with zero private key retention.
- Zero client storage of private identity material.`,
    },
    {
      title: 'DEVTOOLS-MESSAGE-BUS.md',
      category: 'IPC & Bus',
      desc: 'Local loopback, edge relay, and broadcast message routes specification.',
      content: `# DevTools Message Bus Specification
- Multi-transport dispatch across Loopback, BroadcastChannel, and Edge Gateway.
- Aggregate fanout with deterministic deduplication cache (MAX_SEEN = 256).
- Structured frame format with UUID and scoped time-to-live.`,
    },
    {
      title: 'MAGIC-WINDOW-LINEAGE.md',
      category: 'Core Engine',
      desc: 'Polymorphic surface rendering and 3D celestial skybox integration.',
      content: `# Magic Window of ܞ Lineage
- Monolith neural polymorph surface supporting 16+ sovereign modules.
- Three.js particle starfield with relativistic 7-galaxy orbital frame dragging.
- Instant clear UI mode (⌂) without unmounting computational state.`,
    },
    {
      title: 'PUBLIC-SECURITY-REVIEW.md',
      category: 'Security Audit',
      desc: 'Threat model, boundary enforcement, and zero-trust perimeter analysis.',
      content: `# Public Security Audit & Defense-in-Depth
- Client-side CSP with strict connect-src and loopback bindings.
- Fail-closed operational boundaries: offline-first processing with zero API key leaks.
- Byzantine fault tolerance quorum verification across multimodal committee models.`,
    },
  ];

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDocument = documents.find((d) => d.title === selectedDoc);

  const handleCopy = () => {
    if (activeDocument) {
      navigator.clipboard?.writeText(activeDocument.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

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
        <span className="text-[9px] text-[#74ff9b]">{documents.length} SPECS INDEXED</span>
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

      <div className="flex-1 flex flex-col md:flex-row gap-2.5 overflow-hidden">
        {/* Document List */}
        <div className="w-full md:w-1/2 space-y-1.5 overflow-y-auto pr-1">
          {filtered.map((doc, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedDoc(doc.title)}
              className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                selectedDoc === doc.title
                  ? 'border-[#38bdf8] bg-[#0c223c]'
                  : 'border-[#42f5ff]/20 bg-[#061426] hover:border-[#42f5ff]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#38bdf8] text-[10px] flex items-center gap-1.5 truncate">
                  <BookOpen className="w-3 h-3 text-[#38bdf8] flex-shrink-0" />
                  <span className="truncate">{doc.title}</span>
                </span>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#42f5ff]/15 text-[#42f5ff] font-semibold flex-shrink-0">
                  {doc.category}
                </span>
              </div>
              <div className="text-[9px] text-[#8aa0b6] line-clamp-2">{doc.desc}</div>
            </div>
          ))}
        </div>

        {/* Document Detail Preview */}
        <div className="w-full md:w-1/2 p-2.5 rounded-lg bg-[#01040a] border border-[#42f5ff]/20 flex flex-col overflow-hidden">
          {activeDocument ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#42f5ff]/20 pb-1.5 mb-2">
                <span className="font-bold text-white text-[10px] truncate">{activeDocument.title}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2 py-0.5 rounded bg-[#42f5ff]/15 text-[#42f5ff] border border-[#42f5ff]/30 text-[8px] hover:bg-[#42f5ff]/30 cursor-pointer flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-2.5 h-2.5 text-[#74ff9b]" /> : <Copy className="w-2.5 h-2.5" />}
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto text-[9px] text-[#9bb3cf] whitespace-pre-wrap font-mono leading-relaxed select-text bg-[#030914] p-2 rounded border border-[#42f5ff]/10">
                {activeDocument.content}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[10px] text-[#8aa0b6]">
              Select a specification to view full content.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
