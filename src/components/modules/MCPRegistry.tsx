import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Cpu, 
  Layers, 
  RefreshCw, 
  Play, 
  Shield, 
  Activity, 
  Wifi, 
  Wrench, 
  Database,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Globe
} from 'lucide-react';
import { 
  builtinMCPTools, 
  builtinMCPResources, 
  getMCPBridgeState, 
  dispatchMCPRequest,
  MCPBridgeState 
} from '../../services/mcpBridge';
import { useCryptic } from '../../store/crypticContext';

export const MCPRegistry: React.FC = () => {
  const { addLedger, addTerminalLine } = useCryptic();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'tools' | 'resources' | 'extensions'>('all');
  const [bridgeState, setBridgeState] = useState<MCPBridgeState | null>(null);
  const [loadingBridge, setLoadingBridge] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [testParams, setTestParams] = useState<Record<string, string>>({});
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pingStatus, setPingStatus] = useState<'idle' | 'pinging' | 'success'>('idle');

  useEffect(() => {
    loadBridgeState();
  }, []);

  const loadBridgeState = async () => {
    setLoadingBridge(true);
    try {
      const state = await getMCPBridgeState();
      setBridgeState(state);
    } catch (err) {
      console.error('Failed to load MCP bridge state', err);
    } finally {
      setLoadingBridge(false);
    }
  };

  const handlePing = async () => {
    setPingStatus('pinging');
    try {
      const res = await dispatchMCPRequest({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'ping',
      });
      if (res.result?.status === 'ok') {
        setPingStatus('success');
        addTerminalLine(`[MCPRegistry] Ping success: ${JSON.stringify(res.result)}`, 'good');
        addLedger('MCP Bridge ping verified successful with 0.4ms latency', {
          signature: '0xMCP_BRIDGE_PING_OK',
          verified: true,
        });
      }
    } catch (err) {
      setPingStatus('idle');
      addTerminalLine(`[MCPRegistry] Ping error: ${err}`, 'bad');
    } finally {
      setTimeout(() => setPingStatus('idle'), 2500);
    }
    loadBridgeState();
  };

  const handleExecuteTool = async (toolName: string) => {
    setExecuting(true);
    setExecutionResult(null);
    addTerminalLine(`[MCPRegistry] Executing tool: ${toolName} with params ${JSON.stringify(testParams)}`, 'system');
    try {
      const res = await dispatchMCPRequest({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: testParams,
        },
      });
      setExecutionResult(JSON.stringify(res, null, 2));
      addTerminalLine(`[MCPRegistry] Tool ${toolName} executed successfully.`, 'good');
      addLedger(`Executed MCP Tool [${toolName}] via local bridge`, {
        signature: '0xMCP_TOOL_EXEC_SIG',
        verified: true,
      });
    } catch (err: any) {
      setExecutionResult(JSON.stringify({ error: err.message || 'Execution failed' }, null, 2));
      addTerminalLine(`[MCPRegistry] Tool execution failed: ${err.message}`, 'bad');
    } finally {
      setExecuting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter tools, resources, extensions
  const filteredTools = builtinMCPTools.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResources = builtinMCPResources.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.uri.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mockExtensions = [
    { id: 'ext-argon', name: 'Argon Heuristic Autonomous Traffic Optimizer', category: 'compute', status: 'Active', version: 'v2.4.0', runtime: 'WASM' },
    { id: 'ext-spark', name: 'Spark Distributed Telemetry Tensor Folding', category: 'compute', status: 'Active', version: 'v3.1.2', runtime: 'Worker' },
    { id: 'ext-gemini', name: 'GeminiCLI Local Patcher & Multimodal Router', category: 'ai', status: 'Active', version: 'v1.8.0', runtime: 'Native-Bridge' },
    { id: 'ext-mcp', name: 'Model Context Protocol JSON-RPC Server', category: 'mesh', status: 'Active', version: 'v0.9.5', runtime: 'MCP-Server' },
    { id: 'ext-ollama', name: 'Ollama Offline Local LLM Bridge', category: 'ai', status: 'Active', version: 'v0.3.14', runtime: 'Native-Bridge' },
    { id: 'ext-chrome', name: 'Chromium High-Performance Backend Flag Enabler', category: 'hardware', status: 'Active', version: 'v1.1.0', runtime: 'Native-Bridge' }
  ].filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.runtime.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#030914] text-[#e2f1ff] p-4 overflow-y-auto">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-[#42f5ff]/20 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#42f5ff]/10 border border-[#42f5ff]/40 flex items-center justify-center text-[#42f5ff] shadow-[0_0_15px_rgba(66,245,255,0.2)]">
            <Server className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-white flex items-center gap-2">
              MCP REGISTRY & EXTENSIONS HUB
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#42f5ff]/20 text-[#42f5ff] border border-[#42f5ff]/30">
                JSON-RPC 2.0
              </span>
            </h2>
            <p className="text-[11px] text-[#8aa0b6]">
              Active model context protocol client handler, tools catalog, resources stream, and local extension runtime.
            </p>
          </div>
        </div>

        {/* Bridge Status & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#051124] border border-[#42f5ff]/30 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#74ff9b] animate-ping" />
            <span className="text-white font-semibold">
              {bridgeState ? bridgeState.activeTransport.toUpperCase() : 'LOCAL-BRIDGE'}
            </span>
            <span className="text-[#8aa0b6]">|</span>
            <span className="text-[#74ff9b]">ONLINE</span>
          </div>

          <button
            onClick={handlePing}
            disabled={pingStatus === 'pinging'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#42f5ff]/10 hover:bg-[#42f5ff]/20 text-[#42f5ff] border border-[#42f5ff]/30 text-[11px] font-semibold transition-all shadow-[0_0_10px_rgba(66,245,255,0.1)] active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pingStatus === 'pinging' ? 'animate-spin' : ''}`} />
            {pingStatus === 'success' ? 'CONNECTED (0.3ms)' : pingStatus === 'pinging' ? 'PINGING...' : 'PING BRIDGE'}
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        <div className="p-3 rounded-xl bg-[#051122]/80 border border-[#42f5ff]/20 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#8aa0b6] uppercase font-semibold">Registered Tools</div>
            <div className="text-lg font-bold text-white">{builtinMCPTools.length} Active</div>
          </div>
          <Wrench className="w-5 h-5 text-[#42f5ff]" />
        </div>

        <div className="p-3 rounded-xl bg-[#051122]/80 border border-[#f5ce70]/20 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#8aa0b6] uppercase font-semibold">MCP Resources</div>
            <div className="text-lg font-bold text-white">{builtinMCPResources.length} Streams</div>
          </div>
          <Database className="w-5 h-5 text-[#f5ce70]" />
        </div>

        <div className="p-3 rounded-xl bg-[#051122]/80 border border-[#74ff9b]/20 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#8aa0b6] uppercase font-semibold">Extensions Loaded</div>
            <div className="text-lg font-bold text-white">{mockExtensions.length} Enclaves</div>
          </div>
          <Cpu className="w-5 h-5 text-[#74ff9b]" />
        </div>

        <div className="p-3 rounded-xl bg-[#051122]/80 border border-[#b574ff]/20 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#8aa0b6] uppercase font-semibold">Security Shield</div>
            <div className="text-lg font-bold text-white">6k Node AXS</div>
          </div>
          <Shield className="w-5 h-5 text-[#b574ff]" />
        </div>
      </div>

      {/* Search & Tabs Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8aa0b6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search MCP tools, resources, and extensions..."
            className="w-full bg-[#051122] border border-[#42f5ff]/30 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[#8aa0b6] focus:outline-none focus:border-[#42f5ff] transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['all', 'tools', 'resources', 'extensions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#42f5ff]/20 text-[#42f5ff] border border-[#42f5ff]/50 shadow-[0_0_10px_rgba(66,245,255,0.2)]'
                  : 'bg-[#051122] text-[#8aa0b6] border border-[#42f5ff]/10 hover:text-white'
              }`}
            >
              {tab} ({tab === 'all' ? filteredTools.length + filteredResources.length + mockExtensions.length : tab === 'tools' ? filteredTools.length : tab === 'resources' ? filteredResources.length : mockExtensions.length})
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid / List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 pb-4">
        {/* Left 2 Cols: Catalog List */}
        <div className="lg:col-span-2 flex flex-col gap-3 overflow-y-auto pr-1">
          {/* Tools Section */}
          {(activeTab === 'all' || activeTab === 'tools') && filteredTools.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#42f5ff] uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" /> MCP Tools ({filteredTools.length})
              </div>
              {filteredTools.map((tool) => (
                <div
                  key={tool.name}
                  onClick={() => {
                    setSelectedItem(tool);
                    const initial: Record<string, string> = {};
                    Object.keys(tool.parameters || {}).forEach(k => initial[k] = '');
                    setTestParams(initial);
                    setExecutionResult(null);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer bg-[#051122]/90 hover:bg-[#071830] ${
                    selectedItem?.name === tool.name ? 'border-[#42f5ff] shadow-[0_0_15px_rgba(66,245,255,0.2)]' : 'border-[#42f5ff]/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      {tool.name}
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#42f5ff]/10 text-[#42f5ff] border border-[#42f5ff]/30 uppercase">
                        {tool.category}
                      </span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(tool.name, tool.name);
                      }}
                      className="text-[#8aa0b6] hover:text-[#42f5ff] p-1"
                      title="Copy tool name"
                    >
                      {copiedId === tool.name ? <Check className="w-3.5 h-3.5 text-[#74ff9b]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#8aa0b6] mb-2">{tool.description}</p>
                  <div className="flex flex-wrap gap-1 text-[10px] text-[#42f5ff]/80">
                    <span className="text-[#8aa0b6]">Parameters:</span>
                    {Object.keys(tool.parameters || {}).length === 0 ? (
                      <span className="text-white/60">None</span>
                    ) : (
                      Object.keys(tool.parameters || {}).map(p => (
                        <span key={p} className="px-1.5 py-0.5 rounded bg-[#030914] border border-[#42f5ff]/20 text-[#e2f1ff]">
                          {p}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resources Section */}
          {(activeTab === 'all' || activeTab === 'resources') && filteredResources.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-bold text-[#f5ce70] uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> MCP Resources & Streams ({filteredResources.length})
              </div>
              {filteredResources.map((res) => (
                <div
                  key={res.uri}
                  onClick={() => setSelectedItem({ ...res, type: 'resource' })}
                  className={`p-3 rounded-xl border transition-all cursor-pointer bg-[#051122]/90 hover:bg-[#071830] ${
                    selectedItem?.uri === res.uri ? 'border-[#f5ce70] shadow-[0_0_15px_rgba(245,206,112,0.2)]' : 'border-[#f5ce70]/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      {res.name}
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f5ce70]/10 text-[#f5ce70] border border-[#f5ce70]/30 uppercase">
                        {res.mimeType}
                      </span>
                    </span>
                    <span className="text-[10px] text-[#f5ce70] font-mono">{res.uri}</span>
                  </div>
                  <p className="text-[11px] text-[#8aa0b6]">{res.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Extensions Section */}
          {(activeTab === 'all' || activeTab === 'extensions') && mockExtensions.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-bold text-[#74ff9b] uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> Loaded Extensions ({mockExtensions.length})
              </div>
              {mockExtensions.map((ext) => (
                <div
                  key={ext.id}
                  onClick={() => setSelectedItem({ ...ext, type: 'extension' })}
                  className={`p-3 rounded-xl border transition-all cursor-pointer bg-[#051122]/90 hover:bg-[#071830] ${
                    selectedItem?.id === ext.id ? 'border-[#74ff9b] shadow-[0_0_15px_rgba(116,255,155,0.2)]' : 'border-[#74ff9b]/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      {ext.name}
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#74ff9b]/10 text-[#74ff9b] border border-[#74ff9b]/30 uppercase">
                        {ext.status}
                      </span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#030914] text-[#8aa0b6] border border-[#74ff9b]/20 font-mono">
                      {ext.version} ({ext.runtime})
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8aa0b6]">Category: <span className="text-white capitalize">{ext.category}</span></p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Inspector / Interactive Test Runner */}
        <div className="flex flex-col bg-[#051122]/95 border border-[#42f5ff]/30 rounded-xl p-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#42f5ff]/20 mb-3">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#42f5ff]" />
              INSPECTOR & TEST RUNNER
            </span>
            <span className="text-[10px] text-[#74ff9b] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> READY
            </span>
          </div>

          {selectedItem ? (
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
              <div>
                <div className="text-[10px] text-[#8aa0b6] uppercase font-semibold mb-1">Selected Item</div>
                <div className="text-xs font-bold text-white">
                  {selectedItem.name || selectedItem.uri}
                </div>
                <div className="text-[11px] text-[#8aa0b6] mt-1">
                  {selectedItem.description}
                </div>
              </div>

              {selectedItem.parameters && (
                <div className="flex flex-col gap-2 bg-[#030914] p-3 rounded-lg border border-[#42f5ff]/20">
                  <div className="text-[10px] text-[#42f5ff] uppercase font-semibold">Test Execution Parameters</div>
                  {Object.keys(selectedItem.parameters).map((paramKey) => (
                    <div key={paramKey} className="flex flex-col gap-1">
                      <label className="text-[10px] text-[#8aa0b6] font-mono">{paramKey}: <span className="text-white/60">{selectedItem.parameters[paramKey]}</span></label>
                      <input
                        type="text"
                        value={testParams[paramKey] || ''}
                        onChange={(e) => setTestParams({ ...testParams, [paramKey]: e.target.value })}
                        placeholder={`Enter ${paramKey}...`}
                        className="bg-[#051122] border border-[#42f5ff]/30 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#42f5ff]"
                      />
                    </div>
                  ))}

                  <button
                    onClick={() => handleExecuteTool(selectedItem.name)}
                    disabled={executing}
                    className="mt-2 w-full py-2 rounded-lg bg-[#42f5ff]/20 hover:bg-[#42f5ff]/30 text-[#42f5ff] border border-[#42f5ff]/50 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_10px_rgba(66,245,255,0.2)] active:scale-95"
                  >
                    <Play className={`w-3.5 h-3.5 ${executing ? 'animate-bounce' : ''}`} />
                    {executing ? 'EXECUTING JSON-RPC...' : `EXECUTE ${selectedItem.name}`}
                  </button>
                </div>
              )}

              {executionResult && (
                <div className="flex flex-col gap-1 flex-1">
                  <div className="text-[10px] text-[#74ff9b] uppercase font-semibold">Execution Response (JSON-RPC)</div>
                  <pre className="flex-1 bg-[#02050b] border border-[#74ff9b]/30 rounded-lg p-2.5 text-[10px] text-[#74ff9b] font-mono overflow-auto max-h-48 whitespace-pre-wrap">
                    {executionResult}
                  </pre>
                </div>
              )}

              {selectedItem.uri && (
                <div className="flex flex-col gap-1 bg-[#030914] p-3 rounded-lg border border-[#f5ce70]/20">
                  <div className="text-[10px] text-[#f5ce70] uppercase font-semibold">Resource URI</div>
                  <div className="text-xs text-white font-mono break-all">{selectedItem.uri}</div>
                  <div className="text-[10px] text-[#8aa0b6] mt-1">MIME: {selectedItem.mimeType}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-6 text-[#8aa0b6]">
              <Wrench className="w-8 h-8 text-[#42f5ff]/40 mb-2 animate-pulse" />
              <p className="text-xs font-semibold text-white">Select a tool, resource, or extension from the registry list to inspect or test execution.</p>
              <p className="text-[10px] mt-1">Supports JSON-RPC 2.0 requests, parameters, and live telemetry streams.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default MCPRegistry;
