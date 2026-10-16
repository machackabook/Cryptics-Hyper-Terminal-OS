import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Radio, 
  FileText, 
  Cpu, 
  Server, 
  Key, 
  Globe, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Database, 
  Terminal, 
  Activity,
  Layers,
  FileCheck,
  Send,
  Eye,
  Download
} from 'lucide-react';

export const ArchitectDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'comms' | 'documents' | 'ownership' | 'security'>('comms');
  const [satelliteFreq, setSatelliteFreq] = useState(1420.405); // MHz Hydrogen line
  const [quantumEncryption, setQuantumEncryption] = useState(true);
  const [godPolicyActive, setGodPolicyActive] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<string | null>('antigravity-sdk-python-main.zip');
  const [commStatus, setCommStatus] = useState<'nominal' | 'calibrating' | 'encrypted'>('encrypted');
  const [actionLog, setActionLog] = useState<string[]>([
    'SYSTEM: Architect Master Authentication Verified (ID: 137451921129154222)',
    'COMMS: Quantum relay trunk established across 6,000 agent nodes',
    'SECURITY: Soul Stone GOD policy successfully mounted and enforced',
    'DOCUMENTS: Secure repository indexed (4 core artifacts loaded)'
  ]);

  const addLog = (msg: string) => {
    setActionLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 30)]);
  };

  const documentsList = [
    { name: 'antigravity-sdk-python-main.zip', size: '24.8 MB', type: 'SDK Binary & Source Archive', security: 'Level 5 Restricted', updated: '2026-10-15 11:42 UTC' },
    { name: 'soul_stone_god_policy.json', size: '1.2 KB', type: 'Sovereign Core Governance Protocol', security: 'Absolute Sovereign', updated: '2026-10-15 10:15 UTC' },
    { name: 'wireless_adb_ota_firmware.bin', size: '118.4 MB', type: 'OTA Android Flash Package', security: 'Level 4 Encrypted', updated: '2026-10-15 09:30 UTC' },
    { name: 'solarisarafin_ai_weights_manifest.yaml', size: '4.5 MB', type: 'Neural Telemetry Model Manifest', security: 'Level 5 Restricted', updated: '2026-10-15 08:00 UTC' }
  ];

  const triggerCalibrateComms = () => {
    setCommStatus('calibrating');
    addLog('COMM_ARRAY: Initiating frequency sweep and quantum entanglement handshake...');
    setTimeout(() => {
      setCommStatus('encrypted');
      addLog('COMM_ARRAY: Quantum channels locked at 1420.405 MHz with zero packet loss.');
    }, 1800);
  };

  const toggleGodPolicy = () => {
    const next = !godPolicyActive;
    setGodPolicyActive(next);
    addLog(`GOD_POLICY: Soul Stone governance policy ${next ? 'ACTIVATED & ENFORCED' : 'SUSPENDED (Warning)'}`);
  };

  return (
    <div className="h-full flex flex-col bg-[#030712] text-slate-200 font-mono select-none overflow-hidden">
      {/* Top Header Bar */}
      <div className="h-12 bg-[#0b1329] border-b border-[#42f5ff]/30 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-[0_0_10px_#f59e0b] animate-pulse" />
          <span className="text-xs font-black tracking-widest text-[#42f5ff] uppercase flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#f59e0b]" /> THE ARCHITECT PRIVATE CONTROL SUITE
          </span>
          <span className="text-[10px] bg-[#f59e0b]/20 text-[#f59e0b] px-2 py-0.5 rounded border border-[#f59e0b]/40">
            MASTER ID: 13745...4222
          </span>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> BIOMETRIC GATE PASSED
          </span>
          <span className="flex items-center gap-1.5 text-[#42f5ff]">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> COMMS: {commStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-[#050b18] border-b border-slate-800 px-4 flex items-center gap-2 h-10 shrink-0">
        {[
          { id: 'comms', label: 'Telecommunication Management', icon: Radio },
          { id: 'documents', label: 'Secure Document Repository', icon: FileText },
          { id: 'ownership', label: 'Access Ownership & Settings', icon: Sliders },
          { id: 'security', label: 'Soul Stone & GOD Policy', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#42f5ff]/20 text-[#42f5ff] border border-[#42f5ff]/40 shadow-[0_0_12px_rgba(66,245,255,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'comms' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left 2 Cols: Telecommunication Control Panel */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#0b1329]/80 border border-[#42f5ff]/20 rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-[#42f5ff] flex items-center gap-2">
                    <Radio className="w-4 h-4" /> QUANTUM & SATELLITE RELAY CONTROLLER
                  </h3>
                  <button
                    type="button"
                    onClick={triggerCalibrateComms}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#42f5ff]/20 hover:bg-[#42f5ff]/30 text-[#42f5ff] text-[11px] font-bold border border-[#42f5ff]/40 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" /> Calibrate Array
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                    <div className="text-[10px] text-slate-400 mb-1">Carrier Frequency (MHz)</div>
                    <div className="text-lg font-bold text-white flex items-center justify-between">
                      <span>{satelliteFreq.toFixed(3)} MHz</span>
                      <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">Locked</span>
                    </div>
                    <input 
                      type="range" 
                      min="1000" 
                      max="2000" 
                      step="0.1"
                      value={satelliteFreq}
                      onChange={(e) => setSatelliteFreq(parseFloat(e.target.value))}
                      className="w-full mt-3 accent-[#42f5ff] cursor-pointer"
                    />
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                    <div className="text-[10px] text-slate-400 mb-1">Encryption Protocol</div>
                    <div className="text-sm font-bold text-white flex items-center justify-between mt-1">
                      <span className="flex items-center gap-2 text-cyan-300">
                        <Lock className="w-4 h-4 text-[#f59e0b]" /> AES-256 + Quantum Entanglement
                      </span>
                      <button 
                        type="button"
                        onClick={() => setQuantumEncryption(!quantumEncryption)}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${quantumEncryption ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}
                      >
                        {quantumEncryption ? 'ACTIVE' : 'BYPASSED'}
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2">Zero-trust handshake verified across 6,000 agent nodes.</div>
                  </div>
                </div>

                {/* Relay Nodes Map/Grid */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div className="text-[11px] font-semibold text-slate-300 mb-3 flex items-center justify-between">
                    <span>Active Relay Trunks & Swarm Links</span>
                    <span className="text-[#42f5ff]">6,000 / 6,000 Connected</span>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from({ length: 18 }).map((_, idx) => (
                      <div key={idx} className="bg-slate-900 border border-[#42f5ff]/20 p-2 rounded text-center">
                        <div className="text-[9px] text-[#42f5ff] font-bold">RELAY-{101 + idx}</div>
                        <div className="text-[10px] text-emerald-400 mt-1 flex items-center justify-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> 0.2ms
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Live Comms Event Log */}
            <div className="bg-[#0b1329]/80 border border-[#42f5ff]/20 rounded-xl p-4 flex flex-col shadow-lg">
              <h3 className="text-xs font-bold text-[#42f5ff] flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                <Terminal className="w-4 h-4" /> ARCHITECT AUDIT LOG
              </h3>
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-[10px] text-cyan-300/90 overflow-y-auto space-y-1.5 max-h-[380px]">
                {actionLog.map((log, i) => (
                  <div key={i} className="border-b border-slate-900 pb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left 2 Cols: Document List */}
            <div className="lg:col-span-2 bg-[#0b1329]/80 border border-[#42f5ff]/20 rounded-xl p-4 shadow-lg">
              <h3 className="text-xs font-bold text-[#42f5ff] flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                <FileText className="w-4 h-4" /> UPLOADED DOCUMENTS & SENSITIVE REPOSITORY
              </h3>
              <div className="space-y-2">
                {documentsList.map((doc) => (
                  <div 
                    key={doc.name}
                    onClick={() => {
                      setSelectedDoc(doc.name);
                      addLog(`DOCUMENTS: Accessed archive "${doc.name}"`);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      selectedDoc === doc.name 
                        ? 'bg-[#42f5ff]/15 border-[#42f5ff]/60 shadow-[0_0_10px_rgba(66,245,255,0.2)] text-white' 
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-[#42f5ff]" />
                      <div>
                        <div className="text-xs font-bold">{doc.name}</div>
                        <div className="text-[10px] text-slate-400">{doc.type} • {doc.size} • {doc.updated}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
                      {doc.security}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Document Inspector */}
            <div className="bg-[#0b1329]/80 border border-[#42f5ff]/20 rounded-xl p-4 flex flex-col shadow-lg">
              <h3 className="text-xs font-bold text-[#42f5ff] flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                <Eye className="w-4 h-4" /> REPOSITORY INSPECTOR
              </h3>
              {selectedDoc ? (
                <div className="space-y-3 flex-1 flex flex-col">
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs">
                    <div className="text-[10px] text-slate-400">Selected Archive</div>
                    <div className="font-bold text-white mt-0.5">{selectedDoc}</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-[10px] text-slate-300 flex-1 font-mono">
                    <div className="text-[#42f5ff] mb-1 font-bold"># ARCHIVE MANIFEST & HASH</div>
                    <div>SHA-256: 8f9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b</div>
                    <div>Ownership: The Architect (Verified Master)</div>
                    <div>Access Permissions: Read / Write / Execute / OTA Flash</div>
                    <div className="text-emerald-400 mt-2">Status: Fully integrated into Antigravity Python SDK & HyperTerminal CLI runtime.</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => addLog(`DOWNLOAD: Exported secure archive ${selectedDoc}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded bg-[#42f5ff]/20 hover:bg-[#42f5ff]/30 text-[#42f5ff] text-xs font-bold border border-[#42f5ff]/40 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Archive
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic text-center py-12">Select a document to inspect its contents.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ownership' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Access Ownership Section */}
            <div className="bg-[#0b1329]/80 border border-[#42f5ff]/20 rounded-xl p-4 shadow-lg space-y-4">
              <h3 className="text-xs font-bold text-[#42f5ff] flex items-center gap-2 pb-2 border-b border-slate-800">
                <Key className="w-4 h-4" /> ACCESS OWNERSHIP & TIER RANKING
              </h3>
              <div className="space-y-3 text-xs">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Tier 1: Vanguard Battalion</div>
                    <div className="text-[10px] text-slate-400">Primary edge monitoring and instant threat mitigation.</div>
                  </div>
                  <span className="text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded border border-emerald-500/40 font-bold">OPTIMIZED</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Tier 2: Shield Defense Division</div>
                    <div className="text-[10px] text-slate-400">Firewall and zero-trust protocol reinforcement.</div>
                  </div>
                  <span className="text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded border border-emerald-500/40 font-bold">OPTIMIZED</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Tier 3: Recon Brigade</div>
                    <div className="text-[10px] text-slate-400">Deep telemetry and autonomous agent delivery tracking.</div>
                  </div>
                  <span className="text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded border border-emerald-500/40 font-bold">OPTIMIZED</span>
                </div>
              </div>
            </div>

            {/* Sensitive System Settings */}
            <div className="bg-[#0b1329]/80 border border-[#42f5ff]/20 rounded-xl p-4 shadow-lg space-y-4">
              <h3 className="text-xs font-bold text-[#42f5ff] flex items-center gap-2 pb-2 border-b border-slate-800">
                <Sliders className="w-4 h-4" /> SENSITIVE SYSTEM SETTINGS & OVERRIDES
              </h3>
              <div className="space-y-3 text-xs">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Wireless ADB & OTA Flashing Rights</div>
                    <div className="text-[10px] text-slate-400">Allow Antigravity ADB bridge to push OTA updates directly.</div>
                  </div>
                  <span className="text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/40 font-bold">ENABLED</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Solarisarafin AI Remote Link</div>
                    <div className="text-[10px] text-slate-400">Dedicated monitoring model interface.</div>
                  </div>
                  <span className="text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">CONNECTED</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Biometric Camera Liveness Gate</div>
                    <div className="text-[10px] text-slate-400">Mandatory verification prior to Architect access.</div>
                  </div>
                  <span className="text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">ENFORCED</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Soul Stone & GOD Policy */}
            <div className="bg-[#0b1329]/80 border border-[#42f5ff]/20 rounded-xl p-4 shadow-lg space-y-4">
              <h3 className="text-xs font-bold text-[#42f5ff] flex items-center gap-2 pb-2 border-b border-slate-800">
                <Shield className="w-4 h-4 text-[#f59e0b]" /> SOUL STONE & GOD POLICY GOVERNANCE
              </h3>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">GOD Policy Enforcement:</span>
                  <button
                    type="button"
                    onClick={toggleGodPolicy}
                    className={`px-3 py-1 rounded text-xs font-bold ${godPolicyActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}
                  >
                    {godPolicyActive ? 'ACTIVE & GOVERNING' : 'DISABLED'}
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed">
                  The GOD policy set forth within the Soul Stone governs all 6,000 agent nodes, ensuring that every reallocated process and defense protocol operates under absolute sovereign oversight with immutable cryptographic guarantees.
                </div>
              </div>
            </div>

            {/* Solarisarafin AI Integration */}
            <div className="bg-[#0b1329]/80 border border-[#42f5ff]/20 rounded-xl p-4 shadow-lg space-y-4">
              <h3 className="text-xs font-bold text-[#42f5ff] flex items-center gap-2 pb-2 border-b border-slate-800">
                <Zap className="w-4 h-4 text-[#42f5ff]" /> SOLARISARAFIN AI MODEL MONITORING
              </h3>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Model Instance:</span>
                  <span className="text-cyan-300 font-bold">Solarisarafin-v4.9-Sovereign</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Network Telemetry Feed:</span>
                  <span className="text-emerald-400">Synchronized (6k Agents)</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed">
                  Active monitoring link provides real-time anomaly detection and autonomous defensive reconfiguration across all network nodes.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
