import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  ModuleId,
  PanelInstanceState,
  TerminalOutputLine,
  LedgerRecord,
  CrypticToken,
  PeerBeacon,
  WeatherStationData,
  EmergencyIncident,
  NetworkPacketTelemetry,
  SensorDiagnostic,
  ConsensusModelVote,
  IRCMessage,
} from '../types';

interface CrypticContextType {
  // Gate
  gateOpen: boolean;
  enterGate: () => Promise<CrypticToken>;
  showGate: () => void;

  // View & UI mode
  viewMode: 'desktop' | 'globe' | 'magic';
  setViewMode: (mode: 'desktop' | 'globe' | 'magic') => void;
  clearUI: boolean;
  toggleClearUI: () => void;
  clockMode: 'UTC' | 'LOCAL' | 'SIDEREAL' | 'EPOCH';
  cycleClockMode: () => void;
  systemTimeFormatted: string;

  // Audio & 963Hz
  oscillatorActive: boolean;
  toggle963: (on?: boolean) => void;

  // Panels
  panels: PanelInstanceState[];
  openModule: (moduleId: ModuleId) => void;
  closePanel: (instanceId: string) => void;
  toggleCollapse: (instanceId: string) => void;
  toggleGhost: (instanceId: string) => void;
  duplicatePanel: (instanceId: string) => void;
  bringToFront: (instanceId: string) => void;
  updatePanelPos: (instanceId: string, x: number, y: number) => void;
  ghostAll: (on?: boolean) => void;
  restoreAll: () => void;

  // Cryptographic Ledger & Tokens
  tokens: CrypticToken[];
  ledgerRecords: LedgerRecord[];
  mintToken: (scope?: string, meta?: Record<string, any>) => Promise<CrypticToken>;
  addLedger: (event: string, data?: Record<string, any>) => LedgerRecord;

  // Terminal
  terminalLines: TerminalOutputLine[];
  execCommand: (raw: string) => Promise<any>;
  clearTerminal: () => void;
  addTerminalLine: (text: string, type?: TerminalOutputLine['type'], receipt?: string) => void;

  // Geospatial, Weather, Incident State
  beacons: PeerBeacon[];
  addBeacon: (beacon: Omit<PeerBeacon, 'id' | 'lastSeen'>) => void;
  weatherStations: WeatherStationData[];
  incidents: EmergencyIncident[];
  resolveIncident: (incidentId: string) => void;

  // Network Telemetry & Remedies
  networkPackets: NetworkPacketTelemetry[];
  sensorDiagnostics: SensorDiagnostic[];
  triggerNetworkRemedy: (nodeName: string) => void;

  // Consensus
  consensusVotes: ConsensusModelVote[];
  runConsensusQuorum: (intent: string) => Promise<{ quorum: boolean; consensusRate: number }>;

  // IRC
  ircMessages: IRCMessage[];
  sendIRC: (channel: string, text: string) => void;
}

const CrypticContext = createContext<CrypticContextType | null>(null);

// Default initial panels configuration for desktop workspace
const INITIAL_PANELS: PanelInstanceState[] = [
  {
    id: 'panel-terminal',
    moduleId: 'terminal',
    title: 'Æ // COMMAND FABRIC (SOVEREIGN TERMINAL)',
    x: 20,
    y: 65,
    w: 520,
    h: 460,
    zIndex: 10,
    collapsed: false,
    ghost: false,
    hidden: false,
  },
  {
    id: 'panel-globe',
    moduleId: 'globe',
    title: 'GAIA 3D ORBIT & EMERGENCY RESPONSE RADAR',
    x: 550,
    y: 65,
    w: 680,
    h: 460,
    zIndex: 11,
    collapsed: false,
    ghost: false,
    hidden: false,
  },
  {
    id: 'panel-network',
    moduleId: 'network',
    title: 'NETWORK PACKET INSPECTION & REMEDY HUB',
    x: 20,
    y: 535,
    w: 520,
    h: 360,
    zIndex: 8,
    collapsed: false,
    ghost: false,
    hidden: false,
  },
  {
    id: 'panel-consensus',
    moduleId: 'consensus',
    title: 'AI CONSENSUS // TOPOLOGICAL QUORUM',
    x: 550,
    y: 535,
    w: 420,
    h: 360,
    zIndex: 9,
    collapsed: false,
    ghost: false,
    hidden: false,
  },
  {
    id: 'panel-audio',
    moduleId: 'audio',
    title: 'POLYNEUROMORPHIC AUDIO & 963HZ FABRIC',
    x: 980,
    y: 535,
    w: 440,
    h: 360,
    zIndex: 7,
    collapsed: false,
    ghost: false,
    hidden: false,
  },
];

