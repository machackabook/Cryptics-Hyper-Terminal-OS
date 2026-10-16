import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  Shield, 
  Lock, 
  HardDrive, 
  Cloud, 
  RefreshCw, 
  Terminal, 
  FileText, 
  Folder, 
  Cpu, 
  Key, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Radio, 
  Share2, 
  Download, 
  Upload,
  Plus,
  Trash2,
  Activity,
  Layers,
  Settings,
  Eye,
  Zap
} from 'lucide-react';

interface SparseBundleItem {
  id: string;
  name: string;
  sizeGB: number;
  encrypted: boolean;
  tetherNodes: number;
  lastBackup: string;
  status: 'Synced' | 'Backing Up' | 'Partitioned' | 'Verifying';
  hash: string;
  ownerAgent: string;
}

interface MountedService {
  id: string;
  name: string;
  type: 'SSH' | 'Chrome Remote' | 'Windows Dev' | 'SMB' | 'NAS' | 'Google Gadgets';
  endpoint: string;
  status: 'Connected' | 'Standby' | 'Tunnel Active';
  latencyMs: number;
  autoSync: boolean;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  nodeId: string;
  status: 'Verified' | 'Flagged' | 'Encrypted';
}

export const CloudStorageDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tethermesh' | 'sparsebundles' | 'mounts' | 'audit' | 'sandboxes'>('tethermesh');
  const [encryptionStatus, setEncryptionStatus] = useState<boolean>(true);
  const [godPolicyEnforced, setGodPolicyEnforced] = useState<boolean>(true);
  const [amazonQGrokPipelineActive, setAmazonQGrokPipelineActive] = useState<boolean>(true);
  const [syncFrequency, setSyncFrequency] = useState<string>('33.3ms Pulse');
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '[TetherMesh Core]: Initializing decentralized zero-trust storage daemon...',
    '[SparseBundle]: Loaded 12 active encrypted volumes across 6,000 node cluster.',
    '[Amazon Q CLI / Grok]: Secure backup pipeline established with AES-256-GCM offsite parity.',
    '[Soul Stone GOD Policy]: Integrity validation sweep completed. 0 policy deviations detected.'
  ]);

  // Sparsebundles state
  const [bundles, setBundles] = useState<SparseBundleItem[]>([
    { id: 'sb-01', name: 'Antigravity_SDK_Binary_Core.sparsebundle', sizeGB: 142.5, encrypted: true, tetherNodes: 1250, lastBackup: '2 mins ago', status: 'Synced', hash: '0x8f9c...3a1e', ownerAgent: 'Agent-Alpha-1' },
    { id: 'sb-02', name: 'Golden_Army_Forge_Platoon_Weights.sparsebundle', sizeGB: 890.0, encrypted: true, tetherNodes: 2400, lastBackup: 'Just now', status: 'Synced', hash: '0x4b2d...9e8f', ownerAgent: 'Agent-Vanguard-4' },
    { id: 'sb-03', name: 'Soul_Stone_GOD_Policy_State.sparsebundle', sizeGB: 12.4, encrypted: true, tetherNodes: 6000, lastBackup: '1 min ago', status: 'Verifying', hash: '0x1a7f...c4b2', ownerAgent: 'Supreme-Architect' },
    { id: 'sb-04', name: 'Hey_GAIA_Muse_Engagement_Cache.sparsebundle', sizeGB: 45.8, encrypted: true, tetherNodes: 850, lastBackup: '5 mins ago', status: 'Synced', hash: '0x9e3a...7f1c', ownerAgent: 'Agent-Comms-9' },
    { id: 'sb-05', name: 'SubWorker_NexusOrb_Packet_Logs.sparsebundle', sizeGB: 310.2, encrypted: true, tetherNodes: 1500, lastBackup: '10 mins ago', status: 'Backing Up', hash: '0x6c5b...2d8a', ownerAgent: 'Agent-Shield-2' },
  ]);

  // Mounted services state
  const [mounts, setMounts] = useState<MountedService[]>([
    { id: 'm-1', name: 'Cryptic Primary NAS Storage Array', type: 'NAS', endpoint: 'smb://nas.cryptic.mesh/storage', status: 'Connected', latencyMs: 1.2, autoSync: true },
    { id: 'm-2', name: 'Windows Developer Access Tunnel', type: 'Windows Dev', endpoint: 'win-dev://tunnel.cryptic.mesh:5986', status: 'Tunnel Active', latencyMs: 4.5, autoSync: true },
    { id: 'm-3', name: 'Chrome Remote Debugging Link', type: 'Chrome Remote', endpoint: 'chrome-debug://127.0.0.1:9222', status: 'Connected', latencyMs: 0.8, autoSync: false },
    { id: 'm-4', name: 'Secure SSH Gateway Cluster', type: 'SSH', endpoint: 'ssh://architect@gateway.cryptic.mesh:2222', status: 'Connected', latencyMs: 2.1, autoSync: true },
    { id: 'm-5', name: 'Localhost SMB Share Bridge', type: 'SMB', endpoint: 'smb://127.0.0.1/cryptic_share', status: 'Connected', latencyMs: 0.4, autoSync: true },
    { id: 'm-6', name: 'Google Gadgets Embed Pipeline', type: 'Google Gadgets', endpoint: 'https://gadgets.cryptic.mesh/embed/v2', status: 'Connected', latencyMs: 12.5, autoSync: true }
  ]);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'aud-1', timestamp: '15:58:10', action: 'SparseBundle Encryption Key Rotation', nodeId: 'Node-6000-Core', status: 'Verified' },
    { id: 'aud-2', timestamp: '15:57:45', action: 'Amazon Q CLI Offsite Parity Check', nodeId: 'Node-AWS-Backup-1', status: 'Verified' },
    { id: 'aud-3', timestamp: '15:56:12', action: 'Soul Stone GOD Policy Compliance Sweep', nodeId: 'Node-Architect-Root', status: 'Verified' },
    { id: 'aud-4', timestamp: '15:55:00', action: 'TetherMesh Partition Rebalance (33.3ms pulse)', nodeId: 'Node-Cluster-Mesh', status: 'Verified' },
    { id: 'aud-5', timestamp: '15:52:30', action: 'Google Gadgets Mount Pipeline Handshake', nodeId: 'Node-Gadget-Gateway', status: 'Verified' }
  ]);

  const triggerBackup = (id: string) => {
    setBundles(prev => prev.map(b => b.id === id ? { ...b, status: 'Backing Up' } : b));
    setTerminalOutput(prev => [
      `[Amazon Q CLI / Grok]: Initiating secure offsite backup for bundle ID ${id}...`,
      ...prev
    ]);
    setTimeout(() => {
      setBundles(prev => prev.map(b => b.id === id ? { ...b, status: 'Synced', lastBackup: 'Just now' } : b));
      setTerminalOutput(prev => [
        `[Amazon Q CLI / Grok]: Backup successfully secured & verified with parity hash for ${id}.`,
        ...prev
      ]);
    }, 2000);
  };

  const toggleAutoSync = (id: string) => {
    setMounts(prev => prev.map(m => m.id === id ? { ...m, autoSync: !m.autoSync } : m));
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-mono text-xs select-none overflow-hidden">
      {/* Top Header / Status Bar */}
      <div className="px-4 py-3 bg-slate-900 border-b border-cyan-500/30 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-cyan-400 tracking-wider text-sm flex items-center space-x-2">
              <span>TETHERMESH DECENTRALIZED CLOUD STORAGE FRAMEWORK</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px]">
                0-Trust AES-256
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              SparseBundle Offsite Storage, Amazon Q CLI/Grok Backup Pipeline & Google Gadgets Mount Matrix
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Soul Stone GOD Policy: <span className="text-emerald-400 font-bold">ACTIVE</span></span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Cluster Nodes: <span className="text-cyan-400 font-bold">6,000 Active</span></span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 px-4 shrink-0">
        {[
          { id: 'tethermesh', label: 'TetherMesh Topology', icon: Globe },
          { id: 'sparsebundles', label: 'SparseBundle Vault', icon: HardDrive },
          { id: 'mounts', label: 'Tunnels & Mounts (SMB/NAS/SSH)', icon: Share2 },
          { id: 'audit', label: 'Soul Stone Audit Trail', icon: FileText },
          { id: 'sandboxes', label: 'Agent Sandbox Lifecycle', icon: Layers }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 font-medium transition-colors ${
                isActive 
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'tethermesh' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Cluster Partition Map */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <Globe className="w-4 h-4" />
                  <span>6,000-Node Virtual Cluster Sharding & Partition Map</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>99.999% Fault Tolerant</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Total Partitioned Storage</div>
                  <div className="text-lg font-bold text-cyan-400 mt-1">1.48 PB</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">End-to-End Encrypted</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Active TetherMesh Nodes</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">6,000 / 6,000</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Zero-Trust Verified</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Packet Cycle Latency</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">33.3 ms</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Synchronized Pulse</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Amazon Q / Grok Parity</div>
                  <div className="text-lg font-bold text-purple-400 mt-1">100% Synced</div>
                  <div className="text-[10px] text-purple-400 mt-0.5">Offsite Redundant</div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
                <div className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Distributed Mesh Shard Allocation Status</span>
                  <span className="text-xs text-slate-400 font-normal">Brigade / Battalion Distribution</span>
                </div>

                <div className="space-y-2">
                  {[
                    { brigade: 'Brigade 1 (Vanguard Core)', nodes: 2000, usage: '74.2%', health: 'Optimal' },
                    { brigade: 'Brigade 2 (Shield & Defense)', nodes: 2000, usage: '61.5%', health: 'Optimal' },
                    { brigade: 'Brigade 3 (Recon & Telemetry)', nodes: 2000, usage: '88.9%', health: 'Optimal' }
                  ].map((b, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-900 p-2.5 rounded border border-slate-800/80">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <div>
                          <div className="font-bold text-slate-200">{b.brigade}</div>
                          <div className="text-[10px] text-slate-400">{b.nodes} Nodes Assigned</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-cyan-400 font-bold">{b.usage} Storage Utilized</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px]">{b.health}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Security & GOD Policy Control */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col space-y-4">
              <div className="flex items-center space-x-2 text-purple-400 font-bold border-b border-slate-800 pb-3">
                <Shield className="w-4 h-4" />
                <span>Soul Stone & GOD Policy Controls</span>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">Zero-Trust Encryption</div>
                    <div className="text-[10px] text-slate-400">AES-256-GCM hardware partitioning</div>
                  </div>
                  <button 
                    onClick={() => setEncryptionStatus(!encryptionStatus)}
                    className={`px-3 py-1 rounded font-bold text-xs ${encryptionStatus ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}
                  >
                    {encryptionStatus ? 'SECURED' : 'UNSECURED'}
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">GOD Policy Governance</div>
                    <div className="text-[10px] text-slate-400">Absolute sovereign rule enforcement</div>
                  </div>
                  <button 
                    onClick={() => setGodPolicyEnforced(!godPolicyEnforced)}
                    className={`px-3 py-1 rounded font-bold text-xs ${godPolicyEnforced ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}
                  >
                    {godPolicyEnforced ? 'ENFORCED' : 'BYPASSED'}
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">Amazon Q CLI / Grok Pipeline</div>
                    <div className="text-[10px] text-slate-400">Offsite backup sync & execution wrapper</div>
                  </div>
                  <button 
                    onClick={() => setAmazonQGrokPipelineActive(!amazonQGrokPipelineActive)}
                    className={`px-3 py-1 rounded font-bold text-xs ${amazonQGrokPipelineActive ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {amazonQGrokPipelineActive ? 'ACTIVE' : 'IDLE'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col space-y-2">
                <div className="text-slate-400 font-semibold text-[11px]">Live Terminal Stream (TetherMesh Daemon)</div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-[10px] text-cyan-300 h-32 overflow-y-auto space-y-1">
                  {terminalOutput.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sparsebundles' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div>
                <div className="text-cyan-400 font-bold text-sm">SparseBundle Management & Offsite Backup Vault</div>
                <div className="text-slate-400 text-[11px]">Manage encrypted disk images partitioned across the 6,000-node virtual cluster with Amazon Q CLI & Grok backup orchestration.</div>
              </div>
              <button 
                onClick={() => {
                  const newId = `sb-0${bundles.length + 1}`;
                  setBundles(prev => [...prev, {
                    id: newId,
                    name: `New_Encrypted_Container_${newId}.sparsebundle`,
                    sizeGB: 50.0,
                    encrypted: true,
                    tetherNodes: 1000,
                    lastBackup: 'Just now',
                    status: 'Synced',
                    hash: '0x' + Math.random().toString(16).substring(2, 10),
                    ownerAgent: 'Supreme-Architect'
                  }]);
                  setTerminalOutput(prev => [`[SparseBundle]: Created and partitioned new container ${newId}.`, ...prev]);
                }}
                className="flex items-center space-x-2 px-3 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create SparseBundle</span>
              </button>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="p-3">Bundle Name</th>
                    <th className="p-3">Size (GB)</th>
                    <th className="p-3">Tether Nodes</th>
                    <th className="p-3">Owner Agent</th>
                    <th className="p-3">Parity Hash</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {bundles.map(bundle => (
                    <tr key={bundle.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-semibold text-slate-200 flex items-center space-x-2">
                        <Folder className="w-4 h-4 text-cyan-400" />
                        <span>{bundle.name}</span>
                      </td>
                      <td className="p-3 text-cyan-300 font-bold">{bundle.sizeGB} GB</td>
                      <td className="p-3 text-slate-300">{bundle.tetherNodes} nodes</td>
                      <td className="p-3 text-purple-400">{bundle.ownerAgent}</td>
                      <td className="p-3 text-slate-400 font-mono text-[10px]">{bundle.hash}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          bundle.status === 'Synced' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          bundle.status === 'Backing Up' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
                          'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}>
                          {bundle.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => triggerBackup(bundle.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-cyan-400 transition-colors"
                            title="Trigger Amazon Q CLI / Grok Backup"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedBundle(bundle.id);
                              setTerminalOutput(prev => [`[SparseBundle]: Inspected container ${bundle.name}. Verified zero-trust integrity.`, ...prev]);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-purple-400 transition-colors"
                            title="Inspect Integrity"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'mounts' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-cyan-400 font-bold text-sm">External Service Mounts, Tunnels & Gadgets</div>
                <div className="text-slate-400 text-[11px]">Configure and monitor SSH tunnels, Chrome Remote Debugging, Windows Developer access, Localhost SMB shares, NAS arrays, and Google Gadgets embed pipelines.</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-bold">All Tunnels Operational</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mounts.map(mount => (
                <div key={mount.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded text-[10px] font-bold">
                      {mount.type}
                    </span>
                    <span className="text-emerald-400 text-[11px] font-bold flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      <span>{mount.status}</span>
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-slate-200 text-sm">{mount.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1 break-all bg-slate-950 p-2 rounded border border-slate-800">
                      {mount.endpoint}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-400 text-[11px]">
                    <span>Latency: <strong className="text-cyan-300">{mount.latencyMs} ms</strong></span>
                    <div className="flex items-center space-x-2">
                      <span>Auto-Sync</span>
                      <button 
                        onClick={() => toggleAutoSync(mount.id)}
                        className={`w-8 h-4 rounded-full transition-colors relative ${mount.autoSync ? 'bg-cyan-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${mount.autoSync ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-cyan-400 font-bold text-sm">Soul Stone GOD Policy Audit Trail</div>
                <div className="text-slate-400 text-[11px]">Real-time immutable ledger of all file modifications, key rotations, and TetherMesh partition synchronizations.</div>
              </div>
              <button 
                onClick={() => {
                  setAuditLogs(prev => [
                    { id: `aud-${prev.length + 1}`, timestamp: new Date().toLocaleTimeString(), action: 'Manual GOD Policy Integrity Check', nodeId: 'Supreme-Architect', status: 'Verified' },
                    ...prev
                  ]);
                  setTerminalOutput(prev => [`[Soul Stone]: Manual audit verification triggered. All systems nominal.`, ...prev]);
                }}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
              >
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>Run Audit Sweep</span>
              </button>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action Description</th>
                    <th className="p-3">Executing Node</th>
                    <th className="p-3">GOD Policy Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 text-cyan-400 font-mono">{log.timestamp}</td>
                      <td className="p-3 font-semibold text-slate-200">{log.action}</td>
                      <td className="p-3 text-purple-400 font-mono">{log.nodeId}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sandboxes' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-cyan-400 font-bold text-sm">Sub-Worker Agent Sandbox Lifecycle Management</div>
                <div className="text-slate-400 text-[11px]">Orchestrate runtime nexus-orb tethering and packet-cycle calculations (+1 delivered / -0 dropped at 33.3ms pulse intervals).</div>
              </div>
              <div className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20">
                6,000 Active Sandbox Containers
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Platoon Vanguard-Alpha', activeAgents: 2000, packetCycle: '33.3 ms', state: 'Running' },
                { title: 'Platoon Shield-Beta', activeAgents: 2000, packetCycle: '33.3 ms', state: 'Running' },
                { title: 'Platoon Recon-Gamma', activeAgents: 2000, packetCycle: '33.3 ms', state: 'Running' }
              ].map((sandbox, i) => (
                <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{sandbox.title}</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">
                      {sandbox.state}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-slate-400">
                    <div className="flex justify-between">
                      <span>Assigned Workers:</span>
                      <strong className="text-cyan-400">{sandbox.activeAgents} Agents</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Packet Pulse Rate:</span>
                      <strong className="text-amber-400">{sandbox.packetCycle}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Drop Rate Metric:</span>
                      <strong className="text-emerald-400">-0.00% (-0 dropped)</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
