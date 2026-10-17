import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Radio, 
  Activity, 
  User, 
  Clock, 
  Maximize2, 
  Minimize2, 
  Zap,
  Lock
} from 'lucide-react';
import { useCryptic } from '../store/crypticContext';
import { VoipCallSession } from '../types';

interface ActiveCallOverlayProps {
  call: VoipCallSession | null;
  onEndCall: () => void;
}

export const ActiveCallOverlay: React.FC<ActiveCallOverlayProps> = ({ call, onEndCall }) => {
  const { addTerminalLine, addLedger } = useCryptic();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isOnHold, setIsOnHold] = useState(false);
  const [callDuration, setCallDuration] = useState(call?.durationSec || 0);
  const [waveformBars, setWaveformBars] = useState<number[]>([40, 65, 30, 85, 95, 50, 75, 60, 90, 45, 70, 55, 80, 65, 40, 88]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Timer increment
  useEffect(() => {
    if (!call || isOnHold) return;
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [call, isOnHold]);

  // Live waveform animator
  useEffect(() => {
    if (!call || isOnHold || isMuted) return;
    const interval = setInterval(() => {
      setWaveformBars(Array.from({ length: 18 }, () => Math.floor(Math.random() * 75) + 20));
    }, 150);
    return () => clearInterval(interval);
  }, [call, isOnHold, isMuted]);

  if (!call) return null;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    addTerminalLine(`[VOIP CALL]: Microphone ${next ? 'muted' : 'unmuted'}.`, 'system');
    addLedger('voip.call.mute_toggled', { muted: next });
  };

  const handleToggleSpeaker = () => {
    const next = !isSpeakerOn;
    setIsSpeakerOn(next);
    addTerminalLine(`[VOIP CALL]: Audio output switched to ${next ? 'Sovereign Speaker Array' : 'Secure Earpiece'}.`, 'system');
  };

  const handleToggleHold = () => {
    const next = !isOnHold;
    setIsOnHold(next);
    addTerminalLine(`[VOIP CALL]: Call ${next ? 'placed on cryptographic hold' : 'resumed'}.`, 'warn');
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-12 right-6 z-50 bg-[#040d1a]/95 backdrop-blur-xl border border-cyan-500/60 rounded-xl shadow-[0_0_25px_rgba(66,245,255,0.3)] p-3 flex items-center gap-3 text-slate-100 font-mono text-xs animate-in slide-in-from-bottom-4 duration-200">
        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
        <div>
          <div className="font-bold text-cyan-300">{call.contactName || call.phoneNumber}</div>
          <div className="text-[10px] text-emerald-400 font-semibold">{formatTime(callDuration)} • {call.codec}</div>
        </div>
        <div className="flex items-center space-x-1.5 ml-2">
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1.5 bg-cyan-500/20 hover:bg-cyan-500/40 rounded-lg text-cyan-300 cursor-pointer"
            title="Expand Active Call"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onEndCall}
            className="p-1.5 bg-red-600/80 hover:bg-red-500 rounded-lg text-white cursor-pointer"
            title="End Call"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#020610]/90 backdrop-blur-2xl flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200 text-slate-100 font-mono select-none">
      {/* Top Bar Controls */}
      <div className="absolute top-6 right-6 flex items-center space-x-2">
        <button
          onClick={() => setIsMinimized(true)}
          className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 rounded-xl text-cyan-400 cursor-pointer transition-all"
          title="Minimize to Floating Bar"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-md w-full bg-[#040d1a]/95 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(66,245,255,0.2)] p-6 flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow background accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Status Badge */}
        <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          {isOnHold ? 'CALL ON HOLD' : 'SECURE ACTIVE VoIP CALL'}
        </div>

        {/* Avatar / Icon */}
        <div className="w-20 h-20 rounded-2xl bg-cyan-950/80 border-2 border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(66,245,255,0.4)] mb-4">
          <User className="w-10 h-10 animate-pulse" />
        </div>

        {/* Contact & Number */}
        <div className="text-xl font-bold text-cyan-200 tracking-wide mb-1">
          {call.contactName || 'Encrypted Peer'}
        </div>
        <div className="text-xs text-slate-400 mb-2">{call.phoneNumber}</div>

        {/* Call Timer */}
        <div className="text-lg font-bold text-emerald-400 tracking-wider mb-6 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {formatTime(callDuration)}
        </div>

        {/* Waveform Visualizer */}
        <div className="w-full bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center text-[10px] text-cyan-300 mb-2">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              Real-time Audio Spectrum ({call.codec})
            </span>
            <span className="text-emerald-400">{call.bitrateKbps} kbps</span>
          </div>

          <div className="h-16 flex items-center justify-center gap-1.5 bg-black/60 rounded-lg p-2 border border-cyan-500/20 overflow-hidden">
            {waveformBars.map((height, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isMuted || isOnHold ? 'bg-slate-700 h-1' : 'bg-cyan-400 shadow-[0_0_8px_#42f5ff]'
                }`}
                style={{ height: `${isMuted || isOnHold ? 10 : height}%` }}
              />
            ))}
          </div>
        </div>

        {/* Call Controls */}
        <div className="grid grid-cols-4 gap-3 w-full mb-6">
          <button
            onClick={handleToggleMute}
            className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              isMuted
                ? 'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                : 'bg-slate-900 border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/60'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="text-[10px] font-bold">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            onClick={handleToggleSpeaker}
            className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              isSpeakerOn
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(66,245,255,0.3)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-[10px] font-bold">Speaker</span>
          </button>

          <button
            onClick={handleToggleHold}
            className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              isOnHold
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900 border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/60'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span className="text-[10px] font-bold">{isOnHold ? 'Resume' : 'Hold'}</span>
          </button>

          <button
            onClick={onEndCall}
            className="py-3 rounded-xl bg-red-600 hover:bg-red-500 border border-red-400 text-white flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="text-[10px] font-bold">Hang Up</span>
          </button>
        </div>

        {/* Security Footer Info */}
        <div className="flex items-center justify-between w-full pt-3 border-t border-cyan-500/20 text-[9px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3 h-3" /> AES-256 eSIM Encrypted
          </span>
          <span className="text-cyan-400">LATENCY: 12.4ms</span>
        </div>
      </div>
    </div>
  );
};
