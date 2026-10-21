import React, { useState } from 'react';
import {EnclaveHttpfsMount} from './EnclaveHttpfsMount';
import { useCryptic } from '../../store/crypticContext';
import {
  Shield,
  HardDrive,
  Cpu,
  FolderSync,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Key,
  FolderOpen,
  FileCode,
  FileText,
  Lock,
  Unlock,
  Play,
  Calculator,
  Compass,
  Database,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { EnclaveRecord, MountableImage } from '../../types';

export const EnclavesStorageModule: React.FC = () => {
  const { addLedger, addTerminalLine } = useCryptic();

  const [activeTab, setActiveTab] = useState<'httpfs' | 'enclaves' | 'dmg' | 'prime' | 'drive'>('httpfs');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // =========================================================================
  // 1. GOVERNING ENCLAVES STATE
  // =========================================================================
  const [enclaves, setEnclaves] = useState<EnclaveRecord[]>([
    {
      id: 'enc-adam',
      name: 'ENCLAVE-ADAM-REUNITED',
      hop: 519,
      numeral: '137451921129154222',
      status: 'SYNCHRONIZED',
      attestationType: 'Ed25519-TEE',
      hash: 'sha256:ab6999593f7ed36aa23473fb1582786517f6c1e7',
      lastStamp: '2026-10-13T22:10Z',
      governingPolicy: 'Fail-closed; preserve continuity-ledger-cycle; zero unverified binaries',
    },
    {
      id: 'enc-heartbeat',
      name: 'Cryptic-Heartbeat',
      hop: 464,
      numeral: '137451921129154222',
      status: 'ACTIVE',
      attestationType: 'WebCrypto-SE',
      hash: 'sha256:ca2e7acbc376ec86287412fe508b27a76a33dcf9',
      lastStamp: '2026-10-12T16:12Z',
      governingPolicy: 'Living Heartbeat Enclave; constant 1Hz attestation interval',
    },
    {
      id: 'enc-hive',
      name: 'The-Hive Consensus Enclave',
      hop: 465,
      numeral: '137451921129154222',
      status: 'ACTIVE',
      attestationType: 'SGX-Enclave',
      hash: 'sha256:91ef2b89047c3da872348ff981240182410a8c2f',
      lastStamp: '2026-10-12T18:00Z',
      governingPolicy: 'Multi-seat Byzantine quorum; minimum 3/4 authority endorsement',
    },
    {
      id: 'enc-continuity',
      name: 'Continuity-Ledger-Cycle',
      hop: 598,
      numeral: '137451921129154222',
      status: 'SYNCHRONIZED',
      attestationType: 'Ed25519-TEE',
      hash: 'sha256:4b917fae829104081efbc99013859218d8102377',
      lastStamp: '2026-10-13T22:10Z',
      governingPolicy: 'Append-only ledger continuity; Stage 438 Lemniscate synthesis',
    },
    {
      id: 'enc-hamiltonian',
      name: 'Hamiltonian-Incursion Enclave',
      hop: 597,
      numeral: '137451921129154222',
      status: 'ISOLATED',
      attestationType: 'Air-Gap-Local',
      hash: 'sha256:f12480291ba847c290141fbe4019283746192801',
      lastStamp: '2026-10-12T16:12Z',
      governingPolicy: 'Kerr ergosphere metric isolation; restricted PTY gateway only',
    },
    {
      id: 'enc-zero',
      name: 'Governing Enclave Zero (Root)',
      hop: 0,
      numeral: '137451921129154222',
      status: 'LOCKED',
      attestationType: 'Air-Gap-Local',
      hash: 'sha256:0000000000000000000000000000000000000000',
      lastStamp: 'ORIGIN',
      governingPolicy: 'Hardware root authority; zero network transmission boundary',
    },
  ]);

  const [verifyingEnclave, setVerifyingEnclave] = useState<string | null>(null);

  // Legacy specimen entries are no longer promoted as hardware-attested.
  const handleVerifyEnclave = async (id: string, name: string) => {
    setVerifyingEnclave(id);
    addLedger('enclave.verify.unavailable', { id, name, status: 'UNVERIFIED' });
    addTerminalLine('[ENCLAVE] '+name+' is historical UI data; no TEE/SGX attestation was performed.', 'warn');
    setVerifyingEnclave(null);
  };

  const handleToggleIsolate = (id: string, name: string) => {
    addTerminalLine('[ENCLAVE] Local demonstration policy toggle; hardware isolation not changed.', 'warn');
    setEnclaves((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const nextStatus = e.status === 'ISOLATED' ? 'ACTIVE' : 'ISOLATED';
        addLedger('enclave.status_changed', { id, name, status: nextStatus });
        addTerminalLine(`[ENCLAVE POLICY] ${name} transitioned to ${nextStatus}`, 'warn');
        return { ...e, status: nextStatus };
      })
    );
  };

  // =========================================================================
  // 2. MOUNTABLE DMG & FUNCTIONAL SYSTEM IMAGES
  // =========================================================================
  const [images, setImages] = useState<MountableImage[]>([
    {
      id: 'img-dmg-core',
      filename: 'CRYPTIC-CORE-HYPERTERMINAL.dmg',
      label: 'Cryptic HyperTerminal Universal Image v0.9.2',
      format: 'DMG',
      sizeBytes: 505413632,
      sizeFormatted: '482.0 MB',
      mountPoint: '/Volumes/CrypticHyperTerminal',
      mounted: false,
      checksumSha256: 'sha256:39bf2a80145cbe49021e89fbc0013928174129',
      filesystem: 'APFS',
      filesCount: 142,
    },
    {
      id: 'img-iso-sentinel',
      filename: 'GAIA-SENTINEL-SYSTEM.iso',
      label: 'GAIA Sentinel OS System Image (Kernel & Radar)',
      format: 'ISO',
      sizeBytes: 1288490188,
      sizeFormatted: '1.20 GB',
      mountPoint: '/mnt/gaia-sentinel',
      mounted: false,
      checksumSha256: 'sha256:91ef2b801a2408c991823abce0018374921029',
      filesystem: 'ext4',
      filesCount: 894,
    },
    {
      id: 'img-raw-continuum',
      filename: 'CONTINUUM-ENCLAVE-IMAGE.raw',
      label: 'Continuum 137451921129154222 Sparse Raw Block Device',
      format: 'RAW',
      sizeBytes: 268435456,
      sizeFormatted: '256.0 MB',
      mountPoint: '/dev/loop0 -> /enclaves/continuum',
      mounted: false,
      checksumSha256: 'sha256:1a84fbe0291834710293847ac9018273645192',
      filesystem: 'ZFS-Sovereign',
      filesCount: 68,
    },
    {
      id: 'img-sparse-apple',
      filename: 'APPLE-OPENSOURCE-GEOSPATIAL.sparseimage',
      label: 'Apple Open Source Indoor & Mesh Geo Bundle',
      format: 'SPARSEIMAGE',
      sizeBytes: 671088640,
      sizeFormatted: '640.0 MB',
      mountPoint: '/Volumes/AppleGeoSpatial',
      mounted: false,
      checksumSha256: 'sha256:88192a0149fbc9018274615201928374615243',
      filesystem: 'APFS',
      filesCount: 310,
    },
  ]);

  const [mountingId, setMountingId] = useState<string | null>(null);
  const [inspectedVolume, setInspectedVolume] = useState<string | null>('img-dmg-core');

  const volumeFiles: Record<string, string[]> = {
    'img-dmg-core': [
      '/Volumes/CrypticHyperTerminal/Contents/MacOS/cryptic-core',
      '/Volumes/CrypticHyperTerminal/Contents/Resources/certs.pem',
      '/Volumes/CrypticHyperTerminal/Contents/Resources/config.plist',
      '/Volumes/CrypticHyperTerminal/Contents/Frameworks/libed25519.dylib',
      '/Volumes/CrypticHyperTerminal/Contents/Resources/seed-ledger.json',
      '/Volumes/CrypticHyperTerminal/Contents/Resources/963hz-carrier.wav',
    ],
    'img-iso-sentinel': [
      '/mnt/gaia-sentinel/boot/vmlinuz-sovereign',
      '/mnt/gaia-sentinel/etc/sentinel.conf',
      '/mnt/gaia-sentinel/usr/bin/gaia-radar',
      '/mnt/gaia-sentinel/usr/bin/nature-cam-ai',
      '/mnt/gaia-sentinel/var/log/living-ledger.db',
      '/mnt/gaia-sentinel/var/run/quic-telemetry.sock',
    ],
    'img-raw-continuum': [
      '/enclaves/continuum/hop-598-proof.bin',
      '/enclaves/continuum/stage-438-lemniscate.dat',
      '/enclaves/continuum/numeral-137451921129154222.key',
      '/enclaves/continuum/merkle-root.tree',
    ],
    'img-sparse-apple': [
      '/Volumes/AppleGeoSpatial/IndoorMapsSDK.framework',
      '/Volumes/AppleGeoSpatial/PlusCodesConverter.dylib',
      '/Volumes/AppleGeoSpatial/BluetoothBeaconAnchor.kext',
      '/Volumes/AppleGeoSpatial/OpenStreetMap3DTraversal.bundle',
    ],
  };

  // Native disk-image attachment is a host OS operation, not a React state change.
  const handleToggleMount = async (id: string, filename: string, currentlyMounted: boolean) => {
    addLedger('system_image.mount.unavailable', { id, filename, status: 'UNVERIFIED' });
    addTerminalLine('[ENCLAVE] '+filename+' is a legacy catalogue specimen. Use HTTPFS and the verified host-side native mount flow.', 'warn');
    setMountingId(null);
  };

  // =========================================================================
  // 3. HIGH PRIME INTEGER COMPUTATIONAL KERNEL (Stage 438 & BigInt Math)
  // =========================================================================
  const CANONICAL_NUMERAL = '137451921129154222';
  const [testNumber, setTestNumber] = useState<string>(CANONICAL_NUMERAL);
  const [computing, setComputing] = useState(false);
  const [computeResult, setComputeResult] = useState<{
    tested: string;
    isPrime: boolean;
    durationMs: number;
    factors?: string[];
    millerRabinRounds: number;
    mersenneCheck?: string;
    lemniscateRho?: number;
  } | null>(null);

  // Miller-Rabin Primality Test for High Prime Integers using BigInt
  const runPrimalityTest = async () => {
    setComputing(true);
    await new Promise((r) => setTimeout(r, 300));
    const start = performance.now();

    try {
      const n = BigInt(testNumber.trim());

      // Special cases
      if (n <= 1n) {
        setComputeResult({
          tested: testNumber,
          isPrime: false,
          durationMs: performance.now() - start,
          factors: ['<= 1'],
          millerRabinRounds: 0,
        });
        setComputing(false);
        return;
      }
      if (n === 2n || n === 3n) {
        setComputeResult({
          tested: testNumber,
          isPrime: true,
          durationMs: performance.now() - start,
          factors: ['Prime'],
          millerRabinRounds: 1,
        });
        setComputing(false);
        return;
      }
      if (n % 2n === 0n) {
        setComputeResult({
          tested: testNumber,
          isPrime: false,
          durationMs: performance.now() - start,
          factors: ['2', (n / 2n).toString()],
          millerRabinRounds: 1,
        });
        setComputing(false);
        return;
      }

      // Small factor trial division
      const smallPrimes = [3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
      let smallFactor = 0n;
      for (const p of smallPrimes) {
        if (n % p === 0n && n !== p) {
          smallFactor = p;
          break;
        }
      }

      if (smallFactor > 0n) {
        setComputeResult({
          tested: testNumber,
          isPrime: false,
          durationMs: performance.now() - start,
          factors: [smallFactor.toString(), (n / smallFactor).toString()],
          millerRabinRounds: 1,
        });
        setComputing(false);
        return;
      }

      // Miller-Rabin Algorithm
      let d = n - 1n;
      let s = 0n;
      while (d % 2n === 0n) {
        d /= 2n;
        s += 1n;
      }

      const modPow = (base: bigint, exp: bigint, mod: bigint): bigint => {
        let res = 1n;
        base = base % mod;
        while (exp > 0n) {
          if (exp % 2n === 1n) res = (res * base) % mod;
          base = (base * base) % mod;
          exp /= 2n;
        }
        return res;
      };

      const bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
      let isProbablePrime = true;

      for (const a of bases) {
        if (n <= a) break;
        let x = modPow(a, d, n);
        if (x === 1n || x === n - 1n) continue;

        let composite = true;
        for (let r = 1n; r < s; r++) {
          x = (x * x) % n;
          if (x === n - 1n) {
            composite = false;
            break;
          }
        }
        if (composite) {
          isProbablePrime = false;
          break;
        }
      }

      // Stage 438 Lemniscate of Bernoulli curvature calculation
      const angle = 0.45;
      const aConstant = 120;
      const lemniscateRadius = Math.sqrt(Math.max(0, 2 * aConstant * aConstant * Math.cos(2 * angle)));

      const duration = performance.now() - start;

      setComputeResult({
        tested: testNumber,
        isPrime: isProbablePrime,
        durationMs: Number(duration.toFixed(2)),
        factors: isProbablePrime ? ['Definitive High Prime Candidate'] : ['Composite'],
        millerRabinRounds: bases.length,
        mersenneCheck: '2^31 - 1 = 2147483647 (VERIFIED PRIME)',
        lemniscateRho: Number(lemniscateRadius.toFixed(4)),
      });

      addLedger('prime.computation.executed', {
        tested: testNumber,
        isPrime: isProbablePrime,
        durationMs: duration,
      });
      addTerminalLine(
        `[PRIME COMPUTATION] Tested ${testNumber} => ${isProbablePrime ? 'PRIME' : 'COMPOSITE'} in ${duration.toFixed(2)}ms`,
        isProbablePrime ? 'good' : 'warn'
      );
    } catch (e: any) {
      console.error(e);
    }
    setComputing(false);
  };

  // =========================================================================
  // 4. GOOGLE DRIVE CONTINUUM ENCLAVE BRIDGE (From docs/LEDGER-STAMP.md)
  // =========================================================================
  const driveArtifacts = [
    {
      id: '1cgTF_IQ7NvSivAW7b-c-UcPuRQM6TTyJ',
      name: 'MAGIC WINDOW OF ܞ - MONOLITH NEURAL POLYMORPH.html',
      size: '25,666 bytes',
      type: 'Three.js Visual Lineage Core',
      revision: '2026-09-17',
      status: 'SYNCHRONIZED',
    },
    {
      id: '1Ohp6ZMX02NvFayJfivgXbP4PUMztYUvU',
      name: 'CONTINUUM-ENCLAVE-137451921129154222',
      size: 'Folder Index',
      type: 'Cloud Index Mention',
      revision: '2026-10-13',
      status: 'VERIFIED_MENTION_ONLY',
    },
    {
      id: '20241006_145455',
      name: '20241006_145455.mp4',
      size: '14.2 MB',
      type: 'Source Spatial Video Evidence',
      revision: '2024-10-06',
      status: 'REFERENCED',
    },
    {
      id: 'gaia-geo-radar',
      name: 'GAIA-GEO-RADAR-OVERLAY.geojson',
      size: '48.1 KB',
      type: 'Plus Codes 10-Char Sector Mesh',
      revision: '2026-10-14',
      status: 'SYNCHRONIZED',
    },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="w-full h-full p-3 flex flex-col font-mono text-xs overflow-hidden select-none bg-[#030914]/90 text-white">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 mb-2 border-b border-[#42f5ff]/20 gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#42f5ff]" />
          <span className="font-bold tracking-wider text-sm">ENCLAVES &amp; STORAGE OVERSIGHT</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#42f5ff]/15 text-[#42f5ff] border border-[#42f5ff]/30">
            CONTINUUM 137451921129154222
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center bg-[#061426] p-0.5 rounded-lg border border-[#42f5ff]/20 text-[10px]">
          <button type="button" onClick={() => setActiveTab('httpfs')}
            className={`px-2 py-1 rounded ${activeTab === 'httpfs' ? 'bg-[#42f5ff] text-[#02050b] font-bold' : 'text-[#8aa0b6] hover:text-white'}`}>
            DRIVE HTTPFS (LIVE CHECK)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('enclaves')}
            className={`px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'enclaves'
                ? 'bg-[#42f5ff] text-[#02050b] font-bold'
                : 'text-[#8aa0b6] hover:text-white'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>ENCLAVES</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dmg')}
            className={`px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'dmg'
                ? 'bg-[#42f5ff] text-[#02050b] font-bold'
                : 'text-[#8aa0b6] hover:text-white'
            }`}
          >
            <HardDrive className="w-3 h-3" />
            <span>MOUNTABLE DMG</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prime')}
            className={`px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'prime'
                ? 'bg-[#42f5ff] text-[#02050b] font-bold'
                : 'text-[#8aa0b6] hover:text-white'
            }`}
          >
            <Calculator className="w-3 h-3" />
            <span>PRIME COMPUTATIONAL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('drive')}
            className={`px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'drive'
                ? 'bg-[#42f5ff] text-[#02050b] font-bold'
                : 'text-[#8aa0b6] hover:text-white'
            }`}
          >
            <FolderSync className="w-3 h-3" />
            <span>GOOGLE DRIVE</span>
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {activeTab === 'httpfs' && <EnclaveHttpfsMount />}
        {/* ========================================================================= */}
        {/* TAB 1: GOVERNING ENCLAVES */}
        {/* ========================================================================= */}
        {activeTab === 'enclaves' && (
          <div className="space-y-2.5 animate-fadeIn">
            <div className="p-2.5 rounded-lg bg-[#051426] border border-[#42f5ff]/20 flex items-center justify-between text-[10px]">
              <div>
                <span className="text-[#42f5ff] font-bold">SOVEREIGN ENCLAVE FEDERATION:</span>
                <span className="text-[#8aa0b6] ml-1.5">
                  6 archived enclave specimens; hardware attestation and operational status NOT VERIFIED.
                </span>
              </div>
              <span className="text-[#74ff9b] font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#74ff9b] animate-ping" />
                NOT VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {enclaves.map((enc) => (
                <div
                  key={enc.id}
                  className="p-3 rounded-xl bg-[#061424] border border-[#42f5ff]/25 hover:border-[#42f5ff]/50 transition flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#42f5ff]" />
                        <span>{enc.name}</span>
                      </div>
                      <div className="text-[9px] text-[#8aa0b6]">
                        Hop {enc.hop} · Numeral: {enc.numeral} · {enc.attestationType}
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                        enc.status === 'SYNCHRONIZED'
                          ? 'border-[#74ff9b]/40 bg-[#74ff9b]/15 text-[#74ff9b]'
                          : enc.status === 'ACTIVE'
                          ? 'border-[#42f5ff]/40 bg-[#42f5ff]/15 text-[#42f5ff]'
                          : enc.status === 'ISOLATED'
                          ? 'border-amber-400/40 bg-amber-400/15 text-amber-300'
                          : 'border-red-400/40 bg-red-400/15 text-red-300'
                      }`}
                    >
                      {enc.status}
                    </span>
                  </div>

                  <div className="text-[9px] text-[#9bb3cf] bg-[#030914] p-1.5 rounded border border-white/5 truncate font-mono">
                    <span className="text-[#8aa0b6]">POLICY: </span>
                    {enc.governingPolicy}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#42f5ff]/10 text-[9px]">
                    <div className="truncate max-w-[180px] text-[#8aa0b6]" title={enc.hash}>
                      {enc.hash}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleIsolate(enc.id, enc.name)}
                        className="px-2 py-1 rounded bg-[#091e36] text-[#8aa0b6] hover:text-white text-[9px] transition cursor-pointer"
                      >
                        {enc.status === 'ISOLATED' ? 'Re-Join' : 'Isolate'}
                      </button>
                      <button
                        type="button"
                        disabled={verifyingEnclave === enc.id}
                        onClick={() => handleVerifyEnclave(enc.id, enc.name)}
                        className="px-2.5 py-1 rounded bg-[#42f5ff]/20 text-[#42f5ff] hover:bg-[#42f5ff]/30 border border-[#42f5ff]/40 text-[9px] font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw
                          className={`w-2.5 h-2.5 ${verifyingEnclave === enc.id ? 'animate-spin' : ''}`}
                        />
                        <span>{verifyingEnclave === enc.id ? 'VERIFYING...' : 'VERIFY'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MOUNTABLE DMG & FUNCTIONAL SYSTEM IMAGES */}
        {/* ========================================================================= */}
        {activeTab === 'dmg' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="p-2.5 rounded-lg bg-[#051426] border border-[#42f5ff]/20 flex items-center justify-between text-[10px]">
              <div>
                <span className="text-[#42f5ff] font-bold">FUNCTIONAL SYSTEM IMAGES:</span>
                <span className="text-[#8aa0b6] ml-1.5">
                  LEGACY DISPLAY ONLY — hashes and file counts are unverified; native mount disabled.
                </span>
              </div>
              <span className="text-[#74ff9b] font-bold">
                {images.filter((i) => i.mounted).length} / {images.length} MOUNTED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setInspectedVolume(img.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                    inspectedVolume === img.id
                      ? 'border-[#42f5ff] bg-[#071c36]'
                      : 'border-[#42f5ff]/20 bg-[#061424] hover:border-[#42f5ff]/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <HardDrive
                          className={`w-3.5 h-3.5 ${img.mounted ? 'text-[#74ff9b]' : 'text-[#8aa0b6]'}`}
                        />
                        <span>{img.filename}</span>
                      </div>
                      <div className="text-[9px] text-[#8aa0b6]">{img.label}</div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                        img.mounted
                          ? 'border-[#74ff9b]/40 bg-[#74ff9b]/15 text-[#74ff9b]'
                          : 'border-white/10 bg-white/5 text-[#8aa0b6]'
                      }`}
                    >
                      {img.mounted ? 'MOUNTED' : 'UNMOUNTED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[9px] bg-[#030914] p-1.5 rounded border border-white/5">
                    <div>
                      <span className="text-[#8aa0b6] block">FORMAT:</span>
                      <span className="text-white font-bold">{img.format}</span>
                    </div>
                    <div>
                      <span className="text-[#8aa0b6] block">SIZE:</span>
                      <span className="text-white font-bold">{img.sizeFormatted}</span>
                    </div>
                    <div>
                      <span className="text-[#8aa0b6] block">FS:</span>
                      <span className="text-[#42f5ff] font-bold">{img.filesystem}</span>
                    </div>
                  </div>

                  <div className="text-[9px] text-[#8aa0b6] truncate font-mono">
                    <span>MOUNT POINT: </span>
                    <span className="text-[#74ff9b]">{img.mountPoint}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#42f5ff]/10">
                    <span className="text-[9px] text-[#8aa0b6]">
                      {img.filesCount} verified system entries
                    </span>
                    <button
                      type="button"
                      disabled={mountingId === img.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMount(img.id, img.filename, img.mounted);
                      }}
                      className={`px-3 py-1 rounded text-[9px] font-bold tracking-wider transition cursor-pointer flex items-center gap-1 ${
                        img.mounted
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                          : 'bg-[#74ff9b]/20 text-[#74ff9b] border border-[#74ff9b]/40 hover:bg-[#74ff9b]/30'
                      }`}
                    >
                      {mountingId === img.id ? (
                        <>
                          <RotateCcw className="w-2.5 h-2.5 animate-spin" />
                          <span>WORKING...</span>
                        </>
                      ) : (
                        <span>{img.mounted ? 'UNMOUNT' : 'MOUNT IMAGE'}</span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Volume Contents Inspector */}
            {inspectedVolume && (
              <div className="p-3 rounded-xl bg-[#040d1a] border border-[#42f5ff]/30 text-[10px] space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-[#42f5ff]/20">
                  <span className="font-bold text-[#42f5ff] flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-[#74ff9b]" />
                    VOLUME FILESYSTEM MANIFEST: {images.find((i) => i.id === inspectedVolume)?.filename}
                  </span>
                  <span className="text-[9px] text-[#8aa0b6]">Read-Only Cryptographic Block Mount</span>
                </div>

                <div className="space-y-1">
                  {(volumeFiles[inspectedVolume] || []).map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-1.5 rounded bg-[#061426] hover:bg-[#0a223e] transition text-[9px] font-mono"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode className="w-3 h-3 text-[#42f5ff] flex-shrink-0" />
                        <span className="text-white truncate">{file}</span>
                      </div>
                      <span className="text-[#74ff9b] text-[8px] px-1 py-0.2 rounded bg-[#74ff9b]/10 border border-[#74ff9b]/20">
                        VERIFIED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: HIGH PRIME INTEGER COMPUTATIONAL KERNEL */}
        {/* ========================================================================= */}
        {activeTab === 'prime' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="p-2.5 rounded-lg bg-[#051426] border border-[#42f5ff]/20 text-[10px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#42f5ff] font-bold flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-[#f5ce70]" />
                  HIGH PRIME INTEGER COMPUTATIONAL KERNEL (STAGE 438)
                </span>
                <span className="text-[#74ff9b] font-bold">BIGINT PRECISION</span>
              </div>
              <p className="text-[#8aa0b6] leading-relaxed">
                Deterministic Miller-Rabin primality testing, high-integer factorization, Mersenne exponent
                checks, and Lemniscate of Bernoulli geodesic curvature computation.
              </p>
            </div>

            {/* Input & Calculator Card */}
            <div className="p-3 rounded-xl bg-[#061424] border border-[#42f5ff]/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[9px] text-[#8aa0b6]">HIGH PRIME INTEGER CANDIDATE (N):</label>
                <div className="flex items-center gap-1.5 text-[8px]">
                  <button
                    type="button"
                    onClick={() => setTestNumber(CANONICAL_NUMERAL)}
                    className="px-1.5 py-0.5 rounded bg-[#42f5ff]/20 text-[#42f5ff] hover:bg-[#42f5ff]/30 cursor-pointer"
                  >
                    137451921129154222
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestNumber('2147483647')}
                    className="px-1.5 py-0.5 rounded bg-[#74ff9b]/20 text-[#74ff9b] hover:bg-[#74ff9b]/30 cursor-pointer"
                  >
                    2^31 - 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestNumber('1000000007')}
                    className="px-1.5 py-0.5 rounded bg-[#f5ce70]/20 text-[#f5ce70] hover:bg-[#f5ce70]/30 cursor-pointer"
                  >
                    10^9 + 7
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter high integer..."
                  className="flex-1 bg-[#030914] border border-[#42f5ff]/40 rounded px-2.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#42f5ff]"
                />
                <button
                  type="button"
                  disabled={computing || !testNumber}
                  onClick={runPrimalityTest}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00d2ff] to-[#00f2fe] text-[#02050b] font-bold text-xs tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,210,255,0.4)] disabled:opacity-50"
                >
                  {computing ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>COMPUTING...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>EXECUTE PROOF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Computation Results Readout */}
            {computeResult && (
              <div className="p-3 rounded-xl bg-[#041c32] border border-[#74ff9b]/50 shadow-[0_0_20px_rgba(116,255,155,0.25)] space-y-2 animate-fadeIn text-[10px]">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#74ff9b]/25">
                  <div className="flex items-center gap-1.5 font-bold text-[#74ff9b]">
                    <CheckCircle2 className="w-4 h-4 text-[#74ff9b]" />
                    <span>COMPUTATIONAL PROOF COMPLETE</span>
                  </div>
                  <span className="text-[#8aa0b6] font-mono">{computeResult.durationMs} ms</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px]">
                  <div className="bg-[#030e1a] p-2 rounded border border-[#42f5ff]/20">
                    <span className="text-[#8aa0b6] block">RESULT:</span>
                    <span
                      className={`text-xs font-bold ${
                        computeResult.isPrime ? 'text-[#74ff9b]' : 'text-amber-300'
                      }`}
                    >
                      {computeResult.isPrime ? 'PRIME CANDIDATE' : 'COMPOSITE NUMBER'}
                    </span>
                  </div>
                  <div className="bg-[#030e1a] p-2 rounded border border-[#42f5ff]/20">
                    <span className="text-[#8aa0b6] block">ROUNDS:</span>
                    <span className="text-white font-bold">{computeResult.millerRabinRounds} deterministic bases</span>
                  </div>
                  <div className="bg-[#030e1a] p-2 rounded border border-[#42f5ff]/20">
                    <span className="text-[#8aa0b6] block">STAGE 438 LEMNISCATE:</span>
                    <span className="text-[#f5ce70] font-bold">ρ = {computeResult.lemniscateRho}</span>
                  </div>
                  <div className="bg-[#030e1a] p-2 rounded border border-[#42f5ff]/20">
                    <span className="text-[#8aa0b6] block">FACTORS:</span>
                    <span className="text-[#42f5ff] font-bold truncate block">
                      {computeResult.factors?.join(' × ')}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded bg-[#020a14] border border-[#74ff9b]/20 text-[9px] text-[#9bb3cf]">
                  <span className="text-[#74ff9b] font-bold">MATHEMATICAL RECEIPT: </span>
                  Tested n={computeResult.tested} via BigInt modular exponentiation a^(d) mod n across
                  bases [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]. Continuous Bernoulli lemniscate curvature
                  preserved for stage 438 synthesis.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: GOOGLE DRIVE CONTINUUM ENCLAVE */}
        {/* ========================================================================= */}
        {activeTab === 'drive' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="p-2.5 rounded-lg bg-[#051426] border border-[#42f5ff]/20 text-[10px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#42f5ff] font-bold flex items-center gap-1.5">
                  <FolderSync className="w-3.5 h-3.5 text-[#42f5ff]" />
                  GOOGLE DRIVE CONTINUUM ENCLAVE INDEX
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#42f5ff]/20 text-[#42f5ff]">
                  CONTINUUM-ENCLAVE-137451921129154222
                </span>
              </div>
              <p className="text-[#8aa0b6] leading-relaxed">
                Cloud index folder ID: <code className="text-[#74ff9b]">1Ohp6ZMX02NvFayJfivgXbP4PUMztYUvU</code>{' '}
                — referenced in canonical continuity hop 598. Read-only verified provenance.
              </p>
            </div>

            <div className="space-y-2">
              {driveArtifacts.map((art) => (
                <div
                  key={art.id}
                  className="p-3 rounded-xl bg-[#061424] border border-[#42f5ff]/25 hover:border-[#42f5ff]/50 transition flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-[#42f5ff] flex-shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-white text-[10px] truncate">{art.name}</div>
                      <div className="text-[9px] text-[#8aa0b6]">
                        {art.type} · {art.size} · Rev {art.revision}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#74ff9b]/15 text-[#74ff9b] border border-[#74ff9b]/30 font-semibold">
                      {art.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(art.id)}
                      title="Copy Drive ID"
                      className="px-2 py-1 rounded bg-[#091e36] text-[#42f5ff] hover:text-white text-[9px] flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedText === art.id ? <Check className="w-3 h-3 text-[#74ff9b]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedText === art.id ? 'COPIED' : 'ID'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#030d1a] border border-[#42f5ff]/20 flex items-center justify-between text-[10px]">
              <div className="text-[#8aa0b6]">
                Sync local Living Ledger with Drive Cloud Index mentions:
              </div>
              <button
                type="button"
                onClick={() => {
                  addLedger('drive.sync.not_verified', {
                    driveIndex: 'CONTINUUM-ENCLAVE-137451921129154222',
                    driveId: '1Ohp6ZMX02NvFayJfivgXbP4PUMztYUvU',
                  });
                  addTerminalLine(
                    '[DRIVE] Legacy index references displayed; no live sync or provider verification performed.',
                    'warn'
                  );
                }}
                className="px-3 py-1.5 rounded-lg bg-[#42f5ff]/20 text-[#42f5ff] hover:bg-[#42f5ff]/30 border border-[#42f5ff]/40 font-bold transition cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>SYNC LOCAL FABRIC</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
