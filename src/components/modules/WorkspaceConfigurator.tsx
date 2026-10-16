import React, { useState, useEffect } from 'react';
import { useCryptic } from '../../store/crypticContext';
import { Sliders, Layout, RotateCcw, Save, Eye, EyeOff, Maximize2, Minimize2, Move } from 'lucide-react';

export const WorkspaceConfigurator: React.FC = () => {
  const { panels, updatePanelPos, toggleCollapse, toggleGhost, closePanel, openModule } = useCryptic();
  const [savedPresets, setSavedPresets] = useState<string[]>(['Default Sovereign Grid', 'Compact Telemetry Mode', 'Architect Focus Layout']);
  const [activePreset, setActivePreset] = useState<string>('Default Sovereign Grid');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load layout from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cryptic_workspace_layout');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Apply positions if valid
        if (Array.isArray(parsed)) {
          parsed.forEach((p: any) => {
            updatePanelPos(p.id, p.x, p.y);
          });
        }
      } catch (e) {
        console.error('Failed to load workspace layout', e);
      }
    }
  }, []);

  const saveLayoutToLocalStorage = () => {
    const layoutData = panels.map(p => ({ id: p.id, x: p.x, y: p.y, w: p.w, h: p.h }));
    localStorage.setItem('cryptic_workspace_layout', JSON.stringify(layoutData));
    setToastMessage('Workspace layout successfully saved & persisted to localStorage!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const resetLayout = () => {
    localStorage.removeItem('cryptic_workspace_layout');
    setToastMessage('Layout reset to factory sovereign defaults.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const applyPreset = (presetName: string) => {
    setActivePreset(presetName);
    if (presetName === 'Compact Telemetry Mode') {
      panels.forEach((p, idx) => {
        updatePanelPos(p.id, 30 + (idx % 3) * 350, 70 + Math.floor(idx / 3) * 200);
      });
    } else if (presetName === 'Architect Focus Layout') {
      panels.forEach((p, idx) => {
        updatePanelPos(p.id, 50 + idx * 40, 60 + idx * 40);
      });
    } else {
      // Default Grid
      panels.forEach((p, idx) => {
        updatePanelPos(p.id, 20 + (idx % 2) * 560, 65 + Math.floor(idx / 2) * 470);
      });
    }
    setToastMessage(`Applied preset: ${presetName}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-mono text-xs select-none overflow-hidden p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-cyan-400 text-sm tracking-wider">
              WORKSPACE CONFIGURATOR // SNAPGRID LAYOUT MANAGER
            </div>
            <div className="text-slate-400 text-[11px]">
              Rearrange, resize, and persist module positions across the cryptic workspace.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={saveLayoutToLocalStorage}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Layout</span>
          </button>
          <button
            onClick={resetLayout}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition border border-slate-700"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-center font-bold animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* Presets Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">Layout Presets:</span>
        </div>
        <div className="flex items-center space-x-2">
          {savedPresets.map(preset => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              className={`px-3 py-1 rounded text-xs font-bold transition ${
                activePreset === preset 
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(66,245,255,0.4)]' 
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Active Panels List & Position Controls */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <div className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider mb-2">
          Active Workspace Modules ({panels.length})
        </div>

        {panels.map(panel => (
          <div key={panel.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-800 rounded text-cyan-400">
                <Move className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-200">{panel.title}</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Coordinates: X: {panel.x}px, Y: {panel.y}px | Size: {panel.w}x{panel.h}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleCollapse(panel.id)}
                className={`p-1.5 rounded transition ${panel.collapsed ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                title={panel.collapsed ? 'Expand Panel' : 'Collapse Panel'}
              >
                {panel.collapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => toggleGhost(panel.id)}
                className={`p-1.5 rounded transition ${panel.ghost ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                title="Toggle Ghost Mode"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  const nx = panel.x + 20;
                  const ny = panel.y + 20;
                  updatePanelPos(panel.id, nx, ny);
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-[10px]"
              >
                Shift +20px
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
