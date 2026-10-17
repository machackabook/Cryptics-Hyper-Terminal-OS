import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Radio, Video, MessageSquare, Shield, Activity, X, Zap, ChevronUp } from 'lucide-react';
import { useCryptic } from '../store/crypticContext';

export const SignalMonitor: React.FC = () => {
  const { syncActive, addTerminalLine, addLedger } = useCryptic();
  const [isOpen, setIsOpen] = useState(false);
  const [signalStrength, setSignalStrength] = useState<number>(94); // percentage
  const [signalBars, setSignalBars] = useState<number>(5);
  const [mmsStatus, setMmsStatus] = useState<'IDLE' | 'SYNCING' | 'SECURE_SECURED'>('SECURE_SECURED');
  const [videoStatus, setVideoStatus] = useState<'4K_HD' | 'ENCRYPTED_STREAM' | 'STANDBY'>('4K_HD');
  const [signalHistory, setSignalHistory] = useState<number[]>([92, 95, 91, 96, 94, 98, 93, 94, 96, 94]);

  // Periodic signal fluctuation
  useEffect(() => {
    if (!syncActive) return;
    const interval = setInterval(() => {
      setSignalStrength(prev => {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const nextVal = Math.min(100, Math.max(60, prev + delta));
        
        // Update bars
        if (nextVal > 85) setSignalBars(5);
        else if (nextVal > 75) setSignalBars(4);
        else if (nextVal > 65) setSignalBars(3);
        else setSignalBars(2);

        // Update history
        setSignalHistory(h => [...h.slice(1), nextVal]);
        return nextVal;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [syncActive]);

  const handleTestMms = () => {
    setMmsStatus('SYNCING');
    addTerminalLine('[SIGNAL MONITOR]: Transmitting secure MMS batch across encrypted eSIM cellular bridge...', 'system');
    setTimeout(() => {
      setMmsStatus('SECURE_SECURED');
      addTerminalLine('[SIGNAL MONITOR]: MMS package delivered successfully. 0 packet loss.', 'good');
      addLedger('mms.transmit.success', { size: '4.2MB', recipient: 'SOVEREIGN-NODE-01' });
    }, 1200);
  };

  const handleToggleVideo = () => {
    const next = videoStatus === '4K_HD' ? 'ENCRYPTED_STREAM' : '4K_HD';
    setVideoStatus(next);
    addTerminalLine(`[SIGNAL MONITOR]: Video integration switched to ${next} protocol mode.`, 'good');
    addLedger('video.integration.switched', { mode: next });
  };

  return (
    <div className="relative flex items-center">
      {/* Footer trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/60 text-cyan-300 transition-all cursor-pointer shadow-[0_0_8px_rgba(66,245,255,0.2)]"
        title="Virtual VoIP / eSIM Signal Monitor, MMS & Video Integration"
      >
        <Signal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span className="font-bold text-[10px]">eSIM: {signalStrength}%</span>
        {/* Mini 5-bar chart */}
        <div className="flex items-end gap-0.5 h-3 ml-1">
          {[1, 2, 3, 4, 5].map(bar => (
            <div
              key={bar}
              className={`w-1 rounded-t-xs transition-all ${
                bar <= signalBars ? 'bg-cyan-400 shadow-[0_0_4px_#42f5ff]' : 'bg-slate-700'
              }`}
              style={{ height: `${bar * 20}%` }}
            />
          ))}
        </div>
      </button>

      {/* Expanded Modal / Popover */}
      {isOpen && (
        <div className="absolute bottom-10 right-0 w-80 md:w-96 bg-[#040d1a]/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl shadow-2xl p-4 z-50 text-slate-100 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-400">
                <Wifi className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-cyan-300 text-xs tracking-wide">eSIM SIGNAL &amp; MULTIMEDIA MONITOR</div>
                <div className="text-[9px] text-slate-400">VoIP / eSIM Bridge • MMS &amp; Video Active</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-cyan-500/20 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Signal Strength Visual Bar Chart */}
          <div className="space-y-3 mb-4">
            <div className="bg-cyan-950/40 border border-cyan-500/20 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-cyan-300 font-bold uppercase flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                  Cellular Signal Strength
                </span>
                <span className="text-sm font-bold text-emerald-400">{signalStrength}% (LTE-A 5G)</span>
              </div>

              {/* Visual Bar Graph */}
              <div className="h-14 flex items-end gap-1 bg-slate-900/80 p-2 rounded border border-cyan-500/20">
                {signalHistory.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-cyan-500/30 hover:bg-cyan-400 rounded-t transition-all relative group"
                    style={{ height: `${val}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-cyan-300 text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {val}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MMS & Video Integration Section */}
            <div className="grid grid-cols-2 gap-2">
              {/* MMS Box */}
              <div className="bg-slate-900/80 border border-cyan-500/20 rounded-lg p-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-cyan-300 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-cyan-400" />
                      MMS Service
                    </span>
                    <span className="text-[9px] text-emerald-400 font-semibold">{mmsStatus}</span>
                  </div>
                  <p className="text-[9px] text-slate-400">Multimedia messaging & encrypted media attachments.</p>
                </div>
                <button
                  onClick={handleTestMms}
                  className="mt-2 w-full py-1 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 rounded text-[10px] font-bold text-cyan-200 transition-all cursor-pointer"
                >
                  Dispatch MMS Batch
                </button>
              </div>

              {/* Video Integration Box */}
              <div className="bg-slate-900/80 border border-cyan-500/20 rounded-lg p-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-cyan-300 flex items-center gap-1">
                      <Video className="w-3 h-3 text-cyan-400" />
                      Video Stream
                    </span>
                    <span className="text-[9px] text-amber-400 font-semibold">{videoStatus}</span>
                  </div>
                  <p className="text-[9px] text-slate-400">Encrypted real-time video conference bridge.</p>
                </div>
                <button
                  onClick={handleToggleVideo}
                  className="mt-2 w-full py-1 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 rounded text-[10px] font-bold text-amber-200 transition-all cursor-pointer"
                >
                  Switch Video Codec
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-2 border-t border-cyan-500/20">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              AES-256 eSIM Encrypted Bridge
            </span>
            <span className="text-cyan-400">LATENCY: 14.2ms</span>
          </div>
        </div>
      )}
    </div>
  );
};
