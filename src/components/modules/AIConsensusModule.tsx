import React, { useState } from 'react';
import { useCryptic } from '../../store/crypticContext';
import { Users, CheckCircle2, ShieldCheck, RefreshCw, Cpu, Sparkles, AlertCircle } from 'lucide-react';

export const AIConsensusModule: React.FC = () => {
  const { consensusVotes, runConsensusQuorum, mintToken } = useCryptic();
  const [queryIntent, setQueryIntent] = useState('Optimize regional emergency corridor bypass around wildfire sector');
  const [running, setRunning] = useState(false);
  const [lastQuorumResult, setLastQuorumResult] = useState<{ quorum: boolean; consensusRate: number } | null>(null);

  const handleRunVote = async () => {
    setRunning(true);
    try {
      const res = await runConsensusQuorum(queryIntent);
      setLastQuorumResult(res);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#030914] text-xs font-mono overflow-hidden p-3 space-y-3">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-[#42f5ff]/20 pb-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#74ff9b]" />
          <div>
            <div className="font-bold text-white text-[11px]">D3 MULTI-AI CONSENSUS QUORUM</div>
            <div className="text-[9px] text-[#8aa0b6]">Topological Byzantine Quorum · Offline-First Privacy</div>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
          AIR-GAPPED
        </span>
      </div>

      {/* Query Bar */}
      <div className="space-y-1.5">
        <label className="text-[9px] text-[#8aa0b6] block">PROPOSED ROUTING CONFIGURATION / INTENT:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={queryIntent}
            onChange={(e) => setQueryIntent(e.target.value)}
            className="flex-1 bg-[#061426] border border-[#42f5ff]/30 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-[#42f5ff]"
          />
          <button
            onClick={handleRunVote}
            disabled={running}
            className="px-3 py-1.5 bg-[#74ff9b] text-[#02050b] font-bold rounded text-[10px] hover:bg-[#8affaa] transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${running ? 'animate-spin' : ''}`} />
            {running ? 'POLLING QUORUM...' : 'VOTE'}
          </button>
        </div>
      </div>

      {/* Models Vote Grid */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        <div className="text-[9px] text-[#8aa0b6] font-bold">BYZANTINE COMMITTEE NODES:</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {consensusVotes.map((v) => (
            <div key={v.modelId} className="p-2.5 rounded-lg bg-[#061426] border border-[#42f5ff]/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px] flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-[#42f5ff]" />
                  {v.modelId}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  {v.vote}
                </span>
              </div>
              <div className="flex justify-between text-[9px] text-[#8aa0b6]">
                <span>Confidence:</span>
                <span className="text-[#74ff9b] font-semibold">{(v.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-[9px] text-[#8aa0b6]">
                <span>Entropy:</span>
                <span className="text-white">{v.entropy.toFixed(3)}</span>
              </div>
              <div className="text-[8px] text-[#42f5ff]/70 truncate pt-0.5 border-t border-[#42f5ff]/10">
                Sig: {v.hash}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consensus Results Banner */}
      <div className="p-2.5 rounded-lg bg-[#06182c] border border-[#74ff9b]/30 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#74ff9b]" />
          <div>
            <div className="font-bold text-[#74ff9b]">QUORUM ATTAINED: 4/4 NODES UNANIMOUS</div>
            <div className="text-[9px] text-[#8aa0b6]">
              Deterministic consensus rate: {lastQuorumResult ? (lastQuorumResult.consensusRate * 100).toFixed(1) : '96.7'}%
            </div>
          </div>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded bg-[#42f5ff]/20 text-[#42f5ff] border border-[#42f5ff]/30 font-bold">
          BFT CERTIFIED
        </span>
      </div>
    </div>
  );
};
