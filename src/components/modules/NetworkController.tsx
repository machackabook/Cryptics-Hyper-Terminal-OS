import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Signal, 
  Radio, 
  Globe, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Sliders,
  Smartphone,
  Server
} from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';

export const NetworkController: React.FC = () => {
  const { addTerminalLine, addLedger } = useCryptic();
  
  // Controller state
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'ROAMING' | 'SECURE_MESH' | 'STANDBY'>('CONNECTED');
  const [signalBars, setSignalBars] = useState<number>(5);
  const [activeBridge, setActiveBridge] = useState<'satcom' | 'atsc' | 'quantum-mesh'>('satcom');
  const [bandwidthLimitMbps, setBandwidthLimitMbps] = useState<number>(1250);
  const [latencyMs, setLatencyMs] = useState<number>(18.4);
  const [packetLoss, setPacketLoss] = useState<number>(0.02);
  const [airplaneMode, setAirplaneMode] = useState<boolean>(false);
  const [autoHandover, setAutoHandover] = useState<boolean>(true);
  const [diagnosticRunning, setDiagnosticRunning] = useState<boolean>(false);

  // Periodic jitter simulator
  useEffect(() => {
    if (airplaneMode) return;
    const interval = setInterval(() => {
      const jitter = (Math.random() - 0.5) * 3.2;
      setLatencyMs(prev => Math.max(8.0, Number((prev + jitter).toFixed(1))));
    }, 2500);
    return () => clearInterval(interval);
  }, [airplaneMode]);

  const handleToggleAirplane = () => {
    const nextMode = !airplaneMode;
    setAirplaneMode(nextMode);
    if (nextMode) {
      setConnectionStatus('STANDBY');
      setSignalBars(0);
      addTerminalLine('[NETWORK CONTROLLER]: Cellular bridge & eSIM transceiver suspended (Airplane Mode active).', 'warn');
      addLedger('network.airplane.enabled', {});
    } else {
      setConnectionStatus('CONNECTED');
      setSignalBars(5);
      addTerminalLine('[NETWORK CONTROLLER]: Cellular bridge & eSIM transceiver re-initialized. Signal locked.', 'good');
      addLedger('network.airplane.disabled', {});
    }
  };

  const handleRunDiagnostic = () => {
    setDiagnosticRunning(true);
    addTerminalLine(`[NETWORK CONTROLLER]: Running full RF spectrum scan and bridge diagnostics on ${activeBridge.toUpperCase()}...`, 'system');
    setTimeout(() => {
      setDiagnosticRunning(false);
      setLatencyMs(14.2);
      setPacketLoss(0.00);
      addTerminalLine('[NETWORK CONTROLLER]: Diagnostic complete. Zero packet loss. Route secure across 6,000 node mesh.', 'good');
      addLedger('network.diagnostic.completed', { bridge: activeBridge, latency: 14.2 });
    }, 1600);
  };

  const handleBridgeChange = (bridge: 'satcom' | 'atsc' | 'quantum-mesh') => {
    setActiveBridge(bridge);
    addTerminalLine(`[NETWORK CONTROLLER]: Switched active cellular bridge to ${bridge.toUpperCase()} protocol.`, 'good');
    addLedger('network.bridge.changed', { bridge });
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-mono text-xs select-none p-4 space-y-4 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 border-b border-cyan-500/30 gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-cyan-300 text-sm tracking-wider flex items-center space-x-2">
              <span>NETWORK CONTROLLER &amp; CELLULAR BRIDGE</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                airplaneMode 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {airplaneMode ? 'AIRPLANE MODE' : connectionStatus}
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Manages cellular bridge status, eSIM signal strength, bandwidth allocation, and RF mesh handovers.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleAirplane}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition flex items-center space-x-1.5 ${
              airplaneMode 
                ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 border-amber-400' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{airplaneMode ? 'Disable Airplane Mode' : 'Enable Airplane Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Body */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
        {/* Left Column: Signal & Status gauges */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-xs flex items-center space-x-1.5">
                <Signal className="w-4 h-4 text-emerald-400" />
                <span>Cellular Bridge Signal</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                {airplaneMode ? '0 dBm' : `-${Math.floor(55 - signalBars * 7)} dBm`}
              </span>
            </div>

            {/* Signal Bars Visualizer */}
            <div className="space-y-2">
              <div className="flex items-end justify-center space-x-2 h-14 bg-slate-950 p-3 rounded-xl border border-slate-800">
                {[1, 2, 3, 4, 5].map(bar => (
                  <div
                    key={bar}
                    onClick={() => !airplaneMode && setSignalBars(bar)}
                    className={`w-4 rounded-t transition-all cursor-pointer ${
                      bar <= (airplaneMode ? 0 : signalBars)
                        ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                    style={{ height: `${bar * 20}%` }}
                    title={`Set Signal Bars to ${bar}`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 px-1">
                <span>Weak (1)</span>
                <span>Optimal (5 Bars)</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                <div className="text-slate-400 text-[10px]">Latency</div>
                <div className="text-cyan-300 font-bold text-sm">{airplaneMode ? '---' : `${latencyMs} ms`}</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                <div className="text-slate-400 text-[10px]">Packet Loss</div>
                <div className="text-emerald-400 font-bold text-sm">{airplaneMode ? '100%' : `${packetLoss}%`}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunDiagnostic}
            disabled={diagnosticRunning || airplaneMode}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${diagnosticRunning ? 'animate-spin' : ''}`} />
            <span>{diagnosticRunning ? 'Running RF Diagnostic...' : 'Run RF Diagnostics'}</span>
          </button>
        </div>

        {/* Middle Column: Bridge Selector & Bandwidth Controller */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-xs flex items-center space-x-1.5">
                <Server className="w-4 h-4 text-purple-400" />
                <span>Cellular Bridge Protocols</span>
              </span>
              <span className="text-[10px] text-purple-300 font-mono">Multi-carrier</span>
            </div>

            <div className="space-y-2">
              {[
                { id: 'satcom', name: 'Cryptic Sovereign Satcom eSIM', desc: 'LEO Low-Earth Orbit Direct Link (48.5 GB Balance)' },
                { id: 'atsc', name: 'Global ATSC 3.0 OTA Roaming', desc: 'Terrestrial Broadcaster Mesh (12.0 GB Balance)' },
                { id: 'quantum-mesh', name: 'Quantum Encrypted Mesh Gateway', desc: 'Zero-Knowledge Distributed Node Tunnel' },
              ].map(bridge => (
                <div
                  key={bridge.id}
                  onClick={() => !airplaneMode && handleBridgeChange(bridge.id as any)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition space-y-1 ${
                    activeBridge === bridge.id
                      ? 'bg-cyan-950/80 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{bridge.name}</span>
                    {activeBridge === bridge.id && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">{bridge.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-bold">Auto-Handover on Degradation</span>
              <button
                onClick={() => setAutoHandover(!autoHandover)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  autoHandover ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {autoHandover ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Bandwidth allocation & Telemetry Log */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-xs flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Bandwidth Allocator</span>
              </span>
              <span className="text-[10px] text-amber-300 font-mono font-bold">{bandwidthLimitMbps} Mbps</span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={bandwidthLimitMbps}
                disabled={airplaneMode}
                onChange={e => setBandwidthLimitMbps(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>100 Mbps</span>
                <span>5,000 Mbps Ultra-HD</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Controller Telemetry Feed</div>
              <div className="space-y-1 text-[10px] font-mono text-cyan-300 max-h-32 overflow-y-auto">
                <div>[BRIDGE_STATUS]: E2EE tunnel active on {activeBridge.toUpperCase()}.</div>
                <div>[SIGNAL_LOCK]: {signalBars}/5 bars received from nearest ground beacon.</div>
                <div>[BANDWIDTH]: {bandwidthLimitMbps} Mbps allocated for VoIP &amp; eSIM data.</div>
                {!airplaneMode && <div>[HEARTBEAT]: Low-earth orbit relay response OK ({latencyMs}ms).</div>}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-emerald-300 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cellular bridge fully synchronized with Virtual Mobile VoIP &amp; eSIM chassis.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
