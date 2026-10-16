import React, { useState } from 'react';
import { useCryptic } from '../store/crypticContext';
import { ModuleId } from '../types';
import { VaultAccess } from './VaultAccess';
import {
  Terminal,
  Globe,
  Activity,
  Music,
  Users,
  Flame,
  Radio,
  FileText,
  Lock,
  Layers,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Compass,
  HardDrive,
  Boxes,
  Shield,
  Cpu,
  Server,
  Cloud,
  Sliders,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    clearUI,
    toggleClearUI,
    clockMode,
    cycleClockMode,
    systemTimeFormatted,
    oscillatorActive,
    toggle963,
    openModule,
    ghostAll,
    restoreAll,
    showGate,
    session,
    logoutSession,
  } = useCryptic();

  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [isGhosted, setIsGhosted] = useState(false);

  const handleCopyTime = () => {
    navigator.clipboard?.writeText(systemTimeFormatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleToggleGlass = () => {
    if (isGhosted) {
      restoreAll();
      setIsGhosted(false);
    } else {
      ghostAll(true);
      setIsGhosted(true);
    }
  };

  const modulesList: { id: ModuleId; label: string; icon: any }[] = [
    { id: 'terminal', label: 'Terminal Core', icon: Terminal },
    { id: 'globe', label: 'GAIA 3D Globe & Radar', icon: Globe },
    { id: 'network', label: 'Packet Telemetry', icon: Activity },
    { id: 'audio', label: 'Audio Fabric & MIDI', icon: Music },
    { id: 'consensus', label: 'AI Consensus Quorum', icon: Users },
    { id: 'genie', label: 'Genie Djinn Engine', icon: Flame },
    { id: 'matrix', label: 'Kerr & Hopf Matrix', icon: Compass },
    { id: 'galaxies', label: '7 Galaxies Skybox', icon: Sparkles },
    { id: 'ledger', label: 'Living Ledger v1', icon: Layers },
    { id: 'nodes', label: 'Public Nodes Hub', icon: Radio },
    { id: 'sentinel', label: 'TDOC Sentinel v11', icon: Lock },
    { id: 'irc', label: 'Nexus Sovereign IRC', icon: Users },
    { id: 'documents', label: 'PDF Document Corpus', icon: FileText },
    { id: 'telemetry', label: 'Browser Telemetry', icon: Activity },
    { id: 'identity', label: 'SSH Identity Lace', icon: Lock },
    { id: 'axs', label: 'AXS Loopback PTY', icon: Terminal },
    { id: 'enclaves', label: 'Enclaves & Mountable DMG', icon: HardDrive },
    { id: 'extensions', label: 'Extensions & MCP Hub', icon: Boxes },
    { id: 'alpha-hologram', label: 'Alpha & Hologram Synthesizer', icon: Cpu },
    { id: 'mcp-registry', label: 'Searchable MCP Registry', icon: Server },
    { id: 'antigravity', label: 'Antigravity SDK & ADB/OTA Hub', icon: Cpu },
    { id: 'telemetry', label: 'Telemetry & 6k Agent Dashboard', icon: Activity },
    { id: 'architect', label: 'The Architect Control Suite', icon: Lock },
    { id: 'cloud-storage', label: 'TetherMesh Cloud & SparseBundles', icon: Cloud },
    { id: 'workspace-configurator', label: 'Workspace Configurator & Layout', icon: Sliders },
    { id: 'network-topology', label: 'Network Topology Map (D3)', icon: Globe },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-40 bg-[#030814]/90 backdrop-blur-md border-b border-[#42f5ff]/20 px-3 flex items-center justify-between text-xs font-mono select-none">
      {/* Left: Brand and View Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleClearUI}
          title="Toggle Clear UI Mode"
          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border transition cursor-pointer ${
            clearUI
              ? 'border-[#74ff9b] bg-[#74ff9b]/20 text-[#74ff9b] shadow-[0_0_12px_rgba(116,255,155,0.4)]'
              : 'border-[#42f5ff]/30 bg-[#061224] text-[#42f5ff] hover:border-[#42f5ff]/60'
          }`}
        >
          ⌂
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-white">CRYPTIC</span>
            <span className="text-[10px] text-[#42f5ff] tracking-widest font-semibold">// HYPERTERMINAL OS</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] bg-[#74ff9b]/15 text-[#74ff9b] border border-[#74ff9b]/30">
              SYS.OP.ONLINE
            </span>
            {session?.authenticated && (
              <span className="hidden md:inline px-1.5 py-0.5 rounded text-[8px] bg-[#42f5ff]/15 text-[#42f5ff] border border-[#42f5ff]/30 font-semibold truncate max-w-[130px]">
                OP: {session.operatorCallsign}
              </span>
            )}
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-[#071324] p-1 rounded-lg border border-[#42f5ff]/20">
          <button
            onClick={() => setViewMode('desktop')}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold tracking-wider transition cursor-pointer ${
              viewMode === 'desktop'
                ? 'bg-[#42f5ff] text-[#02050b] shadow-[0_0_10px_rgba(66,245,255,0.5)]'
                : 'text-[#9bb3cf] hover:text-white'
            }`}
          >
            DASHBOARD
          </button>
          <button
            onClick={() => setViewMode('globe')}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold tracking-wider transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'globe'
                ? 'bg-[#74ff9b] text-[#02050b] shadow-[0_0_10px_rgba(116,255,155,0.5)]'
                : 'text-[#9bb3cf] hover:text-white'
            }`}
          >
            <Globe className="w-3 h-3" />
            3D GLOBE
          </button>
          <button
            onClick={() => setViewMode('magic')}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold tracking-wider transition cursor-pointer ${
              viewMode === 'magic'
                ? 'bg-[#f5ce70] text-[#02050b] shadow-[0_0_10px_rgba(245,206,112,0.5)]'
                : 'text-[#9bb3cf] hover:text-white'
            }`}
          >
            MAGIC 3D
          </button>
        </div>

        {/* Modules Launcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="px-2.5 py-1.5 rounded-lg border border-[#42f5ff]/30 bg-[#071324] text-[#42f5ff] hover:bg-[#0b1c36] transition cursor-pointer flex items-center gap-1.5 text-[10px] tracking-wider"
          >
            <Layers className="w-3 h-3" />
            MODULES ({modulesList.length})
          </button>

          {menuOpen && (
            <div className="absolute top-10 left-0 w-64 bg-[#050e1c] border border-[#42f5ff]/40 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] p-2 grid grid-cols-1 gap-1 z-50 max-h-[75vh] overflow-y-auto">
              <div className="text-[9px] text-[#8aa0b6] px-2 py-1 font-bold tracking-widest uppercase border-b border-[#42f5ff]/15">
                MOUNT MODULE SURFACE
              </div>
              {modulesList.map(m => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      openModule(m.id);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-xs text-[#d2e4f6] hover:bg-[#0c1f38] hover:text-[#42f5ff] transition cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#42f5ff]" />
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Audio 963Hz, Clock & System Controls */}
      <div className="flex items-center gap-2.5">
        {/* 963Hz Audio Button */}
        <button
          onClick={() => toggle963()}
          title="Toggle 963 Hz Solfeggio Sine Wave"
          className={`px-2.5 py-1 rounded-lg border text-[10px] tracking-wider font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            oscillatorActive
              ? 'border-[#74ff9b] bg-[#74ff9b]/15 text-[#74ff9b] shadow-[0_0_12px_rgba(116,255,155,0.4)] animate-pulse'
              : 'border-[#42f5ff]/30 bg-[#061224] text-[#8aa0b6] hover:text-[#42f5ff]'
          }`}
        >
          {oscillatorActive ? <Volume2 className="w-3.5 h-3.5 text-[#74ff9b]" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{oscillatorActive ? '963 Hz' : '963 OFF'}</span>
        </button>

        {/* Glass transparency toggle */}
        <button
          onClick={handleToggleGlass}
          title="Toggle Glass Opacity (Ghost/Restore)"
          className={`px-2 py-1 rounded-lg border text-[10px] font-semibold transition cursor-pointer ${
            isGhosted
              ? 'border-[#f5ce70] bg-[#f5ce70]/20 text-[#f5ce70]'
              : 'border-[#42f5ff]/30 bg-[#061224] text-[#8aa0b6] hover:text-[#42f5ff]'
          }`}
        >
          ◐ GLASS
        </button>

        {/* System Clock Widget */}
        <div
          onClick={cycleClockMode}
          title="Click to cycle clock: UTC / LOCAL / SIDEREAL / EPOCH"
          className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-[#42f5ff]/30 bg-[#061224] cursor-pointer hover:border-[#42f5ff]/60 transition"
        >
          <span className="text-[10px] text-[#42f5ff] font-semibold tabular-nums">{systemTimeFormatted}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopyTime();
            }}
            title="Copy timestamp"
            className="text-[#74ff9b] hover:text-white p-0.5"
          >
            {copied ? <Check className="w-3 h-3 text-[#74ff9b]" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        {/* Re-lock threshold */}
        <button
          onClick={() => setVaultOpen(true)}
          title="Firebase Vault Access"
          className="px-2.5 py-1 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:border-cyan-400 transition cursor-pointer flex items-center space-x-1.5 text-[10px] font-bold"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Vault Access</span>
        </button>

        <button
          onClick={showGate}
          title="Engage Guardian Lock"
          className="p-1.5 rounded-lg border border-red-500/30 bg-[#16060c] text-red-400 hover:border-red-500/60 transition cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
        </button>
      </div>

      <VaultAccess isOpen={vaultOpen} onClose={() => setVaultOpen(false)} />
    </header>
  );
};
