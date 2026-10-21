import React, { useState, useEffect } from 'react';
import { CrypticProvider, useCryptic } from './store/crypticContext';
import { CosmicGuardian } from './components/CosmicGuardian';
import { Header } from './components/Header';
import { SnapGrid } from './components/SnapGrid';
import { MagicWindow3D } from './components/MagicWindow3D';
import { PersistentBackgroundFX } from './components/PersistentBackgroundFX';
import { InteractiveGlobeModule } from './components/modules/InteractiveGlobeModule';
import { GalaxiesSkyboxModule } from './components/modules/GalaxiesSkyboxModule';
import { CommandPalette } from './components/CommandPalette';
import { PolyquineHyperTerminal } from './components/PolyquineHyperTerminal';
import { SignalMonitor } from './components/SignalMonitor';
import { ActiveCallOverlay } from './components/ActiveCallOverlay';
import { Activity, Radio, Shield, Globe, Terminal, Sparkles, Play, Pause, RefreshCw } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { 
    gateOpen, 
    viewMode, 
    setViewMode, 
    ledgerRecords, 
    tokens, 
    beacons, 
    incidents, 
    clearUI,
    syncActive,
    toggleSync,
    activeCall,
    endCall
  } = useCryptic();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [polyquineOpen, setPolyquineOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#02050b] text-[#e2f1ff] select-none font-mono">
      {/* 3D Celestial Starfield Canvas Background */}
      <MagicWindow3D interactive={viewMode === 'magic'} />

      {/* Persistent Framer-Motion Background Visual Effect */}
      <PersistentBackgroundFX />

      {/* Cyberpunk Grid Background Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a1e36]/30 via-transparent to-transparent pointer-events-none z-0" />

      {/* Cosmic Guardian Gate Layer */}
      {!gateOpen && <CosmicGuardian />}

      {/* Active VoIP Call Overlay */}
      <ActiveCallOverlay call={activeCall} onEndCall={endCall} />

      {/* Master Top Header */}
      <Header />

      {/* Viewport Content based on viewMode */}
      <main className="relative w-full h-full pt-14 pb-8 overflow-hidden z-10 pointer-events-auto">
        {viewMode === 'desktop' && <SnapGrid />}

        {viewMode === 'globe' && (
          <div className="w-full h-full p-3 flex flex-col">
            <div className="flex-1 rounded-2xl border border-[#42f5ff]/30 overflow-hidden shadow-2xl bg-[#040d1a]/90 backdrop-blur-md">
              <InteractiveGlobeModule />
            </div>
          </div>
        )}

        {viewMode === 'magic' && (
          <div className="w-full h-full p-3 flex flex-col">
            <div className="flex-1 rounded-2xl border border-[#f5ce70]/30 overflow-hidden shadow-2xl bg-[#040d1a]/90 backdrop-blur-md">
              <GalaxiesSkyboxModule />
            </div>
          </div>
        )}
      </main>

      {gateOpen && <button type="button" onClick={() => setPolyquineOpen(value => !value)} className="fixed right-4 bottom-12 z-30 rounded-xl border border-cyan-500/70 bg-slate-950/90 text-cyan-300 px-3 py-2 text-xs font-bold" aria-label="Toggle Polyquine terminal">⌘ POLYQUINE</button>}
      {gateOpen && polyquineOpen && <PolyquineHyperTerminal onClose={() => setPolyquineOpen(false)} />}

      {/* Bottom Floating Status Bar */}
      {!clearUI && (
        <footer className="fixed bottom-0 left-0 right-0 h-8 z-30 bg-[#030814]/90 backdrop-blur-md border-t border-[#42f5ff]/20 px-3 flex items-center justify-between text-[10px] text-[#8aa0b6]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#74ff9b] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#74ff9b] animate-ping inline-block" />
              SYS.OP.REAL
            </span>
            <span className="hidden sm:inline text-[#42f5ff]/40">|</span>
            <span className="hidden sm:inline text-[#42f5ff]">
              LEDGER: <b className="text-white">{ledgerRecords.length}</b>
            </span>
            <span className="hidden sm:inline text-[#42f5ff]/40">|</span>
            <span className="hidden sm:inline text-[#f5ce70]">
              TOKENS: <b className="text-white">{tokens.length}</b>
            </span>
            <span className="hidden md:inline text-[#42f5ff]/40">|</span>
            <span className="hidden md:inline text-[#74ff9b]">
              PEER BEACONS: <b className="text-white">{beacons.length}</b>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Global Real-time Ingestion Sync Toggle */}
            <button
              onClick={() => toggleSync()}
              title={syncActive ? 'Click to Pause Real-time Data Ingestion (ArbitrageMonitor & Telemetry)' : 'Click to Resume Real-time Ingestion'}
              className={`px-2 py-0.5 rounded border flex items-center gap-1.5 font-bold text-[10px] transition-all duration-200 cursor-pointer ${
                syncActive
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : 'bg-amber-950/80 border-amber-500/60 text-amber-300 hover:bg-amber-900/80 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${syncActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              {syncActive ? (
                <>
                  <Pause className="w-2.5 h-2.5 text-emerald-400" />
                  <span>SYNC: LIVE</span>
                </>
              ) : (
                <>
                  <Play className="w-2.5 h-2.5 text-amber-400" />
                  <span>SYNC: PAUSED</span>
                </>
              )}
            </button>

            <span className="text-[#42f5ff]/40">|</span>
            <SignalMonitor />

            <span className="text-[#42f5ff]/40">|</span>
            <span className="text-red-400 font-semibold">
              ACTIVE HAZARDS: {incidents.filter(i => i.status !== 'CONTAINED').length}
            </span>
            <span className="text-[#42f5ff]/40">|</span>
            <span className="text-[#8aa0b6]">CRYPTIC NEWS LLC · GAIA SOVEREIGN OS</span>
          </div>
        </footer>
      )}

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <CrypticProvider>
      <MainLayout />
    </CrypticProvider>
  );
}

export default App;
