import { describe, expect, it } from 'vitest';
import type { NumericBase, SecretLength } from '../src/game/types.js';
import { isValidGuess } from '../src/game/guess.js';

const OCTAL: NumericBase = 8;
const DECIMAL: NumericBase = 10;
const HEX: NumericBase = 16;
const FOUR: SecretLength = 4;
const TWO: SecretLength = 2;

describe('isValidGuess', () => {
  describe('accepts well-formed guesses', () => {
    it('accepts a decimal guess of the expected length with unique digits', () => {
      expect(isValidGuess('1234', FOUR, DECIMAL)).toBe(true);
    });

    it('accepts leading zeros because the secret is a string of digits', () => {
      expect(isValidGuess('0123', FOUR, DECIMAL)).toBe(true);
    });

    it('accepts the shortest supported length', () => {
      expect(isValidGuess('10', TWO, DECIMAL)).toBe(true);
    });

    it('accepts octal digits up to 7', () => {
      expect(isValidGuess('7654', FOUR, OCTAL)).toBe(true);
    });

    it('accepts lowercase hex digits', () => {
      expect(isValidGuess('a1b2', FOUR, HEX)).toBe(true);
    });

    it('accepts uppercase hex digits the same way as lowercase', () => {
      expect(isValidGuess('A1B2', FOUR, HEX)).toBe(true);
    });
  });

  describe('rejects guesses with the wrong length', () => {
    it('rejects a guess shorter than the secret', () => {
      expect(isValidGuess('123', FOUR, DECIMAL)).toBe(false);
    });

    it('rejects a guess longer than the secret', () => {
      expect(isValidGuess('12345', FOUR, DECIMAL)).toBe(false);
    });

    it('rejects an empty guess', () => {
      expect(isValidGuess('', FOUR, DECIMAL)).toBe(false);
    });

    it('rejects a two-digit guess when four digits are required', () => {
      expect(isValidGuess('12', FOUR, DECIMAL)).toBe(false);
    });
  });

  describe('rejects characters outside the base alphabet', () => {
    it('rejects decimal digits in an octal game', () => {
      expect(isValidGuess('1289', FOUR, OCTAL)).toBe(false);
    });

    it('rejects letters in a decimal game', () => {
      expect(isValidGuess('a234', FOUR, DECIMAL)).toBe(false);
    });

    it('rejects a letter beyond the hex range', () => {
      expect(isValidGuess('g123', FOUR, HEX)).toBe(false);
    });

    it('rejects whitespace and punctuation', () => {
      ['1 23', '1.23', '1-23', '1_23'].forEach(guess => {
        expect(isValidGuess(guess, FOUR, DECIMAL)).toBe(false);
      });
    });

    it('rejects a multi-character fragment passed as a single guess', () => {
      expect(isValidGuess('10,2', FOUR, DECIMAL)).toBe(false);
    });
  });

  describe('rejects repeated digits', () => {
    it('rejects a guess with a repeated decimal digit', () => {
      expect(isValidGuess('1123', FOUR, DECIMAL)).toBe(false);
    });

    it('rejects a guess where the only difference is a repeated digit at the end', () => {
      expect(isValidGuess('1231', FOUR, DECIMAL)).toBe(false);
    });

    it('rejects a hex guess that repeats a digit in a different case', () => {
      expect(isValidGuess('Aa12', FOUR, HEX)).toBe(false);
    });

    it('rejects a binary guess of length two that repeats the same digit', () => {
      expect(isValidGuess('11', TWO, 2)).toBe(false);
    });

    it('accepts the only unique binary guess of length two', () => {
      expect(isValidGuess('10', TWO, 2)).toBe(true);
    });

    it('rejects a length that cannot be satisfied by the base alphabet', () => {
      const FIVE: SecretLength = 5;
      expect(isValidGuess('11111', FIVE, 2)).toBe(false);
    });
  });

  it('is deterministic: the same arguments always give the same answer', () => {
    const first = isValidGuess('1123', FOUR, DECIMAL);
    const second = isValidGuess('1123', FOUR, DECIMAL);

    expect(first).toBe(second);
    expect(first).toBe(false);
  });

  it('does not depend on previous calls', () => {
    expect(isValidGuess('1234', FOUR, DECIMAL)).toBe(true);
    expect(isValidGuess('1111', FOUR, DECIMAL)).toBe(false);
    expect(isValidGuess('1234', FOUR, DECIMAL)).toBe(true);
  });
});
