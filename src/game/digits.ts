import type { NumericBase } from './types.js';

/** Digit alphabet shared by all supported bases, in ascending value order. */
const DIGIT_ALPHABET = '0123456789abcdef';

/**
 * Curried factory: given a radix, returns a predicate telling whether a
 * character is a valid digit in that radix. Hex accepts both `a`..`f` and
 * `A`..`F` (case-insensitive comparison via toLowerCase).
 */
export const createDigitValidator =
  (base: NumericBase) =>
  (char: string): boolean => {
    if (char.length !== 1) {
      return false;
    }

    const index = DIGIT_ALPHABET.indexOf(char.toLowerCase());

    return index >= 0 && index < base;
  };
