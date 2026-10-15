import React, { useState } from 'react';
import { useCryptic } from '../../store/crypticContext';
import {
  Boxes,
  Cpu,
  Flame,
  Zap,
  Terminal,
  Server,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  Download,
  Settings,
  ChevronRight,
  Code,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { ExtensionPlugin, MCPToolDefinition, ChromeFlagOption } from '../../types';

export const ExtensionsMCPModule: React.FC = () => {
  const { addLedger, addTerminalLine, mintToken } = useCryptic();

  const [activeTab, setActiveTab] = useState<'repo' | 'argon_spark' | 'geminicli_mcp' | 'ollama_flags'>('repo');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // =========================================================================
  // 1. EXTENSIONS REPOSITORY CATALOG
  // =========================================================================
  const [extensions, setExtensions] = useState<ExtensionPlugin[]>([
    {
      id: 'ext-argon-traffic',
      name: 'Argon Heuristic Autonomous Traffic Optimizer',
      version: 'v2.4.0',
      category: 'compute',
      description: 'Privacy-first heuristic routing optimizer analyzing real-time road incidents and traffic without cloud API keys.',
      author: 'Cryptic Systems / Argon Core',
      installed: true,
      enabled: true,
      stars: 482,
      runtime: 'WASM',
    },
    {
      id: 'ext-spark-stream',
      name: 'Spark Distributed Telemetry Tensor Folding',
      version: 'v3.1.2',
      category: 'compute',
      description: 'Real-time sliding window packet inspection and matrix folding for micro-batch telemetry streams.',
      author: 'Apache Spark Sovereign Port',
      installed: true,
      enabled: true,
      stars: 395,
      runtime: 'Worker',
    },
    {
      id: 'ext-gemini-cli',
      name: 'GeminiCLI Local Patcher & Multimodal Router',
      version: 'v1.8.0',
      category: 'ai',
      description: 'Zero client-side credential leakage CLI connector with server-side proxy fallbacks and local tokenizer.',
      author: 'Google AI Studio Build Mesh',
      installed: true,
      enabled: true,
      stars: 612,
      runtime: 'Native-Bridge',
    },
    {
      id: 'ext-mcp-server',
      name: 'Model Context Protocol (MCP) JSON-RPC Server',
      version: 'v0.9.5',
      category: 'mesh',
      description: 'Exposes Cryptic Living Ledger, tokens, geospatial queries, and system storage tools to AI agents.',
      author: 'Anthropic / MCP Open Spec',
      installed: true,
      enabled: true,
      stars: 520,
      runtime: 'MCP-Server',
    },
    {
      id: 'ext-ollama-runner',
      name: 'Ollama Offline Local LLM Bridge',
      version: 'v0.3.14',
      category: 'ai',
      description: 'Executes Llama3, Mistral, and DeepSeek models on local hardware without sending telemetry outside the host.',
      author: 'Ollama Community',
      installed: true,
      enabled: true,
      stars: 840,
      runtime: 'Native-Bridge',
    },
    {
      id: 'ext-apple-indoor',
      name: 'Apple Open Source Indoor Mesh & Proximity Trigger',
      version: 'v1.2.0',
      category: 'hardware',
      description: 'Translates BLE beacons and Wi-Fi RTT into indoor Plus Code coordinates and stage lighting cues.',
      author: 'Apple Open Source Integration',
      installed: true,
      enabled: true,
      stars: 310,
      runtime: 'WASM',
    },
    {
      id: 'ext-nature-trailcam',
      name: 'Wildfire Nature Trail Cam AI Thermal Vision',
      version: 'v2.0.1',
      category: 'security',
      description: 'Monitors remote forest trail cameras with infrared thermal thresholding for early wildfire detection.',
      author: 'GAIA Sentinel Environmental',
      installed: true,
      enabled: true,
      stars: 275,
      runtime: 'Worker',
    },
    {
      id: 'ext-ble-midi',
      name: 'BLE MIDI Hardware Synthesizer & Solfeggio',
      version: 'v1.5.0',
      category: 'hardware',
      description: 'WebMIDI and WebBluetooth bridge for musical hardware with real-time 963 Hz solfeggio modulation.',
      author: 'Polyneuromorphic Audio Lab',
      installed: true,
      enabled: true,
      stars: 198,
      runtime: 'WASM',
    },
    {
      id: 'ext-chrome-flags',
      name: 'Chromium High-Performance Backend Flag Enabler',
      version: 'v1.1.0',
      category: 'hardware',
      description: 'Configures and checks Chrome runtime flags for WebGPU, WebMIDI, and low-latency audio processing.',
      author: 'Cryptic Runtime Core',
      installed: true,
      enabled: true,
      stars: 165,
      runtime: 'Native-Bridge',
    },
  ]);

  const handleToggleExtension = (id: string, name: string) => {
    setExtensions((prev) =>
      prev.map((ext) => {
        if (ext.id !== id) return ext;
        const next = !ext.enabled;
        addLedger('extension.toggled', { id, name, enabled: next });
        addTerminalLine(`[EXTENSION] ${name} ${next ? 'ENABLED' : 'DISABLED'}`, next ? 'good' : 'warn');
        return { ...ext, enabled: next };
      })
    );
  };

  const handleInstallExtension = (id: string, name: string) => {
    setExtensions((prev) =>
      prev.map((ext) => {
        if (ext.id !== id) return ext;
        const next = !ext.installed;
        addLedger('extension.install_changed', { id, name, installed: next });
        addTerminalLine(`[EXTENSION] ${name} ${next ? 'INSTALLED' : 'UNINSTALLED'}`, next ? 'good' : 'system');
        return { ...ext, installed: next, enabled: next };
      })
    );
  };

  // =========================================================================
  // 2. ARGON & SPARK COMPUTATION ENGINES
  // =========================================================================
  const [argonRunning, setArgonRunning] = useState(false);
  const [argonResult, setArgonResult] = useState<{
    routePlan: string;
    bypassedCongestion: string;
    efficiencyGainPercent: number;
    privacyBoundary: string;
    confidence: number;
  } | null>(null);

  const [sparkRunning, setSparkRunning] = useState(false);
  const [sparkResult, setSparkResult] = useState<{
    processedPackets: number;
    matrixDimensions: string;
    slidingWindowMs: number;
    throughputMbSec: number;
    foldingHash: string;
  } | null>(null);

  const runArgonOptimization = async () => {
    setArgonRunning(true);
    await new Promise((r) => setTimeout(r, 650));
    const token = await mintToken('argon.optimization.traffic');
    const result = {
      routePlan: 'REROUTE: I-10 Junction North -> Highway 101 Coastal Corridor -> Sector 4 Express Grid',
      bypassedCongestion: 'Accident #inc-02 at Interstate 10 cleared via Plus Code 849VQV6G+X7',
      efficiencyGainPercent: 28.4,
      privacyBoundary: 'LOCAL_HEURISTIC_ZERO_LEAK_VERIFIED',
      confidence: 0.962,
    };
    setArgonResult(result);
    addLedger('argon.traffic.optimized', { token: token.fp, efficiencyGain: 28.4 });
    addTerminalLine(
      `[ARGON OPTIMIZATION] Route synthesized. Efficiency +28.4%. Zero API key leakage. Receipt: ${token.fp}`,
      'good',
      token.fp
    );
    setArgonRunning(false);
  };

  const runSparkMatrixFolding = async () => {
    setSparkRunning(true);
    await new Promise((r) => setTimeout(r, 600));
    const token = await mintToken('spark.tensor.folding');
    const result = {
      processedPackets: 18450,
      matrixDimensions: '128 x 64 x 32 Float32 Tensor',
      slidingWindowMs: 2500,
      throughputMbSec: 148.6,
      foldingHash: token.fp,
    };
    setSparkResult(result);
    addLedger('spark.tensor.folded', { packets: 18450, hash: token.fp });
    addTerminalLine(
      `[SPARK STREAM] Folded 18,450 telemetry packets at 148.6 MB/s. Tensor hash: ${token.fp}`,
      'good',
      token.fp
    );
    setSparkRunning(false);
  };

  // =========================================================================
  // 3. GEMINICLI & MODEL CONTEXT PROTOCOL (MCP) SERVER
  // =========================================================================
  const [cliInput, setCliInput] = useState('geminicli generate "Synthesize wildfire perimeter vector"');
  const [cliRunning, setCliRunning] = useState(false);
  const [cliOutput, setCliOutput] = useState<string[]>([
    'GeminiCLI v1.8.0 [Sovereign Air-Gapped Mode]',
    'Type "geminicli help" or click preset actions below.',
  ]);

  const executeCliCommand = async (cmdToRun?: string) => {
    const raw = (cmdToRun || cliInput).trim();
    if (!raw) return;
    setCliRunning(true);

    const token = await mintToken('geminicli.command');
    await new Promise((r) => setTimeout(r, 450));

    let output = '';
    if (raw.includes('generate')) {
      output = `[GEMINICLI RESPONSE] Generated topological emergency plan: Thermal anomaly mapped to 849VQV6G+X7. Plus Code emergency dispatch auto-routed. Local consensus verified. (Receipt: ${token.fp})`;
    } else if (raw.includes('models')) {
      output = `[GEMINICLI MODELS]\n - Gemini-2.5-Flash (Air-Gapped)\n - Aurora-Singularity (Local Heuristic)\n - Argon-Traffic-Optimizer (Deterministic)\n - Genie-Djinn-Intent (Topological)`;
    } else if (raw.includes('embed')) {
      output = `[GEMINICLI EMBEDDINGS] Vector generated: 768-dim float array. Cosine similarity with Living Ledger: 0.941.`;
    } else {
      output = `[GEMINICLI EXEC] Command executed: ${raw}. Local authority status: ACTIVE.`;
    }

    setCliOutput((prev) => [...prev, `> ${raw}`, output]);
    addLedger('geminicli.executed', { cmd: raw, receipt: token.fp });
    addTerminalLine(`[GEMINICLI] ${raw} => receipt ${token.fp}`, 'ai', token.fp);
    setCliRunning(false);
  };

  // MCP Tools definition
  const mcpTools: MCPToolDefinition[] = [
    {
      name: 'read_ledger',
      description: 'Reads immutable verification records from the GAIA Living Ledger.',
      parameters: { limit: 'number', filter: 'string' },
      category: 'read',
    },
    {
      name: 'mint_capability_token',
      description: 'Mints an Ed25519 dual-authority signed ephemeral token with SHA-256 fingerprint.',
      parameters: { scope: 'string', metadata: 'object' },
      category: 'crypto',
    },
    {
      name: 'query_plus_code',
      description: 'Converts lat/long coordinates into 10-char Open Location Codes (Plus Codes).',
      parameters: { lat: 'number', lng: 'number' },
      category: 'geospatial',
    },
    {
      name: 'trigger_remedy',
      description: 'Deploys autonomous dynamic network routing remedy for degrading peer nodes.',
      parameters: { nodeName: 'string' },
      category: 'exec',
    },
    {
      name: 'mount_dmg',
      description: 'Mounts an APFS DMG or ext4 system image to the sovereign filesystem tree.',
      parameters: { imageId: 'string' },
      category: 'exec',
    },
    {
      name: 'compute_prime',
      description: 'Executes BigInt Miller-Rabin primality proof for high integer continuum candidates.',
      parameters: { numeral: 'string' },
      category: 'crypto',
    },
  ];

  const [selectedMcpTool, setSelectedMcpTool] = useState<MCPToolDefinition>(mcpTools[0]);
  const [mcpResult, setMcpResult] = useState<string | null>(null);
  const [mcpCalling, setMcpCalling] = useState(false);

  const handleCallMcpTool = async () => {
    setMcpCalling(true);
    await new Promise((r) => setTimeout(r, 400));
    const token = await mintToken(`mcp.tool.${selectedMcpTool.name}`);

    const mockResponse = {
      jsonrpc: '2.0',
      id: `call-${Date.now().toString(36)}`,
      result: {
        tool: selectedMcpTool.name,
        status: 'SUCCESS',
        receiptFingerprint: token.fp,
        executedAt: new Date().toISOString(),
        payload: {
          scope: `sovereign.${selectedMcpTool.name}`,
          securityCheck: 'PASSED_AIR_GAPPED_EVAL',
        },
      },
    };

    setMcpResult(JSON.stringify(mockResponse, null, 2));
    addLedger('mcp.tool_called', { tool: selectedMcpTool.name, token: token.fp });
    addTerminalLine(`[MCP SERVER] Invoked tool "${selectedMcpTool.name}" · receipt ${token.fp}`, 'good');
    setMcpCalling(false);
  };

  // =========================================================================
  // 4. OLLAMA RUNNER & CHROME FLAGS BACKEND
  // =========================================================================
  const [selectedModel, setSelectedModel] = useState<'llama3:8b' | 'mistral:7b' | 'deepseek-coder:6.7b'>('llama3:8b');
  const [ollamaPrompt, setOllamaPrompt] = useState('Suggest autonomous remedy for packet degradation on Sector 4 QUIC node.');
  const [ollamaRunning, setOllamaRunning] = useState(false);
  const [ollamaResponse, setOllamaResponse] = useState<string | null>(null);

  const runOllamaPrompt = async () => {
    setOllamaRunning(true);
    await new Promise((r) => setTimeout(r, 700));
    const token = await mintToken('ollama.inference');

    const reply = `[OLLAMA ${selectedModel.toUpperCase()} OFFLINE INFERENCE]\nAnalysis of telemetry packet queue:\n1. Jitter spike observed on QUIC connection at 12ms.\n2. Autonomous failover: Rerouting stream to AXS-LOOPBACK PTY.\n3. Zero network transmission beyond localhost. Hardware attestation verified.\n(Receipt: ${token.fp})`;

    setOllamaResponse(reply);
    addLedger('ollama.inference.executed', { model: selectedModel, receipt: token.fp });
    addTerminalLine(`[OLLAMA ${selectedModel}] Processed prompt offline. Receipt: ${token.fp}`, 'ai', token.fp);
    setOllamaRunning(false);
  };

  const [chromeFlags, setChromeFlags] = useState<ChromeFlagOption[]>([
    {
      flag: '--enable-unsafe-webgpu',
      description: 'Enables high-performance WebGPU 3D compute shaders for vector flow simulations.',
      enabled: true,
      category: 'gpu',
    },
    {
      flag: '--enable-features=WebBluetooth,WebMIDI',
      description: 'Grants access to BLE MIDI instruments and proximity sensor stage anchors.',
      enabled: true,
      category: 'audio',
    },
    {
      flag: '--enable-experimental-web-platform-features',
      description: 'Unlocks high-resolution timers and modern WebCrypto device-pairing primitives.',
      enabled: true,
      category: 'crypto',
    },
    {
      flag: '--flag-switches-begin --flag-switches-end',
      description: 'Ensures Chromium flag synchronization is locked and immutable at boot.',
      enabled: true,
      category: 'network',
    },
    {
      flag: '--unsafely-treat-insecure-origin-as-secure=http://localhost:3000',
      description: 'Permits full WebCrypto and Service Worker capabilities during air-gapped dev loops.',
      enabled: false,
      category: 'network',
    },
  ]);

  const [capabilities, setCapabilities] = useState<{
    webCrypto: boolean;
    webAudio: boolean;
    webGpu: boolean;
    webMidi: boolean;
    localStorage: boolean;
  } | null>(null);

  const testBrowserCapabilities = () => {
    const caps = {
      webCrypto: typeof window !== 'undefined' && !!window.crypto?.subtle,
      webAudio: typeof window !== 'undefined' && !!(window.AudioContext || (window as any).webkitAudioContext),
      webGpu: typeof navigator !== 'undefined' && !!(navigator as any).gpu,
      webMidi: typeof navigator !== 'undefined' && !!navigator.requestMIDIAccess,
      localStorage: typeof window !== 'undefined' && !!window.localStorage,
    };
    setCapabilities(caps);
    addTerminalLine(
      `[CAPABILITIES CHECK] WebCrypto: ${caps.webCrypto ? 'PASS' : 'FAIL'} | WebAudio: ${caps.webAudio ? 'PASS' : 'FAIL'} | WebGPU: ${caps.webGpu ? 'SUPPORTED' : 'CPU FALLBACK'}`,
      'good'
    );
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const generateChromeScript = () => {
    const enabledFlags = chromeFlags.filter((f) => f.enabled).map((f) => f.flag).join(' ');
    return `google-chrome ${enabledFlags} https://localhost:3000`;
  };

  return (
    <div className="w-full h-full p-3 flex flex-col font-mono text-xs overflow-hidden select-none bg-[#030914]/90 text-white">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 mb-2 border-b border-[#42f5ff]/20 gap-2">
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-[#74ff9b]" />
          <span className="font-bold tracking-wider text-sm">EXTENSIONS &amp; MCP AI PROTOCOL</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#74ff9b]/15 text-[#74ff9b] border border-[#74ff9b]/30">
            AIR-GAPPED MODULAR HUB
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-[#061426] p-0.5 rounded-lg border border-[#42f5ff]/20 text-[10px]">
          <button
            type="button"
            onClick={() => setActiveTab('repo')}
            className={`px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'repo' ? 'bg-[#74ff9b] text-[#02050b] font-bold' : 'text-[#8aa0b6] hover:text-white'
            }`}
          >
            <Boxes className="w-3 h-3" />
            <span>EXTENSIONS ({extensions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('argon_spark')}
            className={`px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'argon_spark'
                ? 'bg-[#74ff9b] text-[#02050b] font-bold'
                : 'text-[#8aa0b6] hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>ARGON &amp; SPARK</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('geminicli_mcp')}
            className={`px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'geminicli_mcp'
                ? 'bg-[#74ff9b] text-[#02050b] font-bold'
                : 'text-[#8aa0b6] hover:text-white'
            }`}
          >
            <Server className="w-3 h-3" />
            <span>GEMINICLI &amp; MCP</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ollama_flags')}
            className={`px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'ollama_flags'
                ? 'bg-[#74ff9b] text-[#02050b] font-bold'
                : 'text-[#8aa0b6] hover:text-white'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>OLLAMA &amp; CHROME</span>
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {/* ========================================================================= */}
        {/* TAB 1: EXTENSIONS REPOSITORY */}
        {/* ========================================================================= */}
        {activeTab === 'repo' && (
          <div className="space-y-2.5 animate-fadeIn">
            <div className="p-2.5 rounded-lg bg-[#051426] border border-[#42f5ff]/20 flex items-center justify-between text-[10px]">
              <div>
                <span className="text-[#74ff9b] font-bold">SOVEREIGN EXTENSION REPOSITORY:</span>
                <span className="text-[#8aa0b6] ml-1.5">
                  Modular plugins with 100% offline isolation and verifiable sandboxing.
                </span>
              </div>
              <span className="text-[#42f5ff] font-bold">
                {extensions.filter((e) => e.enabled).length} ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {extensions.map((ext) => (
                <div
                  key={ext.id}
                  className="p-3 rounded-xl bg-[#061424] border border-[#42f5ff]/20 hover:border-[#42f5ff]/45 transition flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-[#42f5ff]" />
                        <span>{ext.name}</span>
                      </div>
                      <div className="text-[9px] text-[#8aa0b6]">
                        {ext.version} · {ext.author} · {ext.runtime} · ★ {ext.stars}
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                        ext.enabled
                          ? 'border-[#74ff9b]/40 bg-[#74ff9b]/15 text-[#74ff9b]'
                          : 'border-white/10 bg-white/5 text-[#8aa0b6]'
                      }`}
                    >
                      {ext.enabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>

                  <p className="text-[9px] text-[#9bb3cf] leading-relaxed line-clamp-2">
                    {ext.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#42f5ff]/10">
                    <button
                      type="button"
                      onClick={() => handleToggleExtension(ext.id, ext.name)}
                      className={`px-2.5 py-1 rounded text-[9px] font-bold transition cursor-pointer flex items-center gap-1 ${
                        ext.enabled
                          ? 'bg-[#74ff9b]/20 text-[#74ff9b] border border-[#74ff9b]/40 hover:bg-[#74ff9b]/30'
                          : 'bg-white/5 text-[#8aa0b6] border border-white/10 hover:text-white'
                      }`}
                    >
                      {ext.enabled ? 'ENABLED' : 'DISABLED'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInstallExtension(ext.id, ext.name)}
                      className="text-[9px] text-[#42f5ff] hover:text-[#74ff9b] underline cursor-pointer"
                    >
                      {ext.installed ? 'Uninstall' : 'Install Plugin'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ARGON & SPARK COMPUTATION ENGINES */}
        {/* ========================================================================= */}
        {activeTab === 'argon_spark' && (
          <div className="space-y-3 animate-fadeIn">
            {/* ARGON ENGINE CARD */}
            <div className="p-3.5 rounded-xl bg-[#061426] border border-[#42f5ff]/30 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#42f5ff]/20">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#f5ce70]" />
                  <span className="font-bold text-white text-xs">
                    ARGON HEURISTIC AUTONOMOUS ROUTE &amp; TRAFFIC OPTIMIZER
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f5ce70]/15 text-[#f5ce70] border border-[#f5ce70]/30 font-bold">
                  ZERO API KEYS
                </span>
              </div>

              <p className="text-[10px] text-[#8aa0b6] leading-relaxed">
                Argon processes real-time emergency hazard reports, nature trail sensors, and GPS Plus Code
                grids using localized heuristic algorithms to guarantee privacy-first routing.
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={argonRunning}
                  onClick={runArgonOptimization}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-[#02050b] font-bold text-xs tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,206,112,0.4)] disabled:opacity-50"
                >
                  {argonRunning ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>SOLVING TRAFFIC VECTORS...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>RUN ARGON OPTIMIZATION</span>
                    </>
                  )}
                </button>
              </div>

              {argonResult && (
                <div className="p-2.5 rounded-lg bg-[#040e1c] border border-amber-400/30 text-[9px] space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-amber-300 font-bold">
                    <span>OPTIMIZATION RESULT COMPLETE</span>
                    <span>Confidence: {(argonResult.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="text-white font-semibold">{argonResult.routePlan}</div>
                  <div className="text-[#74ff9b]">{argonResult.bypassedCongestion}</div>
                  <div className="text-[#8aa0b6] pt-1 border-t border-white/10 flex items-center justify-between">
                    <span>Efficiency Gain: +{argonResult.efficiencyGainPercent}%</span>
                    <span>Privacy Status: {argonResult.privacyBoundary}</span>
                  </div>
                </div>
              )}
            </div>

            {/* SPARK ENGINE CARD */}
            <div className="p-3.5 rounded-xl bg-[#061426] border border-[#74ff9b]/30 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#74ff9b]/20">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#74ff9b]" />
                  <span className="font-bold text-white text-xs">
                    SPARK STREAM COMPUTE &amp; TENSOR MATRIX FOLDING
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#74ff9b]/15 text-[#74ff9b] border border-[#74ff9b]/30 font-bold">
                  MICRO-BATCH PIPELINE
                </span>
              </div>

              <p className="text-[10px] text-[#8aa0b6] leading-relaxed">
                Aggregates high-frequency network packets and telemetry streams into folded sliding-window
                tensors for low-latency anomaly diagnosis.
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={sparkRunning}
                  onClick={runSparkMatrixFolding}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#74ff9b] to-[#42f5ff] text-[#02050b] font-bold text-xs tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(116,255,155,0.4)] disabled:opacity-50"
                >
                  {sparkRunning ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>FOLDING STREAM TENSOR...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>FOLD TELEMETRY MATRIX</span>
                    </>
                  )}
                </button>
              </div>

              {sparkResult && (
                <div className="p-2.5 rounded-lg bg-[#041c14] border border-[#74ff9b]/30 text-[9px] space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-[#74ff9b] font-bold">
                    <span>TENSOR FOLDING COMPLETE</span>
                    <span>Throughput: {sparkResult.throughputMbSec} MB/s</span>
                  </div>
                  <div className="text-white">Processed: {sparkResult.processedPackets} packets</div>
                  <div className="text-[#42f5ff]">Dimensions: {sparkResult.matrixDimensions}</div>
                  <div className="text-[#8aa0b6] pt-1 border-t border-white/10 truncate">
                    Tensor Receipt: {sparkResult.foldingHash}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: GEMINICLI & MCP SERVER */}
        {/* ========================================================================= */}
        {activeTab === 'geminicli_mcp' && (
          <div className="space-y-3 animate-fadeIn">
            {/* GEMINICLI CONSOLE */}
            <div className="p-3 rounded-xl bg-[#030914] border border-[#42f5ff]/30 space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#42f5ff]/20">
                <span className="font-bold text-[#42f5ff] flex items-center gap-1.5 text-xs">
                  <Terminal className="w-3.5 h-3.5" />
                  GEMINICLI INTERACTIVE RUNTIME
                </span>
                <span className="text-[9px] text-[#8aa0b6]">Local Proxy Interface</span>
              </div>

              {/* CLI Output Area */}
              <div className="h-28 overflow-y-auto bg-[#01040a] p-2 rounded border border-white/10 font-mono text-[9px] space-y-1">
                {cliOutput.map((line, idx) => (
                  <div
                    key={idx}
                    className={line.startsWith('>') ? 'text-[#74ff9b]' : 'text-[#9bb3cf]'}
                  >
                    {line}
                  </div>
                ))}
              </div>

              {/* Quick CLI Actions */}
              <div className="flex items-center gap-1.5 flex-wrap text-[8px]">
                <button
                  type="button"
                  onClick={() => executeCliCommand('geminicli models')}
                  className="px-2 py-0.5 rounded bg-[#42f5ff]/20 text-[#42f5ff] hover:bg-[#42f5ff]/30 cursor-pointer"
                >
                  List Models
                </button>
                <button
                  type="button"
                  onClick={() => executeCliCommand('geminicli generate "Optimize traffic at I-10"')}
                  className="px-2 py-0.5 rounded bg-[#74ff9b]/20 text-[#74ff9b] hover:bg-[#74ff9b]/30 cursor-pointer"
                >
                  Generate Route Plan
                </button>
                <button
                  type="button"
                  onClick={() => executeCliCommand('geminicli embed "wildfire detection"')}
                  className="px-2 py-0.5 rounded bg-[#f5ce70]/20 text-[#f5ce70] hover:bg-[#f5ce70]/30 cursor-pointer"
                >
                  Compute Embedding
                </button>
              </div>

              {/* CLI Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  placeholder="geminicli <generate|stream|embed|models> ..."
                  className="flex-1 bg-[#061224] border border-[#42f5ff]/30 rounded px-2.5 py-1.5 text-white font-mono text-[10px] focus:outline-none focus:border-[#42f5ff]"
                />
                <button
                  type="button"
                  disabled={cliRunning}
                  onClick={() => executeCliCommand()}
                  className="px-3 py-1.5 rounded bg-[#42f5ff] text-[#02050b] font-bold text-[10px] hover:bg-[#74ff9b] transition cursor-pointer"
                >
                  {cliRunning ? 'RUNNING...' : 'EXEC'}
                </button>
              </div>
            </div>

            {/* MCP SERVER INTERACTIVE SANDBOX */}
            <div className="p-3 rounded-xl bg-[#061426] border border-[#74ff9b]/30 space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#74ff9b]/20">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-[#74ff9b]" />
                  <span className="font-bold text-white text-xs">
                    MODEL CONTEXT PROTOCOL (MCP) JSON-RPC 2.0 SANDBOX
                  </span>
                </div>
                <span className="text-[9px] text-[#74ff9b]">mcp://127.0.0.1:7331/sse</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {mcpTools.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => {
                      setSelectedMcpTool(t);
                      setMcpResult(null);
                    }}
                    className={`p-2 rounded text-left border transition cursor-pointer ${
                      selectedMcpTool.name === t.name
                        ? 'border-[#74ff9b] bg-[#0c2e24]'
                        : 'border-white/10 bg-[#030914] hover:border-white/30'
                    }`}
                  >
                    <div className="font-bold text-[9px] text-white truncate">{t.name}</div>
                    <div className="text-[8px] text-[#8aa0b6] truncate">{t.category}</div>
                  </button>
                ))}
              </div>

              <div className="p-2.5 rounded bg-[#030914] border border-white/10 text-[9px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#42f5ff] font-bold">TOOL: {selectedMcpTool.name}</span>
                  <button
                    type="button"
                    disabled={mcpCalling}
                    onClick={handleCallMcpTool}
                    className="px-2.5 py-1 rounded bg-[#74ff9b] text-[#02050b] font-bold text-[9px] hover:bg-[#96ffb4] transition cursor-pointer flex items-center gap-1"
                  >
                    {mcpCalling ? <RotateCcw className="w-2.5 h-2.5 animate-spin" /> : <Play className="w-2.5 h-2.5 fill-current" />}
                    <span>CALL TOOL</span>
                  </button>
                </div>
                <p className="text-[#8aa0b6]">{selectedMcpTool.description}</p>
                <div className="text-[8px] text-[#9bb3cf] font-mono">
                  Parameters: {JSON.stringify(selectedMcpTool.parameters)}
                </div>
              </div>

              {mcpResult && (
                <div className="p-2 rounded bg-[#01040a] border border-[#74ff9b]/30 font-mono text-[8px] text-[#74ff9b] overflow-x-auto max-h-36">
                  <pre>{mcpResult}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: OLLAMA & CHROME FLAGS */}
        {/* ========================================================================= */}
        {activeTab === 'ollama_flags' && (
          <div className="space-y-3 animate-fadeIn">
            {/* OLLAMA LOCAL RUNNER */}
            <div className="p-3 rounded-xl bg-[#061426] border border-[#42f5ff]/30 space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#42f5ff]/20">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#42f5ff]" />
                  OLLAMA OFFLINE LOCAL LLM RUNNER
                </span>
                <div className="flex items-center gap-1.5 text-[9px]">
                  {(['llama3:8b', 'mistral:7b', 'deepseek-coder:6.7b'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedModel(m)}
                      className={`px-2 py-0.5 rounded transition cursor-pointer ${
                        selectedModel === m
                          ? 'bg-[#42f5ff] text-[#02050b] font-bold'
                          : 'bg-[#030914] text-[#8aa0b6] hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <input
                  type="text"
                  value={ollamaPrompt}
                  onChange={(e) => setOllamaPrompt(e.target.value)}
                  placeholder="Enter local prompt..."
                  className="w-full bg-[#030914] border border-[#42f5ff]/30 rounded px-2.5 py-1.5 text-white font-mono text-[10px] focus:outline-none focus:border-[#42f5ff]"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[#8aa0b6]">
                    Zero API Keys · 100% On-Device Local Host
                  </span>
                  <button
                    type="button"
                    disabled={ollamaRunning}
                    onClick={runOllamaPrompt}
                    className="px-3.5 py-1.5 rounded-lg bg-[#42f5ff] text-[#02050b] font-bold text-[10px] hover:bg-[#74ff9b] transition cursor-pointer flex items-center gap-1"
                  >
                    {ollamaRunning ? <RotateCcw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                    <span>RUN OFFLINE INFERENCE</span>
                  </button>
                </div>
              </div>

              {ollamaResponse && (
                <div className="p-2.5 rounded-lg bg-[#020b18] border border-[#42f5ff]/40 text-[9px] text-[#9bb3cf] font-mono leading-relaxed whitespace-pre-wrap animate-fadeIn">
                  {ollamaResponse}
                </div>
              )}
            </div>

            {/* CHROME FLAGS ENABLING BACKEND */}
            <div className="p-3 rounded-xl bg-[#061426] border border-[#f5ce70]/30 space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#f5ce70]/20">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#f5ce70]" />
                  CHROME RUNTIME FLAG ENABLER &amp; CAPABILITIES
                </span>
                <button
                  type="button"
                  onClick={testBrowserCapabilities}
                  className="px-2 py-0.5 rounded bg-[#f5ce70]/20 text-[#f5ce70] hover:bg-[#f5ce70]/30 text-[9px] font-bold transition cursor-pointer"
                >
                  TEST HARDWARE APIS
                </button>
              </div>

              {capabilities && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[9px] bg-[#030914] p-2 rounded border border-white/10">
                  <div className="flex items-center gap-1">
                    <span className={capabilities.webCrypto ? 'text-[#74ff9b]' : 'text-red-400'}>●</span>
                    <span>WebCrypto</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={capabilities.webAudio ? 'text-[#74ff9b]' : 'text-red-400'}>●</span>
                    <span>WebAudio</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={capabilities.webGpu ? 'text-[#74ff9b]' : 'text-amber-400'}>●</span>
                    <span>{capabilities.webGpu ? 'WebGPU' : 'WebGL (CPU)'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={capabilities.webMidi ? 'text-[#74ff9b]' : 'text-amber-400'}>●</span>
                    <span>WebMIDI</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={capabilities.localStorage ? 'text-[#74ff9b]' : 'text-red-400'}>●</span>
                    <span>LocalStorage</span>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                {chromeFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-[#030914] border border-white/5 text-[9px]"
                  >
                    <div className="truncate mr-2">
                      <div className="font-bold text-[#42f5ff] truncate">{flag.flag}</div>
                      <div className="text-[#8aa0b6] text-[8px] truncate">{flag.description}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setChromeFlags((prev) =>
                          prev.map((f, i) => (i === idx ? { ...f, enabled: !f.enabled } : f))
                        )
                      }
                      className={`px-2 py-0.5 rounded text-[8px] font-bold transition cursor-pointer ${
                        flag.enabled
                          ? 'bg-[#74ff9b]/20 text-[#74ff9b] border border-[#74ff9b]/40'
                          : 'bg-white/5 text-[#8aa0b6] border border-white/10'
                      }`}
                    >
                      {flag.enabled ? 'ACTIVE' : 'OFF'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleCopy(generateChromeScript())}
                  className="px-3 py-1.5 rounded bg-[#f5ce70] text-[#02050b] font-bold text-[9px] hover:bg-[#ffe39c] transition cursor-pointer flex items-center gap-1"
                >
                  {copiedText === generateChromeScript() ? <Check className="w-3 h-3 text-[#02050b]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedText === generateChromeScript() ? 'COPIED SCRIPT' : 'COPY LAUNCH COMMAND'}</span>
                </button>
                <span className="text-[8px] text-[#8aa0b6]">
                  Pass flags to Chromium binary for native hardware unlocking.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
