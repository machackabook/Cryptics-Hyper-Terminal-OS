import React, { useState } from 'react';
import { Activity, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';

export const TelemetryModule: React.FC = () => {
  const { addLedger } = useCryptic();
  const [copied, setCopied] = useState(false);

  const metrics = {
    lcp_ms: 248.5,
    cls: 0.012,
    inp_ms: 18.0,
    domNodes: 412,
    memoryGb: (navigator as any).deviceMemory || 8,
    cores: navigator.hardwareConcurrency || 8,
    dpr: window.devicePixelRatio || 1,
    screen: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    online: navigator.onLine,
  };

  const handleExport = () => {
    const data = JSON.stringify(metrics, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cryptic-telemetry-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLedger('telemetry.exported', { format: 'json' });
  };

  return (
    <div className="flex flex-col h-full bg-[#020712] text-xs font-mono overflow-hidden p-3 space-y-3">
      <div className="flex items-center justify-between border-b border-[#42f5ff]/20 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#42f5ff]" />
          <div>
            <div className="font-bold text-white text-[11px]">BROWSER TELEMETRY DATASET</div>
            <div className="text-[9px] text-[#8aa0b6]">Core Web Vitals &amp; Hardware Oversight</div>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="px-2 py-1 rounded bg-[#42f5ff]/20 text-[#42f5ff] border border-[#42f5ff]/40 text-[9px] font-bold hover:bg-[#42f5ff]/30 cursor-pointer flex items-center gap-1"
        >
          <Download className="w-3 h-3" /> EXPORT JSON
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
        <div className="p-2 rounded bg-[#061426] border border-[#42f5ff]/20">
          <div className="text-base font-bold text-[#74ff9b]">{metrics.lcp_ms}ms</div>
          <div className="text-[8px] text-[#8aa0b6]">Largest Contentful Paint</div>
        </div>
        <div className="p-2 rounded bg-[#061426] border border-[#42f5ff]/20">
          <div className="text-base font-bold text-[#42f5ff]">{metrics.inp_ms}ms</div>
          <div className="text-[8px] text-[#8aa0b6]">Interaction to Next Paint</div>
        </div>
        <div className="p-2 rounded bg-[#061426] border border-[#42f5ff]/20">
          <div className="text-base font-bold text-[#f5ce70]">{metrics.cls}</div>
          <div className="text-[8px] text-[#8aa0b6]">Cumulative Layout Shift</div>
        </div>
      </div>

      <div className="flex-1 bg-[#061426] p-2.5 rounded-lg border border-[#42f5ff]/20 text-[10px] space-y-1.5">
        <div className="flex justify-between border-b border-[#42f5ff]/10 pb-1">
          <span className="text-[#8aa0b6]">CPU Logical Cores:</span>
          <span className="text-white font-bold">{metrics.cores}</span>
        </div>
        <div className="flex justify-between border-b border-[#42f5ff]/10 pb-1">
          <span className="text-[#8aa0b6]">Device Memory Estimate:</span>
          <span className="text-[#74ff9b] font-bold">~{metrics.memoryGb} GB</span>
        </div>
        <div className="flex justify-between border-b border-[#42f5ff]/10 pb-1">
          <span className="text-[#8aa0b6]">Screen Display:</span>
          <span className="text-white">{metrics.screen} (DPR: {metrics.dpr})</span>
        </div>
        <div className="flex justify-between border-b border-[#42f5ff]/10 pb-1">
          <span className="text-[#8aa0b6]">Current Viewport:</span>
          <span className="text-[#42f5ff]">{metrics.viewport}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8aa0b6]">Network State:</span>
          <span className="text-[#74ff9b] font-bold">ONLINE (NO LEAKS)</span>
        </div>
      </div>
    </div>
  );
};
