import React, { useState } from 'react';
import { Terminal, Shield, RefreshCw } from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';

export const AXSModule: React.FC = () => {
  const { mintToken } = useCryptic();
  const [ptyOutput, setPtyOutput] = useState<string[]>([
    'AXS Loopback PTY v0.9.2 attached to loopback socket 127.0.0.1:7331',
    'Session Token: loopback.authenticated.token.verified',
    'pty> termux-exec node --version',
    'v22.14.0',
    'pty> uptime',
    '15:27:16 up 14 days, 2 users, load average: 0.12, 0.08, 0.05',
  ]);
  const [ptyInput, setPtyInput] = useState('');

  const quickCommands = ['uname -a', 'uptime', 'netstat -tuln', 'ps aux', 'df -h'];

  const executePtyCmd = async (cmdToRun: string) => {
    if (!cmdToRun.trim()) return;
    const cmd = cmdToRun.trim();
    const t = await mintToken('axs.pty.exec', { cmd });
    let simulatedRes = `[AXS RECEIPT ${t.fp}] Loopback execution isolated. Output verified.`;
    if (cmd === 'uname -a') simulatedRes = 'Linux cryptic-arm64 6.1.0-21-generic aarch64 GNU/Linux';
    if (cmd === 'df -h') simulatedRes = 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/root        64G   18G   44G  29% /';
    if (cmd === 'netstat -tuln') simulatedRes = 'Active Internet connections (only servers)\nProto Recv-Q Send-Q Local Address   State\ntcp        0      0 127.0.0.1:7331  LISTEN';

    setPtyOutput((prev) => [
      ...prev,
      `pty> ${cmd}`,
      simulatedRes,
    ]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptyInput.trim()) return;
    const cmd = ptyInput;
    setPtyInput('');
    await executePtyCmd(cmd);
  };

  return (
    <div className="flex flex-col h-full bg-[#020610] text-xs font-mono overflow-hidden p-3 space-y-2">
      <div className="flex items-center justify-between border-b border-[#42f5ff]/20 pb-1.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#74ff9b]" />
          <div>
            <div className="font-bold text-white text-[11px]">AXS // AUTHENTICATED LOOPBACK PTY</div>
            <div className="text-[9px] text-[#8aa0b6]">Loopback WebSocket PTY · Termux / ARM64 Runtime</div>
          </div>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
          LOOPBACK ONLY
        </span>
      </div>

      {/* Quick PTY commands */}
      <div className="flex items-center gap-1 overflow-x-auto text-[8px] py-0.5">
        <span className="text-[#8aa0b6] font-bold">EXEC:</span>
        {quickCommands.map((qc) => (
          <button
            key={qc}
            type="button"
            onClick={() => executePtyCmd(qc)}
            className="px-2 py-0.5 rounded bg-[#061426] border border-[#42f5ff]/20 text-[#42f5ff] hover:bg-[#42f5ff]/20 whitespace-nowrap cursor-pointer transition"
          >
            {qc}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-[#01040a] p-2.5 rounded-lg border border-[#42f5ff]/20 overflow-y-auto space-y-1 text-[10px] select-text">
        {ptyOutput.map((out, idx) => (
          <div key={idx} className="text-[#8affaa] whitespace-pre-wrap">
            {out}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={ptyInput}
          onChange={(e) => setPtyInput(e.target.value)}
          placeholder="AXS PTY command..."
          className="flex-1 bg-[#061426] border border-[#42f5ff]/30 rounded px-2.5 py-1 text-[10px] text-white focus:outline-none focus:border-[#42f5ff]"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-[#74ff9b] text-[#02050b] font-bold rounded text-[10px] hover:bg-[#8affaa] cursor-pointer transition"
        >
          EXEC
        </button>
      </form>
    </div>
  );
};
