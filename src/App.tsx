import React from 'react';
import { CrypticProvider, useCryptic } from './store/crypticContext';
import { CosmicGuardian } from './components/CosmicGuardian';
import { Header } from './components/Header';
import { SnapGrid } from './components/SnapGrid';
import { MagicWindow3D } from './components/MagicWindow3D';
import { PersistentBackgroundFX } from './components/PersistentBackgroundFX';
import { InteractiveGlobeModule } from './components/modules/InteractiveGlobeModule';
import { GalaxiesSkyboxModule } from './components/modules/GalaxiesSkyboxModule';
import { Activity, Radio, Shield, Globe, Terminal, Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { gateOpen, viewMode, setViewMode, ledgerRecords, tokens, beacons, incidents, clearUI } = useCryptic();

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
            <span className="text-red-400 font-semibold">
              ACTIVE HAZARDS: {incidents.filter(i => i.status !== 'CONTAINED').length}
            </span>
            <span className="text-[#42f5ff]/40">|</span>
            <span className="text-[#8aa0b6]">CRYPTIC NEWS LLC · GAIA SOVEREIGN OS</span>
          </div>
        </footer>
      )}
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
