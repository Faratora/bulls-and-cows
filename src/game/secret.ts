import type { NumericBase, RandomSource, Secret, SecretLength } from './types.js';

/**
 * Digit alphabet of a radix as an immutable list, e.g. base 8 gives
 * ['0','1','2','3','4','5','6','7']. Index toString(16) renders 10..15 as a..f.
 */
export const buildAlphabet = (base: NumericBase): string[] =>
  Array.from({ length: base }, (_unused, index) => index.toString(16));

/** Digit at `index` of the pool, found by folding over the list. */
const takeAt = (pool: readonly string[], index: number): string =>
  pool.reduce((taken, digit, position) => (position === index ? digit : taken), '');

/** A new pool without the element at `index`; the input is never mutated. */
const withoutAt = (pool: readonly string[], index: number): string[] =>
  pool.filter((_digit, position) => position !== index);

/**
 * Recursively draws one digit per step: the random value selects an index in
 * the remaining pool, so a drawn digit can never be picked twice.
 */
const pickDigits = (
  pool: readonly string[],
  remaining: number,
  random: RandomSource,
): readonly string[] => {
  if (remaining === 0) {
    return [];
  }

  const index = Math.floor(random() * pool.length);

  return [takeAt(pool, index), ...pickDigits(withoutAt(pool, index), remaining - 1, random)];
};

/**
 * Builds a secret: `length` unique digits taken from the alphabet of `base`.
 * The randomness source is injected, which keeps generation a pure, testable
 * function; the default `Math.random` is used only when no source is given.
 * A secret may start with a zero, so the result is a string, not a number.
 */
export const generateSecret = (
  length: SecretLength,
  base: NumericBase,
  random: RandomSource = Math.random,
): Secret => pickDigits(buildAlphabet(base), length, random).join('');
