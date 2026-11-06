import { generateSecret } from './secret.js';
import { evaluateGuess } from './score.js';
import type { GameSettings, GameState, Guess, HistoryEntry, RandomSource } from './types.js';

/**
 * Immutable round state helpers. Every transition returns a fresh state built
 * with spread objects and array literals; nothing is ever mutated in place.
 */

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
 */
export const startRound = (
  settings: GameSettings,
  random: RandomSource = Math.random,
  startedAt: number = Date.now(),
): GameState => ({
  phase: 'playing',
  settings: { ...settings },
  secret: generateSecret(settings.length, settings.base, random),
  history: [],
  startedAt,
  finishedAt: null,
});

/** Attempts are simply the number of history entries. */
export const attemptsOf = (state: GameState): number => state.history.length;

/** Elapsed time keeps growing while playing and freezes at the win moment. */
export const elapsedOf = (state: GameState, now: number): number =>
  (state.finishedAt ?? now) - state.startedAt;

/** The round is won as soon as the phase switched to `won`. */
export const isWon = (state: GameState): boolean => state.phase === 'won';

/** A guess is a duplicate when the history already contains it, case ignored. */
export const isDuplicateGuess = (state: GameState, guess: Guess): boolean => {
  const normalized = guess.toLowerCase();

  return state.history.some(entry => entry.guess.toLowerCase() === normalized);
};

/**
 * Records one guess: appends a new history entry to a fresh array and, when
 * the secret is fully guessed, finishes the round with the current timestamp.
 * Guesses after the win and repeated guesses return the same state untouched.
 */
export const recordGuess = (state: GameState, guess: Guess, now: number): GameState => {
  if (state.phase !== 'playing' || isDuplicateGuess(state, guess)) {
    return state;
  }

  const entry: HistoryEntry = { guess, score: evaluateGuess(state.secret, guess) };
  const history = [...state.history, entry];
  const won = entry.score.bulls === state.settings.length;

  return {
    ...state,
    history,
    phase: won ? 'won' : state.phase,
    finishedAt: won ? now : state.finishedAt,
  };
};

/** Returns to the settings phase, keeping the settings of the finished round. */
export const backToSettings = (state: GameState): GameState => emptyState(state.settings);
