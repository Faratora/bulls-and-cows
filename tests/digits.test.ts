import { describe, expect, it } from 'vitest';
import type { NumericBase } from '../src/game/types.js';
import { createDigitValidator } from '../src/game/digits.js';

const BINARY: NumericBase = 2;
const OCTAL: NumericBase = 8;
const DECIMAL: NumericBase = 10;
const HEX: NumericBase = 16;

describe('createDigitValidator', () => {
  it('is a curried factory: calling it with a base returns a predicate function', () => {
    expect(typeof createDigitValidator(DECIMAL)).toBe('function');
  });

  describe('binary base', () => {
    const isDigit = createDigitValidator(BINARY);

    it.each(['0', '1'])('accepts the digit %s', char => {
      expect(isDigit(char)).toBe(true);
    });

    it.each(['2', '8', '9', 'a', 'f', '-', ''])('rejects %s', char => {
      expect(isDigit(char)).toBe(false);
    });
  });

  describe('octal base', () => {
    const isDigit = createDigitValidator(OCTAL);

    it.each(['0', '3', '7'])('accepts the digit %s', char => {
      expect(isDigit(char)).toBe(true);
    });

    it.each(['8', '9', 'a', ' '])('rejects %s', char => {
      expect(isDigit(char)).toBe(false);
    });
  });

  describe('decimal base', () => {
    const isDigit = createDigitValidator(DECIMAL);

    it.each(['0', '5', '9'])('accepts the digit %s', char => {
      expect(isDigit(char)).toBe(true);
    });

    it.each(['a', 'f', 'A', 'F', '.', '10'])('rejects %s', char => {
      expect(isDigit(char)).toBe(false);
    });
  });

  describe('hexadecimal base', () => {
    const isDigit = createDigitValidator(HEX);

    it.each(['0', '9', 'a', 'f'])('accepts the digit %s', char => {
      expect(isDigit(char)).toBe(true);
    });

    it('accepts uppercase A-F the same as lowercase', () => {
      ['A', 'B', 'C', 'D', 'E', 'F'].forEach(char => {
        expect(isDigit(char)).toBe(true);
      });
    });

    it.each(['g', 'G', 'z', '#'])('rejects %s', char => {
      expect(isDigit(char)).toBe(false);
    });
  });

  it('validators for different bases are independent predicates', () => {
    expect(createDigitValidator(BINARY)('1')).toBe(true);
    expect(createDigitValidator(OCTAL)('7')).toBe(true);
    expect(createDigitValidator(DECIMAL)('9')).toBe(true);
    expect(createDigitValidator(HEX)('e')).toBe(true);
  });
});
