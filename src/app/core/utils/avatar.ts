// Farm animals, matching the "Boerenbridge" (farmer's bridge) theme.
export const AVATAR_ICONS = ['🐄', '🐷', '🐑', '🐔', '🐴', '🐐', '🦆', '🐇', '🦃', '🐕'];

export const AVATAR_COLORS = [
  '#7F77DD',
  '#1D9E75',
  '#D85A30',
  '#D4537E',
  '#378ADD',
  '#639922',
  '#BA7517',
  '#3C3489',
];

export const DEFAULT_AVATAR_ICON = '🎲';
export const DEFAULT_AVATAR_COLOR = '#888780';

export interface Avatar {
  icon: string;
  color: string;
}

/** Picks an icon/color pair not already used by other players, cycling once the pool runs out. */
export function randomAvatar(usedIcons: readonly string[], usedColors: readonly string[]): Avatar {
  return {
    icon: pick(AVATAR_ICONS, usedIcons),
    color: pick(AVATAR_COLORS, usedColors),
  };
}

function pick(pool: readonly string[], used: readonly string[]): string {
  const available = pool.filter((item) => !used.includes(item));
  const choices = available.length > 0 ? available : pool;
  return choices[Math.floor(Math.random() * choices.length)];
}
