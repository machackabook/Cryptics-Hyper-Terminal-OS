import React, { useState, useEffect } from 'react';
import { 
  History, 
  RotateCcw, 
  Save, 
  ShieldCheck, 
  TrendingUp, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  RefreshCw,
  Sliders,
  Layers,
  Zap,
  HardDrive
} from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';
import { SystemCheckpoint } from '../../types';
import { 
  loadStoredCheckpoints, 
  createSystemCheckpoint, 
  rollbackToCheckpoint, 
  persistCheckpoints 
} from '../../services/checkpointService';

export const CheckpointManagerModule: React.FC = () => {
  const { panels, ledgerRecords, tokens, addTerminalLine, addLedger } = useCryptic();
  const [checkpoints, setCheckpoints] = useState<SystemCheckpoint[]>([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [customName, setCustomName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<SystemCheckpoint | null>(null);

  // Load existing checkpoints on mount
  useEffect(() => {
    const existing = loadStoredCheckpoints();
    if (existing.length === 0) {
      // Create initial seed checkpoint
      const initial = createSystemCheckpoint('Genesis Sovereign Boot Checkpoint', {
        panels,
        ledgerRecords,
        tokens,
        arbitrageBalanceUsd: 50000,
        satcomPacketsRelayed: 12000
      }, false);
      setCheckpoints([initial]);
    } else {
      setCheckpoints(existing);
    }
  }, []);

  // 30-Second Auto-Save Countdown Timer
  useEffect(() => {
    if (!autoSaveEnabled) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          triggerAutoSave();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoSaveEnabled, panels, ledgerRecords, tokens]);

  const triggerAutoSave = () => {
    const name = `Auto-Save Growth Snapshot #${new Date().toLocaleTimeString()}`;
    const snap = createSystemCheckpoint(name, {
      panels,
      ledgerRecords,
      tokens,
      arbitrageBalanceUsd: 54820.50,
      satcomPacketsRelayed: 14820
    }, true);
    setCheckpoints(loadStoredCheckpoints());
    addTerminalLine(`[EVOLUTIONARY CHECKPOINT]: Auto-saved state ${snap.hash} (Growth: ${snap.growthScore}).`, 'good');
  };

  const handleManualCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    const name = customName.trim() || `Manual Checkpoint [${new Date().toLocaleTimeString()}]`;
    const snap = createSystemCheckpoint(name, {
      panels,
      ledgerRecords,
      tokens,
      arbitrageBalanceUsd: 55400.00,
      satcomPacketsRelayed: 15200
    }, false);
    setCheckpoints(loadStoredCheckpoints());
    setCustomName('');
    setFeedback(`Created Checkpoint: "${snap.name}" (${snap.hash})`);
    addTerminalLine(`[CHECKPOINT CREATED]: ${snap.name} -> ${snap.hash}`, 'good');
    addLedger('checkpoint.created', { id: snap.id, hash: snap.hash, growthScore: snap.growthScore });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRollback = (id: string, name: string) => {
    const res = rollbackToCheckpoint(id);
    if (res) {
      setFeedback(`Rolled back to checkpoint "${name}". Reload or refresh panels to apply.`);
      addTerminalLine(`[CHECKPOINT ROLLBACK]: Restored state to "${name}" (${res.hash}). Integrity verified.`, 'warn');
      addLedger('checkpoint.rollback_applied', { id, hash: res.hash });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleExportAll = () => {
    const blob = new Blob([JSON.stringify(checkpoints, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cryptic-evolutionary-checkpoints-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addTerminalLine('[CHECKPOINTS]: Exported snapshot vault to local JSON file.', 'good');
  };

  const handleClearAll = () => {
    if (confirm('Clear all non-genesis checkpoints?')) {
      const reset = [checkpoints[checkpoints.length - 1] || checkpoints[0]];
      persistCheckpoints(reset);
      setCheckpoints(reset);
      addTerminalLine('[CHECKPOINTS]: Cleared archived history, preserved root checkpoint.', 'warn');
    }
  };

  const currentGrowthScore = checkpoints[0]?.growthScore || 1420;

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-mono text-xs select-none p-4 space-y-4 overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 border-b border-cyan-500/30 gap-2 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <TrendingUp className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-emerald-400 text-sm tracking-wider flex items-center space-x-2">
              <span>EVOLUTIONARY GROWTH CHECKPOINT VAULT</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Score: {currentGrowthScore.toLocaleString()}
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Continuous auto-saving state snapshots, cryptographic SHA-256 verification, and single-click rollbacks.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Auto-save toggle & countdown */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 text-[11px]">
              {autoSaveEnabled ? `Auto-save in ${countdown}s` : 'Auto-save Paused'}
            </span>
            <button
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                autoSaveEnabled ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {autoSaveEnabled ? 'ON' : 'PAUSED'}
            </button>
          </div>

          <button
            onClick={handleExportAll}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition"
            title="Export Checkpoints to JSON"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Manual Checkpoint Form */}
      <form onSubmit={handleManualCheckpoint} className="flex items-center space-x-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 shrink-0">
        <input
          type="text"
          value={customName}
          onChange={e => setCustomName(e.target.value)}
          placeholder="Name your state checkpoint (e.g. Pre-Arbitrage Deployment Epoch)..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1.5 transition shadow"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Checkpoint</span>
        </button>
      </form>

      {/* Checkpoints Timeline / List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
          <span>SAVED CHECKPOINT REVISIONS ({checkpoints.length})</span>
          <button onClick={handleClearAll} className="text-red-400 hover:underline flex items-center space-x-1">
            <Trash2 className="w-3 h-3" />
            <span>Clear Old Snapshots</span>
          </button>
        </div>

        {checkpoints.map((chk, idx) => (
          <div
            key={chk.id}
            className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
              idx === 0 
                ? 'bg-slate-900/90 border-cyan-500/40 shadow-[0_0_15px_rgba(66,245,255,0.1)]' 
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-xs">{chk.name}</span>
                {chk.autoSaved ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    Auto-Save
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                    Manual Epoch
                  </span>
                )}
                {idx === 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                    HEAD (ACTIVE)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                <span>{new Date(chk.timestamp).toLocaleString()}</span>
                <span>•</span>
                <span className="font-mono text-cyan-400">{chk.hash}</span>
                <span>•</span>
                <span>Growth Score: <strong className="text-emerald-400">{chk.growthScore}</strong></span>
                <span>•</span>
                <span>Tokens: {chk.totalTokens}</span>
                <span>•</span>
                <span>Ledger: {chk.totalLedgerRecords} recs</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setSelectedCheckpoint(selectedCheckpoint?.id === chk.id ? null : chk)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                {selectedCheckpoint?.id === chk.id ? 'Close Details' : 'Inspect'}
              </button>
              <button
                onClick={() => handleRollback(chk.id, chk.name)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rollback</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Checkpoint Detailed JSON Inspector */}
      {selectedCheckpoint && (
        <div className="p-3 bg-slate-950 border border-cyan-500/40 rounded-xl space-y-2 shrink-0 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between text-cyan-300 font-bold text-[11px]">
            <span>Checkpoint State Snapshot [{selectedCheckpoint.name}]</span>
            <span className="text-slate-400 font-mono">{selectedCheckpoint.hash}</span>
          </div>
          <pre className="text-[10px] text-slate-300 font-mono whitespace-pre-wrap bg-slate-900 p-2 rounded border border-slate-800">
            {JSON.stringify(selectedCheckpoint.stateSnapshot, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
