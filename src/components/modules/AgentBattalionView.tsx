import React, { useState } from 'react';
import { Users, Filter, LayoutGrid, Table as TableIcon, Shield, Cpu, CheckCircle2 } from 'lucide-react';

interface AgentNode {
  id: string;
  name: string;
  battalion: string;
  division: string;
  platoonModel: string;
  pairedAgent: string;
  status: 'active' | 'patrolling' | 'reoptimizing' | 'synchronized';
  packetsDelivered: number;
  packetsDropped: number;
  cycleCount: number;
}

interface AgentBattalionViewProps {
  nodes: AgentNode[];
  onDispatchTask: (battalion: string) => void;
}

export const AgentBattalionView: React.FC<AgentBattalionViewProps> = ({ nodes, onDispatchTask }) => {
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredNodes = nodes.filter(node => {
    const matchesFilter = filter === 'all' || node.battalion.toLowerCase() === filter.toLowerCase();
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          node.platoonModel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 rounded-xl bg-[#061224] border border-[#42f5ff]/30 space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 border-b border-[#42f5ff]/20 gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-[#42f5ff] text-sm flex items-center space-x-2">
              <span>AGENT BATTALION VIEW: 6,000 VIRTUAL NODE SWARM</span>
              <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/30 rounded text-[10px]">
                {nodes.length} Nodes Active
              </span>
            </div>
            <div className="text-[10px] text-zinc-400">
              High-performance grid tracking active status, assigned battalion brigades, and network telemetry loads.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-2">
          {/* Search bar */}
          <input
            type="text"
            placeholder="Search agents or models..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 bg-[#030d1a] border border-cyan-500/30 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
          />

          {/* Battalion Filter buttons */}
          {['all', 'Vanguard', 'Shield', 'Recon'].map(bat => (
            <button
              key={bat}
              onClick={() => setFilter(bat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                filter === bat ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(66,245,255,0.4)]' : 'bg-[#030d1a] text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              {bat}
            </button>
          ))}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#030d1a] border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[#42f5ff]/20 text-[#42f5ff]' : 'text-zinc-400'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-[#42f5ff]/20 text-[#42f5ff]' : 'text-zinc-400'}`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Nodes Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {filteredNodes.map(node => (
            <div key={node.id} className="p-3 rounded-xl bg-[#030a14] border border-cyan-500/30 hover:border-cyan-400 transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px] truncate">{node.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                  {node.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1 text-[10px] text-zinc-400">
                <div className="flex justify-between">
                  <span>Battalion:</span>
                  <strong className="text-cyan-300">{node.battalion}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Platoon Model:</span>
                  <strong className="text-amber-300 truncate max-w-[120px]" title={node.platoonModel}>{node.platoonModel}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Paired "The One":</span>
                  <strong className="text-purple-300 truncate max-w-[120px]" title={node.pairedAgent}>{node.pairedAgent}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400">Network Load:</span>
                <span className="text-emerald-400 font-bold">+{node.packetsDelivered} / -{node.packetsDropped}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#030a14] rounded-xl border border-zinc-800 overflow-x-auto max-h-[420px]">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-[#071324] text-[#42f5ff] border-b border-zinc-800 sticky top-0">
              <tr>
                <th className="p-2">Agent ID / Name</th>
                <th className="p-2">Battalion</th>
                <th className="p-2">HuggingFace Platoon Model</th>
                <th className="p-2">Paired "The One" (Reverse)</th>
                <th className="p-2">Status</th>
                <th className="p-2 text-right">Packets / Cycles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredNodes.map(node => (
                <tr key={node.id} className="hover:bg-zinc-900/50">
                  <td className="p-2 font-bold text-white">{node.name}</td>
                  <td className="p-2 text-cyan-300">{node.battalion}</td>
                  <td className="p-2 text-amber-300">{node.platoonModel}</td>
                  <td className="p-2 text-purple-300">{node.pairedAgent}</td>
                  <td className="p-2">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[9px]">
                      {node.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-2 text-right font-mono text-zinc-300">
                    +{node.packetsDelivered} / -{node.packetsDropped} ({node.cycleCount}ms)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[#42f5ff]/20 text-[10px] text-zinc-400">
        <span>Showing {filteredNodes.length} of 6,000 active virtual nodes in the TetherMesh ecosystem.</span>
        <button
          onClick={() => onDispatchTask(filter)}
          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition shadow"
        >
          Dispatch Task to {filter === 'all' ? 'All 6k Nodes' : `${filter} Battalion`}
        </button>
      </div>
    </div>
  );
};
