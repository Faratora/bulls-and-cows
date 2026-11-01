import type { NumericBase, RandomSource, Secret, SecretLength } from './types.js';

/**
 * Builds a secret: `length` unique digits taken from the alphabet of `base`.
 * The randomness source is injected so the function stays pure and testable.
 *
 * Stub: TDD red step, produces an empty secret.
 */
export const generateSecret = (
  _length: SecretLength,
  _base: NumericBase,
  _random: RandomSource = Math.random,
): Secret => '';
