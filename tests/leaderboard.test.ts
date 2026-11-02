import { describe, expect, it } from 'vitest';
import {
  addRecord,
  DEFAULT_TOP_SIZE,
  isBetterRecord,
  TOP_SIZE,
  sortRecords,
} from '../src/game/leaderboard.js';
import type { LeaderboardRecord } from '../src/game/types.js';

const record = (
  attempts: number,
  elapsedMs: number,
  overrides: Partial<LeaderboardRecord> = {},
): LeaderboardRecord => ({
  length: 4,
  base: 10,
  attempts,
  elapsedMs,
  finishedAt: 1_000,
  ...overrides,
});

describe('isBetterRecord', () => {
  it('prefers fewer attempts regardless of time', () => {
    expect(isBetterRecord(record(3, 100_000), record(5, 1_000))).toBe(true);
    expect(isBetterRecord(record(5, 1_000), record(3, 100_000))).toBe(false);
  });

  it('breaks attempt ties with shorter time', () => {
    expect(isBetterRecord(record(4, 5_000), record(4, 9_000))).toBe(true);
    expect(isBetterRecord(record(4, 9_000), record(4, 5_000))).toBe(false);
  });

  it('treats equal attempts and equal time as not better', () => {
    expect(isBetterRecord(record(4, 5_000), record(4, 5_000))).toBe(false);
  });

  it('compares records of different settings independently', () => {
    expect(isBetterRecord(record(2, 1_000, { base: 2 }), record(3, 1_000))).toBe(true);
  });
});

describe('sortRecords', () => {
  it('orders by attempts, then by elapsed time', () => {
    const sorted = sortRecords([
      record(5, 1_000),
      record(3, 9_000),
      record(3, 4_000),
      record(4, 1_000),
    ]);

    expect(sorted.map(item => item.attempts)).toEqual([3, 3, 4, 5]);
    expect(sorted.map(item => item.elapsedMs)).toEqual([4_000, 9_000, 1_000, 1_000]);
  });

  it('returns a new array and leaves the input order untouched', () => {
    const input = [record(5, 1_000), record(3, 1_000)];
    const sorted = sortRecords(input);

    expect(sorted).not.toBe(input);
    expect(input.map(item => item.attempts)).toEqual([5, 3]);
  });

  it('is stable for fully equal records', () => {
    const first = record(4, 5_000, { finishedAt: 1 });
    const second = record(4, 5_000, { finishedAt: 2 });
    const sorted = sortRecords([second, first]);

    expect(sorted[0]).toBe(second);
    expect(sorted[1]).toBe(first);
  });
});

describe('addRecord', () => {
  it('appends the new record and sorts the list', () => {
    const updated = addRecord([record(5, 100)], record(3, 200));

    expect(updated).toHaveLength(2);
    expect(updated[0]?.attempts).toBe(3);
  });

  it('does not mutate the passed list', () => {
    const before = [record(3, 100)];
    addRecord(before, record(2, 100));

    expect(before).toHaveLength(1);
  });

  it('keeps only the top N best results', () => {
    let records: LeaderboardRecord[] = [];
    for (let attempt = 12; attempt >= 1; attempt -= 1) {
      records = addRecord(records, record(attempt, 1_000));
    }

    expect(records).toHaveLength(TOP_SIZE);
    expect(records[0]?.attempts).toBe(1);
    expect(records[TOP_SIZE - 1]?.attempts).toBe(TOP_SIZE);
  });

  it('trims an existing list that already exceeds the cap', () => {
    const overflow = Array.from({ length: DEFAULT_TOP_SIZE + 3 }, (_unused, index) =>
      record(index + 1, 1_000),
    );

    expect(addRecord(overflow, record(1, 100))).toHaveLength(DEFAULT_TOP_SIZE);
  });

  it('drops records pushed out by a better result, not just the oldest', () => {
    // A full list is required: only then does a new entry push a record out.
    const records = Array.from({ length: TOP_SIZE }, (_unused, index) => record(index + 1, 5_000));
    const updated = addRecord(records, record(1, 1_000));

    expect(updated).toHaveLength(TOP_SIZE);
    expect(updated[0]).toEqual(record(1, 1_000));
    // The weakest record (the most attempts) is gone, the rest remain.
    expect(updated.some(item => item.attempts === TOP_SIZE)).toBe(false);
    expect(updated.some(item => item.attempts === TOP_SIZE - 1)).toBe(true);
  });
});

describe('TOP_SIZE', () => {
  it('is exported with a sane default', () => {
    expect(TOP_SIZE).toBeGreaterThanOrEqual(5);
    expect(DEFAULT_TOP_SIZE).toBe(TOP_SIZE);
  });
});
