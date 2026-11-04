import { attemptsOf, elapsedOf, emptyState, recordGuess, startRound } from './game/state.js';
import { isValidGuess } from './game/guess.js';
import type { GameSettings, GameState, NumericBase, SecretLength } from './game/types.js';
import { createSettingsScreen } from './ui/settings.js';
import { createPlayScreen, formatElapsed } from './ui/play.js';
import { createWinScreen } from './ui/win.js';
import { createLeaderboardScreen } from './ui/leaderboard.js';
import { recordWin } from './ui/leaderboard-storage.js';

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
  // Non-round screens (the leaderboard) are tracked outside the game state.
  let showingLeaderboard = false;
  // Guards against saving the same finished round more than once.
  let savedRound: GameState | null = null;
  // Live round clock. Owned here because only this closure sees the current
  // state object; the screen only hands over the element to write into.
  let timerId = -1;

  const stopTimer = (): void => {
    if (timerId !== -1) {
      window.clearInterval(timerId);
      timerId = -1;
    }
  };

  const render = (): void => {
    // Every render rebuilds the screen, so the old clock must stop first.
    stopTimer();

    if (showingLeaderboard) {
      root.replaceChildren(
        createLeaderboardScreen({
          onBack: () => {
            showingLeaderboard = false;
            render();
          },
        }),
      );

      return;
    }

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
            savedRound = null;
            render();
          },
          onShowLeaderboard: () => {
            showingLeaderboard = true;
            render();
          },
        }),
      );
    }

    if (state.phase === 'playing') {
      const play = createPlayScreen(state, lastGuess, Date.now(), {
        onSubmitGuess: (guess: string) => {
          const previous = state;

          // Invalid guesses (wrong length or repeated digits) only show a hint.
          if (isValidGuess(guess, state.settings.length, state.settings.base)) {
            state = recordGuess(state, guess, Date.now());
          }

          // Keep the guess for a hint only when it was rejected. A recorded
          // guess is already in history and must not be reported as a duplicate.
          lastGuess = state === previous ? guess : null;
          render();
        },
      });
      root.replaceChildren(play.element);

      // The controller owns the interval so it always sees the current state.
      timerId = window.setInterval(() => {
        play.timer.textContent = `Время: ${formatElapsed(elapsedOf(state, Date.now()))}`;
      }, 1000);
    }

    if (state.phase === 'won') {
      if (savedRound !== state) {
        // Persist exactly once per finished round, at the moment it is shown.
        recordWin(state.settings, attemptsOf(state), elapsedOf(state, Date.now()));
        savedRound = state;
      }
      root.replaceChildren(
        createWinScreen(state, lastGuess, {
          onNewGame: () => {
            // New round, same settings, no page reload.
            state = emptyState(state.settings);
            lastGuess = null;
            render();
          },
        }),
      );
    }
  };

  render();
};

start();
