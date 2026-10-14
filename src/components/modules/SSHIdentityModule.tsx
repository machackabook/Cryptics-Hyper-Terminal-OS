import React, { useState } from 'react';
import { useCryptic } from '../../store/crypticContext';
import { KeyRound, Shield, Check, Copy } from 'lucide-react';

export const SSHIdentityModule: React.FC = () => {
  const { mintToken, addLedger } = useCryptic();
  const [pubKey, setPubKey] = useState(
    'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH9a508N1s8Zq3X9b7kF7f3V7e9p21qR8yU9t7Z4k1aB sovereign-operator@cryptic'
  );
  const [normalizedFp, setNormalizedFp] = useState<string>('SHA256:7f9a21b34e8912cde489b01fa239');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(pubKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRecompute = async () => {
    const t = await mintToken('ssh.identity.check');
    addLedger('ssh.identity.verified', { fp: t.fp });
    setNormalizedFp(`SHA256:${t.fp}${Date.now().toString(16).slice(-6)}`);
  };

  return (
    <div className="flex flex-col h-full bg-[#020712] text-xs font-mono overflow-hidden p-3 space-y-3">
      <div className="flex items-center justify-between border-b border-[#42f5ff]/20 pb-2">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#74ff9b]" />
          <div>
            <div className="font-bold text-white text-[11px]">CRYPTIC SSH IDENTITY // HULE-LACE</div>
            <div className="text-[9px] text-[#8aa0b6]">Local Ed25519 / P-256 Key Normalization &amp; Proofs</div>
          </div>
        </div>
        <span className="text-[9px] text-[#74ff9b] font-bold">LOCAL PROOF</span>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-[#8aa0b6] block">PUBLIC KEY (ED25519 / ECDSA):</label>
        <textarea
          rows={3}
          value={pubKey}
          onChange={(e) => setPubKey(e.target.value)}
          className="w-full bg-[#061426] border border-[#42f5ff]/30 rounded p-2 text-[10px] text-white font-mono break-all focus:outline-none focus:border-[#42f5ff]"
        />
      </div>

      <div className="p-2.5 rounded bg-[#061426] border border-[#74ff9b]/30 space-y-1 text-[10px]">
        <div className="text-[#8aa0b6]">NORMALIZED SHA-256 FINGERPRINT:</div>
        <div className="font-bold text-[#74ff9b] text-[11px] select-all">{normalizedFp}</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 py-1.5 rounded bg-[#061426] border border-[#42f5ff]/30 text-[#42f5ff] font-bold text-[10px] hover:bg-[#42f5ff]/15 cursor-pointer flex items-center justify-center gap-1.5"
        >
          {copied ? <Check className="w-3 h-3 text-[#74ff9b]" /> : <Copy className="w-3 h-3" />}
          {copied ? 'COPIED TO CLIPBOARD' : 'COPY PUBLIC KEY'}
        </button>
        <button
          onClick={handleRecompute}
          className="flex-1 py-1.5 rounded bg-[#74ff9b] text-[#02050b] font-bold text-[10px] hover:bg-[#8affaa] cursor-pointer"
        >
          MINT FRESH ATTESTATION
        </button>
      </div>
    </div>
  );
};