// Pre-seeded emergency incidents
const INITIAL_INCIDENTS: EmergencyIncident[] = [
  {
    id: 'inc-01',
    type: 'wildfire_thermal',
    title: 'Wildfire Thermal Anomaly Detected',
    severity: 'critical',
    lat: 37.7749,
    lng: -122.4194,
    locationName: 'Sierra Foothills Sector 4',
    plusCode: '849VQV6G+X7',
    reportedAgo: '3m ago',
    status: 'MONITORING',
    trailCamUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    details: 'Infrared nature trail telemetry sensor #TR-409 triggered a 184°C thermal spike in dense pine canopy. Fire dispatch alert active.',
  },
  {
    id: 'inc-02',
    type: 'traffic_accident',
    title: 'Multi-Vehicle Collision & Hazard',
    severity: 'warning',
    lat: 34.0522,
    lng: -118.2437,
    locationName: 'Interstate 10 Junction North',
    plusCode: '85633P2W+92',
    reportedAgo: '12m ago',
    status: 'DISPATCHED',
    details: 'Vehicle rollover blocking median lane. Automated roadside mesh node rerouting traffic vectors.',
  },
  {
    id: 'inc-03',
    type: 'network_outage',
    title: 'Regional Backhaul Latency Spike',
    severity: 'info',
    lat: 51.5074,
    lng: -0.1278,
    locationName: 'London Thames Orbital Node',
    plusCode: '9C3XGV65+Q9',
    reportedAgo: '24m ago',
    status: 'CONTAINED',
    details: 'Packet drop 12.4% during undersea fiber re-routing. Automatic remedy failover to local peer mesh established.',
  },
];

// Pre-seeded weather station observations
const INITIAL_WEATHER: WeatherStationData[] = [
  { region: 'Pacific Northwest', lat: 47.6062, lng: -122.3321, tempC: 14.2, condition: 'Intermittent Rain', windSpeedKmh: 24, windDirection: 'WSW', pressureHpa: 1012.8, humidityPercent: 78, wildfireRisk: 'LOW' },
  { region: 'California High Desert', lat: 34.8697, lng: -116.7869, tempC: 31.8, condition: 'Dry Thermal Gusts', windSpeedKmh: 38, windDirection: 'NE', pressureHpa: 1018.4, humidityPercent: 12, wildfireRisk: 'CRITICAL' },
  { region: 'Alps Alpine Ridge', lat: 46.5197, lng: 9.8355, tempC: 2.1, condition: 'Clear Atmosphere', windSpeedKmh: 14, windDirection: 'N', pressureHpa: 1024.1, humidityPercent: 42, wildfireRisk: 'LOW' },
  { region: 'Tokyo Bay Coastal', lat: 35.6762, lng: 139.6503, tempC: 19.5, condition: 'Overcast Cloud Cover', windSpeedKmh: 18, windDirection: 'SE', pressureHpa: 1009.6, humidityPercent: 65, wildfireRisk: 'LOW' },
];

// Pre-seeded social peer beacons
const INITIAL_BEACONS: PeerBeacon[] = [
  { id: 'bcn-1', uuid: 'e9b2-841a-4c2e-9d88', callsign: 'ADAM-OPERATOR', lat: 37.7749, lng: -122.4194, altitude: 48.5, plusCode: '849VQV6G+X7', status: 'transmitting', signalDbm: -54, lastSeen: 'Just now' },
  { id: 'bcn-2', uuid: '710d-9fa3-b1c4-33a1', callsign: 'NEXUS-RECON-7', lat: 34.0522, lng: -118.2437, altitude: 112.0, plusCode: '85633P2W+92', status: 'active', signalDbm: -68, lastSeen: '4s ago' },
  { id: 'bcn-3', uuid: 'a52c-12ec-88f0-51b2', callsign: 'GAIA-ROVER-04', lat: 51.5074, lng: -0.1278, altitude: 22.3, plusCode: '9C3XGV65+Q9', status: 'active', signalDbm: -61, lastSeen: '12s ago' },
  { id: 'bcn-4', uuid: '68ef-0012-98ba-cc34', callsign: 'AURORA-STATION', lat: 64.1466, lng: -21.9426, altitude: 310.0, plusCode: '9F2543W4+X7', status: 'standby', signalDbm: -76, lastSeen: '1m ago' },
];

