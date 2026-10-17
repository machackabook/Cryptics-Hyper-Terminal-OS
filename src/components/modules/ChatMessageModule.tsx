import React, { useState } from 'react';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Video, 
  Send, 
  ShieldCheck, 
  Lock, 
  Paperclip, 
  Maximize2, 
  X, 
  CheckCircle2, 
  Radio, 
  Download, 
  Play, 
  FileText,
  User,
  Clock
} from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';

interface ChatMessage {
  id: string;
  sender: string;
  recipient: string;
  text: string;
  timestamp: string;
  mediaType?: 'image' | 'video' | 'document';
  mediaUrl?: string;
  mediaCaption?: string;
  status: 'SECURE_DELIVERED' | 'ENCRYPTED' | 'PENDING';
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'OPERATOR-01 (HQ)',
    recipient: 'SOVEREIGN-NODE-07',
    text: 'Transmitting secure satellite reconnaissance package and thermal telemetry maps.',
    timestamp: '01:32:10',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    mediaCaption: 'Global Neural Telemetry Grid & Satellite Overlay (Sector 9)',
    status: 'SECURE_DELIVERED'
  },
  {
    id: 'msg-2',
    sender: 'SOVEREIGN-NODE-07',
    recipient: 'OPERATOR-01 (HQ)',
    text: 'Received. Verifying signal integrity across quantum mesh bridge. Video feed attached below.',
    timestamp: '01:34:22',
    mediaType: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-code-31934-large.mp4',
    mediaCaption: 'Encrypted Tactical Uplink & Quantum Key Distribution Stream',
    status: 'SECURE_DELIVERED'
  },
  {
    id: 'msg-3',
    sender: 'OPERATOR-01 (HQ)',
    recipient: 'SOVEREIGN-NODE-07',
    text: 'Encryption handshake confirmed. Proceed with the arbitrage liquidity injection.',
    timestamp: '01:38:05',
    status: 'SECURE_DELIVERED'
  }
];

