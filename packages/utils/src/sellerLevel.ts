// XP thresholds per level. Index = level, value = XP required to reach that level.
// Level 1 is the starting level (0 XP needed).
export const LEVEL_THRESHOLDS = [0, 0, 100, 300, 700, 1500, 3000, 6000, 12000, 25000, 50000];

/**
 * Given a total XP amount, return the correct level (1-indexed).
 * Capped at the maximum defined level.
 */
export function xpToLevel(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i;
    else break;
  }
  return level;
}

/** XP needed to reach the next level (returns null if already max level). */
export function xpToNextLevel(xp: number): number | null {
  const current = xpToLevel(xp);
  const next    = current + 1;
  if (next >= LEVEL_THRESHOLDS.length) return null;
  return LEVEL_THRESHOLDS[next] - xp;
}
