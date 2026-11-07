import { memoize2 } from '../utils/memoize.js';
import type { NumericBase, SecretLength } from './types.js';

/**
 * Number of distinct secrets: permutations without repetition,
 * P(base, length) = base! / (base - length)!. A secret may start with zero, so
 * no leading-zero variant is subtracted.
 *
 * Recursive form: P(base, length) = base * P(base - 1, length - 1), with the
 * empty product P(base, 0) = 1 and P(base, length > base) = 0.
 */
export const countPossibleSecretsUncached = (length: number, base: number): number =>
  length === 0 ? 1 : length > base ? 0 : base * countPossibleSecretsUncached(length - 1, base - 1);

/** Memoized factory used by the settings screen. */
export const createCountPossibleSecrets = (
  counter: (length: number, base: number) => number,
): ((length: SecretLength, base: NumericBase) => number) => {
  const cached = memoize2(counter);

  return (length: SecretLength, base: NumericBase) => cached(length, base);
};

/** Shared instance: recomputing an already known pair is pointless. */
export const countPossibleSecrets = createCountPossibleSecrets(countPossibleSecretsUncached);
