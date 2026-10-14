import React, { useState, useRef, useEffect } from 'react';
import { useCryptic } from '../../store/crypticContext';
import { Music, Radio, Volume2, VolumeX, Sliders, Play, Square, Compass, Sparkles, Zap } from 'lucide-react';

export const AudioFabricModule: React.FC = () => {
  const { oscillatorActive, toggle963, addLedger } = useCryptic();

  const [activeTab, setActiveTab] = useState<'synth' | 'spatial' | 'midi' | 'beacons'>('synth');
  const [carrierFreq, setCarrierFreq] = useState(963);
  const [panX, setPanX] = useState(0); // -1 (Left) to 1 (Right)
  const [panY, setPanY] = useState(0); // -1 (Back) to 1 (Front)
  const [panZ, setPanZ] = useState(0.5); // Elevation
  const [reverbWet, setReverbWet] = useState(35);
  const [activePreset, setActivePreset] = useState<'963_SOLFEGGIO' | 'NEURAL_WARP' | 'BINAURAL_THETA' | 'KERR_DRAG'>('963_SOLFEGGIO');

  // Web MIDI Simulation State
  const [midiConnected, setMidiConnected] = useState(false);
  const [activeMidiNotes, setActiveMidiNotes] = useState<number[]>([]);
  const [beaconLightingSync, setBeaconLightingSync] = useState(true);

  // Canvas visualizer for audio oscilloscope
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.fillStyle = '#030814';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(66, 245, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw multi-channel spatial wave
      const channels = 4;
      const colors = ['#42f5ff', '#74ff9b', '#f5ce70', '#c084fc'];

      for (let ch = 0; ch < channels; ch++) {
        ctx.strokeStyle = colors[ch];
        ctx.lineWidth = oscillatorActive ? 2 : 1;
        ctx.beginPath();

        const amplitude = oscillatorActive ? 25 + ch * 4 : 5;
        const freqMult = (carrierFreq / 963) * (1 + ch * 0.25);

        for (let x = 0; x < width; x++) {
          const y =
            height / 2 +
            Math.sin((x * 0.04 * freqMult) + phase + ch * 1.5) * amplitude * Math.cos(x * 0.005 + panX) +
            (panY * 15);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      phase += oscillatorActive ? 0.08 : 0.01;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [oscillatorActive, carrierFreq, panX, panY]);

  const triggerMidiNote = (note: number) => {
    setActiveMidiNotes((prev) => (prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]));
    addLedger('midi.note.trigger', { note, freq: 440 * Math.pow(2, (note - 69) / 12) });
  };

  const handleConnectBLE = () => {
    setMidiConnected(true);
    addLedger('ble.midi.paired', { interface: 'Web MIDI API / Virtual Ble Bridge' });
  };

  return (
    <div className="flex flex-col h-full bg-[#020712] text-xs font-mono overflow-hidden">
      {/* Header controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#42f5ff]/20 bg-[#051122]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('synth')}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'synth' ? 'bg-[#42f5ff] text-[#02050b]' : 'text-[#8ba4bf] hover:text-white'
            }`}
          >
            <Music className="w-3 h-3" /> NEURAL SYNTH
          </button>
          <button
            onClick={() => setActiveTab('spatial')}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'spatial' ? 'bg-[#74ff9b] text-[#02050b]' : 'text-[#8ba4bf] hover:text-white'
            }`}
          >
            <Compass className="w-3 h-3 text-[#74ff9b]" /> 3D SPATIALIZATION
          </button>
          <button
            onClick={() => setActiveTab('midi')}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'midi' ? 'bg-[#f5ce70] text-[#02050b]' : 'text-[#8ba4bf] hover:text-white'
            }`}
          >
            <Sliders className="w-3 h-3 text-[#f5ce70]" /> BLE / WEB MIDI
          </button>
          <button
            onClick={() => setActiveTab('beacons')}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'beacons' ? 'bg-[#c084fc] text-[#02050b]' : 'text-[#8ba4bf] hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#c084fc]" /> BEACON STAGE LIGHTING
          </button>
        </div>

        <button
          onClick={() => toggle963()}
          className={`px-2.5 py-1 rounded text-[10px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
            oscillatorActive
              ? 'bg-[#74ff9b] text-[#02050b] shadow-[0_0_10px_rgba(116,255,155,0.4)] animate-pulse'
              : 'border border-[#42f5ff]/30 text-[#42f5ff] hover:bg-[#42f5ff]/10'
          }`}
        >
          {oscillatorActive ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          {oscillatorActive ? '963 HZ ENGAGED' : 'ENGAGE 963 HZ'}
        </button>
      </div>

      {/* Main body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Visualizer Oscilloscope Canvas */}
        <div className="flex-1 relative bg-black flex flex-col">
          <canvas ref={canvasRef} width={400} height={200} className="w-full h-44 object-cover" />

          {/* Spatial Panning Vector Pad */}
          <div className="p-3 border-t border-[#42f5ff]/20 bg-[#040e1c] flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#42f5ff] font-bold">MULTI-CHANNEL 3D AUDIO PANNER</span>
              <span className="text-[#8aa0b6]">
                X: {panX.toFixed(2)} | Y: {panY.toFixed(2)} | Z: {panZ.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <label className="text-[9px] text-[#8aa0b6] block mb-1">AZIMUTH (X)</label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={panX}
                  onChange={(e) => setPanX(parseFloat(e.target.value))}
                  className="w-full accent-[#42f5ff]"
                />
              </div>
              <div>
                <label className="text-[9px] text-[#8aa0b6] block mb-1">DEPTH (Y)</label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={panY}
                  onChange={(e) => setPanY(parseFloat(e.target.value))}
                  className="w-full accent-[#74ff9b]"
                />
              </div>
              <div>
                <label className="text-[9px] text-[#8aa0b6] block mb-1">ELEVATION (Z)</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={panZ}
                  onChange={(e) => setPanZ(parseFloat(e.target.value))}
                  className="w-full accent-[#f5ce70]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Tab Panel */}
        <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-[#42f5ff]/20 bg-[#040b18] p-3 overflow-y-auto space-y-3">
          {activeTab === 'synth' && (
            <div className="space-y-3">
              <div className="text-[10px] text-[#42f5ff] font-bold border-b border-[#42f5ff]/20 pb-1">
                SOLFEGGIO HARMONIC PRESETS
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: '963_SOLFEGGIO', label: '963 Hz Crown', freq: 963 },
                  { id: 'NEURAL_WARP', label: '528 Hz Love/DNA', freq: 528 },
                  { id: 'BINAURAL_THETA', label: '432 Hz Natural', freq: 432 },
                  { id: 'KERR_DRAG', label: '108 Hz Sub-Bass', freq: 108 },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePreset(p.id as any);
                      setCarrierFreq(p.freq);
                    }}
                    className={`p-2 rounded text-[9px] border font-semibold text-left transition cursor-pointer ${
                      activePreset === p.id
                        ? 'border-[#42f5ff] bg-[#42f5ff]/20 text-[#42f5ff]'
                        : 'border-[#42f5ff]/20 bg-[#061426] text-[#8aa0b6] hover:text-white'
                    }`}
                  >
                    <div>{p.label}</div>
                    <div className="text-[8px] text-[#74ff9b] mt-0.5">{p.freq} Hz Carrier</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[9px] text-[#8aa0b6] block mb-1">
                  MANUAL FREQUENCY: <span className="text-[#42f5ff] font-bold">{carrierFreq} Hz</span>
                </label>
                <input
                  type="range"
                  min="55"
                  max="1200"
                  value={carrierFreq}
                  onChange={(e) => setCarrierFreq(parseInt(e.target.value))}
                  className="w-full accent-[#42f5ff]"
                />
              </div>

              <div>
                <label className="text-[9px] text-[#8aa0b6] block mb-1">
                  REVERBERATION WET: <span className="text-[#74ff9b] font-bold">{reverbWet}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={reverbWet}
                  onChange={(e) => setReverbWet(parseInt(e.target.value))}
                  className="w-full accent-[#74ff9b]"
                />
              </div>
            </div>
          )}

          {activeTab === 'midi' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#f5ce70]/30 pb-1">
                <span className="text-[10px] text-[#f5ce70] font-bold">BLE &amp; VIRTUAL MIDI KEYBOARD</span>
                <span className={`text-[8px] px-1 rounded ${midiConnected ? 'bg-emerald-500 text-black font-bold' : 'bg-zinc-700 text-white'}`}>
                  {midiConnected ? 'BLE PAIRED' : 'DISCONNECTED'}
                </span>
              </div>

              {!midiConnected && (
                <button
                  onClick={handleConnectBLE}
                  className="w-full py-1.5 bg-[#f5ce70] text-[#02050b] font-bold rounded text-[9px] hover:bg-[#ffe399] transition cursor-pointer"
                >
                  PAIR BLE MIDI CONTROLLER
                </button>
              )}

              <div className="space-y-1">
                <div className="text-[9px] text-[#8aa0b6]">VIRTUAL KEYBOARD TRIGGERS:</div>
                <div className="grid grid-cols-7 gap-1">
                  {[60, 62, 64, 65, 67, 69, 71].map((note, idx) => {
                    const noteNames = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
                    const active = activeMidiNotes.includes(note);
                    return (
                      <button
                        key={note}
                        onClick={() => triggerMidiNote(note)}
                        className={`h-16 rounded border text-[9px] font-bold flex flex-col justify-end p-1 transition cursor-pointer ${
                          active
                            ? 'bg-[#42f5ff] text-black border-[#42f5ff] shadow-[0_0_12px_#42f5ff]'
                            : 'bg-[#061426] text-[#8aa0b6] border-[#42f5ff]/20 hover:text-white'
                        }`}
                      >
                        <span>{noteNames[idx]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'beacons' && (
            <div className="space-y-3">
              <div className="text-[10px] text-[#c084fc] font-bold border-b border-[#c084fc]/30 pb-1">
                BEACON PROXIMITY STAGE LIGHTING
              </div>
              <p className="text-[9px] text-[#8aa0b6]">
                Automated spatial audio triggers and DMX lighting synchronization based on localized peer beacon proximity.
              </p>

              <label className="flex items-center gap-2 p-2 rounded bg-[#061426] border border-[#c084fc]/30 text-[9px] text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={beaconLightingSync}
                  onChange={(e) => setBeaconLightingSync(e.target.checked)}
                  className="accent-[#c084fc]"
                />
                SYNC STAGE LIGHTS TO PROXIMITY RSSI
              </label>

              <div className="p-2 rounded bg-[#061426] border border-[#42f5ff]/20 space-y-1 text-[9px]">
                <div className="text-[#42f5ff] font-bold">DMX / OSC UNIVERSE #1</div>
                <div className="flex justify-between text-[#8aa0b6]">
                  <span>Channel 1-3 (RGB Master):</span>
                  <span className="text-[#74ff9b]">#42f5ff (Cyan Beacon)</span>
                </div>
                <div className="flex justify-between text-[#8aa0b6]">
                  <span>Channel 4 (Strobe Rate):</span>
                  <span className="text-white">12.4 Hz Synced</span>
                </div>
                <div className="flex justify-between text-[#8aa0b6]">
                  <span>Dimmer Threshold:</span>
                  <span className="text-[#f5ce70]">Auto-track Peer RSSI</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
