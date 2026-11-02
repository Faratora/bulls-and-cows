import { TOP_SIZE, addRecord, sortRecords } from '../game/leaderboard.js';
import type { GameSettings, LeaderboardRecord, NumericBase, SecretLength } from '../game/types.js';

/** Storage key of one per-settings leaderboard. */
const storageKey = (settings: GameSettings): string =>
  `bulls-and-cows:top:${settings.base}:${settings.length}`;

/** Runtime check for a parsed record: the file may hold anything at all. */
const isRecord = (value: unknown): value is LeaderboardRecord => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.length === 'number' &&
    typeof candidate.base === 'number' &&
    typeof candidate.attempts === 'number' &&
    typeof candidate.elapsedMs === 'number' &&
    typeof candidate.finishedAt === 'number'
  );
};

/**
 * Reads the leaderboard of one settings combination. Corrupted or missing
 * data degrades to an empty list instead of breaking the round.
 */
export const loadRecords = (settings: GameSettings): LeaderboardRecord[] => {
  const raw = window.localStorage.getItem(storageKey(settings));

  if (raw === null) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return sortRecords(parsed.filter(isRecord)).slice(0, TOP_SIZE);
  } catch {
    return [];
  }
};

/** Persists the leaderboard of one settings combination. */
export const saveRecords = (
  settings: GameSettings,
  records: readonly LeaderboardRecord[],
): void => {
  window.localStorage.setItem(storageKey(settings), JSON.stringify(records));
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

  saveRecords(settings, addRecord(loadRecords(settings), entry));
};

/** Human-readable settings badge, e.g. "dec · 4". */
export const formatSettings = (settings: GameSettings): string => {
  const NAMES: Record<NumericBase, string> = { 2: 'bin', 8: 'oct', 10: 'dec', 16: 'hex' };
  const length = settings.length as SecretLength;

  return `${NAMES[settings.base]} · ${length}`;
};