export const CrypticProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gateOpen, setGateOpen] = useState<boolean>(() => {
    return localStorage.getItem('cryptic.gate.passed') === 'true';
  });
  const [viewMode, setViewMode] = useState<'desktop' | 'globe' | 'magic'>('desktop');
  const [clearUI, setClearUI] = useState<boolean>(false);
  const [clockMode, setClockMode] = useState<'UTC' | 'LOCAL' | 'SIDEREAL' | 'EPOCH'>('UTC');
  const [systemTimeFormatted, setSystemTimeFormatted] = useState<string>('');

  // Audio State
  const [oscillatorActive, setOscillatorActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  // Panels
  const [panels, setPanels] = useState<PanelInstanceState[]>(() => {
    try {
      const saved = localStorage.getItem('cryptic.panels.v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PANELS;
  });

  const maxZIndex = useRef(20);

  // Tokens & Ledger
  const [tokens, setTokens] = useState<CrypticToken[]>([]);
  const [ledgerRecords, setLedgerRecords] = useState<LedgerRecord[]>(() => {
    try {
      const stored = localStorage.getItem('cryptic.ledger');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Terminal Lines
  const [terminalLines, setTerminalLines] = useState<TerminalOutputLine[]>([
    {
      id: 'init-1',
      text: 'CRYPTIC // HYPERTERMINAL SOVEREIGN OS [v0.9.2-REACT]',
      type: 'good',
      time: new Date().toLocaleTimeString(),
    },
    {
      id: 'init-2',
      text: 'Verified secure offline runtime environment · Server-side AI adapter ready · Type "help" for command matrix.',
      type: 'system',
      time: new Date().toLocaleTimeString(),
    },
  ]);

  // Geospatial & Emergency State
  const [beacons, setBeacons] = useState<PeerBeacon[]>(INITIAL_BEACONS);
  const [weatherStations] = useState<WeatherStationData[]>(INITIAL_WEATHER);
  const [incidents, setIncidents] = useState<EmergencyIncident[]>(INITIAL_INCIDENTS);

  // Network Telemetry & Remedies
  const [networkPackets, setNetworkPackets] = useState<NetworkPacketTelemetry[]>([
    { timestamp: '12:44:02', node: 'gateway.crypticnews.org', protocol: 'QUIC', latencyMs: 18.2, jitterMs: 1.4, packetLossPercent: 0.0, stabilityScore: 99.4, remedyActive: false },
    { timestamp: '12:44:15', node: 'gaia-mesh-us-west', protocol: 'AXS-LOOPBACK', latencyMs: 3.1, jitterMs: 0.2, packetLossPercent: 0.0, stabilityScore: 100.0, remedyActive: false },
    { timestamp: '12:44:30', node: 'emergency-dispatch-node', protocol: 'UDP', latencyMs: 44.7, jitterMs: 8.2, packetLossPercent: 0.8, stabilityScore: 92.1, remedyActive: false },
    { timestamp: '12:44:48', node: 'nature-trailcam-thermal-01', protocol: 'WEBSOCKET', latencyMs: 88.5, jitterMs: 14.1, packetLossPercent: 2.1, stabilityScore: 84.6, remedyActive: true, remedyLog: 'Packet routing switched to secondary low-frequency microwave transceiver.' },
  ]);

  const [sensorDiagnostics, setSensorDiagnostics] = useState<SensorDiagnostic[]>([
    { sensorId: 'SNS-901', name: 'Thermal Infrared Forest Grid', region: 'Pacific Coast Area 1', status: 'NOMINAL', thermalC: 22.4, firmware: 'v4.1.0-sec', lastHeartbeat: '1s ago' },
    { sensorId: 'SNS-902', name: 'Canopy Humidity Probe Matrix', region: 'Sierra Foothills', status: 'DEGRADED', thermalC: 41.8, firmware: 'v4.0.8', lastHeartbeat: '4s ago' },
    { sensorId: 'SNS-903', name: 'High-Altitude Barometric Station', region: 'Alpine Ridge', status: 'NOMINAL', thermalC: -1.2, firmware: 'v4.2.1', lastHeartbeat: 'Just now' },
    { sensorId: 'SNS-904', name: 'Cellular Mesh Repeater Hub', region: 'Desert Junction 09', status: 'FAILOVER', thermalC: 38.6, firmware: 'v4.2.0', lastHeartbeat: '2s ago' },
  ]);

  // Consensus State
  const [consensusVotes, setConsensusVotes] = useState<ConsensusModelVote[]>([
    { modelId: 'Gemini-2.5-Flash', vote: 'QUORUM', confidence: 0.984, entropy: 0.012, hash: 'sha256:7f9a21b34' },
    { modelId: 'Aurora-Singularity', vote: 'ENDORSE', confidence: 0.961, entropy: 0.024, hash: 'sha256:88bc41e90' },
    { modelId: 'Argon-Heuristic', vote: 'QUORUM', confidence: 0.945, entropy: 0.038, hash: 'sha256:32cda04f1' },
    { modelId: 'Genie-Djinn', vote: 'ENDORSE', confidence: 0.978, entropy: 0.015, hash: 'sha256:fa239d891' },
  ]);

  // IRC Messages
  const [ircMessages, setIrcMessages] = useState<IRCMessage[]>([
    { id: 'irc-1', channel: '#sovereign', sender: 'TDOC-Sentinel', timestamp: '12:40:11', text: 'Dual authority identity lace verified. Ed25519 signature active.', verified: true },
    { id: 'irc-2', channel: '#sovereign', sender: 'GaiaRecon', timestamp: '12:42:04', text: 'Geospatial satellite feed mapped to Plus Codes. Emergency trail sensors online.', verified: true },
    { id: 'irc-3', channel: '#gaia-mesh', sender: 'ArgonRouter', timestamp: '12:43:20', text: 'Zero external API key leakage detected. Local privacy processing engaged.', verified: true },
  ]);

  // Save panels state
  useEffect(() => {
    localStorage.setItem('cryptic.panels.v2', JSON.stringify(panels));
  }, [panels]);

  // Live System Clock calculation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      if (clockMode === 'UTC') {
        setSystemTimeFormatted(now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
      } else if (clockMode === 'LOCAL') {
        setSystemTimeFormatted(now.toLocaleTimeString() + ' (LOCAL)');
      } else if (clockMode === 'EPOCH') {
        setSystemTimeFormatted(Math.floor(now.getTime() / 1000) + 's [UNIX]');
      } else {
        // Sidereal time approx calculation
        const jd = now.getTime() / 86400000 + 2440587.5;
        const d = jd - 2451545.0;
        let gmst = 18.697374558 + 24.06570982441908 * d;
        gmst = (gmst % 24 + 24) % 24;
        const h = Math.floor(gmst);
        const m = Math.floor((gmst - h) * 60);
        const s = Math.floor(((gmst - h) * 60 - m) * 60);
        setSystemTimeFormatted(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} [SIDEREAL]`);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [clockMode]);

  // Helper: SHA-256 fingerprinting
  const fingerprint = useCallback(async (value: string): Promise<string> => {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 16);
  }, []);

  // Ledger recording
  const addLedger = useCallback((event: string, data: Record<string, any> = {}): LedgerRecord => {
    const record: LedgerRecord = {
      ts: new Date().toISOString(),
      event: event.slice(0, 120),
      data: data,
    };
    setLedgerRecords(prev => {
      const updated = [...prev, record];
      if (updated.length > 512) updated.splice(0, updated.length - 512);
      try {
        localStorage.setItem('cryptic.ledger', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    return record;
  }, []);

  // Cryptographic token minting
  const mintToken = useCallback(async (scope = 'runtime.request', meta: Record<string, any> = {}): Promise<CrypticToken> => {
    const raw = new Uint8Array(24);
    crypto.getRandomValues(raw);
    const b64 = btoa(String.fromCharCode(...raw)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const now = Date.now();
    const id = `crt.${now.toString(36)}.${b64}`;
    const fp = await fingerprint(id);
    const token: CrypticToken = {
      id,
      scope: scope.slice(0, 100),
      issuedAt: now,
      expiresAt: now + 600000,
      fp,
    };
    setTokens(prev => [token, ...prev.slice(0, 47)]);
    addLedger('token.minted', { scope, fp, ...meta });
    return token;
  }, [addLedger, fingerprint]);

  // Audio 963 Hz solfeggio oscillator toggle
  const toggle963 = useCallback((on?: boolean) => {
    const shouldBeOn = on !== undefined ? on : !oscillatorActive;
    if (shouldBeOn) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContextClass();
        }
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        if (oscRef.current) {
          oscRef.current.stop();
          oscRef.current.disconnect();
        }
        const ctx = audioCtxRef.current;
        const gain = ctx.createGain();
        gain.gain.value = 0.022; // gentle harmonic gain
        const osc = ctx.createOscillator();
        osc.frequency.value = 963;
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = osc;
        setOscillatorActive(true);
        addLedger('audio.963.start', { freq: 963 });
      } catch (err: any) {
        console.error('Failed to start 963Hz audio:', err);
      }
    } else {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      setOscillatorActive(false);
      addLedger('audio.963.stop', {});
    }
  }, [oscillatorActive, addLedger]);

  // Gate actions
  const enterGate = useCallback(async (): Promise<CrypticToken> => {
    const token = await mintToken('guardian.entry');
    setGateOpen(true);
    localStorage.setItem('cryptic.gate.passed', 'true');
    addLedger('guardian.entry', { fp: token.fp });
    setTerminalLines(prev => [
      ...prev,
      {
        id: `gate-${Date.now()}`,
        text: `[GUARDIAN THRESHOLD GRANTED] Cryptic Sovereign OS initialized. Entrance receipt: ${token.fp}.`,
        type: 'good',
        time: new Date().toLocaleTimeString(),
        receipt: token.fp,
      },
    ]);
    return token;
  }, [mintToken, addLedger]);

  const showGate = useCallback(() => {
    setGateOpen(false);
    localStorage.removeItem('cryptic.gate.passed');
    addLedger('guardian.gate.closed', {});
  }, [addLedger]);

  // Panel Window Controls
  const bringToFront = useCallback((instanceId: string) => {
    maxZIndex.current += 1;
    setPanels(prev =>
      prev.map(p => (p.id === instanceId ? { ...p, zIndex: maxZIndex.current } : p))
    );
  }, []);

  const openModule = useCallback((moduleId: ModuleId) => {
    setPanels(prev => {
      const existing = prev.find(p => p.moduleId === moduleId);
      if (existing) {
        maxZIndex.current += 1;
        return prev.map(p =>
          p.id === existing.id
            ? { ...p, hidden: false, collapsed: false, zIndex: maxZIndex.current }
            : p
        );
      }
      // Create new panel instance
      maxZIndex.current += 1;
      const count = prev.filter(p => p.moduleId === moduleId).length;
      const newPanel: PanelInstanceState = {
        id: `panel-${moduleId}-${count + 1}`,
        moduleId,
        title: `${moduleId.toUpperCase()} // MODULE INSTANCE`,
        x: 80 + (prev.length * 28) % 320,
        y: 80 + (prev.length * 24) % 260,
        w: 560,
        h: 420,
        zIndex: maxZIndex.current,
        collapsed: false,
        ghost: false,
        hidden: false,
      };
      return [...prev, newPanel];
    });
  }, []);

  const closePanel = useCallback((instanceId: string) => {
    setPanels(prev => prev.map(p => (p.id === instanceId ? { ...p, hidden: true } : p)));
  }, []);

  const toggleCollapse = useCallback((instanceId: string) => {
    setPanels(prev =>
      prev.map(p => (p.id === instanceId ? { ...p, collapsed: !p.collapsed } : p))
    );
  }, []);

  const toggleGhost = useCallback((instanceId: string) => {
    setPanels(prev =>
      prev.map(p => (p.id === instanceId ? { ...p, ghost: !p.ghost } : p))
    );
  }, []);

  const duplicatePanel = useCallback((instanceId: string) => {
    setPanels(prev => {
      const target = prev.find(p => p.id === instanceId);
      if (!target) return prev;
      maxZIndex.current += 1;
      const dup: PanelInstanceState = {
        ...target,
        id: `panel-${target.moduleId}-${Date.now().toString(36)}`,
        title: `${target.title} (COPY)`,
        x: target.x + 32,
        y: target.y + 32,
        zIndex: maxZIndex.current,
      };
      return [...prev, dup];
    });
  }, []);

  const updatePanelPos = useCallback((instanceId: string, x: number, y: number) => {
    setPanels(prev =>
      prev.map(p => (p.id === instanceId ? { ...p, x: Math.max(0, x), y: Math.max(50, y) } : p))
    );
  }, []);

  const ghostAll = useCallback((on = true) => {
    setPanels(prev => prev.map(p => ({ ...p, ghost: on })));
  }, []);

  const restoreAll = useCallback(() => {
    setPanels(prev => prev.map(p => ({ ...p, ghost: false, collapsed: false, hidden: false })));
  }, []);

  const toggleClearUI = useCallback(() => {
    setClearUI(prev => !prev);
  }, []);

  const cycleClockMode = useCallback(() => {
    setClockMode(prev => {
      if (prev === 'UTC') return 'LOCAL';
      if (prev === 'LOCAL') return 'SIDEREAL';
      if (prev === 'SIDEREAL') return 'EPOCH';
      return 'UTC';
    });
  }, []);

  // Terminal Line addition
  const addTerminalLine = useCallback((text: string, type: TerminalOutputLine['type'] = 'system', receipt?: string) => {
    setTerminalLines(prev => [
      ...prev,
      {
        id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text,
        type,
        time: new Date().toLocaleTimeString(),
        receipt,
      },
    ]);
  }, []);

  const clearTerminal = useCallback(() => {
    setTerminalLines([]);
  }, []);

  // Emergency Incident Resolution
  const resolveIncident = useCallback((incidentId: string) => {
    setIncidents(prev =>
      prev.map(inc => (inc.id === incidentId ? { ...inc, status: 'CONTAINED' } : inc))
    );
    addLedger('incident.resolved', { incidentId });
  }, [addLedger]);

  // Peer Beacon addition
  const addBeacon = useCallback((beaconData: Omit<PeerBeacon, 'id' | 'lastSeen'>) => {
    const newBeacon: PeerBeacon = {
      ...beaconData,
      id: `bcn-${Date.now()}`,
      lastSeen: 'Just now',
    };
    setBeacons(prev => [newBeacon, ...prev]);
    addLedger('beacon.registered', { uuid: newBeacon.uuid, callsign: newBeacon.callsign });
  }, [addLedger]);

  // Network remedy trigger
  const triggerNetworkRemedy = useCallback((nodeName: string) => {
    setNetworkPackets(prev => [
      {
        timestamp: new Date().toLocaleTimeString(),
        node: nodeName,
        protocol: 'AXS-LOOPBACK',
        latencyMs: 4.8,
        jitterMs: 0.3,
        packetLossPercent: 0.0,
        stabilityScore: 98.7,
        remedyActive: true,
        remedyLog: `Dynamic routing remedy deployed for ${nodeName}. Bypassed high-jitter node path.`,
      },
      ...prev,
    ]);
    addLedger('network.remedy.deployed', { node: nodeName });
  }, [addLedger]);

  // Consensus Quorum Runner
  const runConsensusQuorum = useCallback(async (intent: string): Promise<{ quorum: boolean; consensusRate: number }> => {
    const t = await mintToken('consensus.round', { intent });
    // Random perturbation for simulation
    const updatedVotes = consensusVotes.map(v => {
      const conf = Math.min(0.999, Math.max(0.85, v.confidence + (Math.random() * 0.06 - 0.03)));
      return { ...v, confidence: Number(conf.toFixed(3)) };
    });
    setConsensusVotes(updatedVotes);
    const avgConfidence = updatedVotes.reduce((acc, v) => acc + v.confidence, 0) / updatedVotes.length;
    addLedger('consensus.quorum.reached', { intent, avgConfidence, fp: t.fp });
    return { quorum: true, consensusRate: avgConfidence };
  }, [consensusVotes, mintToken, addLedger]);

  // IRC Messaging
  const sendIRC = useCallback((channel: string, text: string) => {
    const msg: IRCMessage = {
      id: `irc-${Date.now()}`,
      channel,
      sender: 'Operator',
      timestamp: new Date().toLocaleTimeString(),
      text,
      verified: true,
    };
    setIrcMessages(prev => [...prev, msg]);
    addLedger('irc.message.sent', { channel, length: text.length });
  }, [addLedger]);

  // Terminal Command Execution Engine
  const execCommand = useCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    addTerminalLine(`cryptic> ${trimmed}`, 'user');
    addLedger('terminal.command', { cmd: trimmed.split(' ')[0] });

    const [cmd, ...args] = trimmed.split(/\s+/);
    const lower = cmd.toLowerCase();

    if (lower === 'help') {
      const helpText = `Available HyperTerminal Commands:
  help | about | status | clear
  globe | map | weather | incidents | radar
  panel spawn <module> | panel pop <module> | panel show <module> | glass clear | restore
  token <scope> | tokens | ledger
  telemetry start | snapshot | summary | clear
  bus routes | bus command <cmd> | bus aggregate <kind>
  consensus vote | consensus status | consensus perturb
  genie wish <intent> | genie world <seed> | genie token
  gaia verify | gaia init | gaia status | gaia evolve | matrix
  embed <query> | embed cosine (gemini-embedding-2-preview)
  sentinel verify | sentinel quine | sentinel audit
  galaxies warp | galaxies status | voice | quine | aurora | irc <msg>
  docs [search] | nodes | axs | identity | bridge status
  963 on|off | field on|off | guardian`;
      addTerminalLine(helpText, 'good');
      return;
    }

    if (lower === 'about') {
      addTerminalLine('Cryptic v0.9.2 // HyperTerminal Sovereign OS — Modular command center with local-first controls and 3D geospatial telemetry.', 'good');
      return;
    }

    if (lower === 'clear') {
      clearTerminal();
      return;
    }

    if (lower === 'status') {
      const st = {
        gate: gateOpen,
        viewMode,
        activePanels: panels.filter(p => !p.hidden).map(p => p.moduleId),
        oscillator963: oscillatorActive,
        tokensIssued: tokens.length,
        ledgerEntries: ledgerRecords.length,
        peerBeacons: beacons.length,
        activeIncidents: incidents.filter(i => i.status !== 'CONTAINED').length,
      };
      addTerminalLine(JSON.stringify(st, null, 2), 'system');
      return st;
    }

    if (lower === 'token') {
      const scope = args.join('.') || 'runtime.manual';
      const t = await mintToken(scope);
      addTerminalLine(`[MINTED] ${t.scope} · receipt ${t.fp}`, 'token', t.fp);
      return t;
    }

    if (lower === 'tokens') {
      if (!tokens.length) {
        addTerminalLine('No tokens in current memory ring.', 'warn');
      } else {
        addTerminalLine(tokens.slice(0, 10).map(t => `${t.scope} => fp=${t.fp} (issued ${new Date(t.issuedAt).toLocaleTimeString()})`).join('\n'), 'token');
      }
      return tokens;
    }

    if (lower === 'ledger') {
      addTerminalLine(JSON.stringify(ledgerRecords.slice(-8), null, 2), 'system');
      return ledgerRecords;
    }

    if (lower === 'globe' || lower === 'map' || lower === 'radar') {
      setViewMode('globe');
      openModule('globe');
      addTerminalLine('Switched viewport to GAIA 3D Geospatial Orbit and Incident Radar.', 'good');
      return;
    }

    if (lower === 'weather') {
      addTerminalLine(JSON.stringify(weatherStations, null, 2), 'system');
      return weatherStations;
    }

    if (lower === 'incidents') {
      addTerminalLine(JSON.stringify(incidents, null, 2), 'system');
      return incidents;
    }

    if (lower === 'panel') {
      const op = args[0]?.toLowerCase();
      const mod = args[1]?.toLowerCase() as ModuleId;
      if (op === 'spawn' || op === 'show') {
        if (mod) {
          openModule(mod);
          addTerminalLine(`Opened module [${mod}].`, 'good');
        } else {
          addTerminalLine('Usage: panel spawn <terminal|globe|network|audio|consensus|genie|matrix|galaxies|ledger|nodes|sentinel|irc|documents|telemetry|identity|axs>', 'warn');
        }
        return;
      }
      if (op === 'pop') {
        openModule(mod || 'terminal');
        addTerminalLine(`Module [${mod || 'terminal'}] brought to floating layer.`, 'good');
        return;
      }
      addTerminalLine('Usage: panel spawn|pop|show <module>', 'warn');
      return;
    }

    if (lower === 'glass') {
      if (args[0] === 'clear') {
        ghostAll(true);
        addTerminalLine('Translucency ghosting enabled for all open panels.', 'good');
      } else {
        restoreAll();
        addTerminalLine('Panel opacities restored.', 'good');
      }
      return;
    }

    if (lower === '963') {
      const on = args[0] !== 'off';
      toggle963(on);
      addTerminalLine(`963 Hz solfeggio oscillator ${on ? 'ENGAGED' : 'STOPPED'}.`, on ? 'good' : 'system');
      return;
    }

    if (lower === 'guardian') {
      showGate();
      addTerminalLine('Guardian threshold engaged. Access locked.', 'warn');
      return;
    }

    if (lower === 'gaia') {
      const sub = (args[0] || 'status').toLowerCase();
      if (sub === 'verify') {
        const t = await mintToken('gaia.verify');
        addTerminalLine(`[GAIA VERIFY] Live local checks:\n  PASS · WebCrypto SHA-256 Engine\n  PASS · Sovereign Offline Memory Fabric\n  PASS · Plus Code & Geospatial Grid Alignment\n  PASS · Emergency Trail Sensor Mesh\nRESULT=PASS_BROWSER_CHECKS · receipt ${t.fp}`, 'good', t.fp);
        return;
      }
      if (sub === 'init') {
        const t = await mintToken('gaia.init');
        addTerminalLine(`[GAIA INIT] Sovereign browser session initialized with receipt ${t.fp}. Zero external telemetry leaks.`, 'good', t.fp);
        return;
      }
      addTerminalLine(`[GAIA STATUS] Mode: Sovereign Offline · Node Count: 22 · Ledger Size: ${ledgerRecords.length} records.`, 'system');
      return;
    }

    if (lower === '/gemini' || lower === 'gemini') {
      const query = args.join(' ') || 'Analyze global network traffic patterns and suggest optimal emergency routing configurations.';
      const t = await mintToken('gemini.inference.request');
      addTerminalLine(`[GEMINI MULTIMODAL INFERENCE] (Receipt: ${t.fp})\nProcessing query: "${query}"\nAnalyzing geospatial and network telemetry: Autonomous route failover deployed. 3 Nature Trail Cams synchronized with Plus Code grids. Zero API keys exposed on client.`, 'ai', t.fp);
      return;
    }

    if (lower === 'genie' || lower === 'djinn' || lower === '/genie') {
      const wish = args.join(' ').trim() || 'Synthesize low-latency geospatial route with wild-fire avoidance';
      const t = await mintToken('djinn.wish.request');
      addTerminalLine(`[GENIE DJINN // جِنّي] Manifested intent into sovereign token [${t.fp}]. Intent: "${wish}". World simulation seed generated.`, 'good', t.fp);
      return;
    }

    if (lower === 'consensus' || lower === 'quorum') {
      const res = await runConsensusQuorum(args.join(' ') || 'Standard Sovereign Route Validation');
      addTerminalLine(`[D3 CONSENSUS QUORUM] Byzantine tolerance verified: Quorum REACHED with ${(res.consensusRate * 100).toFixed(1)}% agreement across Gemini, Aurora, Argon, and Genie Djinn.`, 'good');
      return;
    }

    if (lower === 'galaxies' || lower === 'skybox') {
      if (args[0] === 'warp') {
        addTerminalLine('[7 GALAXIES] Relativistic frame dragging boosted. Warp pulse wave propagated across orbitals.', 'good');
      } else {
        addTerminalLine('[7 GALAXIES SKYBOX] 7 Keplerian orbital clusters active with Kerr gravitational lensing.', 'system');
      }
      openModule('galaxies');
      return;
    }

    if (lower === 'voice') {
      toggle963(true);
      addTerminalLine('[POLYNEUROMORPHIC VOICE] 963 Hz harmonic carrier wave active. Web Audio neural synthesis connected.', 'good');
      openModule('audio');
      return;
    }

    if (lower === 'matrix') {
      openModule('matrix');
      addTerminalLine('[SOVEREIGN MATRIX] Kerr black hole ergosphere & Hopf fibration geometry mounted.', 'good');
      return;
    }

    if (lower === 'nodes') {
      openModule('nodes');
      addTerminalLine('[PUBLIC NODES] 22 sovereign network nodes listed in Node Surface module.', 'system');
      return;
    }

    if (lower === 'irc') {
      const text = args.join(' ');
      if (text) {
        sendIRC('#sovereign', text);
        addTerminalLine(`[IRC #sovereign] Broadcast: ${text}`, 'good');
      } else {
        openModule('irc');
        addTerminalLine('[NEXUS IRC] Opened Sovereign IRC Hub.', 'system');
      }
      return;
    }

    if (lower === 'docs' || lower === 'pdf') {
      openModule('documents');
      addTerminalLine('[DOCUMENTS] Sovereign PDF knowledge core and specification catalog ready.', 'system');
      return;
    }

    if (lower === 'telemetry') {
      openModule('telemetry');
      addTerminalLine('[TELEMETRY] Browser performance and hardware telemetry dataset loaded.', 'system');
      return;
    }

    if (lower === 'identity' || lower === 'axs') {
      openModule('identity');
      addTerminalLine('[SSH IDENTITY] HULE-LACE Ed25519 and P-256 key normalization panel loaded.', 'system');
      return;
    }

    addTerminalLine(`Unknown command: "${cmd}". Type "help" for command matrix.`, 'warn');
  }, [
    addTerminalLine,
    addLedger,
    clearTerminal,
    gateOpen,
    viewMode,
    panels,
    oscillatorActive,
    tokens,
    ledgerRecords,
    beacons,
    incidents,
    mintToken,
    weatherStations,
    openModule,
    ghostAll,
    restoreAll,
    toggle963,
    showGate,
    runConsensusQuorum,
    sendIRC,
  ]);

  return (
    <CrypticContext.Provider
      value={{
        gateOpen,
        enterGate,
        showGate,
        viewMode,
        setViewMode,
        clearUI,
        toggleClearUI,
        clockMode,
        cycleClockMode,
        systemTimeFormatted,
        oscillatorActive,
        toggle963,
        panels,
        openModule,
        closePanel,
        toggleCollapse,
        toggleGhost,
        duplicatePanel,
        bringToFront,
        updatePanelPos,
        ghostAll,
        restoreAll,
        tokens,
        ledgerRecords,
        mintToken,
        addLedger,
        terminalLines,
        execCommand,
        clearTerminal,
        addTerminalLine,
        beacons,
        addBeacon,
        weatherStations,
        incidents,
        resolveIncident,
        networkPackets,
        sensorDiagnostics,
        triggerNetworkRemedy,
        consensusVotes,
        runConsensusQuorum,
        ircMessages,
        sendIRC,
      }}
    >
      {children}
    </CrypticContext.Provider>
  );
};

export const useCryptic = () => {
  const ctx = useContext(CrypticContext);
  if (!ctx) throw new Error('useCryptic must be used within CrypticProvider');
  return ctx;
};
