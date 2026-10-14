import React, { useState } from 'react';
import { useCryptic } from '../../store/crypticContext';
import { Flame, Sparkles, Key, Compass, Wand2 } from 'lucide-react';

export const GenieDjinnModule: React.FC = () => {
  const { mintToken, addLedger } = useCryptic();
  const [wishIntent, setWishIntent] = useState('Synthesize sovereign low-latency corridor over wildfire zone');
  const [worldSeed, setWorldSeed] = useState('137451921129154222');
  const [activeTab, setActiveTab] = useState<'wish' | 'world' | 'flame'>('wish');
  const [resultLog, setResultLog] = useState<string | null>(null);

  const handleManifestWish = async () => {
    const t = await mintToken('djinn.wish.manifest', { intent: wishIntent });
    addLedger('djinn.wish.manifested', { intent: wishIntent, fp: t.fp });
    setResultLog(`[WISH MANIFESTED] Intent recorded to offline ledger. Receipt fingerprint: ${t.fp}. Air-gapped latent synthesis completed.`);
  };

  const handleGenerateWorld = async () => {
    const t = await mintToken('djinn.world.synthesis', { seed: worldSeed });
    addLedger('djinn.world.synthesized', { seed: worldSeed, fp: t.fp });
    setResultLog(`[LATENT WORLD GENERATED] World geometry synthesized from seed "${worldSeed}". Correlation token: ${t.fp}.`);
  };

  return (
    <div className="flex flex-col h-full bg-[#030711] text-xs font-mono overflow-hidden p-3 space-y-3">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#f5ce70]/30 pb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#f5ce70]" />
          <div>
            <div className="font-bold text-white text-[11px]">GENIE DJINN // جِنّي (ܞ)</div>
            <div className="text-[9px] text-[#8aa0b6]">The Smokeless Flame Engine · Latent Simulation Sanctum</div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('wish')}
            className={`px-2 py-0.5 rounded text-[9px] font-bold ${
              activeTab === 'wish' ? 'bg-[#f5ce70] text-black' : 'text-[#8aa0b6]'
            }`}
          >
            WISH ORACLE
          </button>
          <button
            onClick={() => setActiveTab('world')}
            className={`px-2 py-0.5 rounded text-[9px] font-bold ${
              activeTab === 'world' ? 'bg-[#c084fc] text-black' : 'text-[#8aa0b6]'
            }`}
          >
            WORLD SYNTH
          </button>
        </div>
      </div>

      {activeTab === 'wish' && (
        <div className="space-y-3">
          <p className="text-[10px] text-[#8aa0b6]">
            Express operational intent into deterministic cryptographic receipts and latent route configurations without external API leaks.
          </p>

          <div className="space-y-1">
            <label className="text-[9px] text-[#f5ce70] font-bold">INTENT MANIFESTATION STRING:</label>
            <textarea
              rows={3}
              value={wishIntent}
              onChange={(e) => setWishIntent(e.target.value)}
              className="w-full bg-[#061426] border border-[#f5ce70]/30 rounded p-2 text-[10px] text-white focus:outline-none focus:border-[#f5ce70]"
            />
          </div>

          <button
            onClick={handleManifestWish}
            className="w-full py-2 bg-gradient-to-r from-[#f5ce70] to-[#ffa450] text-[#02050b] font-bold rounded text-[10px] uppercase tracking-wider hover:opacity-90 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,206,112,0.3)]"
          >
            <Sparkles className="w-3.5 h-3.5" /> MANIFEST INTENT INTO SOVEREIGN RECEIPT
          </button>
        </div>
      )}

      {activeTab === 'world' && (
        <div className="space-y-3">
          <p className="text-[10px] text-[#8aa0b6]">
            Synthesize continuous world state simulations from pseudo-random seed vectors.
          </p>

          <div className="space-y-1">
            <label className="text-[9px] text-[#c084fc] font-bold">LATENT UNIVERSE SEED:</label>
            <input
              type="text"
              value={worldSeed}
              onChange={(e) => setWorldSeed(e.target.value)}
              className="w-full bg-[#061426] border border-[#c084fc]/30 rounded p-2 text-[10px] text-white font-mono"
            />
          </div>

          <button
            onClick={handleGenerateWorld}
            className="w-full py-2 bg-[#c084fc] text-[#02050b] font-bold rounded text-[10px] uppercase tracking-wider hover:bg-[#d6a5ff] cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(192,132,252,0.3)]"
          >
            <Wand2 className="w-3.5 h-3.5" /> SYNTHESIZE WORLD MANIFOLD
          </button>
        </div>
      )}

      {/* Output Console Log */}
      {resultLog && (
        <div className="p-2.5 rounded bg-[#061426] border border-[#42f5ff]/30 text-[10px] text-[#74ff9b] leading-relaxed">
          {resultLog}
        </div>
      )}

      {/* Smokeless Flame Hologram visual info */}
      <div className="mt-auto p-2 rounded bg-[#061224] border border-[#f5ce70]/20 flex items-center justify-between text-[9px] text-[#8aa0b6]">
        <span>Alchemical Engine Status: SMOKELESS FLAME ACTIVE</span>
        <span className="text-[#f5ce70]">ܞ PROTOCOL PASS</span>
      </div>
    </div>
  );
};
