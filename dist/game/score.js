/** Normalizes a value to a comparable list of single lowercase digits. */
const toDigits = (value) => value.toLowerCase().split('');
/** Bulls are digits that are equal to the secret digit at the same index. */
const countBulls = (secret, guess) => secret.reduce((total, digit, index) => (digit === guess[index] ? total + 1 : total), 0);
/** Shared digits count every secret digit that the guess contains at all. */
const countSharedDigits = (secret, guess) => {
    const guessDigits = new Set(guess);
    return secret.filter(digit => guessDigits.has(digit)).length;
};
/**
 * Compares a guess with the secret and returns how many digits are correct and
 * well placed (bulls) plus how many are correct but misplaced (cows). Digits
 * are compared case-insensitively, and each digit position is counted at most
 * once, so cows never double-count a bull.
 */
export const evaluateGuess = (secret, guess) => {
    const secretDigits = toDigits(secret);
    const guessDigits = toDigits(guess);
    const bulls = countBulls(secretDigits, guessDigits);
    const cows = countSharedDigits(secretDigits, guessDigits) - bulls;
    return { bulls, cows };
};
//# sourceMappingURL=score.js.map