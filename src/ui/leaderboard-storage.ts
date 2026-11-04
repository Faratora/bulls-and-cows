import { TOP_SIZE, addRecord, sortRecords } from '../game/leaderboard.js';
import type { GameSettings, LeaderboardRecord, NumericBase, SecretLength } from '../game/types.js';

/** Shared storage key for the unified leaderboard. */
const STORAGE_KEY = 'bulls-and-cows:top';

/** Prefix used by the old per-settings keys (kept for migration). */
const OLD_KEY_PREFIX = 'bulls-and-cows:top:';

/** Valid bases and lengths for runtime record validation. */
const VALID_BASES = new Set<NumericBase>([2, 8, 10, 16]);
const VALID_LENGTHS = new Set<SecretLength>([2, 3, 4, 5, 6]);

/** Runtime check for a parsed record: the file may hold anything at all. */
const isRecord = (value: unknown): value is LeaderboardRecord => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    VALID_LENGTHS.has(candidate.length as SecretLength) &&
    VALID_BASES.has(candidate.base as NumericBase) &&
    typeof candidate.attempts === 'number' &&
    typeof candidate.elapsedMs === 'number' &&
    typeof candidate.finishedAt === 'number'
  );
};

/**
 * Reads the unified leaderboard. If the new key is absent, falls back to the
 * old per-settings keys and migrates everything into the new key.
 */
export const loadRecords = (): LeaderboardRecord[] => {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (raw !== null) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return sortRecords(parsed.filter(isRecord)).slice(0, TOP_SIZE);
    } catch {
      return [];
    }
  }

  // Migration: collect records from old per-settings keys.
  const allRecords: LeaderboardRecord[] = [];

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(OLD_KEY_PREFIX) && key !== STORAGE_KEY) {
      try {
        const parsed: unknown = JSON.parse(window.localStorage.getItem(key) || '[]');
        if (Array.isArray(parsed)) {
          allRecords.push(...parsed.filter(isRecord));
        }
      } catch {
        // Ignore corrupted old keys.
      }
    }
  }

  const migrated = sortRecords(allRecords).slice(0, TOP_SIZE);
  saveRecords(migrated);
  return migrated;
};

/** Persists the unified leaderboard. */
export const saveRecords = (records: readonly LeaderboardRecord[]): void => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

/** Builds a record from a finished round and appends it to storage. */
export const recordWin = (settings: GameSettings, attempts: number, elapsedMs: number): void => {
  const entry: LeaderboardRecord = {
    length: settings.length,
    base: settings.base,
    attempts,
    elapsedMs,
    finishedAt: Date.now(),
  };

  saveRecords(addRecord(loadRecords(), entry));
};

/** Human-readable settings badge, e.g. "dec · 4". */
export const formatSettings = (settings: GameSettings): string => {
  const NAMES: Record<NumericBase, string> = { 2: 'bin', 8: 'oct', 10: 'dec', 16: 'hex' };
  const length = settings.length as SecretLength;

  return `${NAMES[settings.base]} · ${length}`;
};
