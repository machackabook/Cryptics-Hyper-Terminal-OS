import React, { useState, useRef, useEffect } from 'react';
import { useCryptic } from '../../store/crypticContext';
import { Terminal as TerminalIcon, Send, Trash2, Shield, Sparkles } from 'lucide-react';

export const TerminalModule: React.FC = () => {
  const { terminalLines, execCommand, clearTerminal } = useCryptic();
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const cmd = inputVal;
    setInputVal('');
    setHistory((prev) => [...prev, cmd]);
    setHistoryIdx(-1);
    await execCommand(cmd);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputVal(history[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setInputVal('');
      } else {
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx] || '');
      }
    }
  };

  const quickPills = [
    'help',
    'status',
    'gaia verify',
    '/gemini',
    'globe',
    'consensus vote',
    'genie wish Optimize routing',
    'tokens',
    '963 on',
  ];

  return (
    <div className="flex flex-col h-full bg-[#02050b] text-xs font-mono overflow-hidden">
      {/* Quick suggestions header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#42f5ff]/20 bg-[#051020] gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 flex-nowrap">
          <span className="text-[9px] text-[#74ff9b] font-bold">QUICK:</span>
          {quickPills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => execCommand(pill)}
              className="px-2 py-0.5 rounded bg-[#061426] border border-[#42f5ff]/25 text-[9px] text-[#42f5ff] hover:bg-[#42f5ff]/20 whitespace-nowrap cursor-pointer transition"
            >
              {pill}
            </button>
          ))}
        </div>
        <button
          onClick={clearTerminal}
          title="Clear Terminal Output"
          className="text-[#8aa0b6] hover:text-red-400 p-1 cursor-pointer flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Terminal log output */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1.5 bg-[#01040a]/90 select-text">
        {terminalLines.map((line) => {
          let color = 'text-[#9bb3cf]';
          if (line.type === 'user') color = 'text-white font-bold';
          if (line.type === 'good') color = 'text-[#74ff9b]';
          if (line.type === 'warn') color = 'text-[#f5ce70]';
          if (line.type === 'bad') color = 'text-red-400 font-bold';
          if (line.type === 'token') color = 'text-[#42f5ff] font-semibold';
          if (line.type === 'ai') color = 'text-[#c084fc] font-medium';

          return (
            <div key={line.id} className="leading-relaxed">
              <span className="text-[9px] text-[#42f5ff]/40 mr-2 select-none">[{line.time}]</span>
              <span className={`whitespace-pre-wrap break-words ${color}`}>{line.text}</span>
              {line.receipt && (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-[#42f5ff]/10 text-[9px] text-[#42f5ff] border border-[#42f5ff]/30 select-all">
                  fp:{line.receipt}
                </span>
              )}
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 border-t border-[#42f5ff]/20 bg-[#050f1e]">
        <div className="text-[#42f5ff] font-bold select-none flex items-center gap-1">
          <TerminalIcon className="w-3.5 h-3.5" />
          <span>&gt;</span>
        </div>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Type command or "help"...'
          autoFocus
          className="flex-1 bg-transparent border-0 text-white text-xs focus:outline-none placeholder-[#42f5ff]/30 font-mono"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-[#42f5ff]/20 text-[#42f5ff] border border-[#42f5ff]/40 rounded hover:bg-[#42f5ff]/30 cursor-pointer flex items-center gap-1 text-[10px] font-bold tracking-wider"
        >
          <Send className="w-3 h-3" /> RUN
        </button>
      </form>
    </div>
  );
};
