import type { LeaderboardRecord } from './types.js';

/**
 * Pure leaderboard logic: order by attempts, then by elapsed time, cap the
 * list at TOP_SIZE. The storage itself lives in the UI layer; this module
 * stays DOM-free and testable.
 *
 * Stubs: TDD red step, nothing is reordered or trimmed yet.
 */

/** How many best results are kept per settings combination. */
export const TOP_SIZE = 10;

/** Alias kept for readability where the default cap is referenced. */
export const DEFAULT_TOP_SIZE = TOP_SIZE;

/** A record is better with fewer attempts, then with less elapsed time. */
export const isBetterRecord = (
  _candidate: LeaderboardRecord,
  _existing: LeaderboardRecord,
): boolean => false;

/** Returns a new sorted list; the input order is preserved. */
export const sortRecords = (records: readonly LeaderboardRecord[]): LeaderboardRecord[] => [
  ...records,
];

/** Adds a record and trims the list to the cap. */
export const addRecord = (
  records: readonly LeaderboardRecord[],
  record: LeaderboardRecord,
): LeaderboardRecord[] => [...records, record];
