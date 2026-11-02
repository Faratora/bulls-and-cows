import type { GameSettings, GameState, RandomSource } from './types.js';

/**
 * A round that has not started yet: settings phase, no secret and no history.
 * The settings object is copied so the state never aliases caller-owned data.
 */
export const emptyState = (settings: GameSettings): GameState => ({
  phase: 'settings',
  settings: { ...settings },
  secret: '',
  history: [],
  startedAt: 0,
  finishedAt: null,
});

/**
 * Starts a round: freezes the settings, generates the secret and remembers the
 * start timestamp. The random source is injected to keep the function pure.
 *
 * Stub: TDD red step, produces a settings-phase state without a secret.
 */
export const startRound = (
  settings: GameSettings,
  _random: RandomSource = Math.random,
  _startedAt = 0,
): GameState => emptyState(settings);

/** Attempts are simply the number of history entries. Stub: always zero. */
export const attemptsOf = (_state: GameState): number => 0;

/** Elapsed time is frozen at the win moment. Stub: always zero. */
export const elapsedOf = (_state: GameState, _now: number): number => 0;

/** The round is won as soon as the phase switched to `won`. Stub: never. */
export const isWon = (_state: GameState): boolean => false;

/** A guess is a duplicate when the history already contains it. Stub: never. */
export const isDuplicateGuess = (_state: GameState, _guess: string): boolean => false;

/**
 * Records one guess: appends an immutable history entry and, when the secret
 * is fully guessed, finishes the round with the current timestamp. Repeating
 * an already used guess returns the same state untouched.
 *
 * Stub: TDD red step, ignores every guess.
 */
export const recordGuess = (state: GameState, _guess: string, _now: number): GameState => state;

/** Returns to the settings phase. Stub: identity. */
export const backToSettings = (state: GameState): GameState => state;
