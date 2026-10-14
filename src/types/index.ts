export type ModuleId =
  | 'terminal'
  | 'globe'
  | 'network'
  | 'audio'
  | 'consensus'
  | 'genie'
  | 'matrix'
  | 'galaxies'
  | 'ledger'
  | 'nodes'
  | 'sentinel'
  | 'irc'
  | 'documents'
  | 'telemetry'
  | 'identity'
  | 'axs';

export interface ModuleDefinition {
  id: ModuleId;
  title: string;
  category: 'core' | 'geospatial' | 'intelligence' | 'physics' | 'comms' | 'security';
  icon: string;
  badge?: string;
  defaultPos: { x: number; y: number; w: number; h: number };
}

export interface PanelInstanceState {
  id: string; // unique instance id, e.g. "panel-terminal-1"
  moduleId: ModuleId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  collapsed: boolean;
  ghost: boolean;
  hidden: boolean;
}

export interface TerminalOutputLine {
  id: string;
  text: string;
  type: 'system' | 'user' | 'good' | 'warn' | 'bad' | 'token' | 'ai';
  time: string;
  receipt?: string;
}

export interface LedgerRecord {
  ts: string;
  event: string;
  data: Record<string, string | number | boolean | null>;
}

export interface CrypticToken {
  id: string;
  scope: string;
  issuedAt: number;
  expiresAt: number;
  fp: string;
}

// Geospatial & Emergency & Social Types
export interface PeerBeacon {
  id: string;
  uuid: string;
  callsign: string;
  lat: number;
  lng: number;
  altitude: number; // in meters
  plusCode: string;
  status: 'active' | 'transmitting' | 'standby' | 'emergency';
  signalDbm: number;
  lastSeen: string;
}

export interface WeatherStationData {
  region: string;
  lat: number;
  lng: number;
  tempC: number;
  condition: string;
  windSpeedKmh: number;
  windDirection: string;
  pressureHpa: number;
  humidityPercent: number;
  wildfireRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface EmergencyIncident {
  id: string;
  type: 'wildfire_thermal' | 'traffic_accident' | 'road_closure' | 'network_outage' | 'seismic_alert';
  title: string;
  severity: 'info' | 'warning' | 'critical';
  lat: number;
  lng: number;
  locationName: string;
  plusCode: string;
  reportedAgo: string;
  status: 'DISPATCHED' | 'MONITORING' | 'CONTAINED' | 'INVESTIGATING';
  trailCamUrl?: string;
  details: string;
}

// Network Telemetry & Diagnostic Types
export interface NetworkPacketTelemetry {
  timestamp: string;
  node: string;
  protocol: 'QUIC' | 'TCP' | 'UDP' | 'WEBSOCKET' | 'AXS-LOOPBACK';
  latencyMs: number;
  jitterMs: number;
  packetLossPercent: number;
  stabilityScore: number; // 0 - 100
  remedyActive: boolean;
  remedyLog?: string;
}

export interface SensorDiagnostic {
  sensorId: string;
  name: string;
  region: string;
  status: 'NOMINAL' | 'DEGRADED' | 'FAILOVER' | 'OFFLINE';
  thermalC: number;
  firmware: string;
  lastHeartbeat: string;
}

// Consensus Model Vote
export interface ConsensusModelVote {
  modelId: 'Gemini-2.5-Flash' | 'Aurora-Singularity' | 'Argon-Heuristic' | 'Genie-Djinn';
  vote: 'ENDORSE' | 'QUORUM' | 'VERIFY' | 'AMEND';
  confidence: number; // 0 - 1
  entropy: number;
  hash: string;
}

// IRC Message
export interface IRCMessage {
  id: string;
  channel: string;
  sender: string;
  timestamp: string;
  text: string;
  verified: boolean;
}
