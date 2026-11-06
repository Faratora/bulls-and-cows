import { describe, expect, it } from 'vitest';
import {
  attemptsOf,
  backToSettings,
  elapsedOf,
  emptyState,
  isDuplicateGuess,
  isWon,
  recordGuess,
  startRound,
} from '../src/game/state.js';
import type { GameState, GameSettings, RandomSource } from '../src/game/types.js';

const DECIMAL_SETTINGS: GameSettings = { length: 4, base: 10 };
const HEX_SETTINGS: GameSettings = { length: 3, base: 16 };
const START = 1_000_000;

/** Deterministic source: always picks the first remaining digit. */
const zeroRandom: RandomSource = () => 0;

const startedRound = (settings: GameSettings = DECIMAL_SETTINGS): GameState =>
  startRound(settings, zeroRandom, START);

describe('game state', () => {
  describe('startRound', () => {
    it('moves to the playing phase with the given settings', () => {
      const state = startedRound();

      expect(state.phase).toBe('playing');
      expect(state.settings).toEqual(DECIMAL_SETTINGS);
    });

    it('generates a secret matching the settings', () => {
      const state = startedRound();

      expect(state.secret).toHaveLength(4);
      expect(new Set(state.secret.split('')).size).toBe(4);
    });

    it('starts with an empty history and no finish time', () => {
      const state = startedRound();

      expect(state.history).toEqual([]);
      expect(state.startedAt).toBe(START);
      expect(state.firstGuessAt).toBe(0);
      expect(state.finishedAt).toBeNull();
    });

    it('is deterministic for an injected random source', () => {
      expect(startedRound().secret).toBe('0123');
      expect(startRound(HEX_SETTINGS, zeroRandom, START).secret).toBe('012');
    });

    it('keeps settings objects equal but not shared by reference', () => {
      const state = startedRound();

      expect(state.settings).not.toBe(DECIMAL_SETTINGS);
    });
  });

  describe('recordGuess immutability', () => {
    it('returns a new state object instead of mutating the previous one', () => {
      const before = startedRound();
      const after = recordGuess(before, '5678', START + 100);

      expect(after).not.toBe(before);
      expect(before.history).toHaveLength(0);
      expect(after.history).toHaveLength(1);
    });

    it('appends a new history entry built from a fresh array', () => {
      const before = startedRound();
      const first = recordGuess(before, '5678', START + 100);
      const second = recordGuess(first, '0123', START + 200);

      expect(second.history).not.toBe(first.history);
      expect(first.history).toHaveLength(1);
      expect(second.history).toHaveLength(2);
    });

    it('keeps earlier entries unchanged and in order', () => {
      const first = recordGuess(startedRound(), '5678', START + 100);
      const second = recordGuess(first, '0123', START + 200);

      expect(second.history[0]).toBe(first.history[0]);
      expect(second.history[0]).toEqual({ guess: '5678', score: { bulls: 0, cows: 0 } });
      expect(second.history[1]).toEqual({ guess: '0123', score: { bulls: 4, cows: 0 } });
    });

    it('never mutates the secret or the settings', () => {
      const before = startedRound();
      const after = recordGuess(before, '5678', START + 100);

      expect(after.secret).toBe(before.secret);
      expect(after.settings).toEqual(before.settings);
    });
  });

  describe('winning the round', () => {
    it('stays in the playing phase while bulls are below the length', () => {
      const state = recordGuess(startedRound(), '0120', START + 100);

      expect(state.phase).toBe('playing');
      expect(state.finishedAt).toBeNull();
      expect(isWon(state)).toBe(false);
    });

    it('switches to the won phase and stores the finish time', () => {
      const state = recordGuess(startedRound(), '0123', START + 5_000);

      expect(state.phase).toBe('won');
      expect(state.finishedAt).toBe(START + 5_000);
      expect(isWon(state)).toBe(true);
    });

    it('ignores further guesses once the round is won', () => {
      const won = recordGuess(startedRound(), '0123', START + 5_000);
      const later = recordGuess(won, '9876', START + 9_000);

      expect(later).toBe(won);
      expect(later.history).toHaveLength(1);
    });
  });

  describe('duplicate guesses', () => {
    it('detects a guess that was already used', () => {
      const state = recordGuess(startedRound(), '5678', START + 100);

      expect(isDuplicateGuess(state, '5678')).toBe(true);
      expect(isDuplicateGuess(state, '8765')).toBe(false);
    });

    it('does not add a second entry for a repeated guess', () => {
      const first = recordGuess(startedRound(), '5678', START + 100);
      const repeated = recordGuess(first, '5678', START + 200);

      expect(repeated).toBe(first);
      expect(repeated.history).toHaveLength(1);
    });

    it('compares hex guesses case-insensitively', () => {
      const first = recordGuess(startRound(HEX_SETTINGS, zeroRandom, START), '0a1', START + 100);

      expect(isDuplicateGuess(first, '0A1')).toBe(true);
    });
  });

  describe('derived values', () => {
    it('counts attempts as the history size', () => {
      const first = recordGuess(startedRound(), '5678', START + 100);
      const second = recordGuess(first, '6789', START + 200);

      expect(attemptsOf(startedRound())).toBe(0);
      expect(attemptsOf(second)).toBe(2);
    });

    it('shows no elapsed time before the first guess', () => {
      expect(elapsedOf(startedRound(), START + 2_500)).toBe(0);
    });

    it('measures elapsed time from the first guess while playing', () => {
      const first = recordGuess(startedRound(), '5678', START + 1_000);

      expect(elapsedOf(first, START + 3_500)).toBe(2_500);
    });

    it('preserves the first-guess time across subsequent guesses', () => {
      const first = recordGuess(startedRound(), '5678', START + 1_000);
      const second = recordGuess(first, '6789', START + 2_000);

      expect(elapsedOf(second, START + 4_000)).toBe(3_000);
    });

    it('freezes elapsed time at the win moment', () => {
      const first = recordGuess(startedRound(), '5678', START + 1_000);
      const won = recordGuess(first, '0123', START + 6_000);

      expect(elapsedOf(won, START + 900_000)).toBe(5_000);
    });
  });

  describe('backToSettings', () => {
    it('resets to the settings phase without a secret or history', () => {
      const won = recordGuess(startedRound(), '0123', START + 5_000);
      const reset = backToSettings(won);

      expect(reset.phase).toBe('settings');
      expect(reset.history).toEqual([]);
      expect(reset.secret).toBe('');
      expect(reset.finishedAt).toBeNull();
    });

    it('keeps the settings of the finished round for the next one', () => {
      const reset = backToSettings(startedRound(HEX_SETTINGS));

      expect(reset.settings).toEqual(HEX_SETTINGS);
    });

    it('does not mutate the state it was given', () => {
      const won = recordGuess(startedRound(), '0123', START + 5_000);
      const reset = backToSettings(won);

      expect(won.phase).toBe('won');
      expect(reset).not.toBe(won);
    });
  });

  describe('emptyState', () => {
    it('describes a round that has not been started yet', () => {
      const state = emptyState(DECIMAL_SETTINGS);

      expect(state.phase).toBe('settings');
      expect(state.secret).toBe('');
      expect(state.history).toEqual([]);
      expect(state.finishedAt).toBeNull();
    });

    it('is independent from the settings object it receives', () => {
      const state = emptyState(DECIMAL_SETTINGS);

      expect(state.settings).not.toBe(DECIMAL_SETTINGS);
    });
  });
});
