import { DeveloperBrowserModule } from './modules/DeveloperBrowserModule';
import React, { useRef } from 'react';
import { useCryptic } from '../store/crypticContext';
import { PanelInstanceState, ModuleId } from '../types';
import { TerminalModule } from './modules/TerminalModule';
import { InteractiveGlobeModule } from './modules/InteractiveGlobeModule';
import { NetworkInspectorModule } from './modules/NetworkInspectorModule';
import { AudioFabricModule } from './modules/AudioFabricModule';
import { AIConsensusModule } from './modules/AIConsensusModule';
import { GenieDjinnModule } from './modules/GenieDjinnModule';
import { MatrixKerrHopfModule } from './modules/MatrixKerrHopfModule';
import { GalaxiesSkyboxModule } from './modules/GalaxiesSkyboxModule';
import { LivingLedgerModule } from './modules/LivingLedgerModule';
import { NodesModule } from './modules/NodesModule';
import { SentinelModule } from './modules/SentinelModule';
import { NexusIRCModule } from './modules/NexusIRCModule';
import { DocumentCorpusModule } from './modules/DocumentCorpusModule';
import { TelemetryModule } from './modules/TelemetryModule';
import { SSHIdentityModule } from './modules/SSHIdentityModule';
import { AXSModule } from './modules/AXSModule';
import { EnclavesStorageModule } from './modules/EnclavesStorageModule';
import { ExtensionsMCPModule } from './modules/ExtensionsMCPModule';
import { AlphaHologramCompressorModule } from './modules/AlphaHologramCompressorModule';
import { MCPRegistry } from './modules/MCPRegistry';
import { AntigravityAndroidModule } from './modules/AntigravityAndroidModule';
import { TelemetryDashboard } from './modules/TelemetryDashboard';
import { ArchitectDashboard } from './modules/ArchitectDashboard';
import { CloudStorageDashboard } from './modules/CloudStorageDashboard';
import { WorkspaceConfigurator } from './modules/WorkspaceConfigurator';
import { NetworkTopologyMap } from './modules/NetworkTopologyMap';
import { TerrasphereGitHubSync } from './modules/TerrasphereGitHubSync';
import { FinancialArbitrageModule } from './modules/FinancialArbitrageModule';
import { ArbitrageMonitor } from './modules/ArbitrageMonitor';
import { VirtualMobileVoipModule } from './modules/VirtualMobileVoipModule';
import { NetworkController } from './modules/NetworkController';
import { SatcomCircularRelayModule } from './modules/SatcomCircularRelayModule';
import { CallHistoryModule } from './modules/CallHistoryModule';
import { PaymentGatewayModule } from './modules/PaymentGatewayModule';
import { CheckpointManagerModule } from './modules/CheckpointManagerModule';
import { ChatMessageModule } from './modules/ChatMessageModule';
import { SATCOMMap } from './SATCOMMap';

const SNAP = 12;
const snapVal = (n: number) => Math.round(n / SNAP) * SNAP;

