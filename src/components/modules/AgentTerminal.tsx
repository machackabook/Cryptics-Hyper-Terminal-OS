import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, CheckCircle2, AlertCircle, RefreshCw, Cpu, Shield } from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success';
  text: string;
  timestamp: string;
}

export const AgentTerminal: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [history, setHistory] = useState<TerminalLine[]>([
    { id: '1', type: 'output', text: '[AgentTerminal v1.0]: Connected to 6,000-node virtual swarm via TetherMesh socket.', timestamp: '20:05:00' },
    { id: '2', type: 'success', text: '[Soul Stone]: Zero-trust encryption keys and GOD policy governance validated.', timestamp: '20:05:01' },
    { id: '3', type: 'output', text: 'Type "help" to view available agent control commands.', timestamp: '20:05:02' }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const timeStr = new Date().toLocaleTimeString();
    const newInput: TerminalLine = {
      id: Date.now().toString(),
      type: 'input',
      text: `$ ${cmd}`,
      timestamp: timeStr
    };

    setHistory(prev => [...prev, newInput]);
    setInput('');

    // Input validation & command execution simulation
    setTimeout(() => {
      let response: TerminalLine;
      const lower = cmd.toLowerCase();

      if (lower === 'help') {
        response = {
          id: (Date.now() + 1).toString(),
          type: 'output',
          text: 'Available Commands:\n  - swarm reoptimize : Rebalances 6k agent nodes & network throughput\n  - battalion deploy [name] : Deploys HuggingFace model weights to battalion\n  - pulse sync : Synchronizes sub-second 33.3ms packet delivery cycles\n  - audit check : Runs Soul Stone GOD policy compliance sweep\n  - clear : Clears terminal history',
          timestamp: new Date().toLocaleTimeString()
        };
      } else if (lower === 'swarm reoptimize') {
        response = {
          id: (Date.now() + 1).toString(),
          type: 'success',
          text: '[SWARM]: Successfully re-evaluated all 6,000 agent processes. Reallocated network throughput and deployed zero-day security patches.',
          timestamp: new Date().toLocaleTimeString()
        };
      } else if (lower.startsWith('battalion deploy')) {
        const parts = cmd.split(' ');
        const batName = parts[2] || 'Vanguard';
        response = {
          id: (Date.now() + 1).toString(),
          type: 'success',
          text: `[BATTALION]: Deployed Golden Army Forge platoon model to ${batName} brigade across 2,000 sandbox containers.`,
          timestamp: new Date().toLocaleTimeString()
        };
      } else if (lower === 'pulse sync') {
        response = {
          id: (Date.now() + 1).toString(),
          type: 'success',
          text: '[PULSE]: Sub-second 33.3ms packet cycle synchronized. Drop rate: -0.00%.',
          timestamp: new Date().toLocaleTimeString()
        };
      } else if (lower === 'audit check') {
        response = {
          id: (Date.now() + 1).toString(),
          type: 'success',
          text: '[SOUL STONE]: GOD policy compliance sweep completed. 0 policy deviations detected.',
          timestamp: new Date().toLocaleTimeString()
        };
      } else if (lower === 'clear') {
        setHistory([]);
        return;
      } else {
        response = {
          id: (Date.now() + 1).toString(),
          type: 'error',
          text: `[ERROR]: Unrecognized command "${cmd}". Type "help" for valid syntax.`,
          timestamp: new Date().toLocaleTimeString()
        };
      }

      setHistory(prev => [...prev, response]);
    }, 300);
  };

  return (
    <div className="p-4 rounded-xl bg-[#061224] border border-[#42f5ff]/30 space-y-3 font-mono">
      <div className="flex items-center justify-between pb-2 border-b border-[#42f5ff]/20">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#42f5ff] text-xs">AGENT TERMINAL: COMMAND CONTROL CONSOLE</div>
            <div className="text-[9px] text-zinc-400">Send control commands to the 6,000 virtual agent swarm with input validation.</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-bold">Secure PTY Active</span>
        </div>
      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex items-center space-x-2 flex-wrap gap-1 text-[10px]">
        <span className="text-zinc-400">Quick Commands:</span>
        {['help', 'swarm reoptimize', 'battalion deploy Vanguard', 'pulse sync', 'audit check'].map(suggestion => (
          <button
            key={suggestion}
            onClick={() => setInput(suggestion)}
            className="px-2 py-0.5 rounded bg-[#030d1a] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Terminal Output Viewer */}
      <div className="bg-[#030a14] border border-zinc-800 rounded-xl p-3 h-52 overflow-y-auto space-y-2 text-[10px]">
        {history.map(item => (
          <div key={item.id} className={`space-y-0.5 ${
            item.type === 'input' ? 'text-cyan-300 font-bold' :
            item.type === 'success' ? 'text-emerald-400' :
            item.type === 'error' ? 'text-red-400' :
            'text-zinc-300'
          }`}>
            <div className="flex items-center justify-between text-[9px] text-zinc-500 font-sans">
              <span>{item.timestamp}</span>
            </div>
            <div className="whitespace-pre-wrap">{item.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Command Input Form */}
      <form onSubmit={handleCommandSubmit} className="flex items-center space-x-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-2.5 text-cyan-400 font-bold text-xs">$</span>
          <input
            type="text"
            placeholder="Type agent control command (e.g., swarm reoptimize)..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full pl-7 pr-3 py-2 bg-[#030a14] border border-cyan-500/30 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs flex items-center space-x-1.5 transition shadow"
        >
          <span>Execute</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
