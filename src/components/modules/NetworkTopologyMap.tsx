import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Globe, RefreshCw, Layers, Shield, Cpu, Zap, Activity } from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  group: 'Vanguard' | 'Shield' | 'Recon' | 'GodSovereign' | 'Gateway';
  val: number;
  latency: number;
  status: string;
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  source: string | NodeDatum;
  target: string | NodeDatum;
  value: number;
}

export const NetworkTopologyMap: React.FC = () => {
  const { addTerminalLine } = useCryptic();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeDatum | null>(null);
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [filterGroup, setFilterGroup] = useState<string>('all');

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 500;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Sample representative nodes for the 6k cluster
    const rawNodes: NodeDatum[] = [
      { id: 'gw-core', name: 'TetherMesh Core Gateway', group: 'Gateway', val: 30, latency: 0.4, status: 'Optimal' },
      { id: 'god-stone', name: 'Soul Stone GOD Enforcer', group: 'GodSovereign', val: 25, latency: 0.8, status: 'Enforced' },
      { id: 'vang-1', name: 'Vanguard Alpha Node (2k)', group: 'Vanguard', val: 20, latency: 1.2, status: 'Active' },
      { id: 'vang-2', name: 'Vanguard Beta Node', group: 'Vanguard', val: 18, latency: 1.5, status: 'Active' },
      { id: 'shield-1', name: 'Shield Auth Guard (2k)', group: 'Shield', val: 20, latency: 1.1, status: 'Synchronized' },
      { id: 'shield-2', name: 'Shield Firewall Node', group: 'Shield', val: 16, latency: 1.4, status: 'Synchronized' },
      { id: 'recon-1', name: 'Recon Anomaly Scanner (1.5k)', group: 'Recon', val: 20, latency: 2.1, status: 'Patrolling' },
      { id: 'recon-2', name: 'Recon Telemetry Node', group: 'Recon', val: 15, latency: 1.9, status: 'Patrolling' },
      { id: 'ai-gaia', name: 'Hey GAIA Muse Node', group: 'Gateway', val: 18, latency: 1.0, status: 'Connected' },
      { id: 'ai-q', name: 'Amazon Q CLI / Grok Node', group: 'Gateway', val: 18, latency: 1.3, status: 'Backup Active' },
    ];

    const rawLinks: LinkDatum[] = [
      { source: 'gw-core', target: 'god-stone', value: 3 },
      { source: 'gw-core', target: 'vang-1', value: 2 },
      { source: 'gw-core', target: 'shield-1', value: 2 },
      { source: 'gw-core', target: 'recon-1', value: 2 },
      { source: 'vang-1', target: 'vang-2', value: 1 },
      { source: 'shield-1', target: 'shield-2', value: 1 },
      { source: 'recon-1', target: 'recon-2', value: 1 },
      { source: 'god-stone', target: 'vang-1', value: 2 },
      { source: 'god-stone', target: 'shield-1', value: 2 },
      { source: 'gw-core', target: 'ai-gaia', value: 2 },
      { source: 'gw-core', target: 'ai-q', value: 2 },
    ];

    const filteredNodes = filterGroup === 'all' 
      ? rawNodes 
      : rawNodes.filter(n => n.group.toLowerCase() === filterGroup.toLowerCase() || n.group === 'Gateway');

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = rawLinks.filter(l => {
      const sId = typeof l.source === 'object' ? (l.source as NodeDatum).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as NodeDatum).id : l.target;
      return filteredNodeIds.has(sId as string) && filteredNodeIds.has(tId as string);
    });

    const simulation = d3.forceSimulation<NodeDatum>(filteredNodes)
      .force('link', d3.forceLink<NodeDatum, LinkDatum>(filteredLinks).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-250))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const link = g.append('g')
      .selectAll('line')
      .data(filteredLinks)
      .join('line')
      .attr('stroke', '#42f5ff')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', d => Math.sqrt(d.value) * 1.5);

    const colorMap: Record<string, string> = {
      Gateway: '#42f5ff',
      GodSovereign: '#a855f7',
      Vanguard: '#74ff9b',
      Shield: '#f5ce70',
      Recon: '#38bdf8'
    };

    const node = g.append('g')
      .selectAll('g')
      .data(filteredNodes)
      .join('g')
      .call(d3.drag<any, NodeDatum>()
        .on('start', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any);

    node.append('circle')
      .attr('r', d => d.val)
      .attr('fill', d => colorMap[d.group] || '#42f5ff')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d);
        addTerminalLine(`[TOPOLOGY MAP]: Selected node ${d.name} (${d.latency}ms latency).`, 'good');
      });

    node.append('text')
      .text(d => d.name.split(' ')[0])
      .attr('x', 14)
      .attr('y', 4)
      .attr('fill', '#cbd5e1')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as NodeDatum).x ?? 0)
        .attr('y1', d => (d.source as NodeDatum).y ?? 0)
        .attr('x2', d => (d.target as NodeDatum).x ?? 0)
        .attr('y2', d => (d.target as NodeDatum).y ?? 0);

      node
        .attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    if (!simulationActive) {
      simulation.stop();
    }

    return () => {
      simulation.stop();
    };
  }, [filterGroup, simulationActive]);

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-mono text-xs select-none p-4 space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Globe className="w-5 h-5 animate-spin" style={{ animationDuration: '15s' }} />
          </div>
          <div>
            <div className="font-bold text-cyan-400 text-sm tracking-wider">
              NETWORK TOPOLOGY MAP // 6,000 VIRTUAL NODE FORCE GRAPH
            </div>
            <div className="text-slate-400 text-[11px]">
              D3.js force-directed visualization of inter-connectivity, latency paths, and TetherMesh routing.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {['all', 'Vanguard', 'Shield', 'Recon'].map(g => (
            <button
              key={g}
              onClick={() => setFilterGroup(g)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                filterGroup === g ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(66,245,255,0.4)]' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
          <button
            onClick={() => setSimulationActive(!simulationActive)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition border ${
              simulationActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}
          >
            {simulationActive ? 'Sim Active' : 'Sim Paused'}
          </button>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 relative bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex">
        <svg ref={svgRef} className="w-full h-full" />

        {/* Selected Node Inspector Sidebar */}
        {selectedNode && (
          <div className="absolute right-4 top-4 w-72 bg-slate-950/90 border border-cyan-500/40 rounded-xl p-4 space-y-3 backdrop-blur-md shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-cyan-300 text-xs">Node Inspector</span>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div>Name: <strong className="text-white">{selectedNode.name}</strong></div>
              <div>Battalion: <strong className="text-cyan-400">{selectedNode.group}</strong></div>
              <div>Latency Path: <strong className="text-emerald-400">{selectedNode.latency} ms</strong></div>
              <div>Status: <strong className="text-purple-400">{selectedNode.status}</strong></div>
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[10px] text-slate-400">
              Zero-trust secure routing over TetherMesh virtual cluster backbone.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
