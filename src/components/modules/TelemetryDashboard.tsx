import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Wifi, 
  Shield, 
  Server, 
  Zap, 
  Layers, 
  RefreshCw, 
  CheckCircle2, 
  Sliders, 
  SlidersHorizontal,
  Lock,
  Globe,
  Radio,
  BarChart3,
  Terminal,
  Users,
  Bot,
  Database,
  Video,
  Phone,
  Share2,
  Sparkles,
  Play,
  Layers3,
  CpuIcon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  CartesianGrid 
} from 'recharts';
import { useCryptic } from '../../store/crypticContext';
import { PacketCycleViz } from './PacketCycleViz';
import { AgentBattalionView } from './AgentBattalionView';
import { IncidentTimeline } from './IncidentTimeline';
import { AgentTerminal } from './AgentTerminal';

interface TelemetryPoint {
  time: string;
  cpu: number;
  memory: number;
  network: number;
  agentsActive: number;
}

interface AgentNode {
  id: string;
  name: string;
  battalion: string;
  division: string;
  platoonModel: string;
  pairedAgent: string;
  status: 'active' | 'patrolling' | 'reoptimizing' | 'synchronized';
  packetsDelivered: number;
  packetsDropped: number;
  cycleCount: number;
}

export const TelemetryDashboard: React.FC = () => {
  const { addTerminalLine, addLedger } = useCryptic();
  const [data, setData] = useState<TelemetryPoint[]>([]);
  const [tierSystem, setTierSystem] = useState<'tier-1' | 'tier-2' | 'tier-3' | 'god-sovereign'>('tier-1');
  const [autoReoptimize, setAutoReoptimize] = useState(true);
  const [solarisActive, SolarisActive] = useState(false);
  const [godPolicyStatus, setGodPolicyStatus] = useState(true);
  const [activeBattalion, setActiveBattalion] = useState<'all' | 'alpha-vanguard' | 'beta-shield' | 'gamma-recon'>('all');
  
  // Assistant states
  const [heyGaiaActive, setHeyGaiaActive] = useState(true);
  const [amazonQGrokActive, setAmazonQGrokActive] = useState(true);
  const [codexGeminiActive, setCodexGeminiActive] = useState(true);
  const [siriCopilotActive, setSiriCopilotActive] = useState(true);

  // 6k Agent Nodes sample view state
  const [agentNodes, setAgentNodes] = useState<AgentNode[]>([
    { id: 'node-01', name: 'Gaia-Zero-Alpha', battalion: 'Vanguard', division: 'Infra-1', platoonModel: 'HuggingFace-Llama-Sovereign-v1', pairedAgent: 'Zero-Gaia-Alpha-Rev', status: 'active', packetsDelivered: 1420, packetsDropped: 0, cycleCount: 33 },
    { id: 'node-02', name: 'Muse-Shield-Beta', battalion: 'Shield', division: 'Auth-2', platoonModel: 'HuggingFace-Mistral-AuthGuard', pairedAgent: 'Beta-Shield-Muse-Rev', status: 'synchronized', packetsDelivered: 2890, packetsDropped: 1, cycleCount: 67 },
    { id: 'node-03', name: 'Q-Grok-Storage-Gamma', battalion: 'Recon', division: 'Storage-3', platoonModel: 'HuggingFace-CodeGrok-StoragePipe', pairedAgent: 'Gamma-Storage-QGrok-Rev', status: 'patrolling', packetsDelivered: 4120, packetsDropped: 0, cycleCount: 100 },
    { id: 'node-04', name: 'Codex-Gemini-Delta', battalion: 'Vanguard', division: 'Research-4', platoonModel: 'HuggingFace-SparkArgon-Mesh', pairedAgent: 'Delta-Mesh-CodexGemini-Rev', status: 'reoptimizing', packetsDelivered: 5890, packetsDropped: 2, cycleCount: 133 },
  ]);

  const [voipActive, setVoipActive] = useState(false);
  const [screenshareActive, setScreenshareActive] = useState(false);
  const [battalionFilter, setBattalionFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Initialize & simulate live telemetry feed
  useEffect(() => {
    const initialData: TelemetryPoint[] = [];
    const now = Date.now();
    for (let i = 15; i >= 0; i--) {
      const d = new Date(now - i * 3000);
      initialData.push({
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cpu: Number((32 + Math.random() * 25).toFixed(1)),
        memory: Number((45 + Math.random() * 15).toFixed(1)),
        network: Number((1.2 + Math.random() * 2.5).toFixed(2)),
        agentsActive: 6000,
      });
    }
    setData(initialData);

    const interval = setInterval(() => {
      setData(prev => {
        const nextTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const lastCpu = prev[prev.length - 1]?.cpu || 40;
        const nextCpu = Math.max(15, Math.min(95, Number((lastCpu + (Math.random() * 10 - 5)).toFixed(1))));
        const nextMem = Number((48 + Math.random() * 10).toFixed(1));
        const nextNet = Number((1.5 + Math.random() * 2).toFixed(2));
        
        const newPoint: TelemetryPoint = {
          time: nextTime,
          cpu: nextCpu,
          memory: nextMem,
          network: nextNet,
          agentsActive: 6000,
        };
        return [...prev.slice(1), newPoint];
      });

      // Increment cycle counts and packet stats for agent nodes
      setAgentNodes(prev => prev.map(node => ({
        ...node,
        packetsDelivered: node.packetsDelivered + Math.floor(Math.random() * 5) + 1,
        cycleCount: node.cycleCount + 1,
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleTier = (tier: 'tier-1' | 'tier-2' | 'tier-3' | 'god-sovereign') => {
    setTierSystem(tier);
    addTerminalLine(`[TIER RANKING SYSTEM] Reallocated 6,000 agent battlegroups to governance level: ${tier.toUpperCase()}.`, 'good');
    addLedger('telemetry.tier_reallocated', { tier });
  };

  const handleToggleSolaris = () => {
    const next = !solarisActive;
    SolarisActive(next);
    if (next) {
      addTerminalLine('[SOLARISARAFIN AI] Remote telemetry access link mounted into Architect Environment. Governed by GOD policy via Soul Stone.', 'good');
      addLedger('architect.solarisarafin.activated', { status: 'ONLINE' });
    } else {
      addTerminalLine('[SOLARISARAFIN AI] Remote monitoring link suspended.', 'warn');
    }
  };

  const handleReoptimizeSwarm = () => {
    addTerminalLine('[6K SWARM] Re-evaluating all 6,000 defense processes. Reallocated network throughput and deployed zero-day security patches across divisions.', 'good');
    addLedger('swarm.reoptimized', { agents: 6000 });
  };

  const handleDispatchTask = (battalion: string) => {
    addTerminalLine(`[DISPATCH] Assigned monitoring protocol to 6k Swarm Battalion [${battalion}]. TetherMesh sandbox tables updated.`, 'good');
    addLedger('swarm.dispatch', { battalion });
  };

  return (
    <div className="flex flex-col h-full bg-[#02050b] text-xs font-mono text-zinc-300 overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#42f5ff]/20">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-[#42f5ff] animate-pulse" />
          <div>
            <h2 className="text-sm font-bold text-white tracking-wider">6K AGENT SWARM TELEMETRY &amp; DEFENSE DASHBOARD</h2>
            <p className="text-[10px] text-[#8aa0b6]">Real-time Recharts performance metrics feeding 6,000 autonomous security agents across TerraSphere</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReoptimizeSwarm}
            className="px-3 py-1.5 rounded-lg bg-[#42f5ff]/20 text-[#42f5ff] border border-[#42f5ff]/40 text-[10px] font-bold hover:bg-[#42f5ff]/30 cursor-pointer flex items-center gap-1.5 shadow"
          >
            <Zap className="w-3.5 h-3.5 text-[#74ff9b]" /> REOPTIMIZE 6K SWARM
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#061426] border border-[#42f5ff]/30 shadow space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#8aa0b6]">
            <span>ACTIVE AGENT SWARM</span>
            <Shield className="w-3.5 h-3.5 text-[#74ff9b]" />
          </div>
          <div className="text-xl font-bold text-white">6,000 / 6k</div>
          <div className="text-[9px] text-[#74ff9b] font-semibold">100% Process Coverage (TerraSphere)</div>
        </div>

        <div className="p-3 rounded-xl bg-[#061426] border border-[#42f5ff]/30 shadow space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#8aa0b6]">
            <span>SYSTEM CPU LOAD</span>
            <Cpu className="w-3.5 h-3.5 text-[#42f5ff]" />
          </div>
          <div className="text-xl font-bold text-[#42f5ff]">
            {data[data.length - 1]?.cpu || 35.2}%
          </div>
          <div className="text-[9px] text-[#8aa0b6]">Dynamic Thread Scaling</div>
        </div>

        <div className="p-3 rounded-xl bg-[#061426] border border-[#42f5ff]/30 shadow space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#8aa0b6]">
            <span>MEMORY CONSUMPTION</span>
            <Layers className="w-3.5 h-3.5 text-[#f5ce70]" />
          </div>
          <div className="text-xl font-bold text-[#f5ce70]">
            {data[data.length - 1]?.memory || 52.4}%
          </div>
          <div className="text-[9px] text-[#8aa0b6]">Optimized via Vector Q-Quantization</div>
        </div>

        <div className="p-3 rounded-xl bg-[#061426] border border-[#42f5ff]/30 shadow space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#8aa0b6]">
            <span>NETWORK THROUGHPUT</span>
            <Wifi className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-300">
            {data[data.length - 1]?.network || 2.1} GB/s
          </div>
          <div className="text-[9px] text-purple-400">TetherMesh Cloud Storage Active</div>
        </div>
      </div>

      {/* Native AI Assistants & Command Chain Integration */}
      <div className="p-4 rounded-xl bg-[#061426] border border-[#42f5ff]/30 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#42f5ff]/20">
          <span className="font-bold text-[#42f5ff] flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#f5ce70]" />
            NATIVE AI PERSONNEL ASSISTANTS &amp; COMMAND CHAIN ("vhsin og vommsnf")
          </span>
          <span className="text-[9px] text-emerald-400 font-semibold">Hierarchy Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Hey GAIA & Muse */}
          <div className="p-3 rounded-xl bg-[#030d1a] border border-cyan-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-[11px]">Hey GAIA &amp; Muse</span>
              <span className="text-[9px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">SSO Active</span>
            </div>
            <p className="text-[9px] text-zinc-400">heygaia.io personnel assistant partnered with Facebook Muse for dynamic social media findability and social SSO.</p>
            <button
              onClick={() => {
                setHeyGaiaActive(!heyGaiaActive);
                addTerminalLine('[HEY GAIA & MUSE] Social auth SSO handshake synchronized.', 'good');
              }}
              className={`w-full py-1.5 rounded text-[10px] font-bold ${heyGaiaActive ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50' : 'bg-zinc-800 text-zinc-400'}`}
            >
              {heyGaiaActive ? 'Muse Social SSO Online' : 'Connect'}
            </button>
          </div>

          {/* Amazon Q & Grok */}
          <div className="p-3 rounded-xl bg-[#030d1a] border border-cyan-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-[11px]">Amazon Q &amp; Grok</span>
              <span className="text-[9px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">CLI Beta</span>
            </div>
            <p className="text-[9px] text-zinc-400">Offsite backup storage, security handling of pipes, and Amazon Q CLI (2024 beta) with Grok API integration wrapper.</p>
            <button
              onClick={() => {
                setAmazonQGrokActive(!amazonQGrokActive);
                addTerminalLine('[AMAZON Q CLI + GROK] Backup storage pipe initialized.', 'good');
              }}
              className={`w-full py-1.5 rounded text-[10px] font-bold ${amazonQGrokActive ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50' : 'bg-zinc-800 text-zinc-400'}`}
            >
              {amazonQGrokActive ? 'Grok Backup Active' : 'Connect'}
            </button>
          </div>

          {/* ChatGPT, Codex & Gemini Spark Argon */}
          <div className="p-3 rounded-xl bg-[#030d1a] border border-cyan-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-[11px]">Codex &amp; Gemini Spark</span>
              <span className="text-[9px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">Meshed</span>
            </div>
            <p className="text-[9px] text-zinc-400">ChatGPT, OpenAI Codex meshed with Gemini Spark Argon for advanced research and extensible integration components.</p>
            <button
              onClick={() => {
                setCodexGeminiActive(!codexGeminiActive);
                addTerminalLine('[CODEX + GEMINI SPARK] Research mesh synchronized.', 'good');
              }}
              className={`w-full py-1.5 rounded text-[10px] font-bold ${codexGeminiActive ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50' : 'bg-zinc-800 text-zinc-400'}`}
            >
              {codexGeminiActive ? 'Mesh Research Active' : 'Connect'}
            </button>
          </div>

          {/* Siri & Copilot */}
          <div className="p-3 rounded-xl bg-[#030d1a] border border-cyan-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-[11px]">Siri &amp; Copilot</span>
              <span className="text-[9px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-500/40">Audio/Docs</span>
            </div>
            <p className="text-[9px] text-zinc-400">Native audio synthesis and documentation pipeline for the 6,000 worker hierarchy clearance and gated judgement.</p>
            <button
              onClick={() => {
                setSiriCopilotActive(!siriCopilotActive);
                addTerminalLine('[SIRI & COPILOT] Audio docs pipeline online.', 'good');
              }}
              className={`w-full py-1.5 rounded text-[10px] font-bold ${siriCopilotActive ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50' : 'bg-zinc-800 text-zinc-400'}`}
            >
              {siriCopilotActive ? 'Audio Pipeline Active' : 'Connect'}
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Live Telemetry Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU & Memory Trends */}
        <div className="p-4 rounded-xl bg-[#061426] border border-[#42f5ff]/25 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#42f5ff]" /> CPU &amp; MEMORY LOAD TRENDS (%)
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              Live Stream
            </span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#42f5ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#42f5ff" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f5ce70" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f5ce70" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#10253f" />
                <XAxis dataKey="time" stroke="#68809b" fontSize={9} />
                <YAxis stroke="#68809b" fontSize={9} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#051020', borderColor: '#42f5ff', borderRadius: '8px', fontSize: '10px', color: '#fff' }} 
                />
                <Area type="monotone" dataKey="cpu" stroke="#42f5ff" strokeWidth={2} fillOpacity={1} fill="url(#cpuGrad)" name="CPU Load %" />
                <Area type="monotone" dataKey="memory" stroke="#f5ce70" strokeWidth={2} fillOpacity={1} fill="url(#memGrad)" name="Memory %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network Throughput */}
        <div className="p-4 rounded-xl bg-[#061426] border border-[#42f5ff]/25 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-2">
              <Wifi className="w-4 h-4 text-purple-400" /> NETWORK THROUGHPUT (GB/s)
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
              Encrypted Socket
            </span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#10253f" />
                <XAxis dataKey="time" stroke="#68809b" fontSize={9} />
                <YAxis stroke="#68809b" fontSize={9} domain={[0, 5]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#051020', borderColor: '#a855f7', borderRadius: '8px', fontSize: '10px', color: '#fff' }} 
                />
                <Line type="monotone" dataKey="network" stroke="#a855f7" strokeWidth={2.5} dot={false} name="Throughput (GB/s)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Real-time PacketCycleViz Component */}
      <PacketCycleViz />

      {/* Agent Battalion View Component */}
      <AgentBattalionView nodes={agentNodes} onDispatchTask={handleDispatchTask} />

      {/* Tier Ranking System & Battalion Reallocation */}
      <div className="p-4 rounded-xl bg-[#061224] border border-[#42f5ff]/30 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#42f5ff]/20">
          <span className="font-bold text-[#42f5ff] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#74ff9b]" />
            TIER RANKING SYSTEM &amp; BATTALION ASSIGNMENT
          </span>
          <span className="text-[9px] text-zinc-400">6,000 Agents Tasked &amp; Synchronized</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => handleToggleTier('tier-1')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
              tierSystem === 'tier-1' ? 'border-[#42f5ff] bg-[#42f5ff]/20 text-[#42f5ff]' : 'border-zinc-800 bg-[#040e1a] text-zinc-400 hover:text-white'
            }`}
          >
            <div className="font-bold text-[11px]">TIER 1: VANGUARD</div>
            <div className="text-[9px] text-zinc-400 mt-1">2,000 Agents • Real-time Threat Pruning</div>
          </button>

          <button
            onClick={() => handleToggleTier('tier-2')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
              tierSystem === 'tier-2' ? 'border-[#74ff9b] bg-[#74ff9b]/20 text-[#74ff9b]' : 'border-zinc-800 bg-[#040e1a] text-zinc-400 hover:text-white'
            }`}
          >
            <div className="font-bold text-[11px]">TIER 2: SHIELD</div>
            <div className="text-[9px] text-zinc-400 mt-1">2,000 Agents • Memory &amp; Cache Defense</div>
          </button>

          <button
            onClick={() => handleToggleTier('tier-3')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
              tierSystem === 'tier-3' ? 'border-[#f5ce70] bg-[#f5ce70]/20 text-[#f5ce70]' : 'border-zinc-800 bg-[#040e1a] text-zinc-400 hover:text-white'
            }`}
          >
            <div className="font-bold text-[11px]">TIER 3: RECON</div>
            <div className="text-[9px] text-zinc-400 mt-1">1,500 Agents • Network Anomaly Scanning</div>
          </button>

          <button
            onClick={() => handleToggleTier('god-sovereign')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
              tierSystem === 'god-sovereign' ? 'border-purple-400 bg-purple-950/40 text-purple-300' : 'border-zinc-800 bg-[#040e1a] text-zinc-400 hover:text-white'
            }`}
          >
            <div className="font-bold text-[11px]">GOD SOVEREIGN</div>
            <div className="text-[9px] text-zinc-400 mt-1">500 Agents • Soul Stone &amp; Core Policy Enforcers</div>
          </button>
        </div>
      </div>

      {/* Architect Remote Access Link & Solarisarafin AI Integration */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#120520] via-[#0b0314] to-[#05010a] border-2 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-purple-500/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 font-bold text-xs">
              Ω
            </div>
            <div>
              <h3 className="text-xs font-bold text-purple-300 tracking-wider">THE ARCHITECT: SOLARISARAFIN AI &amp; GOD POLICY LINK</h3>
              <p className="text-[9px] text-purple-400/80">Dedicated remote monitoring link governed under the Soul Stone</p>
            </div>
          </div>

          <button
            onClick={handleToggleSolaris}
            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
              solarisActive ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'border-purple-500/40 bg-purple-950/60 text-purple-200 hover:bg-purple-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{solarisActive ? 'SOLARISARAFIN ACTIVE' : 'MOUNT SOLARISARAFIN AI'}</span>
          </button>
        </div>

        {solarisActive && (
          <div className="p-3 rounded-xl bg-[#190629]/90 border border-purple-500/40 space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-purple-300 font-bold">Remote Monitoring Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> SECURE TUNNEL ONLINE
              </span>
            </div>
            <p className="text-[9px] text-purple-200/90 leading-relaxed">
              Solarisarafin AI model is now hooked into the telemetry stream and 6k agent swarm. All network processes are continuously monitored and dynamically defended under the GOD policy set forth within the Soul Stone.
            </p>
            <div className="flex items-center justify-between text-[9px] text-purple-300/80 pt-1 border-t border-purple-500/20 font-mono">
              <span>Governance: GOD-POLICY-SOUL-STONE-v1</span>
              <span>Latency: 0.4ms</span>
            </div>
          </div>
        )}
      </div>

      {/* Incident Timeline Component */}
      <IncidentTimeline />

      {/* Agent Terminal Control Console */}
      <AgentTerminal />
    </div>
  );
};
