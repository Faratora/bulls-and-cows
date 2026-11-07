import { createDigitValidator } from './digits.js';
/** Digits are unique when the set of them is as large as the list itself. */
const hasUniqueDigits = (digits) => new Set(digits).size === digits.length;
/**
 * Checks that a guess has exactly `length` characters, that every character is
 * a digit allowed by `base`, and that no digit repeats. Hex digits are compared
 * case-insensitively, so `Aa` counts as a repetition.
 */
export const isValidGuess = (guess, length, base) => {
    const isDigit = createDigitValidator(base);
    const digits = guess.toLowerCase().split('');
    return digits.length === length && digits.every(isDigit) && hasUniqueDigits(digits);
};
//# sourceMappingURL=guess.js.map