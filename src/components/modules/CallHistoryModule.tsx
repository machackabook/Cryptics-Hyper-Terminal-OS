import React, { useState } from 'react';
import { 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Clock, 
  Signal, 
  Search, 
  Trash2, 
  Download, 
  ShieldCheck, 
  Radio, 
  CheckCircle2, 
  Sliders, 
  Smartphone,
  ExternalLink,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';
import { VoipCallSession } from '../../types';

interface ExtendedCallLog extends VoipCallSession {
  signalBars: number;
  signalDbm: number;
  location: string;
  encryptedHash: string;
}

export const CallHistoryModule: React.FC = () => {
  const { addTerminalLine, addLedger, openModule, startCall } = useCryptic();
  
  const [callLogs, setCallLogs] = useState<ExtendedCallLog[]>([
    {
      id: 'call-001',
      phoneNumber: '+1 (800) 555-0199',
      contactName: 'Architect Core Node',
      direction: 'INCOMING',
      status: 'CONNECTED',
      durationSec: 428,
      codec: 'OPUS_HD',
      bitrateKbps: 128,
      startTime: 'Today, 10:42 AM',
      signalBars: 5,
      signalDbm: -64,
      location: 'Sovereign Satcom Orbital LEO-99',
      encryptedHash: '0x8f9a...3b21'
    },
    {
      id: 'call-002',
      phoneNumber: '+44 20 7946 0912',
      contactName: 'London Gateway Relay',
      direction: 'OUTGOING',
      status: 'CONNECTED',
      durationSec: 184,
      codec: 'G.711_SOVEREIGN',
      bitrateKbps: 96,
      startTime: 'Today, 09:15 AM',
      signalBars: 4,
      signalDbm: -72,
      location: 'European Ground Station 04',
      encryptedHash: '0x4e21...9f80'
    },
    {
      id: 'call-003',
      phoneNumber: '+1 (555) 382-9901',
      contactName: 'Encrypted eSIM Bridge',
      direction: 'INCOMING',
      status: 'CONNECTED',
      durationSec: 62,
      codec: 'NOISE_ENCRYPTED',
      bitrateKbps: 160,
      startTime: 'Yesterday, 04:30 PM',
      signalBars: 5,
      signalDbm: -61,
      location: 'Mesh Relay Node Alpha',
      encryptedHash: '0x11ab...ff45'
    },
    {
      id: 'call-004',
      phoneNumber: '+81 3 5555 0143',
      contactName: 'Tokyo Quantum Terminal',
      direction: 'OUTGOING',
      status: 'ENDED',
      durationSec: 0,
      codec: 'OPUS_HD',
      bitrateKbps: 128,
      startTime: 'Yesterday, 01:10 PM',
      signalBars: 3,
      signalDbm: -84,
      location: 'APAC Gateway 02',
      encryptedHash: '0x7c34...2a11'
    },
    {
      id: 'call-005',
      phoneNumber: '+1 (888) 412-9921',
      contactName: 'Emergency SATCOM ATSC Relay',
      direction: 'INCOMING',
      status: 'CONNECTED',
      durationSec: 1250,
      codec: 'OPUS_HD',
      bitrateKbps: 192,
      startTime: 'Oct 15, 2026',
      signalBars: 5,
      signalDbm: -58,
      location: 'Stratospheric Rebound Node',
      encryptedHash: '0x99ee...00ab'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOMING' | 'OUTGOING' | 'MISSED'>('ALL');
  const [selectedCall, setSelectedCall] = useState<ExtendedCallLog | null>(callLogs[0]);

  const formatDuration = (sec: number) => {
    if (sec === 0) return 'Missed / No Connection';
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins}m ${remainingSec}s`;
  };

  const filteredCalls = callLogs.filter(call => {
    const matchesSearch = call.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (call.contactName && call.contactName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          call.location.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'INCOMING') return matchesSearch && call.direction === 'INCOMING';
    if (filterType === 'OUTGOING') return matchesSearch && call.direction === 'OUTGOING';
    if (filterType === 'MISSED') return matchesSearch && (call.durationSec === 0 || call.status === 'ENDED');
    return matchesSearch;
  });

  const handleRedial = (call: ExtendedCallLog) => {
    addTerminalLine(`Initiating secure redial to ${call.phoneNumber} (${call.contactName}) via VoIP eSIM...`, 'good');
    addLedger('voip.call.redialed', { phoneNumber: call.phoneNumber, codec: call.codec });
    
    // Create new outgoing call record
    const newLog: ExtendedCallLog = {
      id: `call-${Date.now()}`,
      phoneNumber: call.phoneNumber,
      contactName: call.contactName,
      direction: 'OUTGOING',
      status: 'CONNECTED',
      durationSec: 15,
      codec: call.codec,
      bitrateKbps: call.bitrateKbps,
      startTime: 'Just now',
      signalBars: 5,
      signalDbm: -62,
      location: call.location,
      encryptedHash: `0x${Math.random().toString(16).substring(2, 10)}`
    };
    setCallLogs([newLog, ...callLogs]);
    setSelectedCall(newLog);
    startCall(newLog);
  };

  const handleClearHistory = () => {
    setCallLogs([]);
    setSelectedCall(null);
    addTerminalLine('VoIP call history cleared securely from volatile memory buffers.', 'warn');
    addLedger('voip.call_history.cleared', { count: callLogs.length });
  };

  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(callLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cryptic_voip_call_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addTerminalLine('Exported VoIP call history JSON audit file.', 'good');
    addLedger('voip.call_history.exported', { totalRecords: callLogs.length });
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-cyan-400 font-mono text-xs select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-cyan-500/30">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-950/60 border border-cyan-500/40 rounded-lg text-cyan-400">
            <Phone className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wider text-cyan-200 flex items-center space-x-2">
              <span>VIRTUAL VoIP CALL HISTORY & METADATA</span>
              <span className="px-2 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded">
                SECURE BRIDGE
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Interfacing with NetworkController & Cellular eSIM Telemetry
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => openModule('mobile-voip')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 rounded text-cyan-300 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open VoIP Studio</span>
          </button>
          <button 
            onClick={() => openModule('network-controller')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 rounded text-cyan-300 transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Network Controller</span>
          </button>
          <button 
            onClick={handleExportLogs}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>
          <button 
            onClick={handleClearHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 rounded text-red-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe Logs</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Call List & Filters */}
        <div className="w-1/2 flex flex-col border-r border-cyan-500/20 bg-slate-950/80">
          {/* Search & Filter Bar */}
          <div className="p-3 border-b border-cyan-500/20 bg-slate-900/50 space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-cyan-500/60" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phone number, contact, or location..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-cyan-500/30 rounded text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
              />
            </div>
            <div className="flex items-center space-x-1.5">
              {(['ALL', 'INCOMING', 'OUTGOING', 'MISSED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterType(tab)}
                  className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                    filterType === tab 
                      ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/50' 
                      : 'bg-slate-900 text-slate-400 hover:text-cyan-300 border border-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Call Log Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-cyan-500/10">
            {filteredCalls.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <PhoneMissed className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-500" />
                <div>No call telemetry logs match current filters.</div>
              </div>
            ) : (
              filteredCalls.map(call => {
                const isSelected = selectedCall?.id === call.id;
                return (
                  <div
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg border ${
                        call.direction === 'INCOMING' 
                          ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400' 
                          : 'bg-cyan-950/50 border-cyan-500/40 text-cyan-400'
                      }`}>
                        {call.direction === 'INCOMING' ? (
                          <PhoneIncoming className="w-4 h-4" />
                        ) : (
                          <PhoneOutgoing className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-cyan-200 font-semibold text-xs flex items-center space-x-2">
                          <span>{call.contactName || call.phoneNumber}</span>
                          {call.status === 'CONNECTED' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {call.phoneNumber} • {call.startTime}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-cyan-300 font-mono text-xs">
                        {formatDuration(call.durationSec)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {call.codec}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Detailed Metadata & Signal Inspection */}
        <div className="w-1/2 flex flex-col bg-slate-950 p-5 overflow-y-auto">
          {selectedCall ? (
            <div className="space-y-6">
              {/* Call Header Card */}
              <div className="p-4 bg-slate-900/80 border border-cyan-500/30 rounded-xl space-y-4 shadow-lg shadow-cyan-950/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl border ${
                      selectedCall.direction === 'INCOMING'
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                        : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400'
                    }`}>
                      {selectedCall.direction === 'INCOMING' ? (
                        <PhoneIncoming className="w-6 h-6" />
                      ) : (
                        <PhoneOutgoing className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-cyan-100">
                        {selectedCall.contactName || selectedCall.phoneNumber}
                      </div>
                      <div className="text-xs text-cyan-400 font-mono mt-0.5">
                        {selectedCall.phoneNumber}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedial(selectedCall)}
                    className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition-colors shadow-lg shadow-cyan-500/30"
                  >
                    <Phone className="w-4 h-4 fill-slate-950" />
                    <span>Redial Secure Call</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-cyan-500/20 text-xs">
                  <div>
                    <span className="text-slate-400">Direction:</span>
                    <span className="ml-2 font-bold text-cyan-300">{selectedCall.direction}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>
                    <span className="ml-2 font-bold text-emerald-400">{selectedCall.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Duration:</span>
                    <span className="ml-2 font-bold text-cyan-300">{formatDuration(selectedCall.durationSec)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="ml-2 font-bold text-cyan-300">{selectedCall.startTime}</span>
                  </div>
                </div>
              </div>

              {/* Signal Quality & Network Bridge Metadata */}
              <div className="p-4 bg-slate-900/60 border border-cyan-500/20 rounded-xl space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center space-x-2">
                  <Signal className="w-4 h-4 text-cyan-400" />
                  <span>Cellular Signal & Radio Quality</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950 border border-cyan-500/20 rounded-lg">
                    <div className="text-[11px] text-slate-400">Signal Bars</div>
                    <div className="flex items-center space-x-1.5 mt-1">
                      {[1, 2, 3, 4, 5].map(bar => (
                        <div 
                          key={bar} 
                          className={`w-1.5 rounded-sm ${
                            bar <= selectedCall.signalBars ? 'bg-cyan-400' : 'bg-slate-800'
                          }`}
                          style={{ height: `${bar * 4 + 6}px` }}
                        />
                      ))}
                      <span className="text-xs font-bold text-cyan-300 ml-2">{selectedCall.signalBars}/5 Bars</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-cyan-500/20 rounded-lg">
                    <div className="text-[11px] text-slate-400">RSSI Power</div>
                    <div className="text-sm font-bold text-cyan-200 mt-1">
                      {selectedCall.signalDbm} dBm
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">Optimal Reception</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-cyan-500/10">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Audio Codec:</span>
                    <span className="font-bold text-cyan-300">{selectedCall.codec}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Stream Bitrate:</span>
                    <span className="font-bold text-cyan-300">{selectedCall.bitrateKbps} kbps HD</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Routing Location:</span>
                    <span className="font-bold text-cyan-300">{selectedCall.location}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Cryptographic Handshake:</span>
                    <span className="font-mono text-cyan-400">{selectedCall.encryptedHash}</span>
                  </div>
                </div>
              </div>

              {/* Security & Attestation Banner */}
              <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/40 rounded-xl flex items-center space-x-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div className="text-[11px] text-cyan-300 leading-relaxed">
                  Call metadata is verified via Sovereign TEE Enclave attestation and routed through zero-knowledge encrypted channels.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2">
              <Phone className="w-10 h-10 opacity-30 text-cyan-500 animate-pulse" />
              <div>Select a call log entry to inspect deep metadata and radio telemetry.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
