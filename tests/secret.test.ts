import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDigitValidator } from '../src/game/digits.js';
import { generateSecret } from '../src/game/secret.js';
import type { NumericBase, RandomSource, SecretLength } from '../src/game/types.js';

const BINARY: NumericBase = 2;
const OCTAL: NumericBase = 8;
const DECIMAL: NumericBase = 10;
const HEX: NumericBase = 16;

const TWO: SecretLength = 2;
const FOUR: SecretLength = 4;
const SIX: SecretLength = 6;
const EIGHT_DIGITS = 8 as unknown as SecretLength;

/** Deterministic source replaying a fixed sequence of values. */
const fromQueue = (values: readonly number[]): RandomSource => {
  let index = 0;

  return () => {
    const value = values[index % values.length] ?? 0;
    index += 1;

    return value;
  };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('generateSecret', () => {
  describe('shape of the result', () => {
    it('returns a string of the requested length', () => {
      expect(generateSecret(FOUR, DECIMAL, () => 0)).toHaveLength(FOUR);
    });

    it('returns only digits allowed by the base', () => {
      const isDigit = createDigitValidator(HEX);

      [...generateSecret(SIX, HEX, () => 0.5)].forEach(char => {
        expect(isDigit(char)).toBe(true);
      });
    });

    it('never repeats a digit, even with the real Math.random', () => {
      for (let attempt = 0; attempt < 200; attempt += 1) {
        const secret = generateSecret(SIX, DECIMAL);

        expect(secret).toHaveLength(SIX);
        expect(new Set(secret.split('')).size).toBe(SIX);
      }
    });

    it('keeps a leading zero as a meaningful digit', () => {
      const secret = generateSecret(FOUR, DECIMAL, () => 0);

      expect(secret.startsWith('0')).toBe(true);
      expect(secret).toBe('0123');
    });

    it('produces a permutation of the whole alphabet when length equals the base', () => {
      expect(generateSecret(EIGHT_DIGITS, OCTAL, () => 0)).toBe('01234567');
    });
  });

  describe('deterministic with an injected random source', () => {
    it('picks the first remaining digit when random always returns 0', () => {
      expect(generateSecret(FOUR, DECIMAL, () => 0)).toBe('0123');
      expect(generateSecret(TWO, BINARY, () => 0)).toBe('01');
      expect(generateSecret(SIX, HEX, () => 0)).toBe('012345');
    });

    it('picks the last remaining digit when random always returns almost 1', () => {
      expect(generateSecret(FOUR, DECIMAL, () => 0.9999)).toBe('9876');
      expect(generateSecret(TWO, BINARY, () => 0.99)).toBe('10');
    });

    it('follows an exact sequence of random values', () => {
      const secret = generateSecret(FOUR, DECIMAL, fromQueue([0.1, 0.7, 0.4, 0.9]));

      expect(secret).toBe('1749');
    });

    it('is repeatable: the same source sequence gives the same secret', () => {
      const values = [0.42, 0.05, 0.87, 0.31];

      expect(generateSecret(FOUR, DECIMAL, fromQueue(values))).toBe(
        generateSecret(FOUR, DECIMAL, fromQueue(values)),
      );
    });

    it('calls the injected source exactly once per generated digit', () => {
      let calls = 0;
      const counting: RandomSource = () => {
        calls += 1;

        return 0.5;
      };

      generateSecret(FOUR, DECIMAL, counting);

      expect(calls).toBe(FOUR);
    });

    it('does not touch Math.random when a source is injected', () => {
      const spy = vi.spyOn(Math, 'random');

      generateSecret(FOUR, DECIMAL, () => 0.25);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('randomness source defaults to Math.random', () => {
    it('uses Math.random when no source is passed', () => {
      const spy = vi.spyOn(Math, 'random').mockImplementation(() => 0);

      expect(generateSecret(TWO, BINARY)).toBe('01');
      expect(spy).toHaveBeenCalled();
    });

    it('still produces valid secrets with the default source', () => {
      for (let attempt = 0; attempt < 50; attempt += 1) {
        const secret = generateSecret(FOUR, OCTAL);

        expect(secret).toHaveLength(FOUR);
        expect(new Set(secret.split('')).size).toBe(FOUR);
        [...secret].forEach(char => {
          expect(createDigitValidator(OCTAL)(char)).toBe(true);
        });
      }
    });
  });

  it('depends on both length and base arguments', () => {
    expect(generateSecret(TWO, DECIMAL, () => 0)).toBe('01');
    expect(generateSecret(SIX, DECIMAL, () => 0)).toBe('012345');
    expect(generateSecret(TWO, HEX, () => 0)).toBe('01');
    expect(generateSecret(TWO, HEX, () => 0.99)).toBe('fe');
    expect(generateSecret(TWO, BINARY, () => 0.99)).toBe('10');
  });
});
