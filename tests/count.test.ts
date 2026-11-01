import { describe, expect, it } from 'vitest';
import type { NumericBase, SecretLength } from '../src/game/types.js';
import {
  countPossibleSecrets,
  countPossibleSecretsUncached,
  createCountPossibleSecrets,
} from '../src/game/count.js';

const BINARY: NumericBase = 2;
const OCTAL: NumericBase = 8;
const DECIMAL: NumericBase = 10;
const HEX: NumericBase = 16;

const TWO = 2 as SecretLength;
const THREE = 3 as SecretLength;
const FOUR = 4 as SecretLength;
const FIVE = 5 as SecretLength;
const SIX = 6 as SecretLength;

describe('countPossibleSecrets', () => {
  describe('permutations without repetition', () => {
    it('counts the two binary secrets of length two', () => {
      expect(countPossibleSecrets(TWO, BINARY)).toBe(2);
    });

    it('counts octal secrets as 8 * 7 * 6', () => {
      expect(countPossibleSecrets(THREE, OCTAL)).toBe(336);
    });

    it('counts decimal secrets of length four as 10 * 9 * 8 * 7', () => {
      expect(countPossibleSecrets(FOUR, DECIMAL)).toBe(5040);
    });

    it('counts decimal secrets of length six as 10 * 9 * 8 * 7 * 6 * 5', () => {
      expect(countPossibleSecrets(SIX, DECIMAL)).toBe(151200);
    });

    it('counts hex secrets of length four as 16 * 15 * 14 * 13', () => {
      expect(countPossibleSecrets(FOUR, HEX)).toBe(43680);
    });

    it('counts hex secrets of length six', () => {
      expect(countPossibleSecrets(SIX, HEX)).toBe(5765760);
    });

    it('agrees across bases for the same length', () => {
      expect(countPossibleSecrets(TWO, BINARY)).toBe(2);
      expect(countPossibleSecrets(TWO, OCTAL)).toBe(56);
      expect(countPossibleSecrets(TWO, DECIMAL)).toBe(90);
      expect(countPossibleSecrets(TWO, HEX)).toBe(240);
    });

    it('does not subtract the leading-zero case because zero is a valid first digit', () => {
      // 0123 is a legal secret, so the count is exactly P(10, 4), not 9 * 9 * 8 * 7.
      expect(countPossibleSecrets(FOUR, DECIMAL)).toBe(10 * 9 * 8 * 7);
    });
  });

  describe('lengths the base alphabet cannot satisfy', () => {
    it('returns zero when the length exceeds the base', () => {
      expect(countPossibleSecrets(FIVE, BINARY)).toBe(0);
      expect(countPossibleSecrets(SIX, BINARY)).toBe(0);
    });

    it('returns zero for a length one digit above the alphabet', () => {
      expect(countPossibleSecrets(THREE, BINARY)).toBe(0);
    });
  });

  describe('memoized wrapper against the recursive function', () => {
    const lengths: SecretLength[] = [TWO, THREE, FOUR, FIVE, SIX];
    const bases: NumericBase[] = [BINARY, OCTAL, DECIMAL, HEX];

    it('matches the uncached recursion for every supported pair', () => {
      lengths.forEach(length => {
        bases.forEach(base => {
          expect(countPossibleSecrets(length, base)).toBe(
            countPossibleSecretsUncached(length, base),
          );
        });
      });
    });
  });

  describe('memoization behaviour', () => {
    it('computes a repeated request only once', () => {
      let calls = 0;
      const counting = (length: number, base: number): number => {
        calls += 1;

        return countPossibleSecretsUncached(length, base);
      };

      const cached = createCountPossibleSecrets(counting);

      expect(cached(FOUR, DECIMAL)).toBe(5040);
      expect(cached(FOUR, DECIMAL)).toBe(5040);
      expect(calls).toBe(1);
    });

    it('keeps separate entries for different arguments', () => {
      let calls = 0;
      const counting = (length: number, base: number): number => {
        calls += 1;

        return countPossibleSecretsUncached(length, base);
      };

      const cached = createCountPossibleSecrets(counting);

      expect(cached(FOUR, DECIMAL)).toBe(5040);
      expect(cached(THREE, DECIMAL)).toBe(720);
      expect(cached(FOUR, HEX)).toBe(43680);
      expect(calls).toBe(3);
    });

    it('serves cached results without calling the inner counter again', () => {
      let calls = 0;
      const counting = (length: number, base: number): number => {
        calls += 1;

        return countPossibleSecretsUncached(length, base);
      };

      const cached = createCountPossibleSecrets(counting);

      cached(TWO, BINARY);
      const firstCalls = calls;

      const results = Array.from({ length: 50 }, () => cached(TWO, BINARY));

      expect(calls).toBe(firstCalls);
      expect(results.every(value => value === 2)).toBe(true);
    });

    it('is deterministic and independent of call order', () => {
      expect(countPossibleSecrets(THREE, OCTAL)).toBe(336);
      expect(countPossibleSecrets(FOUR, DECIMAL)).toBe(5040);
      expect(countPossibleSecrets(THREE, OCTAL)).toBe(336);
    });
  });
});
