import type { Guess, Score, Secret } from './types.js';

/**
 * Compares a guess with the secret and returns how many digits are correct and
 * well placed (bulls) plus how many are correct but misplaced (cows). Digits
 * are compared case-insensitively, and each digit position is counted at most
 * once, so cows never double-count a bull.
 *
 * Stub: TDD red step, always reports an empty score.
 */
export const evaluateGuess = (_secret: Secret, _guess: Guess): Score => ({
  bulls: 0,
  cows: 0,
});
