import type { LeaderboardRecord } from './types.js';

/**
 * Pure leaderboard logic: order by attempts, then by elapsed time, cap the
 * list at TOP_SIZE. The storage itself lives in the UI layer; this module
 * stays DOM-free and testable.
 */

/** How many best results are kept per settings combination. */
export const TOP_SIZE = 10;

/** Alias kept for readability where the default cap is referenced. */
export const DEFAULT_TOP_SIZE = TOP_SIZE;

/**
 * A record is better with fewer attempts; equal attempts are decided by
 * shorter elapsed time. Equal attempts and equal time is not "better".
 */
export const isBetterRecord = (
  candidate: LeaderboardRecord,
  existing: LeaderboardRecord,
): boolean =>
  candidate.attempts !== existing.attempts
    ? candidate.attempts < existing.attempts
    : candidate.elapsedMs < existing.elapsedMs;

/**
 * Comparison used for sorting: negative when `a` ranks above `b`. Returning 0
 * for fully equal records keeps the sort stable, preserving relative order.
 */
const compareRecords = (a: LeaderboardRecord, b: LeaderboardRecord): number =>
  a.attempts !== b.attempts ? a.attempts - b.attempts : a.elapsedMs - b.elapsedMs;

/** Returns a new sorted list; the input order is preserved. */
export const sortRecords = (records: readonly LeaderboardRecord[]): LeaderboardRecord[] =>
  [...records].sort(compareRecords);

/** Adds a record and keeps only the TOP_SIZE best results. */
export const addRecord = (
  records: readonly LeaderboardRecord[],
  record: LeaderboardRecord,
): LeaderboardRecord[] => sortRecords([...records, record]).slice(0, TOP_SIZE);
