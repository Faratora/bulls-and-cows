import { isValidGuess } from '../game/guess.js';
import { attemptsOf, elapsedOf, isDuplicateGuess } from '../game/state.js';
import type { GameSettings, GameState, Guess, SecretLength } from '../game/types.js';
import { createDigitValidator } from '../game/digits.js';
import { createDigitsHint } from './digits-hint.js';
import { BASE_LABELS } from './base-labels.js';

/** Callbacks the play screen invokes on user interaction. */
export interface PlayActions {
  readonly onSubmitGuess: (guess: Guess) => void;
  readonly onNewGame: () => void;
}

const el = (tag: string, className: string, text = ''): HTMLElement => {
  const node = document.createElement(tag);
  node.className = className;

  if (text !== '') {
    node.textContent = text;
  }

  return node;
};

/** Formats milliseconds as m:ss for the timer and win screen. */
export const formatElapsed = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

/** A single history row: guess, bulls and cows. Old rows never change. */
const createHistoryRow = (
  guess: string,
  bulls: number,
  cows: number,
  index: number,
): HTMLElement => {
  const row = el('div', 'history__row');
  row.appendChild(el('span', 'history__index', String(index + 1)));
  row.appendChild(el('span', 'history__guess', guess));
  row.appendChild(el('span', 'history__score', `${bulls} бык · ${cows} корова`));

  return row;
};

/**
 * Russian agrees the noun with the numeral: "2 разные цифры" but "5 разных цифр".
 */
const digitsWord = (length: SecretLength): string => (length <= 4 ? 'разные цифры' : 'разных цифр');

/** Prompt naming the length and the numeral system chosen on the settings screen. */
const guessPrompt = (settings: GameSettings): string =>
  `Введите ${settings.length} ${digitsWord(settings.length)} системы счисления ` +
  `${BASE_LABELS[settings.base]}.`;

/**
 * Status hint under the input: duplicates, invalid input or a normal prompt.
 * The prompt names the numeral system picked on the settings screen, so the
 * player knows which digits are allowed without going back to it.
 */
const createStatus = (state: GameState, lastGuess: string | null): HTMLElement => {
  if (lastGuess !== null && isDuplicateGuess(state, lastGuess)) {
    return el('p', 'play__status play__status--warn', 'Эта попытка уже была.');
  }

  const prompt = guessPrompt(state.settings);

  if (lastGuess !== null && !isValidGuess(lastGuess, state.settings.length, state.settings.base)) {
    return el('p', 'play__status play__status--warn', prompt);
  }

  return el('p', 'play__status', prompt);
};

/**
 * Play screen: guess input filtered by the curried digit validator, attempt
 * history and a live timer. Pure function of the current state plus the last
 * submitted guess, which the controller passes separately.
 *
 * The timer element is returned so the controller can own the ticking
 * interval: only the controller sees the current state object, which is
 * replaced on every render. A stale reference captured here would freeze the
 * clock at the moment the screen was built.
 */
export const createPlayScreen = (
  state: GameState,
  lastGuess: string | null,
  now: number,
  actions: PlayActions,
): { element: HTMLElement; timer: HTMLElement } => {
  const isDigit = createDigitValidator(state.settings.base);

  const screen = el('section', 'screen screen--play');

  // Title row: the heading plus a button that returns to the settings screen.
  const header = el('div', 'screen__header');
  header.appendChild(el('h1', 'screen__title', 'Bulls and Cows'));

  const newGameButton = el('button', 'screen__new-game', 'Новая игра') as HTMLButtonElement;
  newGameButton.type = 'button';
  newGameButton.addEventListener('click', actions.onNewGame);
  header.appendChild(newGameButton);

  const info = el('div', 'play__info');
  const timer = el('span', 'play__stat', `Время: ${formatElapsed(elapsedOf(state, now))}`);
  info.append(el('span', 'play__stat', `Попытки: ${attemptsOf(state)}`), timer);

  // The alphabet picked on the settings screen, shown while guessing.
  const digits = createDigitsHint(state.settings.base);

  const form = el('div', 'play__form');
  const input = document.createElement('input');
  input.className = 'play__input';
  input.type = 'text';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.maxLength = state.settings.length;
  input.placeholder = 'Введите число…';
  input.value = '';

  // Live input filtering: characters outside the base alphabet never land.
  input.addEventListener('input', () => {
    const filtered = input.value.toLowerCase().split('').filter(isDigit).join('');

    if (input.value !== filtered) {
      input.value = filtered;
    }
  });

  const submitButton = el('button', 'play__submit', 'Проверить') as HTMLButtonElement;
  submitButton.type = 'button';

  const submit = (): void => {
    if (input.value.length > 0) {
      actions.onSubmitGuess(input.value);
    }
  };

  submitButton.addEventListener('click', submit);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      submit();
    }
  });

  form.append(input, submitButton);

  const history = el('div', 'history');
  history.appendChild(el('span', 'history__title', 'История попыток'));

  if (state.history.length === 0) {
    history.appendChild(el('p', 'history__empty', 'Пока нет попыток.'));
  } else {
    state.history.forEach((entry, index) => {
      history.appendChild(
        createHistoryRow(entry.guess, entry.score.bulls, entry.score.cows, index),
      );
    });
  }

  screen.append(header, info, digits, form, createStatus(state, lastGuess), history);

  return { element: screen, timer };
};
