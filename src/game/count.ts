import { memoize2 } from '../utils/memoize.js';
import type { NumericBase, SecretLength } from './types.js';

/**
 * Number of distinct secrets: permutations without repetition,
 * P(base, length) = base! / (base - length)!. A secret may start with zero, so
 * no leading-zero variant is subtracted.
 *
 * Stub: TDD red step.
 */
export const countPossibleSecretsUncached = (_length: number, _base: number): number => 0;

/** Memoized factory used by the settings screen. */
export const createCountPossibleSecrets = (
  counter: (length: number, base: number) => number,
): ((length: SecretLength, base: NumericBase) => number) => {
  const cached = memoize2(counter);

  return (length: SecretLength, base: NumericBase) => cached(length, base);
};

/** Shared instance: recomputing an already known pair is pointless. */
export const countPossibleSecrets = createCountPossibleSecrets(countPossibleSecretsUncached);
