import React, { useState } from 'react';
import { Shield, Lock, Key, CheckCircle2, Mail, User, LogOut, Terminal, AlertCircle } from 'lucide-react';
import { useCryptic } from '../store/crypticContext';

interface VaultAccessProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VaultAccess: React.FC<VaultAccessProps> = ({ isOpen, onClose }) => {
  const { session, verifySessionAndEnterGateway, logoutSession, addTerminalLine } = useCryptic();
  const [email, setEmail] = useState('architect@cryptic.mesh');
  const [passkey, setPasskey] = useState('137451921129154222');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await verifySessionAndEnterGateway('Supreme Architect', passkey, true);
      if (result.success) {
        addTerminalLine(`[VAULT ACCESS]: Firebase Auth authenticated successfully for ${email}. Administrative network control unlocked.`, 'good');
        onClose();
      } else {
        setError('Invalid passkey or credentials. Required passkey: 137451921129154222');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    logoutSession();
    addTerminalLine('[VAULT ACCESS]: Session locked. Administrative control revoked.', 'warn');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 font-mono select-none">
      <div className="w-full max-w-md bg-[#061224] border-2 border-cyan-500/50 rounded-2xl p-6 space-y-6 shadow-[0_0_40px_rgba(66,245,255,0.25)] animate-fadeIn">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/40 rounded-xl text-cyan-400">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-cyan-400 text-sm tracking-wider">
                FIREBASE VAULT ACCESS
              </div>
              <div className="text-[11px] text-slate-400">
                Administrative Control &amp; Network Gate
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-lg px-2 py-1 rounded bg-slate-900 border border-slate-800"
          >
            ✕
          </button>
        </div>

        {session ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Vault Unlocked: {session.operatorCallsign}</div>
              <div className="text-[11px] text-emerald-400 mt-1">Firebase Auth Sovereign Session Active</div>
            </div>

            <div className="p-3 bg-[#030d1a] border border-cyan-500/30 rounded-xl text-left text-[11px] space-y-1 text-slate-300 font-mono">
              <div>Role: <span className="text-cyan-400 font-bold">Supreme Architect</span></div>
              <div>Clearance: <span className="text-purple-400 font-bold">GOD-SOVEREIGN-LEVEL-9</span></div>
              <div>Network Access: <span className="text-emerald-400 font-bold">Full 6k Node Control</span></div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 bg-red-600/30 hover:bg-red-600/40 border border-red-500/50 text-red-300 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Lock Vault &amp; Sign Out</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl text-[11px] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-300 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Firebase Auth Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#030a14] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-300 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                <span>Architect Passkey (Entry Code)</span>
              </label>
              <input
                type="password"
                value={passkey}
                onChange={e => setPasskey(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#030a14] border border-cyan-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                placeholder="137451921129154222"
              />
            </div>

            <div className="text-[10px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              Note: Unlocks administrative control over the 6,000 virtual agent nodes, TetherMesh partitions, and Soul Stone GOD policy governance.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-[0_0_20px_rgba(66,245,255,0.4)]"
            >
              {loading ? (
                <span>Authenticating with Firebase...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate &amp; Unlock Vault</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
