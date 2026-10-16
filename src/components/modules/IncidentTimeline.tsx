import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Clock, Terminal, RefreshCw, Filter, Zap } from 'lucide-react';

interface IncidentItem {
  id: string;
  timestamp: string;
  title: string;
  severity: 'Critical' | 'Warning' | 'Resolved' | 'Info';
  status: 'Active' | 'Resolved' | 'Mitigating';
  nodeId: string;
  description: string;
  remediation: string;
}

export const IncidentTimeline: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'Active' | 'Resolved'>('all');
  const [incidents, setIncidents] = useState<IncidentItem[]>([
    {
      id: 'inc-01',
      timestamp: '2026-10-15 20:04:12',
      title: 'TetherMesh Partition Packet Spike',
      severity: 'Warning',
      status: 'Resolved',
      nodeId: 'Node-6000-Core',
      description: 'Transient burst in packet retransmission across Vanguard Brigade nodes during high-frequency SparseBundle backup.',
      remediation: 'Automatically re-routed via Amazon Q CLI / Grok secure offsite parity channel. Zero data loss.'
    },
    {
      id: 'inc-02',
      timestamp: '2026-10-15 19:58:30',
      title: 'Soul Stone GOD Policy Integrity Check',
      severity: 'Info',
      status: 'Resolved',
      nodeId: 'Supreme-Architect',
      description: 'Scheduled cryptographic sweep of zero-trust encryption keys and hardware storage partitions.',
      remediation: 'All 6,000 agent nodes verified against sovereign baseline. 100% compliance.'
    },
    {
      id: 'inc-03',
      timestamp: '2026-10-15 19:45:10',
      title: 'ADB Wireless Debugging OTA Handshake Retrying',
      severity: 'Warning',
      status: 'Active',
      nodeId: 'Antigravity-Bridge-01',
      description: 'Android device wireless debugging tunnel awaiting ADB authorization ping over port 5555.',
      remediation: 'Tunnel daemon re-initializing connection handshake and validating SSL certificates.'
    },
    {
      id: 'inc-04',
      timestamp: '2026-10-15 19:30:00',
      title: 'Golden Army Forge Platoon Weight Allocation',
      severity: 'Resolved',
      status: 'Resolved',
      nodeId: 'Node-Vanguard-Alpha',
      description: 'Hugging Face custom model weights deployed for sub-worker agent pairing cycles.',
      remediation: 'Successfully compiled and mounted across all 2,000 Vanguard platoon containers.'
    }
  ]);

  const filteredIncidents = incidents.filter(inc => {
    if (filter === 'all') return true;
    return inc.status === filter;
  });

  const triggerNewIncident = () => {
    const newInc: IncidentItem = {
      id: `inc-0${incidents.length + 1}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      title: 'Autonomous Threat Pruning Event',
      severity: Math.random() > 0.5 ? 'Warning' : 'Critical',
      status: 'Active',
      nodeId: `Node-Shield-${Math.floor(Math.random() * 100)}`,
      description: 'Anomalous network ingress detected on secondary proxy pipe. Vanguard battalion engaged.',
      remediation: 'Isolating container sandbox and executing zero-day quarantine protocol.'
    };
    setIncidents(prev => [newInc, ...prev]);
  };

  return (
    <div className="p-4 rounded-xl bg-[#061224] border border-[#42f5ff]/30 space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 border-b border-[#42f5ff]/20 gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-[#42f5ff] text-sm flex items-center space-x-2">
              <span>INCIDENT TIMELINE: SYSTEM HAZARDS &amp; AUDIT LOG</span>
              <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-500/30 rounded text-[10px]">
                {incidents.filter(i => i.status === 'Active').length} Active Hazards
              </span>
            </div>
            <div className="text-[10px] text-zinc-400">
              Scrollable vertical timeline tracking system hazards, active remediations, and Soul Stone GOD policy sweeps.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          {['all', 'Active', 'Resolved'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st as any)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                filter === st ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(66,245,255,0.4)]' : 'bg-[#030d1a] text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}

          <button
            onClick={triggerNewIncident}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-[10px] transition shadow"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Hazard</span>
          </button>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {/* Timeline Line */}
        <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-emerald-500 opacity-40" />

        {filteredIncidents.map(inc => {
          const isResolved = inc.status === 'Resolved';
          const isCritical = inc.severity === 'Critical';
          return (
            <div key={inc.id} className="relative pl-6 group">
              {/* Timeline Node Dot */}
              <div className={`absolute -left-[19px] top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-[#030a14] ${
                isResolved ? 'border-emerald-400 text-emerald-400' :
                isCritical ? 'border-red-400 text-red-400 animate-bounce' :
                'border-amber-400 text-amber-400 animate-pulse'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isResolved ? 'bg-emerald-400' : isCritical ? 'bg-red-400' : 'bg-amber-400'}`} />
              </div>

              {/* Incident Card */}
              <div className="p-3.5 rounded-xl bg-[#030a14] border border-cyan-500/20 hover:border-cyan-400/50 transition space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-xs">{inc.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                      isResolved ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' :
                      isCritical ? 'bg-red-950 text-red-400 border-red-500/30' :
                      'bg-amber-950 text-amber-400 border-amber-500/30'
                    }`}>
                      {inc.severity}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-mono">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{inc.timestamp}</span>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-300 leading-relaxed">
                  {inc.description}
                </p>

                <div className="p-2 rounded bg-[#071324] border border-zinc-800 text-[10px] space-y-1">
                  <div className="text-cyan-300 font-semibold flex items-center justify-between">
                    <span>Remediation Action / Status: <strong className="text-emerald-400">{inc.status}</strong></span>
                    <span className="text-purple-400 font-mono text-[9px]">{inc.nodeId}</span>
                  </div>
                  <div className="text-zinc-400">{inc.remediation}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