export const SnapGrid: React.FC = () => {
  const {
    panels,
    closePanel,
    toggleCollapse,
    toggleGhost,
    duplicatePanel,
    bringToFront,
    updatePanelPos,
    clearUI,
  } = useCryptic();

  const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, panel: PanelInstanceState) => {
    if ((e.target as HTMLElement).closest('button')) return;
    bringToFront(panel.id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      id: panel.id,
      ox: e.clientX - panel.x,
      oy: e.clientY - panel.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { id, ox, oy } = dragRef.current;
    const nx = snapVal(Math.max(0, Math.min(window.innerWidth - 120, e.clientX - ox)));
    const ny = snapVal(Math.max(56, Math.min(window.innerHeight - 100, e.clientY - oy)));
    updatePanelPos(id, nx, ny);
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const renderModuleContent = (moduleId: ModuleId) => {
    switch (moduleId) {
      case 'terminal':
        return <TerminalModule />;
      case 'globe':
        return <InteractiveGlobeModule />;
      case 'network':
        return <NetworkInspectorModule />;
      case 'audio':
        return <AudioFabricModule />;
      case 'consensus':
        return <AIConsensusModule />;
      case 'genie':
        return <GenieDjinnModule />;
      case 'matrix':
        return <MatrixKerrHopfModule />;
      case 'galaxies':
        return <GalaxiesSkyboxModule />;
      case 'ledger':
        return <LivingLedgerModule />;
      case 'nodes':
        return <NodesModule />;
      case 'sentinel':
        return <SentinelModule />;
      case 'irc':
        return <NexusIRCModule />;
      case 'documents':
        return <DocumentCorpusModule />;
      case 'telemetry':
        return <TelemetryModule />;
      case 'identity':
        return <SSHIdentityModule />;
      case 'axs':
        return <AXSModule />;
      case 'enclaves':
        return <EnclavesStorageModule />;
      case 'extensions':
        return <DeveloperBrowserModule />;
      case 'alpha-hologram':
        return <AlphaHologramCompressorModule />;
      case 'mcp-registry':
        return <MCPRegistry />;
      case 'antigravity':
        return <AntigravityAndroidModule />;
      case 'telemetry':
        return <TelemetryDashboard />;
      case 'architect':
        return <ArchitectDashboard />;
      case 'cloud-storage':
        return <CloudStorageDashboard />;
      case 'workspace-configurator':
        return <WorkspaceConfigurator />;
      case 'network-topology':
        return <NetworkTopologyMap />;
      case 'terrasphere-sync':
        return <TerrasphereGitHubSync />;
      case 'arbitrage':
        return <FinancialArbitrageModule />;
      case 'arbitrage-monitor':
        return <ArbitrageMonitor />;
      case 'mobile-voip':
        return <VirtualMobileVoipModule />;
      case 'network-controller':
        return <NetworkController />;
      case 'satcom-relay':
        return <SatcomCircularRelayModule />;
      case 'call-history':
        return <CallHistoryModule />;
      case 'payment-gateway':
        return <PaymentGatewayModule />;
      case 'checkpoints':
        return <CheckpointManagerModule />;
      case 'chat-messages':
        return <ChatMessageModule />;
      case 'satcom-map':
        return <SATCOMMap />;
      default:
        return <TerminalModule />;
    }
  };

  if (clearUI) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-10"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {panels
        .filter((p) => !p.hidden)
        .map((p) => (
          <div
            key={p.id}
            onPointerDown={() => bringToFront(p.id)}
            style={{
              position: 'absolute',
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.w}px`,
              height: p.collapsed ? 'auto' : `${p.h}px`,
              zIndex: p.zIndex,
            }}
            className={`pointer-events-auto rounded-xl border cyber-panel transition-opacity flex flex-col overflow-hidden shadow-2xl ${
              p.ghost ? 'panel-ghost' : ''
            }`}
          >
            {/* Titlebar / Drag Handle */}
            <div
              onPointerDown={(e) => handlePointerDown(e, p)}
              className="h-8 bg-[#051122]/95 border-b border-[#42f5ff]/20 px-2.5 flex items-center justify-between cursor-move select-none"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-[#42f5ff]/70 inline-block shadow-[0_0_6px_#42f5ff]" />
                <span className="text-[10px] font-bold text-white tracking-wider truncate">
                  {p.title}
                </span>
              </div>

              {/* Titlebar Tools */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleGhost(p.id)}
                  title="Toggle Transparency"
                  className={`w-5 h-5 rounded flex items-center justify-center text-[10px] cursor-pointer transition ${
                    p.ghost ? 'bg-[#42f5ff]/20 text-[#42f5ff]' : 'text-[#8aa0b6] hover:text-white'
                  }`}
                >
                  ◐
                </button>
                <button
                  type="button"
                  onClick={() => toggleCollapse(p.id)}
                  title={p.collapsed ? 'Expand' : 'Collapse'}
                  className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-[#8aa0b6] hover:text-white cursor-pointer"
                >
                  {p.collapsed ? '□' : '—'}
                </button>
                <button
                  type="button"
                  onClick={() => duplicatePanel(p.id)}
                  title="Duplicate Panel"
                  className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-[#8aa0b6] hover:text-white cursor-pointer"
                >
                  ＋
                </button>
                <button
                  type="button"
                  onClick={() => closePanel(p.id)}
                  title="Close Panel"
                  className="w-5 h-5 rounded flex items-center justify-center text-[11px] text-[#8aa0b6] hover:text-red-400 cursor-pointer"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Panel Body */}
            {!p.collapsed && (
              <div className="flex-1 overflow-hidden flex flex-col">
                {renderModuleContent(p.moduleId)}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};
