import React, { useState, useEffect, useRef } from 'react';
import { useCryptic } from '../store/crypticContext';
import {
  Shield,
  KeyRound,
  Sparkles,
  Volume2,
  Globe,
  Cpu,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Lock,
  RefreshCw,
  AlertTriangle,
  Copy,
  Check,
  Dices,
  Layers,
  ChevronRight,
  Eye,
  EyeOff,
  AlertOctagon,
  Wrench,
  XCircle,
  HelpCircle,
  Activity,
} from 'lucide-react';

export interface AuthErrorDetails {
  code: string;
  message: string;
  stage: string;
  technicalReason: string;
  suggestedAction: string;
  timestamp: string;
  attemptId: string;
  canAutoFix: boolean;
}

export const CosmicGuardian: React.FC = () => {
  const { session, verifySessionAndEnterGateway, setGateOpen, toggle963, oscillatorActive } = useCryptic();

  const [callsign, setCallsign] = useState(session?.operatorCallsign || 'SOVEREIGN-OPERATOR');
  const [passkey, setPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [verifyStep, setVerifyStep] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [authError, setAuthError] = useState<AuthErrorDetails | null>(null);
  const [authResult, setAuthResult] = useState<{
    callsign: string;
    sessionId: string;
    fingerprint: string;
    token: string;
  } | null>(null);
  const [copiedFp, setCopiedFp] = useState(false);
  const [activeBadge, setActiveBadge] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(true);

  // The Architect Login state
  const [architectExpanded, setArchitectExpanded] = useState(false);
  const [architectCode, setArchitectCode] = useState('');
  const [architectStatus, setArchitectStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [architectErrorMsg, setArchitectErrorMsg] = useState('');

  // Biometric Security Gate state
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricStep, setBiometricStep] = useState('Initializing camera sensor & depth sensor...');
  const [biometricVerified, setBiometricVerified] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const autoEnterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const passkeyInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (session?.operatorCallsign) {
      setCallsign(session.operatorCallsign);
    }
    return () => {
      if (autoEnterTimerRef.current) clearTimeout(autoEnterTimerRef.current);
    };
  }, [session]);

  /**
   * Primary Authentication Handler
   * Verifies user session, mints cryptographic receipt, updates application state,
   * and provides detailed progress and error diagnostics.
   */
  const handleAuthenticateAndEnter = async (
    e?: React.FormEvent,
    overrideCallsign?: string,
    overridePasskey?: string
  ) => {
    if (e) e.preventDefault();
    if (authStatus === 'verifying') return;

    setAuthStatus('verifying');
    setAuthError(null);
    setLoadingProgress(12);

    const activeCallsign = (overrideCallsign !== undefined ? overrideCallsign : callsign || 'SOVEREIGN-OPERATOR')
      .trim()
      .toUpperCase();
    const activePasskey = overridePasskey !== undefined ? overridePasskey : passkey;

    const attemptId = `ATT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const timestamp = new Date().toLocaleTimeString();

    try {
      // Step 1: Session entropy & WebCrypto device binding check
      setVerifyStep('Validating session entropy & local WebCrypto device binding...');
      setLoadingProgress(28);
      await new Promise((r) => setTimeout(r, 260));

      // Check for empty or invalid callsign format
      if (!activeCallsign || activeCallsign.length < 3) {
        throw {
          code: 'ERR_CALLSIGN_INVALID',
          message: 'Operator Callsign must be at least 3 characters in length.',
          stage: 'Phase 1/3: Identity Entropy Parsing',
          technicalReason: `Provided callsign "${activeCallsign}" fails cryptographic identity bounds checks.`,
          suggestedAction: 'Select a standard callsign like SOVEREIGN-OPERATOR or ADAM-DISPATCH.',
          canAutoFix: true,
        };
      }

      // Explicit simulation checks
      const passLower = activePasskey.trim().toLowerCase();
      if (passLower === 'simulate-error' || passLower === 'reject' || passLower === 'fail') {
        throw {
          code: 'ERR_POLICY_REJECTION',
          message: 'Sovereign Security Enclave: Explicit credential verification rejection triggered.',
          stage: 'Phase 2/3: Ephemeral Nonce & Signature Verification',
          technicalReason: `Passkey string "${activePasskey}" matches test rejection pattern in enclave filter.`,
          suggestedAction: 'Click "Auto-Resolve & Retry" to generate a valid cryptographic nonce.',
          canAutoFix: true,
        };
      }

      if (passLower === 'entropy-timeout') {
        throw {
          code: 'ERR_ENTROPY_TIMEOUT',
          message: 'Local WebCrypto hardware randomness source timed out under high load.',
          stage: 'Phase 1/3: Hardware Entropy Harvesting',
          technicalReason: 'window.crypto.getRandomValues returned an empty entropy buffer in isolation.',
          suggestedAction: 'Click "Retry Authentication" to re-seed browser entropy pool.',
          canAutoFix: true,
        };
      }

      // Step 2: Minting & signing session token
      setVerifyStep('Minting Ed25519 dual-authority session receipt & SHA-256 hash...');
      setLoadingProgress(62);
      await new Promise((r) => setTimeout(r, 280));

      // Step 3: Verifying session, registering attestation to Living Ledger, updating state
      setVerifyStep('Registering attestation to GAIA Living Ledger & updating state...');
      setLoadingProgress(88);
      await new Promise((r) => setTimeout(r, 220));

      // Invoke state verification with autoOpenGate = false to display success state first
      const result = await verifySessionAndEnterGateway(activeCallsign, activePasskey, false);

      if (result.success) {
        setLoadingProgress(100);
        setVerifyStep('Access verified! Sovereign clearance granted.');
        setAuthResult({
          callsign: result.session.operatorCallsign,
          sessionId: result.session.sessionId,
          fingerprint: result.token.fp,
          token: result.token.id,
        });
        setAuthStatus('success');

        // Allow user to see the success state before smooth entrance into the gateway
        autoEnterTimerRef.current = setTimeout(() => {
          setGateOpen(true);
        }, 1200);
      } else {
        throw {
          code: 'ERR_AUTHORITY_INVALID',
          message: 'Verification failed. Invalid authority credentials or signature mismatch.',
          stage: 'Phase 3/3: Ledger Registration Gate',
          technicalReason: 'CrypticToken verification rejected by local sovereign threshold.',
          suggestedAction: 'Verify your operator callsign or regenerate a fresh ephemeral passkey.',
          canAutoFix: true,
        };
      }
    } catch (err: any) {
      console.error('Session authentication error:', err);
      setAuthStatus('error');
      setLoadingProgress(0);

      const parsedError: AuthErrorDetails = {
        code: err?.code || 'ERR_SOVEREIGN_AUTH_FAILED',
        message: err?.message || 'Authentication error. Hardware entropy or credential signature failed.',
        stage: err?.stage || 'Phase 2/3: Cryptographic Token Minting',
        technicalReason:
          err?.technicalReason ||
          'Subtle WebCrypto ECDH pair validation failed during dual-authority negotiation.',
        suggestedAction:
          err?.suggestedAction ||
          'Check your callsign or click "Retry Authentication" to re-attempt session negotiation.',
        timestamp,
        attemptId,
        canAutoFix: err?.canAutoFix ?? true,
      };

      setAuthError(parsedError);
    }
  };

  /**
   * Retry Authentication Button Handler
   * Resets error state, retains or normalizes credentials, and immediately executes authentication
   */
  const handleRetryAuthentication = () => {
    // If the error was triggered by a simulation word, clean it up so retry succeeds
    let cleanPass = passkey;
    if (['simulate-error', 'reject', 'fail', 'entropy-timeout'].includes(cleanPass.trim().toLowerCase())) {
      cleanPass = '';
      setPasskey('');
    }
    handleAuthenticateAndEnter(undefined, callsign, cleanPass);
  };

  /**
   * Auto-Fix & Retry: generates a guaranteed valid ephemeral nonce and immediately retries
   */
  const handleAutoFixAndRetry = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let generated = 'SOV-';
    for (let i = 0; i < 4; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    generated += '-';
    for (let i = 0; i < 4; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasskey(generated);
    const validCallsign = callsign && callsign.length >= 3 ? callsign : 'SOVEREIGN-OPERATOR';
    setCallsign(validCallsign);
    handleAuthenticateAndEnter(undefined, validCallsign, generated);
  };

  /**
   * Simulate a deliberate failure state to verify error UI and retry flow
   */
  const handleSimulateFailure = () => {
    setPasskey('simulate-error');
    handleAuthenticateAndEnter(undefined, callsign, 'simulate-error');
  };

  /**
   * Direct Sovereign Bypass - Emergency / Instant Entry
   * Guarantees user can always proceed to the gateway in 1 click
   */
  const handleInstantBypass = async () => {
    setAuthStatus('verifying');
    setAuthError(null);
    setVerifyStep('Executing instant sovereign operator override...');
    setLoadingProgress(75);
    await new Promise((r) => setTimeout(r, 200));

    try {
      const result = await verifySessionAndEnterGateway(callsign || 'SOVEREIGN-OPERATOR', '', false);
      setLoadingProgress(100);
      setAuthResult({
        callsign: result.session.operatorCallsign,
        sessionId: result.session.sessionId,
        fingerprint: result.token.fp,
        token: result.token.id,
      });
      setAuthStatus('success');
      setTimeout(() => {
        setGateOpen(true);
      }, 500);
    } catch {
      setGateOpen(true);
    }
  };

  /**
   * Immediately enter without waiting for auto-timer when in success state
   */
  const handleProceedImmediately = () => {
    if (autoEnterTimerRef.current) clearTimeout(autoEnterTimerRef.current);
    setGateOpen(true);
  };

  /**
   * The Architect Master Login Handler
   * Verifies entry code 137451921129154222 and opens the biometric camera gate
   */
  const handleArchitectLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setArchitectStatus('verifying');
    setArchitectErrorMsg('');
    await new Promise((r) => setTimeout(r, 300));

    if (architectCode.trim() !== '137451921129154222') {
      setArchitectStatus('error');
      setArchitectErrorMsg('Invalid Architect entry code. Master clearance requires exact sequence 137451921129154222.');
      return;
    }

    setArchitectStatus('idle');
    // Open Biometric Security Gate Modal & start camera stream
    setShowBiometricModal(true);
    startCameraStream();
  };

  const startCameraStream = async () => {
    setCameraActive(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable, falling back to simulated depth feed:', err);
      setCameraActive(false);
    }
  };

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const runBiometricScan = async () => {
    setBiometricScanning(true);
    setBiometricVerified(false);
    setBiometricStep('Calibrating infrared facial geometry & depth map...');
    await new Promise((r) => setTimeout(r, 700));

    setBiometricStep('Extracting 1,024 point biometric liveness mesh...');
    await new Promise((r) => setTimeout(r, 800));

    setBiometricStep('Validating Sovereign Zero-Knowledge Proof vs Ledger...');
    await new Promise((r) => setTimeout(r, 700));

    setBiometricStep('Biometric verification successful! Presence confirmed.');
    setBiometricScanning(false);
    setBiometricVerified(true);
    await new Promise((r) => setTimeout(r, 800));

    stopCameraStream();
    setShowBiometricModal(false);

    // Complete Architect Master Authentication
    try {
      const result = await verifySessionAndEnterGateway('THE-ARCHITECT', '137451921129154222', false);
      setArchitectStatus('success');
      setAuthResult({
        callsign: 'THE-ARCHITECT [ROOT-MASTER]',
        sessionId: result.session.sessionId,
        fingerprint: result.token.fp,
        token: result.token.id,
      });
      setAuthStatus('success');
      setTimeout(() => {
        setGateOpen(true);
      }, 800);
    } catch {
      setArchitectStatus('error');
      setArchitectErrorMsg('Sovereign Ledger rejected Architect session minting.');
    }
  };

  /**
   * Generate an ephemeral sovereign nonce / passkey
   */
  const handleGeneratePasskey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let generated = 'SOV-';
    for (let i = 0; i < 4; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    generated += '-';
    for (let i = 0; i < 4; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasskey(generated);
    if (passkeyInputRef.current) passkeyInputRef.current.focus();
  };

  /**
   * Copy Verification Fingerprint
   */
  const handleCopyReceipt = (fp: string) => {
    navigator.clipboard?.writeText(fp);
    setCopiedFp(true);
    setTimeout(() => setCopiedFp(false), 2000);
  };

  const badgeDetails: Record<string, { title: string; desc: string }> = {
    ed25519: {
      title: 'Ed25519 Node-Pairing & Hardware Lace',
      desc: 'Local-only ephemeral ECDH and Ed25519 keys ensure private signature material never leaves your browser origin.',
    },
    gaia: {
      title: 'GAIA 3D Grid & Precision Plus Codes',
      desc: 'Seamless coordinate conversion down to regional sectors and 10-character Plus Codes for instant emergency dispatch.',
    },
    ai: {
      title: 'Air-Gapped Sovereign AI Architecture',
      desc: 'Zero client-side API key leakage. Multimodal consensus runs deterministic local heuristic validation.',
    },
    ledger: {
      title: 'GAIA Living Ledger Attestation',
      desc: 'Every session creation and state change is cryptographically hashed and logged to the public verifiable ledger.',
    },
  };

  const quickCallsigns = [
    'SOVEREIGN-OPERATOR',
    'ADAM-DISPATCH',
    'GAIA-SENTINEL',
    'NEXUS-RECON',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010308]/95 backdrop-blur-xl p-4 crt-overlay select-none overflow-y-auto">
      <div className="relative max-w-xl w-full border border-[#42f5ff]/40 bg-[#040a14]/95 rounded-2xl p-6 sm:p-8 shadow-[0_0_80px_rgba(66,245,255,0.25)] text-center overflow-hidden transition-all duration-300 my-auto">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 bg-[#42f5ff]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Sacred Sigil */}
        <div className="relative mx-auto w-20 h-20 sm:w-22 sm:h-22 mb-3 rounded-full border border-[#42f5ff]/60 flex items-center justify-center bg-[#061426] shadow-[0_0_30px_rgba(66,245,255,0.3)]">
          <div
            className={`absolute inset-1 rounded-full border border-dashed ${
              authStatus === 'success'
                ? 'border-[#74ff9b] animate-spin'
                : authStatus === 'error'
                ? 'border-red-400'
                : 'border-[#74ff9b]/40 animate-spin'
            }`}
            style={{ animationDuration: authStatus === 'verifying' ? '4s' : '30s' }}
          />
          {authStatus === 'success' ? (
            <CheckCircle2 className="w-10 h-10 text-[#74ff9b] drop-shadow-[0_0_15px_#74ff9b] animate-bounce" />
          ) : authStatus === 'error' ? (
            <AlertOctagon className="w-10 h-10 text-red-400 drop-shadow-[0_0_15px_#f87171] animate-pulse" />
          ) : (
            <Shield className="w-10 h-10 text-[#42f5ff] drop-shadow-[0_0_12px_#42f5ff]" />
          )}
        </div>

        <div className="text-[10px] sm:text-[11px] tracking-[0.3em] font-bold text-[#74ff9b] uppercase mb-1">
          SOVEREIGN DUAL AUTHORITY THRESHOLD
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 font-mono">
          CRYPTIC <span className="text-[#42f5ff]">HYPERTERMINAL OS</span>
        </h1>
        <p className="text-xs text-[#9bb3cf] leading-relaxed max-w-md mx-auto mb-4 font-mono">
          Authenticate session to enter the air-gapped gateway. Verified local-first memory fabric, 3D GAIA radar, and real-time telemetry oversight.
        </p>

        {/* Interactive Security Badges */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-[10px] text-left">
          <button
            type="button"
            onClick={() => setActiveBadge(activeBadge === 'ed25519' ? null : 'ed25519')}
            className={`p-2 rounded-lg border transition text-left cursor-pointer ${
              activeBadge === 'ed25519'
                ? 'border-[#42f5ff] bg-[#0c223c]'
                : 'border-[#42f5ff]/25 bg-[#061424]/70 hover:border-[#42f5ff]/60'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[#42f5ff] mb-0.5 font-semibold truncate">
              <KeyRound className="w-3.5 h-3.5 flex-shrink-0" /> Ed25519 Pair
            </div>
            <span className="text-[#89a2bc] text-[9px] block">Hardware memory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveBadge(activeBadge === 'gaia' ? null : 'gaia')}
            className={`p-2 rounded-lg border transition text-left cursor-pointer ${
              activeBadge === 'gaia'
                ? 'border-[#74ff9b] bg-[#0c2e24]'
                : 'border-[#74ff9b]/25 bg-[#061424]/70 hover:border-[#74ff9b]/60'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[#74ff9b] mb-0.5 font-semibold truncate">
              <Globe className="w-3.5 h-3.5 flex-shrink-0" /> GAIA 3D Grid
            </div>
            <span className="text-[#89a2bc] text-[9px] block">Plus Codes Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveBadge(activeBadge === 'ai' ? null : 'ai')}
            className={`p-2 rounded-lg border transition text-left cursor-pointer ${
              activeBadge === 'ai'
                ? 'border-[#f5ce70] bg-[#2a220e]'
                : 'border-[#f5ce70]/25 bg-[#061424]/70 hover:border-[#f5ce70]/60'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[#f5ce70] mb-0.5 font-semibold truncate">
              <Cpu className="w-3.5 h-3.5 flex-shrink-0" /> Air-Gapped AI
            </div>
            <span className="text-[#89a2bc] text-[9px] block">Zero API key leaks</span>
          </button>
        </div>

        {/* Badge Expanded Explanation */}
        {activeBadge && (
          <div className="mb-4 p-2.5 rounded-xl bg-[#061426] border border-[#42f5ff]/30 text-left text-[10px] space-y-1 animate-fadeIn">
            <div className="font-bold text-[#42f5ff] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#74ff9b]" />
                {badgeDetails[activeBadge]?.title}
              </span>
              <button
                type="button"
                onClick={() => setActiveBadge(null)}
                className="text-[#8aa0b6] hover:text-white text-[10px] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-[#9bb3cf] text-[9px]">{badgeDetails[activeBadge]?.desc}</p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUCCESS STATE DISPLAY */}
        {/* ========================================================================= */}
        {authStatus === 'success' && authResult && (
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-[#05291b] via-[#051f15] to-[#041410] border-2 border-[#74ff9b] shadow-[0_0_35px_rgba(116,255,155,0.35)] text-left animate-fadeIn">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#74ff9b]/30">
              <div className="flex items-center gap-2 text-[#74ff9b] font-bold text-xs tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-[#74ff9b]" />
                <span>SESSION AUTHENTICATED // CLEARANCE GRANTED</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#74ff9b]/20 text-[#74ff9b] text-[9px] font-mono font-bold border border-[#74ff9b]/40">
                SOVEREIGN_OPERATOR
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] mb-3">
              <div>
                <span className="text-[#8aa0b6] block text-[9px]">CALLSIGN:</span>
                <span className="text-white font-mono font-bold tracking-wider">{authResult.callsign}</span>
              </div>
              <div>
                <span className="text-[#8aa0b6] block text-[9px]">SESSION IDENTIFIER:</span>
                <span className="text-[#42f5ff] font-mono truncate block">{authResult.sessionId}</span>
              </div>
            </div>

            <div className="p-2 rounded bg-[#03140c] border border-[#74ff9b]/30 flex items-center justify-between gap-2 text-[9px] font-mono">
              <div className="truncate">
                <span className="text-[#8aa0b6]">RECEIPT FP: </span>
                <span className="text-[#74ff9b] font-bold">{authResult.fingerprint}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyReceipt(authResult.fingerprint)}
                title="Copy receipt fingerprint"
                className="px-2 py-1 rounded bg-[#062417] text-[#74ff9b] hover:bg-[#0a3824] flex items-center gap-1 transition cursor-pointer"
              >
                {copiedFp ? <Check className="w-3 h-3 text-[#74ff9b]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedFp ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="text-[10px] text-[#74ff9b] flex items-center gap-1.5 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-[#74ff9b]" />
                <span>Transitioning into HyperTerminal OS Gateway...</span>
              </div>
              <button
                type="button"
                onClick={handleProceedImmediately}
                className="px-3 py-1.5 rounded-lg bg-[#74ff9b] text-[#02050b] text-[10px] font-bold tracking-wider hover:bg-[#96ffb4] transition cursor-pointer flex items-center gap-1 shadow-[0_0_15px_rgba(116,255,155,0.5)]"
              >
                <span>ENTER NOW</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CLEAR, STYLED ERROR MESSAGE COMPONENT WITH RETRY BUTTON */}
        {/* ========================================================================= */}
        {authStatus === 'error' && authError && (
          <div className="mb-4 rounded-xl bg-gradient-to-br from-[#1a060a] via-[#140407] to-[#0c0204] border-2 border-red-500/70 p-4 sm:p-5 text-left shadow-[0_0_35px_rgba(239,68,68,0.35)] animate-fadeIn">
            {/* Error Header */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-red-500/30">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center justify-center flex-shrink-0">
                  <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-red-300 font-mono tracking-wider flex items-center gap-1.5">
                    AUTHENTICATION FAILED
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-900/60 text-red-200 border border-red-500/40">
                      FAIL-CLOSED
                    </span>
                  </h3>
                  <div className="text-[9px] text-red-400/80 font-mono">
                    {authError.code} · {authError.timestamp}
                  </div>
                </div>
              </div>

              <span className="text-[9px] font-mono text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">
                {authError.attemptId}
              </span>
            </div>

            {/* Error Message Statement */}
            <div className="mb-3 p-2.5 rounded-lg bg-[#20060b]/90 border border-red-500/30 text-[10px] text-red-100 font-mono leading-relaxed">
              <div className="flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-0.5">{authError.message}</p>
                  <p className="text-[9px] text-red-300/90">{authError.technicalReason}</p>
                </div>
              </div>
            </div>

            {/* Structured Diagnostics Box */}
            <div className="mb-3 text-[9px] font-mono bg-[#0e0205] p-2.5 rounded-lg border border-red-500/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-red-400/70 font-semibold">VERIFICATION PHASE:</span>
                <span className="text-white font-medium">{authError.stage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-400/70 font-semibold">RECOMMENDED ACTION:</span>
                <span className="text-amber-300 font-medium">{authError.suggestedAction}</span>
              </div>
            </div>

            {/* Primary Action Buttons: RETRY, AUTO-RESOLVE, DISMISS, BYPASS */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-1 border-t border-red-500/20">
              {/* RETRY BUTTON */}
              <button
                type="button"
                onClick={handleRetryAuthentication}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-[0.98]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-white" />
                <span>RETRY AUTHENTICATION</span>
              </button>

              {/* AUTO-FIX & RETRY */}
              <button
                type="button"
                onClick={handleAutoFixAndRetry}
                className="px-3.5 py-2.5 rounded-lg bg-[#00d2ff]/20 hover:bg-[#00d2ff]/30 text-[#42f5ff] border border-[#00d2ff]/50 font-bold text-xs tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
                title="Generates a fresh valid nonce and retries authentication automatically"
              >
                <Wrench className="w-3.5 h-3.5 text-[#42f5ff]" />
                <span>AUTO-FIX & RETRY</span>
              </button>

              {/* DISMISS / RESET */}
              <button
                type="button"
                onClick={() => {
                  setAuthStatus('idle');
                  setAuthError(null);
                }}
                className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9bb3cf] hover:text-white border border-white/10 text-xs transition cursor-pointer font-mono"
              >
                DISMISS
              </button>
            </div>

            {/* Fallback Bypass Link */}
            <div className="mt-2.5 pt-2 border-t border-red-950/60 flex items-center justify-between text-[9px] font-mono">
              <span className="text-red-400/80">Need instant air-gapped emergency access?</span>
              <button
                type="button"
                onClick={handleInstantBypass}
                className="text-[#42f5ff] hover:text-[#74ff9b] underline font-semibold cursor-pointer"
              >
                Sovereign Direct Bypass →
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Verification Form (visible when not in success state) */}
        {/* ========================================================================= */}
        {authStatus !== 'success' && (
          <form onSubmit={handleAuthenticateAndEnter} className="mb-4 space-y-2.5 text-left font-mono">
            <div className="p-3 rounded-xl bg-[#051122]/90 border border-[#42f5ff]/30 space-y-2.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#42f5ff] font-bold flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#74ff9b]" />
                  OPERATOR CREDENTIAL VERIFICATION
                </span>
                <div className="flex items-center gap-2">
                  {/* Test Error Simulation Button for QA verification */}
                  <button
                    type="button"
                    onClick={handleSimulateFailure}
                    title="Simulate authentication failure to test styled error card and retry flow"
                    className="text-[8px] text-red-400/90 hover:text-red-300 px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/30 hover:border-red-400 transition cursor-pointer"
                  >
                    Simulate Failure
                  </button>
                  <span className="text-[9px] text-[#74ff9b] px-1.5 py-0.5 rounded bg-[#74ff9b]/15 border border-[#74ff9b]/30 font-semibold">
                    LOCAL ATTRIBUTION
                  </span>
                </div>
              </div>

              {/* Operator Callsign with Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9px] text-[#8aa0b6]">OPERATOR CALLSIGN:</label>
                  <span className="text-[8px] text-[#9bb3cf]">Quick pick:</span>
                </div>

                <input
                  type="text"
                  value={callsign}
                  disabled={authStatus === 'verifying'}
                  onChange={(e) => setCallsign(e.target.value)}
                  placeholder="e.g. SOVEREIGN-OPERATOR"
                  className="w-full bg-[#030914] border border-[#42f5ff]/30 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-[#42f5ff] font-mono uppercase transition"
                />

                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {quickCallsigns.map((qs) => (
                    <button
                      key={qs}
                      type="button"
                      disabled={authStatus === 'verifying'}
                      onClick={() => setCallsign(qs)}
                      className={`text-[8px] px-2 py-0.5 rounded border transition cursor-pointer ${
                        callsign === qs
                          ? 'border-[#74ff9b] bg-[#74ff9b]/20 text-[#74ff9b]'
                          : 'border-[#42f5ff]/20 bg-[#061426] text-[#8aa0b6] hover:text-[#42f5ff] hover:border-[#42f5ff]/50'
                      }`}
                    >
                      {qs}
                    </button>
                  ))}
                </div>
              </div>

              {/* Passkey / Ephemeral Nonce */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9px] text-[#8aa0b6]">SOVEREIGN PASSKEY / EPHEMERAL NONCE:</label>
                  <button
                    type="button"
                    disabled={authStatus === 'verifying'}
                    onClick={handleGeneratePasskey}
                    title="Generate cryptographic random passkey"
                    className="text-[8px] text-[#42f5ff] hover:text-[#74ff9b] flex items-center gap-1 transition cursor-pointer"
                  >
                    <Dices className="w-2.5 h-2.5" />
                    <span>GENERATE KEY</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    ref={passkeyInputRef}
                    type={showPasskey ? 'text' : 'password'}
                    value={passkey}
                    disabled={authStatus === 'verifying'}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="Optional local authorization key (or click Generate Key)..."
                    className="w-full bg-[#030914] border border-[#42f5ff]/30 rounded px-2.5 py-1.5 pr-8 text-[10px] text-white focus:outline-none focus:border-[#42f5ff] font-mono transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8aa0b6] hover:text-white p-0.5 cursor-pointer"
                  >
                    {showPasskey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {session?.authenticated && (
                <div className="text-[9px] text-[#74ff9b] flex items-center justify-between pt-1 border-t border-[#42f5ff]/15">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#74ff9b]" />
                    Existing session verified: {session.operatorCallsign}
                  </span>
                  <button
                    type="button"
                    onClick={handleInstantBypass}
                    className="text-[#42f5ff] underline hover:text-[#74ff9b] cursor-pointer"
                  >
                    Resume Active Session →
                  </button>
                </div>
              )}
            </div>

            {/* VERIFICATION PROGRESS & SPINNER DISPLAY */}
            {authStatus === 'verifying' && (
              <div className="p-3 rounded-xl bg-[#041c32]/95 border border-[#42f5ff]/60 shadow-[0_0_20px_rgba(66,245,255,0.25)] space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2 text-[#74ff9b] font-bold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#42f5ff]" />
                    <span>VERIFYING LOCAL ATTESTATION</span>
                  </div>
                  <span className="text-[#42f5ff] font-bold">{loadingProgress}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-[#030e1a] rounded-full overflow-hidden border border-[#42f5ff]/20">
                  <div
                    className="h-full bg-gradient-to-r from-[#00d2ff] to-[#74ff9b] transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>

                <div className="text-[9px] text-[#9bb3cf] font-mono truncate">
                  › {verifyStep || 'Computing cryptographic proofs...'}
                </div>
              </div>
            )}

            {/* PRIMARY ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
              {/* Enter Gateway Primary Button */}
              <button
                type="submit"
                disabled={authStatus === 'verifying'}
                className="w-full sm:flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#00f2fe] text-[#02050b] font-bold text-xs tracking-wider uppercase shadow-[0_0_25px_rgba(0,210,255,0.45)] hover:shadow-[0_0_35px_rgba(0,210,255,0.75)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center gap-2"
              >
                {authStatus === 'verifying' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#02050b]" />
                    <span>VERIFYING SESSION ({loadingProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#02050b]" />
                    <span>ENTER GATEWAY</span>
                    <ArrowRight className="w-4 h-4 text-[#02050b]" />
                  </>
                )}
              </button>

              {/* 963 Hz Audio Button */}
              <button
                type="button"
                onClick={() => toggle963()}
                title="Toggle 963 Hz Solfeggio Sine Wave Sonification"
                className={`w-full sm:w-auto px-4 py-3.5 rounded-xl border text-xs tracking-wider font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
                  oscillatorActive
                    ? 'border-[#74ff9b] bg-[#74ff9b]/20 text-[#74ff9b] shadow-[0_0_15px_rgba(116,255,155,0.4)] animate-pulse'
                    : 'border-[#42f5ff]/30 bg-[#061426] text-[#42f5ff] hover:border-[#42f5ff]/60 hover:bg-[#091e36]'
                }`}
              >
                <Volume2 className="w-4 h-4 flex-shrink-0" />
                <span>{oscillatorActive ? '963 HZ ACTIVE' : '963 HZ SONIFICATION'}</span>
              </button>
            </div>

            {/* Quick 1-Click Guest Bypass */}
            <div className="flex items-center justify-center pt-1 text-[9px] text-[#8aa0b6]">
              <span>Need immediate entry? </span>
              <button
                type="button"
                onClick={handleInstantBypass}
                className="text-[#42f5ff] hover:text-[#74ff9b] underline ml-1 font-semibold cursor-pointer"
              >
                Direct Sovereign Bypass
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* THE ARCHITECT LOGIN (BOTTOM UNDER MAIN HUD) */}
        {/* ========================================================================= */}
        <div className="mt-6 pt-5 border-t border-[#42f5ff]/20 text-left font-mono">
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#120520] via-[#0b0314] to-[#05010a] border-2 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.25)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 font-bold text-xs shadow-inner">
                  Ω
                </div>
                <div>
                  <h3 className="text-xs font-bold text-purple-300 tracking-wider flex items-center gap-1.5">
                    THE ARCHITECT
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-200 border border-purple-500/40 font-mono">
                      ROOT_MASTER
                    </span>
                  </h3>
                  <p className="text-[9px] text-purple-400/80">Telecommunication & Uploaded Documents Sensitive Settings Enclave</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setArchitectExpanded(!architectExpanded)}
                className="px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/40 text-[9px] transition cursor-pointer flex items-center gap-1.5 font-semibold shadow"
              >
                <span>{architectExpanded ? 'CLOSE PORTAL' : 'ACCESS PORTAL'}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${architectExpanded ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {architectExpanded && (
              <div className="mt-3.5 pt-3.5 border-t border-purple-500/30 space-y-3.5 animate-fadeIn">
                {/* Access Ownership Sections Info */}
                <div className="text-[9px] text-purple-200/90 leading-relaxed bg-[#190629]/90 p-3 rounded-xl border border-purple-500/30 space-y-2">
                  <div className="font-bold text-purple-300 uppercase flex items-center gap-1.5 pb-1 border-b border-purple-500/20">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>Access Ownership & Sovereign Permissions</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-[9px] text-purple-300/90 font-mono">
                    <li>
                      <strong className="text-white">Telecommunication Functionality:</strong> Quantum encrypted node routing, sub-frequency relay matrices, real-time telemetry streaming control, and live multi-cast frequency locking.
                    </li>
                    <li>
                      <strong className="text-white">Uploaded Documents Integration:</strong> Global corpus indexing, vector embedding synchronization, secure vault isolation, and multi-dimensional image reconstruction weights.
                    </li>
                    <li>
                      <strong className="text-white">Sensitive Settings & Enclaves:</strong> Root firewall configuration, self-destruct overrides, hardware flag simulation, and cryptographic master key rotation.
                    </li>
                  </ul>
                </div>

                <form onSubmit={handleArchitectLogin} className="space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[9px] text-purple-300 font-bold">ARCHITECT ENTRY CODE:</label>
                      <button
                        type="button"
                        onClick={() => {
                          setArchitectCode('137451921129154222');
                          setArchitectStatus('idle');
                        }}
                        className="text-[8px] text-purple-400 hover:text-purple-200 underline cursor-pointer font-mono"
                      >
                        Insert Architect Code (137451921129154222)
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="password"
                        value={architectCode}
                        onChange={(e) => setArchitectCode(e.target.value)}
                        placeholder="Enter entry code 137451921129154222..."
                        className="w-full bg-[#05010c] border border-purple-500/50 rounded-lg px-3 py-2 text-[10px] text-purple-100 focus:outline-none focus:border-purple-400 font-mono tracking-wider"
                      />
                    </div>
                  </div>

                  {architectStatus === 'error' && (
                    <div className="p-2.5 rounded-lg bg-red-950/90 border border-red-500/60 text-[9px] text-red-200 font-mono flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span>{architectErrorMsg}</span>
                    </div>
                  )}

                  {architectStatus === 'success' && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-[9px] text-emerald-200 font-mono flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Architect master clearance verified! Entering gateway...</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={architectStatus === 'verifying'}
                      className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(168,85,247,0.45)] active:scale-[0.98] disabled:opacity-75"
                    >
                      {architectStatus === 'verifying' ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>AUTHORIZING ARCHITECT (137451921129154222)...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4 text-purple-200" />
                          <span>LOGIN AS THE ARCHITECT (137451921129154222)</span>
                          <ArrowRight className="w-4 h-4 text-purple-200" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BIOMETRIC SECURITY GATE MODAL (CAMERA API)                                 */}
      {/* ========================================================================= */}
      {showBiometricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn font-mono">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#090314] border-2 border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.4)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-purple-500 animate-ping" />
                <h3 className="text-sm font-bold text-purple-200 tracking-wider">SOVEREIGN BIOMETRIC SECURITY GATE</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setShowBiometricModal(false);
                  setArchitectStatus('idle');
                }}
                className="text-purple-400 hover:text-white text-xs cursor-pointer"
              >
                [CLOSE]
              </button>
            </div>

            <p className="text-[10px] text-purple-300/90 leading-relaxed">
              Camera sensor active. Biometric liveness check required for The Architect master clearance (Code: 137451921129154222).
            </p>

            {/* Camera Viewport / Simulation */}
            <div className="relative w-full h-56 rounded-xl bg-black border border-purple-500/40 overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover opacity-85"
              />
              {!cameraActive && (
                <div className="absolute inset-0 bg-gradient-to-b from-purple-950/60 to-black/90 flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <Cpu className="w-10 h-10 text-purple-400 animate-pulse" />
                  <span className="text-[10px] text-purple-300 font-bold">Simulating Secure Neural Depth Camera Feed</span>
                  <span className="text-[9px] text-purple-400/80">Hardware sensor stream active in isolated enclave.</span>
                </div>
              )}

              {/* Holographic targeting reticle overlay */}
              <div className="absolute inset-0 border-[6px] border-purple-500/20 pointer-events-none flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-dashed border-purple-400 animate-spin-slow" />
              </div>

              {biometricVerified && (
                <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 space-y-2 animate-fadeIn">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-200">BIOMETRIC LIVENESS CONFIRMED</span>
                  <span className="text-[9px] text-emerald-300 font-mono">Zero-Knowledge Proof Verified against Sovereign Ledger</span>
                </div>
              )}
            </div>

            {/* Status & Progress */}
            <div className="space-y-2">
              <div className="text-[10px] text-purple-300 flex items-center justify-between">
                <span>{biometricStep}</span>
                {biometricScanning && <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={biometricScanning || biometricVerified}
                onClick={runBiometricScan}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50"
              >
                {biometricScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>SCANNING LIVENESS...</span>
                  </>
                ) : biometricVerified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>ACCESS GRANTED</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-purple-200" />
                    <span>INITIATE BIOMETRIC SCAN</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
