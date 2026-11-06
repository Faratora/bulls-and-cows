import { describe, expect, it } from 'vitest';
import type { NumericBase } from '../src/game/types.js';
import { createDigitValidator, digitsOfBase } from '../src/game/digits.js';

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

describe('digitsOfBase', () => {
  it('lists the digits of binary base', () => {
    expect(digitsOfBase(BINARY)).toBe('0 1');
  });

  it('lists the digits of octal base', () => {
    expect(digitsOfBase(OCTAL)).toBe('0 1 2 3 4 5 6 7');
  });

  it('lists the digits of decimal base', () => {
    expect(digitsOfBase(DECIMAL)).toBe('0 1 2 3 4 5 6 7 8 9');
  });

  it('renders hex digits uppercase', () => {
    expect(digitsOfBase(HEX)).toBe('0 1 2 3 4 5 6 7 8 9 A B C D E F');
  });

  it('lists exactly as many digits as the base', () => {
    [BINARY, OCTAL, DECIMAL, HEX].forEach(base => {
      expect(digitsOfBase(base).split(' ')).toHaveLength(base);
    });
  });

  it('lists the same digits the validator of that base accepts', () => {
    [BINARY, OCTAL, DECIMAL, HEX].forEach(base => {
      const isDigit = createDigitValidator(base);

      expect(digitsOfBase(base).split(' ').every(isDigit)).toBe(true);
    });
  });
});
