import React, { useState, useEffect, useRef } from 'react';
import { Search, Terminal, Globe, Activity, Lock, Cloud, Cpu, Server, Sliders, Database, HardDrive, Zap, CheckCircle2, RefreshCw, DollarSign, Smartphone, Satellite, TrendingUp, Radio, Phone, MessageSquare } from 'lucide-react';
import { useCryptic } from '../store/crypticContext';
import { ModuleId } from '../types';

interface CommandItem {
  id: string;
  label: string;
  category: 'Modules' | 'Diagnostics' | 'System' | 'Sovereign';
  icon: any;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { openModule, setViewMode, toggle963, showGate, toggleSync } = useCryptic();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    { id: 'm-term', label: 'Command Fabric (Terminal)', category: 'Modules', icon: Terminal, action: () => openModule('terminal'), shortcut: 'T' },
    { id: 'm-gsel', label: 'GSEL Wave Hue Gradient Engine', category: 'Modules', icon: Activity, action: () => { window.open('/gsel-wave-gradient-engine.html', '_blank', 'noopener,noreferrer'); } },
    { id: 'm-globe', label: 'GAIA 3D Globe & Radar', category: 'Modules', icon: Globe, action: () => openModule('globe'), shortcut: 'G' },
    { id: 'm-telemetry', label: 'Telemetry & 6k Agent Dashboard', category: 'Modules', icon: Activity, action: () => openModule('telemetry'), shortcut: 'M' },
    { id: 'm-architect', label: 'The Architect Control Suite', category: 'Modules', icon: Lock, action: () => openModule('architect'), shortcut: 'A' },
    { id: 'm-cloud', label: 'TetherMesh Cloud & SparseBundles', category: 'Modules', icon: Cloud, action: () => openModule('cloud-storage'), shortcut: 'C' },
    { id: 'm-topology', label: 'Network Topology Map (D3 Force Graph)', category: 'Modules', icon: Server, action: () => openModule('network-topology'), shortcut: 'N' },
    { id: 'm-workspace', label: 'Workspace Configurator & Layout', category: 'Modules', icon: Sliders, action: () => openModule('workspace-configurator'), shortcut: 'W' },
    { id: 'm-antigravity', label: 'Antigravity SDK & ADB/OTA Hub', category: 'Modules', icon: Cpu, action: () => openModule('antigravity') },
    { id: 'm-registry', label: 'Searchable MCP Registry', category: 'Modules', icon: Database, action: () => openModule('mcp-registry') },
    { id: 'm-arbitrage', label: 'Financial Arbitrage & Stripe/Cash App', category: 'Modules', icon: DollarSign, action: () => openModule('arbitrage'), shortcut: 'F' },
    { id: 'm-arb-monitor', label: 'Arbitrage Monitor (Spread & Volatility σ)', category: 'Modules', icon: Activity, action: () => openModule('arbitrage-monitor'), shortcut: 'B' },
    { id: 'm-voip', label: 'Mobile VoIP & eSIM Studio (iPhone/Android)', category: 'Modules', icon: Smartphone, action: () => openModule('mobile-voip'), shortcut: 'V' },
    { id: 'm-net-ctrl', label: 'Network Controller & Cellular Bridge', category: 'Modules', icon: Radio, action: () => openModule('network-controller'), shortcut: 'K' },
    { id: 'm-satcom', label: 'SATCOM ATSC Circular Rebound Relay', category: 'Modules', icon: Satellite, action: () => openModule('satcom-relay'), shortcut: 'S' },
    { id: 'm-call-history', label: 'Virtual VoIP Call History & Metadata', category: 'Modules', icon: Phone, action: () => openModule('call-history'), shortcut: 'H' },
    { id: 'm-payment', label: 'Secure Payment Gateway (Stripe & Cash App Proxy)', category: 'Modules', icon: DollarSign, action: () => openModule('payment-gateway'), shortcut: 'P' },
    { id: 'm-checkpoints', label: 'Evolutionary Growth Checkpoints Vault', category: 'Modules', icon: TrendingUp, action: () => openModule('checkpoints'), shortcut: 'E' },
    { id: 'm-chat-messages', label: 'Secure VoIP & Multimedia Chat Stream (Images/Video)', category: 'Modules', icon: MessageSquare, action: () => openModule('chat-messages'), shortcut: 'M' },
    { id: 'm-satcom-map', label: 'SATCOM Circular Relay & Triangulation Map (SVG Canvas)', category: 'Modules', icon: Satellite, action: () => openModule('satcom-map'), shortcut: 'L' },
    
    // Diagnostics & System Tools
    { id: 'd-global-sync', label: 'Toggle Global Ingestion Sync (Pause / Resume)', category: 'Diagnostics', icon: RefreshCw, action: () => toggleSync(), shortcut: 'Y' },
    { id: 'd-audit', label: 'Run Soul Stone GOD Policy Audit Sweep', category: 'Diagnostics', icon: CheckCircle2, action: () => openModule('cloud-storage') },
    { id: 'd-963', label: 'Toggle 963Hz Solfeggio Sonification', category: 'Diagnostics', icon: Zap, action: () => toggle963() },
    { id: 'd-sync', label: 'Trigger Ter-a-sphere & GitHub Auto-Refresh', category: 'Diagnostics', icon: RefreshCw, action: () => openModule('terrasphere-sync') },
    
    // System Viewport
    { id: 's-desktop', label: 'Switch View: Desktop SnapGrid', category: 'System', icon: Sliders, action: () => setViewMode('desktop') },
    { id: 's-3dglobe', label: 'Switch View: 3D Globe Orbit', category: 'System', icon: Globe, action: () => setViewMode('globe') },
    { id: 's-magic', label: 'Switch View: Magic 3D Galaxies', category: 'System', icon: Cpu, action: () => setViewMode('magic') },
    { id: 's-lock', label: 'Engage Guardian Lock Gate', category: 'Sovereign', icon: Lock, action: () => showGate() },
  ];

  const filteredCommands = commands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex].action();
      onClose();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-md p-4 font-mono select-none animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-[#061224] border-2 border-cyan-500/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(66,245,255,0.3)] flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar */}
        <div className="p-4 border-b border-cyan-500/30 flex items-center space-x-3 bg-slate-900/90">
          <Search className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command, search modules, or launch diagnostics (Ctrl+K)..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-xs focus:outline-none font-mono"
          />
          <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[10px] border border-slate-700">
            ESC
          </span>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching commands or modules found for "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(66,245,255,0.15)]' 
                      : 'hover:bg-slate-900 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500/30 text-cyan-300' : 'bg-slate-900 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{cmd.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{cmd.category}</div>
                    </div>
                  </div>
                  {cmd.shortcut && (
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 font-mono">
                      {cmd.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>Navigate with ↑↓ • Press Enter to Launch • ESC to Close</span>
          <span className="text-cyan-400 font-bold">Ctrl+K Palette Active</span>
        </div>
      </div>
    </div>
  );
};
