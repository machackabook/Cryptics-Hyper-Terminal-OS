import React, { useState, useEffect, useRef } from 'react';
import { useCryptic } from '../../store/crypticContext';
import {
  Globe,
  Flame,
  AlertTriangle,
  Compass,
  Wind,
  Thermometer,
  ShieldAlert,
  UserPlus,
  Navigation,
  Eye,
  Camera,
  Layers,
  Radio,
  Search,
} from 'lucide-react';
import { EmergencyIncident, PeerBeacon } from '../../types';

export const InteractiveGlobeModule: React.FC = () => {
  const { incidents, resolveIncident, weatherStations, beacons, addBeacon } = useCryptic();

  const [activeTab, setActiveTab] = useState<'globe3d' | 'incidents' | 'beacons' | 'weather'>('globe3d');
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(incidents[0] || null);
  const [selectedBeacon, setSelectedBeacon] = useState<PeerBeacon | null>(beacons[0] || null);
  const [zoomLevel, setZoomLevel] = useState<number>(2); // 1 = Global, 2 = Regional, 3 = Street
  const [searchCoord, setSearchCoord] = useState<string>('');
  const [trailCamFeedActive, setTrailCamFeedActive] = useState<boolean>(true);

  // New beacon form state
  const [newCallsign, setNewCallsign] = useState('');
  const [newLat, setNewLat] = useState('37.7749');
  const [newLng, setNewLng] = useState('-122.4194');
  const [newAlt, setNewAlt] = useState('45');
  const [newPlusCode, setNewPlusCode] = useState('849VQV6G+X7');

  // Canvas for 3D Earth Globe
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotation = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.38 * (zoomLevel === 1 ? 0.8 : zoomLevel === 2 ? 1.0 : 1.35);

      // Deep Space background with cyber grid
      ctx.strokeStyle = 'rgba(66, 245, 255, 0.08)';
      ctx.lineWidth = 1;
      const step = 28;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Atmospheric outer glow
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.25);
      glowGrad.addColorStop(0, 'rgba(66, 245, 255, 0.25)');
      glowGrad.addColorStop(0.7, 'rgba(0, 180, 255, 0.08)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Earth Globe Sphere base
      const sphereGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      sphereGrad.addColorStop(0, '#0c223d');
      sphereGrad.addColorStop(0.6, '#061324');
      sphereGrad.addColorStop(1, '#020710');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Latitude and Longitude Grid Lines (3D spherical projection simulation)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.strokeStyle = 'rgba(66, 245, 255, 0.25)';
      ctx.lineWidth = 1;

      // Parallels of Latitude
      for (let lat = -60; lat <= 60; lat += 20) {
        const y = cy + (lat / 90) * radius;
        const rx = Math.sqrt(Math.max(0, radius * radius - (y - cy) * (y - cy)));
        ctx.beginPath();
        ctx.ellipse(cx, y, rx, rx * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Meridians of Longitude (rotating)
      for (let lon = 0; lon < 360; lon += 30) {
        const angle = ((lon + rotation) * Math.PI) / 180;
        const xOffset = Math.sin(angle) * radius;
        if (Math.cos(angle) > -0.1) {
          ctx.beginPath();
          ctx.ellipse(cx + xOffset * 0.5, cy, Math.abs(xOffset) * 0.5, radius, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Continents representation as digital polygonal vector clusters
      ctx.fillStyle = 'rgba(116, 255, 155, 0.28)';
      ctx.strokeStyle = 'rgba(116, 255, 155, 0.5)';
      ctx.lineWidth = 1;

      const continentAngles = [45, 120, 210, 300];
      continentAngles.forEach((baseAngle) => {
        const rad = ((baseAngle + rotation) * Math.PI) / 180;
        const visible = Math.cos(rad) > -0.2;
        if (visible) {
          const px = cx + Math.sin(rad) * radius * 0.65;
          const py = cy + Math.sin(rad * 0.7) * radius * 0.4;
          ctx.beginPath();
          ctx.arc(px, py, radius * 0.18, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      });

      // Markers for Incidents (Wildfire cams / Accidents)
      incidents.forEach((inc, idx) => {
        const markerAngle = ((inc.lng + 180 + rotation) * Math.PI) / 180;
        const isFacing = Math.cos(markerAngle) > -0.15;
        if (isFacing) {
          const mx = cx + Math.sin(markerAngle) * radius * 0.8;
          const my = cy - (inc.lat / 90) * radius * 0.8;

          // Incident pulsing beacon
          ctx.fillStyle = inc.severity === 'critical' ? 'rgba(255, 71, 126, 0.9)' : 'rgba(245, 206, 112, 0.9)';
          ctx.beginPath();
          ctx.arc(mx, my, 4 + Math.sin(Date.now() / 200 + idx) * 2, 0, Math.PI * 2);
          ctx.fill();

          // Radar rings
          ctx.strokeStyle = inc.severity === 'critical' ? 'rgba(255, 71, 126, 0.4)' : 'rgba(245, 206, 112, 0.4)';
          ctx.beginPath();
          ctx.arc(mx, my, 10 + (Date.now() / 50 + idx * 8) % 16, 0, Math.PI * 2);
          ctx.stroke();

          // Label
          ctx.fillStyle = '#ffffff';
          ctx.font = '9px monospace';
          ctx.fillText(inc.plusCode.slice(0, 8), mx + 8, my + 3);
        }
      });

      // Markers for Peer Beacons (Friends / UUID location tracking)
      beacons.forEach((bcn, idx) => {
        const bAngle = ((bcn.lng + 180 + rotation) * Math.PI) / 180;
        if (Math.cos(bAngle) > -0.15) {
          const bx = cx + Math.sin(bAngle) * radius * 0.8;
          const by = cy - (bcn.lat / 90) * radius * 0.8;

          ctx.fillStyle = '#42f5ff';
          ctx.beginPath();
          ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(66, 245, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(bx, by, 8, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#42f5ff';
          ctx.font = '8px monospace';
          ctx.fillText(`[${bcn.callsign}]`, bx + 6, by - 4);
        }
      });

      ctx.restore();

      // Outer atmospheric border ring
      ctx.strokeStyle = 'rgba(66, 245, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs & HUD coordinates
      ctx.strokeStyle = 'rgba(66, 245, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy);
      ctx.lineTo(cx + 15, cy);
      ctx.moveTo(cx, cy - 15);
      ctx.lineTo(cx, cy + 15);
      ctx.stroke();

      rotation += 0.35;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [zoomLevel, incidents, beacons]);

  const handleRegisterBeacon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCallsign) return;
    addBeacon({
      uuid: crypto.randomUUID().slice(0, 18),
      callsign: newCallsign.toUpperCase(),
      lat: parseFloat(newLat) || 37.7749,
      lng: parseFloat(newLng) || -122.4194,
      altitude: parseFloat(newAlt) || 50,
      plusCode: newPlusCode || '849VQV6G+X7',
      status: 'active',
      signalDbm: -58,
    });
    setNewCallsign('');
  };

  return (
    <div className="flex flex-col h-full bg-[#030914] text-xs font-mono overflow-hidden">
      {/* Sub-nav Tab Controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#42f5ff]/20 bg-[#051020]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('globe3d')}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'globe3d' ? 'bg-[#42f5ff] text-[#02050b]' : 'text-[#8ba4bf] hover:text-white'
            }`}
          >
            <Globe className="w-3 h-3" /> 3D SPHERICAL RADAR
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'incidents' ? 'bg-red-500 text-white' : 'text-[#8ba4bf] hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-red-400" /> DISPATCH ({incidents.length})
          </button>
          <button
            onClick={() => setActiveTab('beacons')}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'beacons' ? 'bg-[#74ff9b] text-[#02050b]' : 'text-[#8ba4bf] hover:text-white'
            }`}
          >
            <Radio className="w-3 h-3 text-[#74ff9b]" /> PEER BEACONS ({beacons.length})
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'weather' ? 'bg-[#f5ce70] text-[#02050b]' : 'text-[#8ba4bf] hover:text-white'
            }`}
          >
            <Wind className="w-3 h-3 text-[#f5ce70]" /> METEOROLOGY
          </button>
        </div>

        {/* Zoom Level Selectors */}
        <div className="flex items-center gap-1 bg-[#091a32] p-0.5 rounded border border-[#42f5ff]/20">
          <button
            onClick={() => setZoomLevel(1)}
            title="Global Orbital View"
            className={`px-2 py-0.5 rounded text-[9px] ${zoomLevel === 1 ? 'bg-[#42f5ff] text-black font-bold' : 'text-[#8aa0b6]'}`}
          >
            GLOBE
          </button>
          <button
            onClick={() => setZoomLevel(2)}
            title="Regional Sector View"
            className={`px-2 py-0.5 rounded text-[9px] ${zoomLevel === 2 ? 'bg-[#42f5ff] text-black font-bold' : 'text-[#8aa0b6]'}`}
          >
            REGION
          </button>
          <button
            onClick={() => setZoomLevel(3)}
            title="Street Coordinates & Plus Code Grid"
            className={`px-2 py-0.5 rounded text-[9px] ${zoomLevel === 3 ? 'bg-[#42f5ff] text-black font-bold' : 'text-[#8aa0b6]'}`}
          >
            STREET
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Visualizer Canvas */}
        <div className="flex-1 relative flex items-center justify-center bg-[#01040a] min-h-[220px]">
          <canvas
            ref={canvasRef}
            width={480}
            height={380}
            className="w-full h-full object-contain"
          />

          {/* Precision Coordinates & Plus Code HUD HUD Overlay */}
          <div className="absolute top-2 left-2 p-2 rounded bg-[#040e1c]/80 border border-[#42f5ff]/30 text-[9px] backdrop-blur-sm space-y-0.5 pointer-events-none">
            <div className="text-[#42f5ff] font-bold">GRID LOCATOR // PRECISION</div>
            <div>LAT: <span className="text-[#74ff9b]">37.7749° N</span> · LNG: <span className="text-[#74ff9b]">122.4194° W</span></div>
            <div>ALTITUDE: <span className="text-[#f5ce70]">48.5m MSL</span> · BEARING: <span className="text-white">184° SSE</span></div>
            <div>PLUS CODE: <span className="text-[#42f5ff] font-bold">849VQV6G+X7</span></div>
            <div>STATUS: <span className="text-[#74ff9b]">TRAIL SENSORS SYNCHRONIZED</span></div>
          </div>

          {/* Incident Quick Warning Alert Pill */}
          {incidents.some(i => i.status !== 'CONTAINED') && (
            <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-red-950/70 border border-red-500/40 text-[10px] text-red-200 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>
                  <strong>CRITICAL ALERT:</strong> {incidents.find(i => i.severity === 'critical')?.title} ({incidents.find(i => i.severity === 'critical')?.plusCode})
                </span>
              </div>
              <button
                onClick={() => setActiveTab('incidents')}
                className="px-2 py-0.5 rounded bg-red-500 text-white font-bold text-[9px] hover:bg-red-400 cursor-pointer"
              >
                VIEW INCIDENT
              </button>
            </div>
          )}
        </div>

        {/* Right Details Inspector Panel */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-[#42f5ff]/20 bg-[#040c1a] flex flex-col p-3 overflow-y-auto">
          {activeTab === 'globe3d' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#42f5ff]/20 pb-1.5">
                <span className="font-bold text-[#42f5ff] text-[11px] flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" /> GEOSPATIAL EXPLORER
                </span>
                <span className="text-[9px] text-[#74ff9b]">OFFLINE CACHED</span>
              </div>

              {/* Plus Code Search input */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={searchCoord}
                  onChange={(e) => setSearchCoord(e.target.value)}
                  placeholder="Enter Plus Code or Lat,Lng..."
                  className="flex-1 bg-[#061426] border border-[#42f5ff]/30 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-[#42f5ff]"
                />
                <button
                  type="button"
                  className="px-2.5 py-1 bg-[#42f5ff]/20 text-[#42f5ff] border border-[#42f5ff]/40 rounded hover:bg-[#42f5ff]/30 cursor-pointer"
                >
                  <Search className="w-3 h-3" />
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-[#061426] border border-[#42f5ff]/20 space-y-1.5 text-[10px]">
                <div className="text-[#8ba4bf] uppercase font-bold text-[9px]">LOCAL COORDINATE TRANSLATION</div>
                <div className="flex justify-between">
                  <span className="text-[#8ba4bf]">Global Sector:</span>
                  <span className="text-white">Zone 10-Alpha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8ba4bf]">Plus Code Quad:</span>
                  <span className="text-[#42f5ff] font-bold">849VQV6G+X7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8ba4bf]">Resolution Scale:</span>
                  <span className="text-[#74ff9b]">{zoomLevel === 1 ? '1:100,000 km' : zoomLevel === 2 ? '1:500 km' : '1:25 m (Street Grid)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8ba4bf]">Wildfire Sensor Link:</span>
                  <span className="text-[#f5ce70]">TRAIL-CAM #409 ACTIVE</span>
                </div>
              </div>

              {/* Nature Trail Cam Live Snapshot Preview */}
              <div className="border border-[#42f5ff]/20 rounded-lg p-2 bg-[#061426] space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-bold">
                  <span className="text-[#74ff9b] flex items-center gap-1">
                    <Camera className="w-3 h-3 text-[#74ff9b]" /> NATURE TRAIL CAM #409
                  </span>
                  <span className="text-[#8aa0b6]">THERMAL INFRARED</span>
                </div>
                <div className="relative rounded overflow-hidden h-28 bg-black flex items-center justify-center border border-[#42f5ff]/30">
                  <img
                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80"
                    alt="Nature trail wildfire sensor camera"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[8px] text-[#74ff9b] border border-[#74ff9b]/30">
                    LIVE IR STREAM · 184°C SPIKE
                  </div>
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-red-950/80 text-[8px] text-red-300 border border-red-500/40">
                    CANOPY MONITOR
                  </div>
                </div>
                <div className="text-[9px] text-[#8aa0b6]">
                  Solar-powered low-frequency mesh camera streaming remote forest canopy readings.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-red-500/30 pb-1.5">
                <span className="font-bold text-red-400 text-[11px] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> EMERGENCY DISPATCH MATRIX
                </span>
                <span className="text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-300 rounded border border-red-500/30">
                  {incidents.filter(i => i.status !== 'CONTAINED').length} ACTIVE
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition ${
                      selectedIncident?.id === inc.id
                        ? 'border-red-400 bg-red-950/40'
                        : 'border-[#42f5ff]/20 bg-[#061426] hover:border-[#42f5ff]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[10px] text-white truncate">{inc.title}</span>
                      <span
                        className={`text-[8px] px-1 rounded font-semibold ${
                          inc.severity === 'critical' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                        }`}
                      >
                        {inc.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[9px] text-[#8aa0b6] flex justify-between">
                      <span>{inc.locationName}</span>
                      <span className="text-[#42f5ff]">{inc.plusCode}</span>
                    </div>
                    <div className="text-[8px] text-[#74ff9b] mt-1 flex justify-between">
                      <span>Status: {inc.status}</span>
                      <span>{inc.reportedAgo}</span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedIncident && (
                <div className="p-2.5 rounded-lg bg-[#061426] border border-red-500/40 text-[9px] space-y-1.5">
                  <div className="font-bold text-white text-[10px]">{selectedIncident.title}</div>
                  <div className="text-[#8aa0b6]">{selectedIncident.details}</div>
                  <div className="flex justify-between border-t border-[#42f5ff]/10 pt-1 text-[#8aa0b6]">
                    <span>Coordinates:</span>
                    <span className="text-white">{selectedIncident.lat.toFixed(4)}, {selectedIncident.lng.toFixed(4)}</span>
                  </div>
                  {selectedIncident.status !== 'CONTAINED' && (
                    <button
                      onClick={() => resolveIncident(selectedIncident.id)}
                      className="w-full mt-2 py-1.5 bg-emerald-500 text-[#02050b] font-bold rounded hover:bg-emerald-400 transition cursor-pointer"
                    >
                      MARK DISPATCH CONTAINED
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'beacons' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#74ff9b]/30 pb-1.5">
                <span className="font-bold text-[#74ff9b] text-[11px] flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5" /> PEER BEACONS (FRIEND LOCATOR)
                </span>
                <span className="text-[9px] text-[#8aa0b6]">UUID MESH</span>
              </div>

              {/* Beacon List */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {beacons.map((bcn) => (
                  <div
                    key={bcn.id}
                    onClick={() => setSelectedBeacon(bcn)}
                    className={`p-2 rounded border text-left cursor-pointer transition ${
                      selectedBeacon?.id === bcn.id
                        ? 'border-[#74ff9b] bg-[#74ff9b]/15'
                        : 'border-[#42f5ff]/20 bg-[#061426] hover:border-[#42f5ff]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px] text-white">[{bcn.callsign}]</span>
                      <span className="text-[8px] text-[#74ff9b]">{bcn.signalDbm} dBm</span>
                    </div>
                    <div className="text-[8px] text-[#8aa0b6] flex justify-between mt-0.5">
                      <span>Plus: {bcn.plusCode}</span>
                      <span>Alt: {bcn.altitude}m</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Beacon Form */}
              <form onSubmit={handleRegisterBeacon} className="p-2.5 rounded-lg bg-[#061426] border border-[#74ff9b]/30 space-y-2">
                <div className="text-[9px] font-bold text-[#74ff9b]">TRANSMIT NEW PEER BEACON</div>
                <input
                  type="text"
                  value={newCallsign}
                  onChange={(e) => setNewCallsign(e.target.value)}
                  placeholder="Callsign / Friend UUID..."
                  className="w-full bg-[#030914] border border-[#74ff9b]/30 rounded px-2 py-1 text-[9px] text-white"
                />
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    placeholder="Lat"
                    className="bg-[#030914] border border-[#74ff9b]/30 rounded px-1.5 py-1 text-[9px] text-white"
                  />
                  <input
                    type="text"
                    value={newLng}
                    onChange={(e) => setNewLng(e.target.value)}
                    placeholder="Lng"
                    className="bg-[#030914] border border-[#74ff9b]/30 rounded px-1.5 py-1 text-[9px] text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    value={newAlt}
                    onChange={(e) => setNewAlt(e.target.value)}
                    placeholder="Alt (m)"
                    className="bg-[#030914] border border-[#74ff9b]/30 rounded px-1.5 py-1 text-[9px] text-white"
                  />
                  <input
                    type="text"
                    value={newPlusCode}
                    onChange={(e) => setNewPlusCode(e.target.value)}
                    placeholder="Plus Code"
                    className="bg-[#030914] border border-[#74ff9b]/30 rounded px-1.5 py-1 text-[9px] text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1 rounded bg-[#74ff9b] text-[#02050b] font-bold text-[9px] hover:bg-[#8affaa] cursor-pointer"
                >
                  BROADCAST BEACON
                </button>
              </form>
            </div>
          )}

          {activeTab === 'weather' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#f5ce70]/30 pb-1.5">
                <span className="font-bold text-[#f5ce70] text-[11px] flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5" /> REGIONAL METEOROLOGY &amp; ATMOSPHERE
                </span>
                <span className="text-[9px] text-[#8aa0b6]">LIVE SENSORS</span>
              </div>

              <div className="space-y-2">
                {weatherStations.map((st, i) => (
                  <div key={i} className="p-2 rounded-lg bg-[#061426] border border-[#f5ce70]/20 space-y-1">
                    <div className="flex justify-between text-white font-bold text-[10px]">
                      <span>{st.region}</span>
                      <span className="text-[#f5ce70]">{st.tempC}°C</span>
                    </div>
                    <div className="text-[9px] text-[#8aa0b6] flex justify-between">
                      <span>Condition: {st.condition}</span>
                      <span>Wind: {st.windSpeedKmh} km/h {st.windDirection}</span>
                    </div>
                    <div className="text-[9px] text-[#8aa0b6] flex justify-between">
                      <span>Pressure: {st.pressureHpa} hPa</span>
                      <span className={`font-bold ${st.wildfireRisk === 'CRITICAL' ? 'text-red-400' : 'text-[#74ff9b]'}`}>
                        Wildfire Risk: {st.wildfireRisk}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
