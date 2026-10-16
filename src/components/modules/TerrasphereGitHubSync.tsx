import React, { useState, useEffect } from 'react';
import { Globe, GitBranch, RefreshCw, CheckCircle2, Terminal, Cloud, Shield, GitCommit, ExternalLink, Activity } from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';

export const TerrasphereGitHubSync: React.FC = () => {
  const { addTerminalLine, addLedger } = useCryptic();
  const [syncStatus, setSyncStatus] = useState<'Idle' | 'Syncing' | 'Synchronized' | 'Failed'>('Synchronized');
  const [lastSynced, setLastSynced] = useState<string>(new Date().toLocaleTimeString());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [repoUrl] = useState<string>('https://github.com/machackabook/Cryptics-Hyper-Terminal-OS');
  const [commitHash] = useState<string>('a8b7c6d (hop 647 - main)');
  const [terrasphereElevation, setTerrasphereElevation] = useState<number>(18.4);
  const [sensorMeshConnected, setSensorMeshConnected] = useState<boolean>(true);

  // Auto refresh simulation
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const interval = setInterval(() => {
      setLastSynced(new Date().toLocaleTimeString());
      setTerrasphereElevation(prev => Number((prev + (Math.random() * 0.2 - 0.1)).toFixed(2)));
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefreshEnabled]);

  const handleTriggerSync = () => {
    setSyncStatus('Syncing');
    addTerminalLine('[TERRASPHERE & GITHUB SYNC]: Initiating bidirectional pull-ff with repository...', 'system');
    setTimeout(() => {
      setSyncStatus('Synchronized');
      setLastSynced(new Date().toLocaleTimeString());
      addTerminalLine('[TERRASPHERE & GITHUB SYNC]: Repository successfully synchronized. Terrasphere sensor grid and geonav updated.', 'good');
      addLedger('terrasphere.github.synced', { repo: repoUrl, commit: commitHash });
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-mono text-xs select-none p-4 space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Globe className="w-5 h-5 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <div className="font-bold text-cyan-400 text-sm tracking-wider">
              TERRASPHERE &amp; GITHUB REPOSITORY SYNC MATRIX
            </div>
            <div className="text-slate-400 text-[11px]">
              Automatic environment updating, geonav sensor grid, and GitHub continuity sync.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleTriggerSync}
            disabled={syncStatus === 'Syncing'}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncStatus === 'Syncing' ? 'animate-spin' : ''}`} />
            <span>{syncStatus === 'Syncing' ? 'Syncing...' : 'Force Refresh Now'}</span>
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-[10px]">GitHub Repository</div>
          <div className="text-xs font-bold text-cyan-400 mt-1 truncate">Cryptics-Hyper-Terminal-OS</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Branch: main (Active)</div>
        </div>
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-[10px]">Terrasphere Grid Status</div>
          <div className="text-xs font-bold text-emerald-400 mt-1">ONLINE &amp; RESPONSIVE</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Elevation: {terrasphereElevation}m MSL</div>
        </div>
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-[10px]">Last Automatic Refresh</div>
          <div className="text-xs font-bold text-amber-400 mt-1">{lastSynced}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Status: {syncStatus}</div>
        </div>
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-[10px]">Sensor Mesh Telemetry</div>
          <div className="text-xs font-bold text-purple-400 mt-1">100% SECURE</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Zero external leaks</div>
        </div>
      </div>

      {/* Repository & Terrasphere Integration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold border-b border-slate-800 pb-2">
            <GitBranch className="w-4 h-4" />
            <span>GitHub Source Linkage &amp; Continuity</span>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Repository URL:</span>
              <a href={repoUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center space-x-1">
                <span>machackabook/Cryptics-...</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Latest Commit / Receipt:</span>
              <span className="text-purple-400 font-mono text-[10px]">{commitHash}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Automatic Refresh Stream:</span>
              <button 
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                className={`px-3 py-1 rounded font-bold text-xs ${autoRefreshEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}
              >
                {autoRefreshEnabled ? 'ENABLED (10s)' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold border-b border-slate-800 pb-2">
            <Activity className="w-4 h-4" />
            <span>Terrasphere 3D Geonav &amp; Sensor Grid</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-[11px] text-slate-300">
            <div>Global Geonav &amp; Sensor Grid is fully integrated into the HyperTerminal operating system.</div>
            <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
              <span>Active Sensor Nodes:</span>
              <strong className="text-emerald-400">6,000 Nodes</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Plus Codes Precision:</span>
              <strong className="text-cyan-400">10-Character RTK Fix</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
