import { SystemCheckpoint } from '../types';

const CHECKPOINTS_STORAGE_KEY = 'cryptic_checkpoints_vault_v1';
const MAX_STORED_CHECKPOINTS = 20;

export const computeStateHash = (payload: any): string => {
  const str = JSON.stringify(payload);
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `0xCHK_${hex1}${hex2}`.toUpperCase();
};

export const loadStoredCheckpoints = (): SystemCheckpoint[] => {
  try {
    const raw = localStorage.getItem(CHECKPOINTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load checkpoints from localStorage', e);
    return [];
  }
};

export const persistCheckpoints = (checkpoints: SystemCheckpoint[]): void => {
  try {
    const trimmed = checkpoints.slice(0, MAX_STORED_CHECKPOINTS);
    localStorage.setItem(CHECKPOINTS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to persist checkpoints to localStorage', e);
  }
};

export const createSystemCheckpoint = (
  name: string,
  stateSnapshot: Record<string, any>,
  autoSaved: boolean = false
): SystemCheckpoint => {
  const now = new Date().toISOString();
  const hash = computeStateHash(stateSnapshot);

  // Compute evolutionary growth score based on activities
  const tokenWeight = (stateSnapshot.tokens?.length || 0) * 12;
  const ledgerWeight = (stateSnapshot.ledgerRecords?.length || 0) * 8;
  const arbitrageWeight = Math.floor((stateSnapshot.arbitrageProfitUsd || 1420) / 10);
  const satcomWeight = Math.floor((stateSnapshot.satcomPacketsRelayed || 6000) / 25);
  const growthScore = 1000 + tokenWeight + ledgerWeight + arbitrageWeight + satcomWeight;

  const checkpoint: SystemCheckpoint = {
    id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    timestamp: now,
    hash,
    growthScore,
    totalTokens: stateSnapshot.tokens?.length || 0,
    totalLedgerRecords: stateSnapshot.ledgerRecords?.length || 0,
    activePanelsCount: stateSnapshot.panels?.filter((p: any) => !p.hidden).length || 0,
    arbitrageBalanceUsd: stateSnapshot.arbitrageBalanceUsd || 54250.80,
    satcomPacketsRelayed: stateSnapshot.satcomPacketsRelayed || 14820,
    stateSnapshot,
    autoSaved,
  };

  const existing = loadStoredCheckpoints();
  const updated = [checkpoint, ...existing];
  persistCheckpoints(updated);
  return checkpoint;
};

export const rollbackToCheckpoint = (checkpointId: string): SystemCheckpoint | null => {
  const checkpoints = loadStoredCheckpoints();
  const target = checkpoints.find(c => c.id === checkpointId);
  if (!target) return null;

  // Restore panel positions if available
  if (target.stateSnapshot.panels) {
    try {
      localStorage.setItem('cryptic.panels.v2', JSON.stringify(target.stateSnapshot.panels));
    } catch {}
  }
  // Restore ledger if available
  if (target.stateSnapshot.ledgerRecords) {
    try {
      localStorage.setItem('cryptic.ledger', JSON.stringify(target.stateSnapshot.ledgerRecords));
    } catch {}
  }
  // Restore arbitrage data
  if (target.stateSnapshot.arbitrageState) {
    try {
      localStorage.setItem('cryptic_arbitrage_vault_v1', JSON.stringify(target.stateSnapshot.arbitrageState));
    } catch {}
  }

  return target;
};
