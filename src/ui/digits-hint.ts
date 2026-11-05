import { digitsOfBase } from '../game/digits.js';
import type { NumericBase } from '../game/types.js';

/**
 * One-line hint listing the digits available in the game for a radix. Shared
 * by the settings and the play screen so both name the alphabet identically.
 */
export const createDigitsHint = (base: NumericBase): HTMLElement => {
  const hint = document.createElement('p');
  hint.className = 'digits-hint';

  const label = document.createElement('span');
  label.className = 'digits-hint__label';
  label.textContent = 'Цифры в игре: ';

  const value = document.createElement('span');
  value.className = 'digits-hint__value';
  value.textContent = digitsOfBase(base);

  hint.append(label, value);

  return hint;
};
