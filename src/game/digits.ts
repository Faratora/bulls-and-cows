import type { NumericBase } from './types.js';

/**
 * Curried factory: given a radix, returns a predicate telling whether a
 * character is a valid digit in that radix. Hex accepts both `a`..`f` and
 * `A`..`F` (case-insensitive comparison via toLowerCase).
 *
 * Stub: TDD red step, returns false for every character.
 */
export const createDigitValidator =
  (_base: NumericBase) =>
  (_char: string): boolean =>
    false;
