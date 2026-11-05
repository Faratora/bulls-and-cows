import { countPossibleSecrets } from '../game/count.js';
import { digitsOfBase } from '../game/digits.js';
import { BASE_LABELS } from './base-labels.js';
import type { GameSettings, NumericBase, SecretLength } from '../game/types.js';

/** Choices offered on the settings screen, in display order. */
const LENGTH_OPTIONS: readonly SecretLength[] = [2, 3, 4, 5, 6];
const BASE_OPTIONS: readonly NumericBase[] = [2, 8, 10, 16];

/** Callbacks the screen invokes on user interaction. */
export interface SettingsActions {
  readonly onLengthChange: (length: SecretLength) => void;
  readonly onBaseChange: (base: NumericBase) => void;
  readonly onStart: () => void;
  readonly onShowLeaderboard: () => void;
}

/** Builds an element with a class and optional text content. */
const el = (tag: string, className: string, text = ''): HTMLElement => {
  const node = document.createElement(tag);
  node.className = className;

  if (text !== '') {
    node.textContent = text;
  }

  return node;
};

/** A single choice button; clicking it only reports the choice, never mutates. */
const createChoice = (
  className: string,
  label: string,
  selected: boolean,
  disabled: boolean,
  onClick: () => void,
): HTMLButtonElement => {
  const button = el(
    'button',
    selected ? `${className} is-selected` : className,
    label,
  ) as HTMLButtonElement;
  button.type = 'button';
  button.disabled = disabled;
  button.addEventListener('click', onClick);

  return button;
};

/**
 * Settings screen: pick a length and a radix, then start the round. The view
 * is a pure function of the current settings — no component state is kept
 * here, the caller owns the data and re-renders on every change.
 */
export const createSettingsScreen = (
  settings: GameSettings,
  actions: SettingsActions,
): HTMLElement => {
  const screen = el('section', 'screen screen--settings');
  const title = el('h1', 'screen__title', 'Bulls and Cows');
  const subtitle = el(
    'p',
    'screen__subtitle',
    'Угадайте секретное число: каждая цифра встречается один раз. Бык — цифра на своём месте, корова — цифра есть, но на другом месте.',
  );

  const lengthGroup = el('div', 'settings__group');
  lengthGroup.appendChild(el('span', 'settings__label', 'Длина секрета'));
  const lengthRow = el('div', 'settings__options');
  LENGTH_OPTIONS.forEach(length => {
    // A secret needs `length` unique digits, so the alphabet must be big enough.
    const disabled = length > settings.base;
    lengthRow.appendChild(
      createChoice('settings__option', String(length), length === settings.length, disabled, () =>
        actions.onLengthChange(length),
      ),
    );
  });
  lengthGroup.appendChild(lengthRow);

  const baseGroup = el('div', 'settings__group');
  baseGroup.appendChild(el('span', 'settings__label', 'Система счисления'));
  const baseRow = el('div', 'settings__options');
  BASE_OPTIONS.forEach(base => {
    // Any radix can be chosen; changing it clamps the length to the alphabet.
    baseRow.appendChild(
      createChoice('settings__option', BASE_LABELS[base], base === settings.base, false, () =>
        actions.onBaseChange(base),
      ),
    );
  });
  baseGroup.appendChild(baseRow);

  const digitsHint = el('p', 'settings__hint', `Цифры в игре: ${digitsOfBase(settings.base)}`);
  baseGroup.appendChild(digitsHint);

  const possibleSecrets = countPossibleSecrets(settings.length, settings.base);
  const hint = el(
    'p',
    'settings__hint',
    `Возможных секретов: ${possibleSecrets.toLocaleString('ru-RU')}`,
  );

  const startButton = createChoice('settings__start', 'Начать игру', false, false, actions.onStart);
  const leaderboardButton = createChoice(
    'settings__secondary',
    'Таблица рекордов',
    false,
    false,
    actions.onShowLeaderboard,
  );

  screen.append(title, subtitle, lengthGroup, baseGroup, hint, startButton, leaderboardButton);

  return screen;
};
