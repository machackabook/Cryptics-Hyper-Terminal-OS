import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Satellite, 
  Server, 
  Activity, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Plus, 
  MapPin, 
  Wifi, 
  Lock,
  Globe
} from 'lucide-react';
import { useCryptic } from '../store/crypticContext';
import { SatcomRelayNode } from '../types';

export const SATCOMMap: React.FC = () => {
  const { addTerminalLine, addLedger } = useCryptic();
  
  const [nodes, setNodes] = useState<SatcomRelayNode[]>([
    {
      id: 'node-01',
      name: 'SATCOM LEO Satellite 99',
      type: 'LEO_SATELLITE',
      lat: 48.2,
      lng: 11.4,
      altitudeKm: 550,
      elevationAngleDeg: 78.4,
      azimuthDeg: 142.0,
      distanceKmToBeacon: 820.4,
      lineOfSight: true,
      rfFrequencyMhz: 1425.8,
      dopplerShiftHz: 1240,
      reboundRoundTripMs: 14.2,
      signalStrengthDbm: -58.2,
      packetsForwarded: 149280,
      packetsDropped: 2
    },
    {
      id: 'node-02',
      name: 'Ground Beacon Alpha (Pacific)',
      type: 'GROUND_BEACON',
      lat: 37.7749,
      lng: -122.4194,
      altitudeKm: 0.1,
      elevationAngleDeg: 89.1,
      azimuthDeg: 0,
      distanceKmToBeacon: 0,
      lineOfSight: true,
      rfFrequencyMhz: 2450.0,
      dopplerShiftHz: 0,
      reboundRoundTripMs: 4.1,
      signalStrengthDbm: -42.0,
      packetsForwarded: 892100,
      packetsDropped: 0
    },
    {
      id: 'node-03',
      name: 'ATSC OTA Transmitter Tower 04',
      type: 'ATSC_OTA_TRANSMITTER',
      lat: 51.5074,
      lng: -0.1278,
      altitudeKm: 0.3,
      elevationAngleDeg: 45.0,
      azimuthDeg: 210.5,
      distanceKmToBeacon: 3410.8,
      lineOfSight: true,
      rfFrequencyMhz: 680.0,
      dopplerShiftHz: 12,
      reboundRoundTripMs: 22.8,
      signalStrengthDbm: -74.5,
      packetsForwarded: 65420,
      packetsDropped: 5
    },
    {
      id: 'node-04',
      name: 'Node Cluster Zeta (European)',
      type: 'NODE_CLUSTER',
      lat: 48.8566,
      lng: 2.3522,
      altitudeKm: 0.2,
      elevationAngleDeg: 62.1,
      azimuthDeg: 95.2,
      distanceKmToBeacon: 1290.4,
      lineOfSight: true,
      rfFrequencyMhz: 5150.0,
      dopplerShiftHz: 45,
      reboundRoundTripMs: 18.9,
      signalStrengthDbm: -61.0,
      packetsForwarded: 312040,
      packetsDropped: 1
    }
  ]);

  const [selectedNode, setSelectedNode] = useState<SatcomRelayNode | null>(nodes[0]);
  const [triangulating, setTriangulating] = useState(false);
  const [sweepAngle, setSweepAngle] = useState(0);

  // Radar sweep animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSweepAngle(prev => (prev + 4) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerTriangulation = () => {
    setTriangulating(true);
    addTerminalLine('[SATCOM MAP]: Triggering multi-node circular relay signal triangulation sweep...', 'system');
    setTimeout(() => {
      setTriangulating(false);
      addTerminalLine('[SATCOM MAP]: Triangulation sweep completed successfully. Zero interference verified across all nodes.', 'good');
      addLedger('satcom.triangulation.sweep', { nodesCount: nodes.length });
    }, 1500);
  };

  const handleAddNode = () => {
    const newNode: SatcomRelayNode = {
      id: `node-${Date.now().toString(36)}`,
      name: `Relay Relay Beacon ${nodes.length + 1}`,
      type: Math.random() > 0.5 ? 'LEO_SATELLITE' : 'GROUND_BEACON',
      lat: Number((Math.random() * 60 - 30).toFixed(4)),
      lng: Number((Math.random() * 180 - 90).toFixed(4)),
      altitudeKm: Math.floor(Math.random() * 600 + 10),
      elevationAngleDeg: Number((Math.random() * 40 + 50).toFixed(1)),
      azimuthDeg: Number((Math.random() * 360).toFixed(1)),
      distanceKmToBeacon: Math.floor(Math.random() * 2000 + 100),
      lineOfSight: true,
      rfFrequencyMhz: Number((Math.random() * 4000 + 1000).toFixed(1)),
      dopplerShiftHz: Math.floor(Math.random() * 500),
      reboundRoundTripMs: Number((Math.random() * 20 + 5).toFixed(1)),
      signalStrengthDbm: -Math.floor(Math.random() * 30 + 40),
      packetsForwarded: Math.floor(Math.random() * 50000),
      packetsDropped: 0
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode);
    addTerminalLine(`[SATCOM MAP]: Deployed and registered new relay node ${newNode.name}.`, 'good');
    addLedger('satcom.node.deployed', { name: newNode.name, type: newNode.type });
  };

  return (
    <div className="h-full flex flex-col bg-[#020610] text-slate-100 font-mono text-xs select-none p-4 space-y-3 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 border-b border-cyan-500/30 gap-2 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Satellite className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-cyan-300 text-sm tracking-wider flex items-center space-x-2">
              <span>SATCOM CIRCULAR RELAY &amp; TRIANGULATION MAP</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold uppercase">
                SVG OVERLAY ACTIVE
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Interactive SVG canvas visualizing circular relay nodes, LEO satellites, and triangulation beam paths.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleTriggerTriangulation}
            disabled={triangulating}
            className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-[0_0_15px_rgba(66,245,255,0.4)] flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${triangulating ? 'animate-spin' : ''}`} />
            <span>{triangulating ? 'Triangulating...' : 'Run Signal Triangulation'}</span>
          </button>
          <button
            onClick={handleAddNode}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 text-cyan-300 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Deploy Node</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Interactive SVG Canvas on Left, Node Details on Right */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Interactive SVG Canvas Overlaid on Globe Map View */}
        <div className="flex-1 bg-[#040d1a] border border-cyan-500/30 rounded-2xl relative overflow-hidden flex items-center justify-center p-4">
          {/* Cyberpunk Grid Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/40 via-slate-950/80 to-slate-950 pointer-events-none" />

          {/* SVG Canvas */}
          <svg className="w-full h-full relative z-10" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
            {/* World Map Background Continental Outlines (Stylized) */}
            <g className="text-slate-800/60" fill="currentColor">
              <path d="M 120,150 Q 180,120 240,160 T 360,180 T 480,130 T 600,170 T 720,150 L 720,400 L 120,400 Z" opacity="0.3" />
              {/* Meridians & Parallels */}
              <circle cx="400" cy="250" r="200" fill="none" stroke="rgba(66,245,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="400" cy="250" r="140" fill="none" stroke="rgba(66,245,255,0.15)" strokeWidth="1" />
              <circle cx="400" cy="250" r="80" fill="none" stroke="rgba(66,245,255,0.15)" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="200" y1="250" x2="600" y2="250" stroke="rgba(66,245,255,0.15)" strokeWidth="1" />
              <line x1="400" y1="50" x2="400" y2="450" stroke="rgba(66,245,255,0.15)" strokeWidth="1" />
            </g>

            {/* Radar Sweep Line */}
            <g transform={`rotate(${sweepAngle} 400 250)`}>
              <line x1="400" y1="250" x2="400" y2="50" stroke="rgba(66,245,255,0.6)" strokeWidth="2" />
              <polygon points="400,250 370,60 430,60" fill="rgba(66,245,255,0.1)" />
            </g>

            {/* Triangulation Connection Beams between Nodes */}
            {nodes.map((node, i) => {
              const nextNode = nodes[(i + 1) % nodes.length];
              const x1 = 400 + (node.lng / 180) * 320;
              const y1 = 250 - (node.lat / 90) * 180;
              const x2 = 400 + (nextNode.lng / 180) * 320;
              const y2 = 250 - (nextNode.lat / 90) * 180;

              return (
                <g key={`beam-${node.id}`}>
                  <line 
                    x1={x1} 
                    y1={y1} 
                    x2={x2} 
                    y2={y2} 
                    stroke="rgba(66, 245, 255, 0.4)" 
                    strokeWidth="1.5" 
                    strokeDasharray="6 3"
                    className="animate-pulse"
                  />
                </g>
              );
            })}

            {/* Circular Relay Nodes & Markers */}
            {nodes.map((node) => {
              const cx = 400 + (node.lng / 180) * 320;
              const cy = 250 - (node.lat / 90) * 180;
              const isSelected = selectedNode?.id === node.id;

              return (
                <g 
                  key={node.id} 
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  {/* Circular Relay Ring */}
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={isSelected ? 24 : 16} 
                    fill="none" 
                    stroke={isSelected ? '#42f5ff' : 'rgba(66,245,255,0.4)'} 
                    strokeWidth={isSelected ? 2 : 1}
                    className={isSelected ? 'animate-ping' : ''}
                  />

                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={isSelected ? 10 : 6} 
                    fill={isSelected ? '#42f5ff' : '#0ea5e9'} 
                    stroke="#ffffff" 
                    strokeWidth="1.5"
                  />

                  {/* Node Label */}
                  <text 
                    x={cx} 
                    y={cy - 14} 
                    fill="#e2f1ff" 
                    fontSize="10" 
                    textAnchor="middle" 
                    className="font-mono font-bold pointer-events-none drop-shadow"
                  >
                    {node.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Details Sidebar */}
        <div className="w-full lg:w-96 bg-[#040d1a] border border-cyan-500/30 rounded-2xl p-4 flex flex-col justify-between shrink-0 space-y-3">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-300">
                    <Radio className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="font-bold text-cyan-200 text-sm">{selectedNode.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase">{selectedNode.type.replace('_', ' ')}</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                  {selectedNode.signalStrengthDbm} dBm
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between bg-slate-900/80 p-2.5 rounded-lg border border-cyan-500/20">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="text-cyan-300 font-bold">{selectedNode.lat.toFixed(4)}°, {selectedNode.lng.toFixed(4)}°</span>
                </div>
                <div className="flex justify-between bg-slate-900/80 p-2.5 rounded-lg border border-cyan-500/20">
                  <span className="text-slate-400">RF Frequency:</span>
                  <span className="text-cyan-300 font-bold">{selectedNode.rfFrequencyMhz} MHz</span>
                </div>
                <div className="flex justify-between bg-slate-900/80 p-2.5 rounded-lg border border-cyan-500/20">
                  <span className="text-slate-400">Round-Trip Time:</span>
                  <span className="text-emerald-400 font-bold">{selectedNode.reboundRoundTripMs} ms</span>
                </div>
                <div className="flex justify-between bg-slate-900/80 p-2.5 rounded-lg border border-cyan-500/20">
                  <span className="text-slate-400">Doppler Shift:</span>
                  <span className="text-amber-300 font-bold">{selectedNode.dopplerShiftHz} Hz</span>
                </div>
                <div className="flex justify-between bg-slate-900/80 p-2.5 rounded-lg border border-cyan-500/20">
                  <span className="text-slate-400">Packets Forwarded:</span>
                  <span className="text-white font-bold">{selectedNode.packetsForwarded.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Select a relay node on the map to inspect triangulation telemetry.
            </div>
          )}

          <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-[10px] text-cyan-300/90 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Triangulation Mesh Active
            </span>
            <span className="text-white font-bold">{nodes.length} Nodes Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};
