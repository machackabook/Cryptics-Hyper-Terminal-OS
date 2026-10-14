import React, { useState } from 'react';
import { useCryptic } from '../../store/crypticContext';
import { MessageSquare, Send, Users, ShieldCheck, Sparkles } from 'lucide-react';

export const NexusIRCModule: React.FC = () => {
  const { ircMessages, sendIRC } = useCryptic();
  const [activeChannel, setActiveChannel] = useState('#sovereign');
  const [inputMsg, setInputMsg] = useState('');

  const channels = ['#sovereign', '#gaia-mesh', '#cryptic-dev'];

  const quickBroadcasts = [
    'Emergency Corridors Mapped',
    '963 Hz Harmonic Carrier Online',
    'Quorum Confirmed 4/4',
    'Plus Codes GPS Linked',
  ];

  const filteredMessages = ircMessages.filter((m) => m.channel === activeChannel);

  const handleSend = (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const content = textOverride || inputMsg;
    if (!content.trim()) return;
    sendIRC(activeChannel, content.trim());
    if (!textOverride) setInputMsg('');
  };

  return (
    <div className="flex flex-col h-full bg-[#020610] text-xs font-mono overflow-hidden">
      {/* Channel subheader */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#42f5ff]/20 bg-[#040e1c]">
        <div className="flex items-center gap-1.5">
          {channels.map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                activeChannel === ch
                  ? 'bg-[#42f5ff] text-[#02050b]'
                  : 'text-[#8aa0b6] hover:text-white'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
        <span className="text-[9px] text-[#74ff9b] flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#74ff9b]" /> ENCRYPTED MESH
        </span>
      </div>

      {/* Quick broadcast pills */}
      <div className="flex items-center gap-1 px-3 py-1 bg-[#030b18] border-b border-[#42f5ff]/10 overflow-x-auto text-[8px]">
        <span className="text-[#8aa0b6] font-bold flex-shrink-0">QUICK:</span>
        {quickBroadcasts.map((qb) => (
          <button
            key={qb}
            type="button"
            onClick={() => handleSend(undefined, qb)}
            className="px-2 py-0.5 rounded bg-[#061426] border border-[#42f5ff]/20 text-[#42f5ff] hover:bg-[#42f5ff]/20 whitespace-nowrap cursor-pointer transition"
          >
            {qb}
          </button>
        ))}
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-[#01040a]/90 select-text">
        {filteredMessages.map((msg) => (
          <div key={msg.id} className="p-2 rounded bg-[#061426] border border-[#42f5ff]/15 space-y-1">
            <div className="flex items-center justify-between text-[9px]">
              <span className="font-bold text-[#42f5ff] flex items-center gap-1">
                &lt;{msg.sender}&gt;
                {msg.verified && <span className="text-[8px] text-[#74ff9b] font-bold">✓</span>}
              </span>
              <span className="text-[#8aa0b6]">{msg.timestamp}</span>
            </div>
            <div className="text-white text-[10px] leading-relaxed">{msg.text}</div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <form onSubmit={(e) => handleSend(e)} className="p-2 border-t border-[#42f5ff]/20 bg-[#040d1a] flex gap-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder={`Broadcast encrypted packet to ${activeChannel}...`}
          className="flex-1 bg-[#061426] border border-[#42f5ff]/30 rounded px-2.5 py-1 text-[10px] text-white focus:outline-none focus:border-[#42f5ff]"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-[#42f5ff] text-[#02050b] font-bold rounded text-[10px] hover:bg-[#74f8ff] cursor-pointer flex items-center gap-1 transition"
        >
          <Send className="w-3 h-3" /> SEND
        </button>
      </form>
    </div>
  );
};
