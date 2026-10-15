import React, { useState, useEffect, useRef } from 'react';
import { useCryptic } from '../../store/crypticContext';
import {
  Cpu,
  Layers,
  Sliders,
  Play,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Maximize2,
  Terminal,
  Compass,
  FileCode,
  Shield,
  Eye,
  RefreshCw,
  Box,
  Radio
} from 'lucide-react';

export const AlphaHologramCompressorModule: React.FC = () => {
  const { addTerminalLine } = useCryptic();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'sparse' | 'cgh' | 'pipeline' | 'operators'>('sparse');

  // 1. Sparse Imaging State
  const [alphaReg, setAlphaReg] = useState<number>(0.075);
  const [sparsityThreshold, setSparsityThreshold] = useState<number>(0.15);
  const [fidelityLoss, setFidelityLoss] = useState<number>(0.0034);
  const [sparseCoefficients, setSparseCoefficients] = useState<number[]>([0.91, 0.42, 0.0, 0.0, 0.73, 0.12, 0.0, 0.0, 0.65, 0.0, 0.0, 0.33]);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  // 2. CGH (Computer-Generated Holography) State
  const [wavelength, setWavelength] = useState<number>(532); // nm (Green)
  const [transmissionAlpha, setTransmissionAlpha] = useState<number>(0.85); // alpha_trans
  const [propagationMethod, setPropagationMethod] = useState<'fresnel' | 'angular' | 'rayleigh'>('fresnel');
  const [focalDistance, setFocalDistance] = useState<number>(150); // mm
  const [phaseModulation] = useState<number>(3.14);

  // 3. Pipeline / Operators State
  const [kompressorLevel, setKompressorLevel] = useState<number>(4); // quad-tree depth
  const [tensallTensionsLoad, setTensallTensionsLoad] = useState<number>(0.68); // manifold edge load
  const [hatchetPruneActive, setHatchetPruneActive] = useState<boolean>(true);
  const [pipelineLog, setPipelineLog] = useState<string[]>([
    '[INIT] Alpha pipeline synthesizer online.',
    '[KOMPRESSOR] Quad-tree spectrum isolating active.',
    '[TENSALLTENSIONS] Edge-load manifold constrained at 0.68.',
    '[HATCHETCHOPMAN] Hard boundary pruning block armed.'
  ]);

  // Canvas ref for wavefield / sparse matrix rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Run Sparse L1 Optimization loop
  const handleRunSparseOptimization = () => {
    setIsOptimizing(true);
    addTerminalLine(`[SPARSE OPT] Executing min_x 0.5||Ax-y||_2^2 + alpha ||Psi x||_1 with alpha=${alphaReg}...`, 'system');
    
    setTimeout(() => {
      const newCoeffs = Array.from({ length: 12 }, () => (Math.random() > 0.6 ? parseFloat((Math.random()).toFixed(2)) : 0.0));
      setSparseCoefficients(newCoeffs);
      setFidelityLoss(parseFloat((Math.random() * 0.005 + 0.001).toFixed(5)));
      setIsOptimizing(false);
      addTerminalLine(`[SPARSE OPT] Converged. Objective loss: ${fidelityLoss}, Active Basis Coeffs: ${newCoeffs.filter(c => c > 0).length}`, 'good');
    }, 800);
  };

  // Run Kompressor loop
  const handleRunKompressor = () => {
    addTerminalLine(`[KOMPRESSOR] Executing vector quantization & quad-tree transform at depth ${kompressorLevel}...`, 'system');
    setPipelineLog(prev => [`[${new Date().toLocaleTimeString()}] KOMPRESSOR: Quad-tree split completed. Ratio: 4.82:1`, ...prev]);
  };

  // Run TensallTensions check
  const handleRunTensallTensions = () => {
    const newLoad = parseFloat((Math.random() * 0.3 + 0.5).toFixed(2));
    setTensallTensionsLoad(newLoad);
    addTerminalLine(`[TENSALLTENSIONS] Boundary manifold evaluated. Edge-load distribution: ${newLoad * 100}%`, 'system');
    setPipelineLog(prev => [`[${new Date().toLocaleTimeString()}] TENSALLTENSIONS: Manifold load stable at ${newLoad}`, ...prev]);
  };

  // Run HatchetChopman routine
  const handleRunHatchetChopman = () => {
    setHatchetPruneActive(prev => !prev);
    addTerminalLine(`[HATCHETCHOPMAN] Hard boundary pruning block toggled: ${!hatchetPruneActive ? 'ARMED' : 'DISARMED'}`, 'warn');
    setPipelineLog(prev => [`[${new Date().toLocaleTimeString()}] HATCHETCHOPMAN: Pruning block ${!hatchetPruneActive ? 'engaged' : 'bypassed'}`, ...prev]);
  };

  // Canvas visual rendering loop for Wavefield & Sparse Matrix
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (activeTab === 'cgh') {
        // Render Holographic Wavefield Interference Pattern U(x,y) = A(x,y) * exp(j phi)
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const maxR = Math.min(cx, cy) - 20;

        ctx.lineWidth = 1.5;
        for (let r = 20; r < maxR; r += 16) {
          const alphaFactor = transmissionAlpha * (1 - r / maxR);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alphaFactor * (0.4 + 0.3 * Math.sin(t + r * 0.05))})`;
          ctx.beginPath();
          for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
            const waveMod = Math.sin(angle * 6 + t * 2) * (focalDistance * 0.05);
            const x = cx + (r + waveMod) * Math.cos(angle);
            const y = cy + (r + waveMod) * Math.sin(angle);
            if (angle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
        }

        // Center SLM Aperture
        ctx.fillStyle = 'rgba(14, 165, 233, 0.2)';
        ctx.beginPath();
        ctx.arc(cx, cy, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px monospace';
        ctx.fillText(`CGH WAVEFIELD: lambda=${wavelength}nm | alpha_trans=${transmissionAlpha} | Method: ${propagationMethod.toUpperCase()}`, 16, 24);

      } else {
        // Render Sparse Reconstruction & Matrix Grid
        const cols = 16;
        const rows = 12;
        const cellW = canvas.width / cols;
        const cellH = canvas.height / rows;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const val = Math.sin(c * 0.5 + t + r * 0.3) * Math.cos(t * 0.5);
            const intensity = Math.abs(val);

            if (intensity > sparsityThreshold) {
              ctx.fillStyle = `rgba(168, 85, 247, ${intensity * alphaReg * 10})`;
              ctx.fillRect(c * cellW + 2, r * cellH + 2, cellW - 4, cellH - 4);
              ctx.strokeStyle = 'rgba(216, 180, 254, 0.6)';
              ctx.strokeRect(c * cellW + 2, r * cellH + 2, cellW - 4, cellH - 4);
            } else {
              ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
              ctx.fillRect(c * cellW + 2, r * cellH + 2, cellW - 4, cellH - 4);
              ctx.strokeStyle = 'rgba(30, 41, 59, 0.8)';
              ctx.strokeRect(c * cellW + 2, r * cellH + 2, cellW - 4, cellH - 4);
            }
          }
        }

        ctx.fillStyle = '#c084fc';
        ctx.font = '11px monospace';
        ctx.fillText(`SPARSE IMAGING GRID: min 0.5||Ax-y||² + alpha(${alphaReg})||Psi x||₁ | TensallTensions: ${tensallTensionsLoad}`, 16, 24);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeTab, alphaReg, sparsityThreshold, transmissionAlpha, wavelength, propagationMethod, focalDistance, tensallTensionsLoad]);

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-mono text-xs overflow-hidden select-none">
      {/* Top Header / Nav Tabs */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-purple-300">ALPHA PIPELINE & HOLOGRAM SYNTHESIZER</h2>
            <p className="text-[10px] text-slate-400">Sparse reconstruction, CGH wavefields, kompressor, tensalltensions, hatchetchopman</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('sparse')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
              activeTab === 'sparse' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Sparse Imaging (α)</span>
          </button>
          <button
            onClick={() => setActiveTab('cgh')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
              activeTab === 'cgh' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>CGH Wavefield</span>
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
              activeTab === 'pipeline' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pipeline Layout</span>
          </button>
          <button
            onClick={() => setActiveTab('operators')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
              activeTab === 'operators' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Custom Identifiers</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-y-auto">
        
        {/* Left / Top Canvas Viewport */}
        <div className="lg:col-span-2 flex flex-col bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-slate-200 uppercase tracking-wide">
                {activeTab === 'sparse' && 'Sparse Matrix Optimization Field (L1 Regularization)'}
                {activeTab === 'cgh' && 'Complex Object Wavefield Modulation U(x,y) = A(x,y) · exp(jφ)'}
                {activeTab === 'pipeline' && 'Multi-Dimensional Rasterization & Volumetric Quantization'}
                {activeTab === 'operators' && 'Kompressor & TensallTensions Manifold Grid'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded text-[10px]">
                Active Alpha: {activeTab === 'cgh' ? transmissionAlpha : alphaReg}
              </span>
            </div>
          </div>

          {/* Canvas Render */}
          <div className="relative flex-1 min-h-[280px] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={640}
              height={360}
              className="w-full h-full object-cover"
            />
            {isOptimizing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                <span className="text-purple-300 font-bold">Solving Sparse Optimization Objective...</span>
              </div>
            )}
          </div>

          {/* Bottom Live Metrics */}
          <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800 text-center">
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400">FIDELITY LOSS</div>
              <div className="text-sm font-bold text-purple-400">{fidelityLoss}</div>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400">BASIS COEFFS</div>
              <div className="text-sm font-bold text-sky-400">{sparseCoefficients.filter(c => c > 0).length} / 12 Active</div>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400">EDGE-LOAD (TENSALL)</div>
              <div className="text-sm font-bold text-amber-400">{(tensallTensionsLoad * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400">HATCHET PRUNE</div>
              <div className={`text-sm font-bold ${hatchetPruneActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {hatchetPruneActive ? 'ARMED' : 'BYPASSED'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Controls & Parameter Tunning */}
        <div className="flex flex-col space-y-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-xl overflow-y-auto">
          
          {activeTab === 'sparse' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-purple-300 uppercase">1. Sparse Imaging & Mass Reconstructions</h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  min_x 0.5||Ax - y||_2^2 + α||Ψx||_1
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-300">Alpha Regularization (α)</span>
                    <span className="text-purple-400">{alphaReg}</span>
                  </div>
                  <input
                    type="range"
                    min="0.001"
                    max="0.5"
                    step="0.005"
                    value={alphaReg}
                    onChange={(e) => setAlphaReg(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-950"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-300">Sparsity Threshold</span>
                    <span className="text-sky-400">{sparsityThreshold}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.9"
                    step="0.05"
                    value={sparsityThreshold}
                    onChange={(e) => setSparsityThreshold(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-slate-950"
                  />
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Basis Coefficient Vector (α_i)</div>
                  <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px]">
                    {sparseCoefficients.map((c, idx) => (
                      <div key={idx} className={`p-1 text-center rounded border ${c > 0 ? 'bg-purple-950/40 border-purple-500/40 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                        {c.toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleRunSparseOptimization}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center justify-center space-x-2 transition-all shadow-lg"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Run L1 Sparse Optimization</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cgh' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-sky-300 uppercase">2. Computer-Generated Holography (CGH)</h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  U(x,y) = A(x,y) · exp(jφ(x,y)) | α_trans ∈ [0, 1]
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-300">Transmission Amplitude (α_trans)</span>
                    <span className="text-sky-400">{transmissionAlpha}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={transmissionAlpha}
                    onChange={(e) => setTransmissionAlpha(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-slate-950"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-300">Wavelength (λ)</span>
                    <span className="text-emerald-400">{wavelength} nm</span>
                  </div>
                  <select
                    value={wavelength}
                    onChange={(e) => setWavelength(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200"
                  >
                    <option value={450}>450 nm (Blue)</option>
                    <option value={532}>532 nm (Green)</option>
                    <option value={635}>635 nm (Red)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-300">Propagation Algorithm</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['fresnel', 'angular', 'rayleigh'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setPropagationMethod(m)}
                        className={`py-1 rounded text-[10px] border transition-all ${
                          propagationMethod === m ? 'bg-sky-600 border-sky-400 text-white font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] space-y-1 text-slate-300">
                  <div className="font-bold text-sky-400 mb-1">SLM Field State</div>
                  <div>• Phase Modulation: {phaseModulation} rad</div>
                  <div>• Focal Distance: {focalDistance} mm</div>
                  <div>• Multi-plane Layer Blending: Active</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-emerald-300 uppercase">3. Pipeline Synthesis Layout</h3>
                <p className="text-[10px] text-slate-400 mt-1">Cascaded parameter execution layers</p>
              </div>

              <div className="space-y-2 text-[10px]">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center justify-between">
                    <span>Rasterization / Fragment Shader</span>
                    <span className="text-[9px] text-slate-400">0.0 to 1.0</span>
                  </div>
                  <div className="text-slate-400">Per-pixel structural opacity and transparency mapping over grid.</div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-bold text-sky-400 flex items-center justify-between">
                    <span>Volumetric Quantization</span>
                    <span className="text-[9px] text-slate-400">α ∈ ℝ⁺</span>
                  </div>
                  <div className="text-slate-400">Point-cloud attenuation profiles during volumetric projections.</div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-bold text-purple-400 flex items-center justify-between">
                    <span>Compressed Optimization</span>
                    <span className="text-[9px] text-slate-400">α_reg &gt; 0</span>
                  </div>
                  <div className="text-slate-400">Hard/soft thresholding line for pruning wave coefficients.</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'operators' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-amber-300 uppercase">4. Custom Architecture Identifiers</h3>
                <p className="text-[10px] text-slate-400 mt-1">kompressor, tensalltensions, hatchetchopman</p>
              </div>

              <div className="space-y-3">
                {/* Kompressor */}
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">kompressor</span>
                    <button
                      onClick={handleRunKompressor}
                      className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-[9px]"
                    >
                      Run Loop
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">Vector quantization / Quad-tree low-frequency isolation.</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-300">
                    <span>Quad Depth: {kompressorLevel}</span>
                    <input
                      type="range" min="2" max="8" step="1"
                      value={kompressorLevel}
                      onChange={(e) => setKompressorLevel(parseInt(e.target.value))}
                      className="w-24 accent-amber-500"
                    />
                  </div>
                </div>

                {/* TensallTensions */}
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-400">tensalltensions</span>
                    <button
                      onClick={handleRunTensallTensions}
                      className="px-2 py-0.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-[9px]"
                    >
                      Check Load
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">Edge-load distribution & continuous manifold constraints.</p>
                  <div className="text-[10px] text-sky-300">Current Load Factor: {(tensallTensionsLoad * 100).toFixed(1)}%</div>
                </div>

                {/* HatchetChopman */}
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400">hatchetchopman</span>
                    <button
                      onClick={handleRunHatchetChopman}
                      className={`px-2 py-0.5 rounded text-[9px] ${hatchetPruneActive ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                    >
                      {hatchetPruneActive ? 'Prune Active' : 'Bypassed'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">Structural sub-divider hard boundary pruning block.</p>
                </div>
              </div>
            </div>
          )}

          {/* Pipeline Activity Log */}
          <div className="mt-auto bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 max-h-[140px] overflow-y-auto">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Execution Log</span>
              <Terminal className="w-3 h-3 text-slate-500" />
            </div>
            {pipelineLog.map((log, idx) => (
              <div key={idx} className="text-[10px] text-purple-300 font-mono truncate">
                {log}
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
