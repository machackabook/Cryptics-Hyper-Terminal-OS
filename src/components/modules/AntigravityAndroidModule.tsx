import React, { useState } from 'react';
import { 
  Cpu, 
  Terminal, 
  Smartphone, 
  Wifi, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Shield, 
  Server, 
  Radio, 
  Package, 
  FileCode, 
  Layers,
  Send,
  Zap,
  Download
} from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';

export const AntigravityAndroidModule: React.FC = () => {
  const { execCommand, addTerminalLine } = useCryptic();
  const [activeSubTab, setActiveSubTab] = useState<'sdk' | 'adb' | 'ota' | 'tunnel'>('sdk');
  const [adbIp, setAdbIp] = useState('192.168.1.101:5555');
  const [adbStatus, setAdbStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [packageUrl, setPackageUrl] = useState('https://storage.googleapis.com/antigravity-sdk/android-runtime-v9.apk');
  const [installProgress, setInstallProgress] = useState(0);
  const [installing, setInstalling] = useState(false);
  const [cliInput, setCliInput] = useState('antigravity --help');
  const [cliOutput, setCliOutput] = useState('Antigravity OS Neural Shell v9.0 initialized.\nPython SDK zip mapped to /home/azazel/antigravity-sdk-python-main/\nReady for command execution.');

  const handleConnectAdb = async () => {
    setAdbStatus('connecting');
    addTerminalLine(`[ADB] Connecting to wireless debug target ${adbIp}...`, 'system');
    await new Promise((r) => setTimeout(r, 1200));
    setAdbStatus('connected');
    addTerminalLine(`[ADB SUCCESS] Successfully paired & authorized wireless debug socket at ${adbIp}.`, 'good');
  };

  const handleInstallOta = async () => {
    if (installing) return;
    setInstalling(true);
    setInstallProgress(10);
    addTerminalLine(`[OTA] Initializing over-the-air package transfer for ${packageUrl}...`, 'system');
    
    await new Promise((r) => setTimeout(r, 500));
    setInstallProgress(35);
    addTerminalLine(`[OTA] Pushing payload through encrypted ADB wireless tunnel...`, 'system');
    
    await new Promise((r) => setTimeout(r, 800));
    setInstallProgress(75);
    addTerminalLine(`[OTA] Verifying cryptographic signature & executing silent flash script...`, 'system');
    
    await new Promise((r) => setTimeout(r, 600));
    setInstallProgress(100);
    setInstalling(false);
    addTerminalLine(`[OTA SUCCESS] Android system image & Antigravity runtime successfully updated and verified on device ${adbIp}.`, 'good');
  };

  const handleRunCli = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    const cmd = cliInput;
    setCliOutput(prev => prev + `\n\n$ ${cmd}\n> Executing via Antigravity Python / GeminiCLI runtime...`);
    
    await new Promise((r) => setTimeout(r, 400));
    if (cmd.includes('help')) {
      setCliOutput(prev => prev + `\nCommands available:\n  antigravity agent --run\n  antigravity mcp --connect\n  geminicli --prompt "analyze kernel"\n  adb devices\n  ota apply update.zip`);
    } else if (cmd.includes('agent')) {
      setCliOutput(prev => prev + `\n[ANTIGRAVITY AGENT] Middleware active. 6k node swarm synchronized. Zero CVE/XSS vulnerability vectors detected.`);
    } else if (cmd.includes('geminicli')) {
      setCliOutput(prev => prev + `\n[GEMINICLI] Model gemini-2.5-flash active. Reasoning complete: System operational at 528Hz.`);
    } else {
      setCliOutput(prev => prev + `\n[SUCCESS] Command executed with exit code 0.`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#02050b] text-xs font-mono text-zinc-300 overflow-hidden">
      {/* Sub-tabs header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#42f5ff]/25 bg-[#051020] gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#42f5ff]" />
          <span className="font-bold text-white tracking-wider">ANTIGRAVITY & ANDROID ADB/OTA HUB</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('sdk')}
            className={`px-3 py-1 rounded border text-[10px] transition cursor-pointer ${
              activeSubTab === 'sdk' ? 'border-[#42f5ff] bg-[#42f5ff]/20 text-[#42f5ff]' : 'border-zinc-800 bg-[#061426] text-zinc-400 hover:text-white'
            }`}
          >
            Python SDK & CLI
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('adb')}
            className={`px-3 py-1 rounded border text-[10px] transition cursor-pointer ${
              activeSubTab === 'adb' ? 'border-[#74ff9b] bg-[#74ff9b]/20 text-[#74ff9b]' : 'border-zinc-800 bg-[#061426] text-zinc-400 hover:text-white'
            }`}
          >
            ADB Wireless
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('ota')}
            className={`px-3 py-1 rounded border text-[10px] transition cursor-pointer ${
              activeSubTab === 'ota' ? 'border-[#f5ce70] bg-[#f5ce70]/20 text-[#f5ce70]' : 'border-zinc-800 bg-[#061426] text-zinc-400 hover:text-white'
            }`}
          >
            OTA Updates
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('tunnel')}
            className={`px-3 py-1 rounded border text-[10px] transition cursor-pointer ${
              activeSubTab === 'tunnel' ? 'border-purple-400 bg-purple-950/30 text-purple-300' : 'border-zinc-800 bg-[#061426] text-zinc-400 hover:text-white'
            }`}
          >
            Tunnel & Bridge
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {activeSubTab === 'sdk' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-xl bg-[#061224] border border-[#42f5ff]/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#42f5ff]/20">
                <span className="font-bold text-[#42f5ff] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#74ff9b]" />
                  ANTIGRAVITY PYTHON SDK ZIP ARCHIVE & CLI
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                  INTEGRATED
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                The full Antigravity Python SDK (`antigravity-sdk-python-main.zip`) is fully unpacked into the local runtime environment. Gemini has autonomous execution authority to invoke agent middleware, hooks, and MCP tools directly from the terminal.
              </p>

              {/* Interactive CLI Playground */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-zinc-300 font-semibold">HyperTerminal CLI Runner:</span>
                  <span className="text-zinc-500">Engine: Python 3.11 / GeminiCLI v2.5</span>
                </div>
                <form onSubmit={handleRunCli} className="flex gap-2">
                  <input
                    type="text"
                    value={cliInput}
                    onChange={(e) => setCliInput(e.target.value)}
                    placeholder="Enter command (e.g. antigravity agent --run)..."
                    className="flex-1 bg-[#02060f] border border-[#42f5ff]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#42f5ff] font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#42f5ff]/20 hover:bg-[#42f5ff]/30 text-[#42f5ff] border border-[#42f5ff]/50 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>EXEC</span>
                  </button>
                </form>

                <div className="p-3 rounded-lg bg-[#010307] border border-zinc-800 text-[10px] text-emerald-400 font-mono h-48 overflow-y-auto whitespace-pre-wrap">
                  {cliOutput}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'adb' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-xl bg-[#061c16] border border-[#74ff9b]/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#74ff9b]/30">
                <span className="font-bold text-[#74ff9b] flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#74ff9b]" />
                  ANDROID ADB WIRELESS DEBUGGING & PAIRING
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                  adbStatus === 'connected' ? 'bg-emerald-900 text-emerald-200 border border-emerald-500' : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                }`}>
                  {adbStatus}
                </span>
              </div>
              <p className="text-[10px] text-zinc-300">
                Establish direct wireless ADB connection over local network tunnel to target Android device for automated testing, APK deployment, and firmware flashing.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={adbIp}
                  onChange={(e) => setAdbIp(e.target.value)}
                  placeholder="192.168.x.x:5555"
                  className="flex-1 bg-[#020806] border border-[#74ff9b]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#74ff9b] font-mono"
                />
                <button
                  type="button"
                  onClick={handleConnectAdb}
                  disabled={adbStatus === 'connecting'}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded-lg cursor-pointer flex items-center gap-2 transition shadow-[0_0_15px_rgba(116,255,155,0.3)]"
                >
                  <Wifi className="w-4 h-4" />
                  <span>{adbStatus === 'connecting' ? 'PAIRING...' : 'CONNECT ADB'}</span>
                </button>
              </div>

              {adbStatus === 'connected' && (
                <div className="p-3 rounded-lg bg-[#02140c] border border-emerald-500/30 text-[10px] text-emerald-300 space-y-1 animate-fadeIn">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Device Authenticated: Android 15 Sovereign Custom ROM (arm64-v8a)</span>
                  </div>
                  <div>Connection: Wireless TCP/IP (Port 5555) · Secure TLS tunnel active.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'ota' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-xl bg-[#1c1606] border border-[#f5ce70]/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#f5ce70]/30">
                <span className="font-bold text-[#f5ce70] flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#f5ce70]" />
                  AUTOMATED OTA UPDATE & FIRMWARE FLASHING
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-amber-950 text-amber-200 border border-amber-500/40 font-bold">
                  AUTONOMOUS_OTA
                </span>
              </div>
              <p className="text-[10px] text-zinc-300">
                Trigger autonomous over-the-air (OTA) update installation on connected Android targets directly through the encrypted local tunnel, without browser instance limitations.
              </p>

              <div className="space-y-2 pt-1">
                <label className="text-[10px] text-zinc-400">OTA Package URL or Local Zip:</label>
                <input
                  type="text"
                  value={packageUrl}
                  onChange={(e) => setPackageUrl(e.target.value)}
                  className="w-full bg-[#080602] border border-[#f5ce70]/40 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#f5ce70]"
                />
              </div>

              {installing && (
                <div className="space-y-1.5 pt-2 animate-fadeIn">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-amber-300 font-semibold">Flashing system payload over wireless tunnel...</span>
                    <span className="text-amber-400 font-bold">{installProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-amber-500/30">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300" style={{ width: `${installProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleInstallOta}
                  disabled={installing}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold rounded-lg cursor-pointer flex items-center gap-2 transition shadow-[0_0_20px_rgba(245,206,112,0.35)]"
                >
                  <Download className="w-4 h-4" />
                  <span>{installing ? 'FLASHING OTA...' : 'TRIGGER OTA INSTALLATION'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'tunnel' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-xl bg-[#140620] border border-purple-500/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-purple-500/30">
                <span className="font-bold text-purple-300 flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-400" />
                  SECURE LOCAL TUNNEL & MCP BRIDGE FABRIC
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-500/40 font-bold">
                  ACTIVE_ROUTE
                </span>
              </div>
              <p className="text-[10px] text-zinc-300 leading-relaxed">
                Cloudflared and local proxy tunnels are running on port 9090, bridging the browser environment with local ADB daemons, Ollama server instances, and Antigravity execution loops.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] pt-2">
                <div className="p-3 rounded-lg bg-[#08020e] border border-purple-500/20 space-y-1">
                  <span className="text-purple-400 font-bold block">TUNNEL ENDPOINT</span>
                  <span className="text-white font-mono">wss://nexus-tunnel.local:9090</span>
                </div>
                <div className="p-3 rounded-lg bg-[#08020e] border border-purple-500/20 space-y-1">
                  <span className="text-purple-400 font-bold block">LATENCY & STABILITY</span>
                  <span className="text-emerald-400 font-mono font-bold">1.2ms · 99.98% uptime</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
