import type { NumericBase } from '../game/types.js';

/**
 * Radix labels shared by the screens: the settings buttons and the play
 * screen hint must name the numeral system the same way.
 */
export const BASE_LABELS: Record<NumericBase, string> = {
  2: 'bin (2)',
  8: 'oct (8)',
  10: 'dec (10)',
  16: 'hex (16)',
};