export const ChatMessageModule: React.FC = () => {
  const { addTerminalLine, addLedger } = useCryptic();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'media'>('all');
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video'; caption: string } | null>(null);
  const [attachType, setAttachType] = useState<'none' | 'image' | 'video'>('none');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && attachType === 'none') return;

    let mediaUrl: string | undefined;
    let mediaCaption: string | undefined;

    if (attachType === 'image') {
      mediaUrl = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop';
      mediaCaption = 'Encrypted Tactical Cipher Document & Matrix Stream';
    } else if (attachType === 'video') {
      mediaUrl = 'https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-background-with-lines-and-dots-42410-large.mp4';
      mediaCaption = 'Secure Live VoIP Telemetry Stream #42';
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'SOVEREIGN-OPERATOR',
      recipient: 'GLOBAL-MESH-DISPATCH',
      text: inputText.trim() || (attachType !== 'none' ? `[Attached Secure ${attachType.toUpperCase()} Payload]` : ''),
      timestamp: new Date().toLocaleTimeString(),
      mediaType: attachType !== 'none' ? attachType : undefined,
      mediaUrl,
      mediaCaption,
      status: 'SECURE_DELIVERED'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setAttachType('none');
    addTerminalLine(`[VOIP CHAT]: Secure message dispatched with eSIM end-to-end AES-256 encryption.`, 'good');
    addLedger('voip.chat.message_sent', { hasMedia: !!mediaUrl, type: attachType });
  };

  const filteredMessages = activeTab === 'media' 
    ? messages.filter(m => m.mediaUrl)
    : messages;

  return (
    <div className="h-full flex flex-col bg-[#020610] text-slate-100 font-mono text-xs select-none relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#040d1a] border-b border-cyan-500/30 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <MessageSquare className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-cyan-300 text-sm tracking-wide flex items-center space-x-2">
              <span>SECURE VOIP &amp; MULTIMEDIA CHAT</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                AES-256 SECURED
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              End-to-end encrypted messaging with inline image/video rendering and lightboxed inspection.
            </div>
          </div>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-lg border border-cyan-500/20">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(66,245,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'media'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(66,245,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Media Attachments ({messages.filter(m => m.mediaUrl).length})
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.map(msg => (
          <div 
            key={msg.id} 
            className={`flex flex-col max-w-xl p-3.5 rounded-xl border ${
              msg.sender === 'SOVEREIGN-OPERATOR'
                ? 'ml-auto bg-cyan-950/40 border-cyan-500/30 text-cyan-100 shadow-[0_0_15px_rgba(66,245,255,0.1)]'
                : 'mr-auto bg-slate-900/80 border-slate-700/60 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 pb-1 border-b border-white/10">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <User className="w-3 h-3 text-cyan-400" />
                {msg.sender}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {msg.timestamp}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed mb-2">{msg.text}</p>

            {/* Multimedia Attachment Rendering */}
            {msg.mediaUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border border-cyan-500/30 bg-black/50 group relative">
                {msg.mediaType === 'image' ? (
                  <div className="relative aspect-video max-h-56 overflow-hidden">
                    <img 
                      src={msg.mediaUrl} 
                      alt={msg.mediaCaption || 'Media'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => setSelectedMedia({ url: msg.mediaUrl!, type: 'image', caption: msg.mediaCaption || '' })}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                    >
                      <div className="px-3 py-1.5 bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg shadow-lg flex items-center gap-1.5 text-xs">
                        <Maximize2 className="w-3.5 h-3.5" />
                        Inspect in Lightbox
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="relative aspect-video max-h-56 bg-black flex items-center justify-center overflow-hidden">
                    <video 
                      src={msg.mediaUrl} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 justify-between">
                      <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" /> Encrypted Video Feed
                      </span>
                      <button
                        onClick={() => setSelectedMedia({ url: msg.mediaUrl!, type: 'video', caption: msg.mediaCaption || '' })}
                        className="px-3 py-1 bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-1.5 text-[10px] cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" /> Fullscreen Stream
                      </button>
                    </div>
                  </div>
                )}

                {msg.mediaCaption && (
                  <div className="p-2 bg-slate-950 text-[10px] text-cyan-300/90 border-t border-cyan-500/20 flex items-center justify-between">
                    <span>{msg.mediaCaption}</span>
                    <span className="text-[9px] text-emerald-400">Verified e2e</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-2 pt-1.5 text-[9px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3 h-3" /> {msg.status}
              </span>
              <span className="text-cyan-400">eSIM Tunnel: Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar with Attachment Options */}
      <form onSubmit={handleSendMessage} className="p-3 bg-[#040d1a] border-t border-cyan-500/30 flex flex-col gap-2 shrink-0">
        {attachType !== 'none' && (
          <div className="flex items-center justify-between bg-cyan-950/60 border border-cyan-500/40 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-cyan-300 flex items-center gap-2">
              <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
              Attached Payload: <b className="uppercase">{attachType}</b> (Ready for secure dispatch)
            </span>
            <button
              type="button"
              onClick={() => setAttachType('none')}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Attachment buttons */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-cyan-500/30">
            <button
              type="button"
              onClick={() => setAttachType('image')}
              title="Attach Secure Image"
              className={`p-1.5 rounded transition-all cursor-pointer ${
                attachType === 'image' ? 'bg-cyan-500 text-slate-950' : 'text-cyan-400 hover:bg-cyan-500/20'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setAttachType('video')}
              title="Attach Secure Video Stream"
              className={`p-1.5 rounded transition-all cursor-pointer ${
                attachType === 'video' ? 'bg-cyan-500 text-slate-950' : 'text-cyan-400 hover:bg-cyan-500/20'
              }`}
            >
              <Video className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Type encrypted VoIP message or dispatch secure payload..."
            className="flex-1 bg-slate-900 border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-[0_0_15px_rgba(66,245,255,0.4)] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Transmit</span>
          </button>
        </div>
      </form>

      {/* Lightbox Modal for Media Inspection */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute top-4 right-4 flex items-center space-x-3">
            <a
              href={selectedMedia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Download Original
            </a>
            <button
              onClick={() => setSelectedMedia(null)}
              className="p-2 bg-slate-800/80 hover:bg-red-950 text-slate-300 hover:text-red-400 border border-slate-700 rounded-lg transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-w-4xl max-h-[80vh] w-full flex flex-col items-center justify-center">
            {selectedMedia.type === 'image' ? (
              <img 
                src={selectedMedia.url} 
                alt="Lightbox inspection" 
                className="max-h-[70vh] max-w-full object-contain rounded-xl border border-cyan-500/50 shadow-2xl"
              />
            ) : (
              <video 
                src={selectedMedia.url} 
                controls 
                autoPlay 
                className="max-h-[70vh] max-w-full rounded-xl border border-cyan-500/50 shadow-2xl"
              />
            )}
            
            {selectedMedia.caption && (
              <div className="mt-4 text-center">
                <div className="text-cyan-300 text-sm font-bold">{selectedMedia.caption}</div>
                <div className="text-[10px] text-slate-400 mt-1">Inspected via Sovereign Secure Lightbox Engine • AES-256 Verified</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
