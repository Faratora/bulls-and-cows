import type { LeaderboardRecord } from '../game/types.js';
import { formatElapsed } from './play.js';
import { formatSettings, loadRecords } from './leaderboard-storage.js';

/** Callbacks the leaderboard screen invokes on user interaction. */
export interface LeaderboardActions {
  readonly onBack: () => void;
}

const el = (tag: string, className: string, text = ''): HTMLElement => {
  const node = document.createElement(tag);
  node.className = className;

  if (text !== '') {
    node.textContent = text;
  }

  return node;
};

/** One row of the table; rank is computed at render time, not stored. */
const createRow = (record: LeaderboardRecord, rank: number): HTMLElement => {
  const row = el('div', 'leaderboard__row');
  row.appendChild(el('span', 'leaderboard__rank', String(rank)));
  row.appendChild(el('span', 'leaderboard__badge', formatSettings(record)));
  row.appendChild(el('span', 'leaderboard__attempts', `${record.attempts} попыт.`));
  row.appendChild(el('span', 'leaderboard__time', formatElapsed(record.elapsedMs)));

  return row;
};

/**
 * Leaderboard screen: the best results of the settings combination the player
 * just looked at. Records are read fresh from storage on every render.
 */
export const createLeaderboardScreen = (
  settings: Parameters<typeof loadRecords>[0],
  actions: LeaderboardActions,
): HTMLElement => {
  const screen = el('section', 'screen screen--leaderboard');
  const title = el('h1', 'screen__title', 'Таблица рекордов');
  const subtitle = el(
    'p',
    'screen__subtitle',
    `Лучшие результаты для ${formatSettings(settings)} (меньше попыток, затем меньше времени).`,
  );

  const list = el('div', 'leaderboard');
  const records = loadRecords(settings);

  if (records.length === 0) {
    list.appendChild(el('p', 'leaderboard__empty', 'Рекордов пока нет — сыграйте раунд!'));
  } else {
    records.forEach((record, index) => {
      list.appendChild(createRow(record, index + 1));
    });
  }

  const backButton = el('button', 'leaderboard__back', 'К настройкам') as HTMLButtonElement;
  backButton.type = 'button';
  backButton.addEventListener('click', actions.onBack);

  screen.append(title, subtitle, list, backButton);

  return screen;
};
