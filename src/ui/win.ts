import { attemptsOf, elapsedOf, isWon } from '../game/state.js';
import type { GameState, Guess } from '../game/types.js';
import { formatElapsed } from './play.js';

/** Callbacks the win screen invokes on user interaction. */
export interface WinActions {
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

/** Congratulation panel with round statistics and the way back to settings. */
export const createWinScreen = (
  state: GameState,
  _lastGuess: Guess | null,
  actions: WinActions,
): HTMLElement => {
  const screen = el('section', 'screen screen--win');

  if (!isWon(state)) {
    // Defensive: the controller routes only won rounds here.
    return screen;
  }

  const title = el('h1', 'screen__title', 'Победа! 🎉');
  const secret = el('p', 'win__secret', `Секретное число: ${state.secret}`);

  const stats = el('div', 'win__stats');
  stats.appendChild(el('span', 'win__stat', `Попытки: ${attemptsOf(state)}`));
  stats.appendChild(
    el('span', 'win__stat', `Время: ${formatElapsed(elapsedOf(state, Date.now()))}`),
  );

  const newGameButton = el('button', 'win__button', 'Новая игра') as HTMLButtonElement;
  newGameButton.type = 'button';
  newGameButton.addEventListener('click', actions.onNewGame);

  screen.append(title, secret, stats, newGameButton);

  return screen;
};
