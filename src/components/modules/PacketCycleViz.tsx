import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Cpu, Zap, Layers } from 'lucide-react';

export const PacketCycleViz: React.FC = () => {
  const [angle, setAngle] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [packetsDelivered, setPacketsDelivered] = useState(14820);
  const [packetsDropped, setPacketsDropped] = useState(0);
  const [pulseMetric, setPulseMetric] = useState(33.3);

  useEffect(() => {
    const timer = setInterval(() => {
      setAngle(prev => (prev + 12) % 360);
      setCycleCount(prev => prev + 1);
      setPacketsDelivered(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 33.3); // 33.3ms sub-second pulse interval

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-4 rounded-xl bg-[#051020] border border-cyan-500/40 space-y-4 shadow-[0_0_25px_rgba(66,245,255,0.15)]">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-bold text-cyan-300 tracking-wider text-xs">
            PACKETCYCLEVIZ: 33.3MS SPINDLE &amp; FRACTAL PAIR SYNCHRONIZATION
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-bold">
            Pulse: {pulseMetric}ms
          </span>
          <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/30 rounded text-[9px] font-bold">
            Cycles: {cycleCount}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-zinc-400">
        Visualizing sub-worker agent pair synchronization. The actuating spindle turn in the center orchestrates cache absorption and core delivery at precise 33.3ms pulse intervals (+1 delivered, -0 dropped).
      </p>

      {/* Spindle & Frame-Rate Node Visualization */}
      <div className="relative bg-[#020710] border border-zinc-800 rounded-xl p-6 flex items-center justify-between overflow-hidden min-h-[180px]">
        {/* Left Frame Rate Node */}
        <div className="flex flex-col items-center space-y-2 z-10 w-1/4">
          <div className="w-14 h-14 rounded-xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(66,245,255,0.4)] animate-pulse">
            <Cpu className="w-6 h-6" />
          </div>
          <div className="text-center">
            <div className="font-bold text-white text-[11px]">Node-Alpha</div>
            <div className="text-[9px] text-cyan-400 font-mono">Primary Nexus</div>
          </div>
          <div className="text-[9px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            +{packetsDelivered} Pkts
          </div>
        </div>

        {/* Center Spindle Turn & Fractal Animation */}
        <div className="relative flex flex-col items-center justify-center z-10 w-2/4">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Outer Rotating Spindle Ring */}
            <div 
              className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/60 transition-transform duration-75"
              style={{ transform: `rotate(${angle}deg)` }}
            />
            {/* Middle Fractal Geometric Shape */}
            <div 
              className="absolute inset-3 rounded-full border border-purple-500/70 bg-purple-950/20 transition-transform duration-75 flex items-center justify-center"
              style={{ transform: `rotate(-${angle * 1.5}deg)` }}
            >
              <div className="w-10 h-10 rotate-45 border border-cyan-300 bg-cyan-950/40 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-cyan-400 animate-ping" />
              </div>
            </div>
            {/* Center Spindle Core */}
            <div className="w-8 h-8 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(66,245,255,0.8)] flex items-center justify-center text-slate-950 font-bold text-[10px]">
              Ω
            </div>
          </div>

          <div className="text-[10px] text-cyan-300 font-mono mt-2 tracking-widest text-center">
            SPINDLE ACTUATION ({angle.toFixed(0)}°)
          </div>
        </div>

        {/* Right Frame Rate Node ("The One" Reverse Pair) */}
        <div className="flex flex-col items-center space-y-2 z-10 w-1/4">
          <div className="w-14 h-14 rounded-xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse">
            <Layers className="w-6 h-6" />
          </div>
          <div className="text-center">
            <div className="font-bold text-white text-[11px]">Alpha-Rev</div>
            <div className="text-[9px] text-purple-400 font-mono">Sub-Worker Pair</div>
          </div>
          <div className="text-[9px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            -0 Drops
          </div>
        </div>

        {/* Background Energy Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(66,245,255,0.03)_1px,transparent_1px),linear-gradient(0deg,rgba(66,245,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
        <div className="bg-[#020710] p-2 rounded border border-zinc-800">
          <div className="text-zinc-400">Delivered Packets</div>
          <div className="text-emerald-400 font-bold text-xs mt-0.5">+{packetsDelivered}</div>
        </div>
        <div className="bg-[#020710] p-2 rounded border border-zinc-800">
          <div className="text-zinc-400">Dropped Packets</div>
          <div className="text-cyan-400 font-bold text-xs mt-0.5">-{packetsDropped} (-0%)</div>
        </div>
        <div className="bg-[#020710] p-2 rounded border border-zinc-800">
          <div className="text-zinc-400">Pulse Interval</div>
          <div className="text-purple-400 font-bold text-xs mt-0.5">{pulseMetric}ms</div>
        </div>
      </div>
    </div>
  );
};
