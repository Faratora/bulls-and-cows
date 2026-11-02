import { emptyState, recordGuess, startRound } from './game/state.js';
import type { GameSettings, GameState, NumericBase, SecretLength } from './game/types.js';
import { createSettingsScreen } from './ui/settings.js';
import { createPlayScreen } from './ui/play.js';

/**
 * Application controller. Owns the single game state reference and re-renders
 * the screen after every transition. The state object itself is never mutated:
 * every change replaces the reference with a fresh immutable snapshot.
 */

const DEFAULT_SETTINGS: GameSettings = { length: 4, base: 10 };

const createAppRoot = (): HTMLElement => {
  const existing = document.getElementById('app');
  if (existing !== null) {
    return existing;
  }

  const root = document.createElement('div');
  root.id = 'app';
  document.body.appendChild(root);

  return root;
};

const start = (): void => {
  const root = createAppRoot();
  let state: GameState = emptyState(DEFAULT_SETTINGS);
  let lastGuess: string | null = null;

  const render = (): void => {
    if (state.phase === 'settings') {
      root.replaceChildren(
        createSettingsScreen(state.settings, {
          onLengthChange: (length: SecretLength) => {
            state = { ...state, settings: { ...state.settings, length } };
            render();
          },
          onBaseChange: (base: NumericBase) => {
            // A shorter alphabet may not fit the chosen length: clamp it.
            const length = Math.min(state.settings.length, base) as SecretLength;
            state = { ...state, settings: { ...state.settings, base, length } };
            render();
          },
          onStart: () => {
            state = startRound(state.settings);
            lastGuess = null;
            render();
          },
        }),
      );
    }

    if (state.phase === 'playing') {
      root.replaceChildren(
        createPlayScreen(state, lastGuess, Date.now(), {
          onSubmitGuess: (guess: string) => {
            lastGuess = guess;
            state = recordGuess(state, guess, Date.now());
            render();
          },
        }),
      );
    }
  };

  render();
};

start();
