import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Satellite, 
  RotateCw, 
  Activity, 
  Zap, 
  Signal, 
  Compass, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  Sliders, 
  Layers,
  Send,
  HardDrive
} from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';
import { SatcomRelayNode } from '../../types';

export const SatcomCircularRelayModule: React.FC = () => {
  const { addTerminalLine, addLedger } = useCryptic();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Relay loop state
  const [reboundActive, setReboundActive] = useState<boolean>(true);
  const [frequencyMhz, setFrequencyMhz] = useState<number>(533.25); // ATSC 3.0 channel
  const [pingRateMs, setPingRateMs] = useState<number>(33.3);
  const [cycleCounter, setCycleCounter] = useState<number>(14820);
  const [packetsDelivered, setPacketsDelivered] = useState<number>(42890);
  const [triangulationStatus, setTriangulationStatus] = useState<string>('LOCKED_CIRCULAR_LOOP');
  const [pingLoadPercent, setPingLoadPercent] = useState<number>(84.2);

  // Relay Nodes in the circular bounce chain
  const [relayNodes, setRelayNodes] = useState<SatcomRelayNode[]>([
    {
      id: 'node-ground-beacon',
      name: 'Ground Base Station Beacon (Origin & Return)',
      type: 'GROUND_BEACON',
      lat: 37.7749,
      lng: -122.4194,
      altitudeKm: 0.05,
      elevationAngleDeg: 48.5,
      azimuthDeg: 184.2,
      distanceKmToBeacon: 0,
      lineOfSight: true,
      rfFrequencyMhz: 533.25,
      dopplerShiftHz: 0,
      reboundRoundTripMs: 0.4,
      signalStrengthDbm: -48,
      packetsForwarded: 14820,
      packetsDropped: 0
    },
    {
      id: 'node-cluster-6k',
      name: '6,000 Agent Virtual Node Cluster',
      type: 'NODE_CLUSTER',
      lat: 37.8100,
      lng: -122.3800,
      altitudeKm: 0.35,
      elevationAngleDeg: 54.0,
      azimuthDeg: 210.0,
      distanceKmToBeacon: 5.4,
      lineOfSight: true,
      rfFrequencyMhz: 533.25,
      dopplerShiftHz: 12.4,
      reboundRoundTripMs: 12.2,
      signalStrengthDbm: -56,
      packetsForwarded: 14820,
      packetsDropped: 0
    },
    {
      id: 'node-leo-sat',
      name: 'Cryptic-SAT LEO Station (Rebounding Apex)',
      type: 'LEO_SATELLITE',
      lat: 38.2000,
      lng: -122.1000,
      altitudeKm: 550.0,
      elevationAngleDeg: 62.5,
      azimuthDeg: 275.4,
      distanceKmToBeacon: 552.1,
      lineOfSight: true,
      rfFrequencyMhz: 14250.0,
      dopplerShiftHz: -248.5,
      reboundRoundTripMs: 22.8,
      signalStrengthDbm: -72,
      packetsForwarded: 14820,
      packetsDropped: 0
    },
    {
      id: 'node-atsc-tower',
      name: 'ATSC 3.0 OTA Forwarding Transmitter',
      type: 'ATSC_OTA_TRANSMITTER',
      lat: 37.7500,
      lng: -122.4500,
      altitudeKm: 0.28,
      elevationAngleDeg: 42.0,
      azimuthDeg: 145.0,
      distanceKmToBeacon: 4.8,
      lineOfSight: true,
      rfFrequencyMhz: 533.25,
      dopplerShiftHz: 2.1,
      reboundRoundTripMs: 33.3,
      signalStrengthDbm: -52,
      packetsForwarded: 14820,
      packetsDropped: 0
    }
  ]);

  // Canvas animation for circular rebounding wave
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let phase = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#020712';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.38;

      // Draw background radar grid
      ctx.strokeStyle = 'rgba(66, 245, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let circleR = 40; circleR <= r + 30; circleR += 40) {
        ctx.beginPath();
        ctx.arc(cx, cy, circleR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw crosshair axes
      ctx.beginPath();
      ctx.moveTo(cx, 10);
      ctx.lineTo(cx, h - 10);
      ctx.moveTo(10, cy);
      ctx.lineTo(w - 10, cy);
      ctx.stroke();

      // Node Positions along the circular loop
      const positions = [
        { angle: -Math.PI / 2, label: 'LEO Sat Apex', color: '#a855f7' },
        { angle: 0, label: 'Node Cluster (6k)', color: '#38bdf8' },
        { angle: Math.PI / 2, label: 'Ground Beacon (Origin)', color: '#10b981' },
        { angle: Math.PI, label: 'ATSC OTA Relay', color: '#f59e0b' }
      ];

      // Draw rebounding trajectory path
      ctx.strokeStyle = reboundActive ? 'rgba(66, 245, 255, 0.4)' : 'rgba(100, 116, 139, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      positions.forEach((p, i) => {
        const x = cx + Math.cos(p.angle) * r;
        const y = cy + Math.sin(p.angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();

      // Draw active circular ping wave bouncing along the loop
      if (reboundActive) {
        const pingAngle = phase;
        const px = cx + Math.cos(pingAngle) * r;
        const py = cy + Math.sin(pingAngle) * r;

        // Glowing bouncing ping packet
        const pingGrad = ctx.createRadialGradient(px, py, 1, px, py, 18);
        pingGrad.addColorStop(0, '#ffffff');
        pingGrad.addColorStop(0.3, '#42f5ff');
        pingGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = pingGrad;
        ctx.beginPath();
        ctx.arc(px, py, 18, 0, Math.PI * 2);
        ctx.fill();

        // Echo trail
        ctx.strokeStyle = '#74ff9b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r, pingAngle - 0.6, pingAngle);
        ctx.stroke();
      }

      // Draw Node Points
      positions.forEach(p => {
        const x = cx + Math.cos(p.angle) * r;
        const y = cy + Math.sin(p.angle) * r;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px monospace';
        ctx.fillText(p.label, x + 10, y + 4);
      });

      // Center Spindle / Line-of-sight Reticle
      ctx.fillStyle = 'rgba(66, 245, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#42f5ff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('OTA', cx, cy + 3);
      ctx.textAlign = 'start';

      phase += 0.04;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [reboundActive]);

  // Periodic packet delivery ticker
  useEffect(() => {
    if (!reboundActive) return;
    const interval = setInterval(() => {
      setCycleCounter(prev => prev + 1);
      setPacketsDelivered(prev => prev + Math.floor(Math.random() * 3 + 1));
      setPingLoadPercent(prev => Math.max(70, Math.min(98, Number((prev + (Math.random() * 4 - 2)).toFixed(1)))));
    }, 1500);

    return () => clearInterval(interval);
  }, [reboundActive]);

  const handleInjectPingPackage = () => {
    setCycleCounter(prev => prev + 1);
    setPacketsDelivered(prev => prev + 10);
    addTerminalLine(`[SATCOM ATSC REBOUND]: Injected test package ping. Rebounded back through 4-hop circular loop (33.3ms RTT).`, 'good');
    addLedger('satcom.circular_ping.rebounded', { frequencyMhz, rttMs: 33.3, hops: 4 });
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-mono text-xs select-none p-4 space-y-4 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 border-b border-cyan-500/30 gap-2 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Satellite className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-cyan-300 text-sm tracking-wider flex items-center space-x-2">
              <span>SATCOM ATSC CIRCULAR REBOUND RELAY</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                {triangulationStatus}
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Rebounds and bounces signal from ground beacon back to itself via 6k node cluster &amp; ATSC OTA station.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setReboundActive(!reboundActive)}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
              reboundActive ? 'bg-emerald-600 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {reboundActive ? 'Loop Active' : 'Loop Paused'}
          </button>
          <button
            onClick={handleInjectPingPackage}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Inject Package Ping</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-[10px]">Ping Loaded Datacom</div>
          <div className="text-lg font-bold text-cyan-400 mt-1">{pingLoadPercent}%</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">33.3ms Pulse Sync</div>
        </div>
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-[10px]">Packets Rebounded</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">+{packetsDelivered.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">-0 Drops (100% Delivery)</div>
        </div>
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-[10px]">ATSC Carrier Frequency</div>
          <div className="text-lg font-bold text-amber-400 mt-1">{frequencyMhz} MHz</div>
          <div className="text-[10px] text-slate-500 mt-0.5">UHF Channel 24 OTA</div>
        </div>
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-[10px]">Triangulation Distance</div>
          <div className="text-lg font-bold text-purple-400 mt-1">552.1 km</div>
          <div className="text-[10px] text-purple-400 mt-0.5">LEO Apex Line of Sight</div>
        </div>
      </div>

      {/* Canvas & Node Data Plane */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Radar Circular Animation */}
        <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-2 relative flex items-center justify-center min-h-[260px] overflow-hidden">
          <canvas ref={canvasRef} width={480} height={320} className="w-full h-full object-contain" />
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-slate-950/80 rounded border border-slate-800 text-[9px] text-slate-400">
            Circular Path: Beacon &rarr; 6k Cluster &rarr; LEO Sat &rarr; ATSC Tower &rarr; Beacon Return
          </div>
        </div>

        {/* Node Triangulation Table */}
        <div className="w-full lg:w-96 bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col space-y-2 overflow-y-auto shrink-0">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="font-bold text-white text-xs">Triangulation Hop Matrix</span>
            <span className="text-cyan-400 text-[10px]">4 Hops Circular</span>
          </div>

          <div className="space-y-2">
            {relayNodes.map(node => (
              <div key={node.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate max-w-[180px]">{node.name}</span>
                  <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[9px] ${
                    node.type === 'GROUND_BEACON' ? 'bg-emerald-950 text-emerald-400' :
                    node.type === 'LEO_SATELLITE' ? 'bg-purple-950 text-purple-300' :
                    'bg-cyan-950 text-cyan-300'
                  }`}>
                    {node.type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-slate-400 font-mono">
                  <div>Distance: <strong className="text-white">{node.distanceKmToBeacon} km</strong></div>
                  <div>Doppler: <strong className="text-amber-400">{node.dopplerShiftHz} Hz</strong></div>
                  <div>Roundtrip: <strong className="text-cyan-400">{node.reboundRoundTripMs} ms</strong></div>
                  <div>Power: <strong className="text-emerald-400">{node.signalStrengthDbm} dBm</strong></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-slate-950 rounded-xl border border-cyan-500/20 text-[10px] text-slate-400">
            Continuous line-of-sight packet forwarding repeat loop guaranteed by sub-second 33.3ms beacon reflection pulses.
          </div>
        </div>
      </div>
    </div>
  );
};
