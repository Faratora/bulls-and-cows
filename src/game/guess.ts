import type { NumericBase, SecretLength } from './types.js';

/**
 * Checks that a guess has exactly `length` characters, that every character is
 * a digit allowed by `base`, and that no digit repeats. Hex digits are compared
 * case-insensitively, so `Aa` counts as a repetition.
 *
 * Stub: TDD red step, rejects every guess.
 */
export const isValidGuess = (_guess: string, _length: SecretLength, _base: NumericBase): boolean =>
  false;
