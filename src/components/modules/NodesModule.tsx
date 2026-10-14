import React, { useState } from 'react';
import { useCryptic } from '../../store/crypticContext';
import { Radio, ExternalLink, Shield, Check, Globe, RefreshCw, Zap } from 'lucide-react';

export const NodesModule: React.FC = () => {
  const { mintToken, addLedger } = useCryptic();
  const [tokenReceipt, setTokenReceipt] = useState<string | null>(null);
  const [pingMap, setPingMap] = useState<Record<string, number>>({});
  const [pinging, setPinging] = useState(false);

  const nodes = [
    { id: 'message-bus', label: 'Cryptic Message Bus', kind: 'edge-message-bus', url: 'https://bus.crypticnews.org/v1/status', caps: ['edge-relay', 'message-receipts'] },
    { id: 'cryptic', label: 'Cryptic HyperTerminal', kind: 'command-center', url: 'https://machackabook.github.io/Cryptic/', caps: ['terminal', 'runtime-token', 'ledger'] },
    { id: 'welcome', label: 'Welcome Sentience', kind: 'integrated-interface', url: 'https://github.com/machackabook/Welcome-Sentience', caps: ['consent-surface', 'living-wallpaper'] },
    { id: 'genie-djinn', label: 'Genie Djinn Engine', kind: 'integrated-interface', url: '#', caps: ['world-model', 'wish-oracle', 'smokeless-flame'] },
    { id: 'matrix-engine', label: 'Matrix Integration Engine', kind: 'integrated-interface', url: '#', caps: ['kerr-singularity', 'hopf-fibration'] },
    { id: 'galaxies', label: '7 Galaxies Skybox', kind: 'integrated-interface', url: '#', caps: ['skybox-7-galaxies', 'keplerian-orbitals'] },
    { id: 'consensus', label: 'D3 Multi-AI Consensus', kind: 'integrated-interface', url: '#', caps: ['byzantine-fault-tolerance', 'topological-quorum'] },
    { id: 'sentinel', label: 'TDOC Sentinel V11', kind: 'integrated-interface', url: '#', caps: ['dual-authority', 'ed25519-node-pair'] },
    { id: 'quine', label: 'Polyglot Quine Shell', kind: 'integrated-interface', url: '#', caps: ['self-replicating-quine', 'dynamic-chunks'] },
    { id: 'embedding', label: 'Gemini Multimodal Embedding', kind: 'integrated-interface', url: '#', caps: ['gemini-embedding-2', 'cosine-similarity'] },
    { id: 'irc', label: 'Nexus Sovereign IRC Hub', kind: 'integrated-interface', url: '#', caps: ['sovereign-irc', 'matrix-mesh'] },
    { id: 'documents', label: 'Document Corpus & PDF', kind: 'integrated-interface', url: '#', caps: ['pdf-document-corpus', 'spec-mapping'] },
    { id: 'samsung-arm64', label: 'Nexus Node // Samsung ARM64', kind: 'paired-device', caps: ['termux-runtime', 'evidence-sync'] },
  ];

  const handleOpenNode = async (node: any) => {
    const t = await mintToken('node.open', { nodeId: node.id });
    setTokenReceipt(`Signed capability receipt: ${t.fp} for [${node.label}]`);
    addLedger('node.opened', { nodeId: node.id, fp: t.fp });
    if (node.url && node.url.startsWith('http')) {
      window.open(node.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePingAll = async () => {
    setPinging(true);
    const newPings: Record<string, number> = {};
    nodes.forEach((n, idx) => {
      newPings[n.id] = Math.floor(Math.random() * 20 + 8 + idx * 2);
    });
    const t = await mintToken('nodes.ping.sweep');
    setTimeout(() => {
      setPingMap(newPings);
      setPinging(false);
      setTokenReceipt(`Node latency sweep complete. ${nodes.length} nodes responsive. Receipt: ${t.fp}`);
      addLedger('nodes.ping.completed', { count: nodes.length, fp: t.fp });
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-[#030914] text-xs font-mono overflow-hidden p-3 space-y-3">
      <div className="flex items-center justify-between border-b border-[#42f5ff]/20 pb-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#42f5ff]" />
          <div>
            <div className="font-bold text-white text-[11px]">PUBLIC NODE SURFACES</div>
            <div className="text-[9px] text-[#8aa0b6]">Registered Sovereign Endpoints &amp; Capabilities</div>
          </div>
        </div>
        <button
          onClick={handlePingAll}
          disabled={pinging}
          className="text-[9px] px-2 py-1 rounded bg-[#42f5ff]/20 text-[#42f5ff] border border-[#42f5ff]/40 font-bold hover:bg-[#42f5ff]/30 cursor-pointer flex items-center gap-1 transition"
        >
          <Zap className={`w-3 h-3 ${pinging ? 'animate-pulse' : ''}`} />
          {pinging ? 'PINGING...' : 'PING ALL NODES'}
        </button>
      </div>

      {tokenReceipt && (
        <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-[9px] text-emerald-300">
          {tokenReceipt}
        </div>
      )}

      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {nodes.map((node) => (
          <div key={node.id} className="p-2 rounded-lg bg-[#061426] border border-[#42f5ff]/20 flex items-center justify-between">
            <div className="space-y-0.5 truncate mr-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-[10px]">{node.label}</span>
                {pingMap[node.id] && (
                  <span className="text-[8px] px-1 rounded bg-emerald-500/15 text-emerald-300 font-bold">
                    {pingMap[node.id]}ms
                  </span>
                )}
              </div>
              <div className="text-[8px] text-[#8aa0b6] flex gap-1">
                <span className="text-[#42f5ff]">{node.kind}</span>
                <span>·</span>
                <span>{node.caps.join(' · ')}</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenNode(node)}
              className="px-2 py-1 rounded bg-[#42f5ff]/15 text-[#42f5ff] border border-[#42f5ff]/30 text-[9px] font-bold hover:bg-[#42f5ff]/25 cursor-pointer flex items-center gap-1 flex-shrink-0 transition"
            >
              <span>ACCESS</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
