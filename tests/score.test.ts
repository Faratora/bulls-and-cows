import { describe, expect, it } from 'vitest';
import { evaluateGuess } from '../src/game/score.js';

describe('evaluateGuess', () => {
  it('returns all bulls when the guess equals the secret', () => {
    expect(evaluateGuess('1234', '1234')).toEqual({ bulls: 4, cows: 0 });
  });

  it('returns zero cows when only some positions match', () => {
    expect(evaluateGuess('1234', '1203')).toEqual({ bulls: 2, cows: 1 });
  });

  it('counts every digit as a cow when all digits are present but misplaced', () => {
    expect(evaluateGuess('1234', '4321')).toEqual({ bulls: 0, cows: 4 });
  });

  it('mixes bulls and cows correctly', () => {
    expect(evaluateGuess('1234', '1243')).toEqual({ bulls: 2, cows: 2 });
  });

  it('returns zeros when the guess shares no digits with the secret', () => {
    expect(evaluateGuess('1234', '5678')).toEqual({ bulls: 0, cows: 0 });
  });

  it('counts a cow for each misplaced digit only once', () => {
    // '0' is a bull, '1' is misplaced; no digit may be counted twice.
    expect(evaluateGuess('0123', '0321')).toEqual({ bulls: 2, cows: 2 });
  });

  it('keeps leading zeros significant', () => {
    expect(evaluateGuess('0123', '1023')).toEqual({ bulls: 1, cows: 3 });
  });

  it('treats uppercase hex digits as equal to lowercase ones', () => {
    expect(evaluateGuess('12ab', '12AB')).toEqual({ bulls: 4, cows: 0 });
    expect(evaluateGuess('ABCD', 'abcd')).toEqual({ bulls: 4, cows: 0 });
  });

  it('works for the shortest supported secret', () => {
    expect(evaluateGuess('10', '01')).toEqual({ bulls: 0, cows: 2 });
    expect(evaluateGuess('10', '10')).toEqual({ bulls: 2, cows: 0 });
  });

  it('is symmetric about case but not about argument order for cows', () => {
    expect(evaluateGuess('1234', '2134')).toEqual(evaluateGuess('1234', '2134'));
    expect(evaluateGuess('1234', '2134')).toEqual({ bulls: 2, cows: 2 });
  });

  it('does not mutate its arguments', () => {
    const secret = '1234';
    const guess = '4321';

    const result = evaluateGuess(secret, guess);

    expect(secret).toBe('1234');
    expect(guess).toBe('4321');
    expect(result).toEqual({ bulls: 0, cows: 4 });
  });

  it('returns a plain object with only bulls and cows', () => {
    expect(Object.keys(evaluateGuess('1234', '4321')).sort()).toEqual(['bulls', 'cows']);
  });

  it('is deterministic across repeated calls', () => {
    expect(evaluateGuess('123456', '654321')).toEqual(evaluateGuess('123456', '654321'));
  });
});
