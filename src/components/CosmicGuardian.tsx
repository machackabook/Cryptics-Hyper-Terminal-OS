import React, { useState } from 'react';
import { useCryptic } from '../store/crypticContext';
import { Shield, KeyRound, Sparkles, Volume2, Globe, Cpu } from 'lucide-react';

export const CosmicGuardian: React.FC = () => {
  const { enterGate, toggle963, oscillatorActive } = useCryptic();
  const [verifying, setVerifying] = useState(false);
  const [signatureReceipt, setSignatureReceipt] = useState<string | null>(null);

  const handleEnter = async () => {
    setVerifying(true);
    try {
      const token = await enterGate();
      setSignatureReceipt(token.fp);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010308]/95 backdrop-blur-xl p-4 crt-overlay">
      <div className="relative max-w-xl w-full border border-[#42f5ff]/40 bg-[#040a14]/90 rounded-2xl p-8 shadow-[0_0_80px_rgba(66,245,255,0.2)] text-center overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 bg-[#42f5ff]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Sacred Sigil */}
        <div className="relative mx-auto w-24 h-24 mb-6 rounded-full border border-[#42f5ff]/60 flex items-center justify-center bg-[#061426] shadow-[0_0_30px_rgba(66,245,255,0.3)]">
          <div className="absolute inset-1 rounded-full border border-dashed border-[#74ff9b]/40 animate-spin" style={{ animationDuration: '30s' }} />
          <Shield className="w-10 h-10 text-[#42f5ff] drop-shadow-[0_0_12px_#42f5ff]" />
        </div>

        <div className="text-[11px] tracking-[0.3em] font-bold text-[#74ff9b] uppercase mb-1">
          SOVEREIGN DUAL AUTHORITY THRESHOLD
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3">
          CRYPTIC <span className="text-[#42f5ff]">HYPERTERMINAL OS</span>
        </h1>
        <p className="text-xs text-[#9bb3cf] leading-relaxed max-w-md mx-auto mb-6">
          Zero-leak offline command environment. Geospatial emergency radar, 3D Gaia orbital globe, real-time packet inspection, multimodal AI consensus, and Web MIDI harmonic synthesis.
        </p>

        {/* Security badges */}
        <div className="grid grid-cols-3 gap-2 mb-8 text-[10px] text-left">
          <div className="p-2.5 rounded-lg border border-[#42f5ff]/20 bg-[#061424]/60">
            <div className="flex items-center gap-1.5 text-[#42f5ff] mb-1 font-semibold">
              <KeyRound className="w-3.5 h-3.5" /> Ed25519 Pair
            </div>
            <span className="text-[#89a2bc]">Hardware isolated memory fabric</span>
          </div>
          <div className="p-2.5 rounded-lg border border-[#74ff9b]/20 bg-[#061424]/60">
            <div className="flex items-center gap-1.5 text-[#74ff9b] mb-1 font-semibold">
              <Globe className="w-3.5 h-3.5" /> GAIA 3D Grid
            </div>
            <span className="text-[#89a2bc]">Plus Codes &amp; Incident Radar</span>
          </div>
          <div className="p-2.5 rounded-lg border border-[#f5ce70]/20 bg-[#061424]/60">
            <div className="flex items-center gap-1.5 text-[#f5ce70] mb-1 font-semibold">
              <Cpu className="w-3.5 h-3.5" /> Air-Gapped AI
            </div>
            <span className="text-[#89a2bc]">Zero client API key leakage</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleEnter}
            disabled={verifying}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#00f2fe] text-[#02050b] font-bold text-xs tracking-wider uppercase shadow-[0_0_25px_rgba(0,210,255,0.4)] hover:shadow-[0_0_35px_rgba(0,210,255,0.7)] transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {verifying ? 'Minting Sovereign Receipt...' : 'Authenticate & Enter Gateway'}
          </button>

          <button
            onClick={() => toggle963()}
            type="button"
            className={`px-4 py-3 rounded-xl border text-xs tracking-wider font-semibold transition cursor-pointer flex items-center gap-2 ${
              oscillatorActive
                ? 'border-[#74ff9b] bg-[#74ff9b]/15 text-[#74ff9b] shadow-[0_0_15px_rgba(116,255,155,0.3)]'
                : 'border-[#42f5ff]/30 bg-[#061426] text-[#42f5ff] hover:border-[#42f5ff]/60'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            {oscillatorActive ? '963 Hz Carrier ACTIVE' : 'Sonify 963 Hz'}
          </button>
        </div>

        {signatureReceipt && (
          <div className="mt-4 text-[10px] text-[#74ff9b] tracking-wider">
            Verification Fingerprint: {signatureReceipt}
          </div>
        )}
      </div>
    </div>
  );
};
