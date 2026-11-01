/**
 * Shared types for the game core. The core is DOM-free: everything here is
 * plain data, updated immutably by pure functions.
 */

/** Supported radixes: binary, octal, decimal, hexadecimal. */
export type NumericBase = 2 | 8 | 10 | 16;

/** Allowed secret length in digits (clamped further by the radix alphabet). */
export type SecretLength = 2 | 3 | 4 | 5 | 6;

/**
 * A secret or a guess is a string of unique digits, lowercase-normalized.
 * Strings (not numbers) keep leading zeros meaningful, e.g. "0123".
 */
export type Secret = string;
export type Guess = string;

/** Result of comparing one guess with the secret. */
export interface Score {
  readonly bulls: number;
  readonly cows: number;
}

/** One row of the guess history; entries are never mutated afterwards. */
export interface HistoryEntry {
  readonly guess: Guess;
  readonly score: Score;
}

/** Settings chosen before the round starts; frozen for the round duration. */
export interface GameSettings {
  readonly length: SecretLength;
  readonly base: NumericBase;
}

export type GamePhase = 'settings' | 'playing' | 'won';

/** Immutable snapshot of the whole round. */
export interface GameState {
  readonly phase: GamePhase;
  readonly settings: GameSettings;
  readonly secret: Secret;
  readonly history: readonly HistoryEntry[];
  readonly startedAt: number;
  readonly finishedAt: number | null;
}

/** Persisted best result for one settings combination. */
export interface LeaderboardRecord {
  readonly length: SecretLength;
  readonly base: NumericBase;
  readonly attempts: number;
  readonly elapsedMs: number;
  readonly finishedAt: number;
}
