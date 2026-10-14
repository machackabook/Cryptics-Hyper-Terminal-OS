import React, { useState } from 'react';
import { useCryptic } from '../../store/crypticContext';
import { Activity, ShieldAlert, Cpu, Wrench, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';

export const NetworkInspectorModule: React.FC = () => {
  const { networkPackets, sensorDiagnostics, triggerNetworkRemedy } = useCryptic();
  const [activeTab, setActiveTab] = useState<'packets' | 'heatmap' | 'sensors'>('packets');
  const [autoRemedyEnabled, setAutoRemedyEnabled] = useState(true);

  // Generate heatmap matrix (5x8 regional cells)
  const heatmapGrid = Array.from({ length: 40 }).map((_, i) => {
    // Generate jitter stability simulation
    const seed = (i * 17 + 23) % 100;
    const isDegraded = i === 14 || i === 29;
    return {
      index: i,
      region: `Sector-${Math.floor(i / 8) + 1}-${(i % 8) + 1}`,
      latency: isDegraded ? 180 + (seed % 60) : 12 + (seed % 28),
      loss: isDegraded ? 8.4 : 0.0,
      status: isDegraded ? 'DEGRADED' : 'NOMINAL',
    };
  });

  return (
    <div className="flex flex-col h-full bg-[#020712] text-xs font-mono overflow-hidden">
      {/* Tab controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#42f5ff]/20 bg-[#051122]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('packets')}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'packets' ? 'bg-[#42f5ff] text-[#02050b]' : 'text-[#8ba4bf] hover:text-white'
            }`}
          >
            <Activity className="w-3 h-3" /> PACKET STREAM ({networkPackets.length})
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'heatmap' ? 'bg-[#74ff9b] text-[#02050b]' : 'text-[#8ba4bf] hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3 text-[#74ff9b]" /> STABILITY HEATMAP
          </button>
          <button
            onClick={() => setActiveTab('sensors')}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'sensors' ? 'bg-[#f5ce70] text-[#02050b]' : 'text-[#8ba4bf] hover:text-white'
            }`}
          >
            <Cpu className="w-3 h-3 text-[#f5ce70]" /> SENSOR DIAGNOSTICS ({sensorDiagnostics.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[9px] text-[#8aa0b6] flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRemedyEnabled}
              onChange={(e) => setAutoRemedyEnabled(e.target.checked)}
              className="accent-[#74ff9b]"
            />
            AUTO-REMEDY
          </label>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {activeTab === 'packets' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-[#8aa0b6] border-b border-[#42f5ff]/15 pb-1">
              <span>ACTIVE TELEMETRY HOPS</span>
              <span>DYNAMIC REMEDY PROTOCOLS READY</span>
            </div>

            <div className="space-y-1.5">
              {networkPackets.map((pkt, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border transition ${
                    pkt.remedyActive
                      ? 'border-[#f5ce70] bg-[#1a1406]/50'
                      : 'border-[#42f5ff]/20 bg-[#051122]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px] truncate">{pkt.node}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#42f5ff]/15 text-[#42f5ff] font-semibold">
                      {pkt.protocol}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-1.5 text-[9px] text-[#8aa0b6]">
                    <div>
                      LATENCY: <span className="text-[#74ff9b] font-semibold">{pkt.latencyMs} ms</span>
                    </div>
                    <div>
                      JITTER: <span className="text-white">{pkt.jitterMs} ms</span>
                    </div>
                    <div>
                      LOSS: <span className={pkt.packetLossPercent > 0 ? 'text-red-400 font-bold' : 'text-[#74ff9b]'}>{pkt.packetLossPercent}%</span>
                    </div>
                    <div>
                      STABILITY: <span className="text-[#42f5ff] font-semibold">{pkt.stabilityScore}%</span>
                    </div>
                  </div>

                  {pkt.remedyActive && (
                    <div className="mt-2 p-1.5 rounded bg-[#2a1d04] border border-[#f5ce70]/40 text-[9px] text-[#f5ce70] flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <Wrench className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{pkt.remedyLog}</span>
                      </div>
                      <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                        MITIGATED
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#8aa0b6]">REGIONAL COMMUNICATION LATENCY &amp; STABILITY MATRIX</span>
              <div className="flex items-center gap-2 text-[8px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> &lt;30ms (Optimal)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 30-100ms</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> &gt;100ms (Degraded)</span>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-1.5 p-2 rounded-lg bg-[#040e1c] border border-[#42f5ff]/20">
              {heatmapGrid.map((cell) => {
                const color =
                  cell.status === 'DEGRADED'
                    ? 'bg-red-500/60 border-red-400 text-white'
                    : cell.latency > 35
                    ? 'bg-amber-500/40 border-amber-400 text-amber-200'
                    : 'bg-emerald-500/25 border-emerald-500/50 text-emerald-200';
                return (
                  <div
                    key={cell.index}
                    onClick={() => {
                      if (cell.status === 'DEGRADED') triggerNetworkRemedy(cell.region);
                    }}
                    title={`${cell.region} - Latency: ${cell.latency}ms, Loss: ${cell.loss}%`}
                    className={`h-11 rounded border p-1 flex flex-col justify-between text-[8px] cursor-pointer hover:scale-105 transition ${color}`}
                  >
                    <span className="truncate font-semibold">{cell.region.split('-').slice(1).join('-')}</span>
                    <span className="font-bold">{cell.latency}ms</span>
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 rounded-lg bg-[#061426] border border-[#42f5ff]/20 text-[9px] text-[#8aa0b6] space-y-1">
              <div className="font-bold text-[#42f5ff]">AUTOMATED REMEDY ENGINE</div>
              <div>
                When packet loss exceeds 2% or latency jitter crosses threshold (12ms), the sovereign mesh router performs instantaneous zero-downtime BGP failover to local peer microwave corridors.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sensors' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[10px] text-[#8aa0b6]">
              <span>REMOTE SENSOR SUITE DIAGNOSTICS</span>
              <button
                onClick={() => triggerNetworkRemedy('Hardware Mesh Diagnostic Sweep')}
                className="px-2 py-0.5 rounded bg-[#42f5ff]/20 text-[#42f5ff] border border-[#42f5ff]/30 text-[9px] hover:bg-[#42f5ff]/30 cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-2.5 h-2.5" /> RE-CALIBRATE
              </button>
            </div>

            <div className="space-y-2">
              {sensorDiagnostics.map((sns) => (
                <div key={sns.sensorId} className="p-2.5 rounded-lg bg-[#051122] border border-[#42f5ff]/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#42f5ff]" />
                      {sns.sensorId} // {sns.name}
                    </span>
                    <span
                      className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                        sns.status === 'NOMINAL'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : sns.status === 'DEGRADED'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {sns.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[9px] text-[#8aa0b6]">
                    <div>REGION: <span className="text-white">{sns.region}</span></div>
                    <div>THERMAL: <span className={sns.thermalC > 35 ? 'text-amber-400 font-bold' : 'text-[#74ff9b]'}>{sns.thermalC}°C</span></div>
                    <div>FIRMWARE: <span className="text-[#42f5ff]">{sns.firmware}</span></div>
                  </div>

                  {sns.status !== 'NOMINAL' && (
                    <button
                      onClick={() => triggerNetworkRemedy(sns.name)}
                      className="mt-1 w-full py-1 rounded bg-[#f5ce70] text-[#02050b] font-bold text-[9px] hover:bg-[#ffe399] transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Wrench className="w-3 h-3" /> APPLY AUTONOMOUS SENSOR REMEDY
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
