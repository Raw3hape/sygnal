export function levelFromXp(xp: number): number {
  return Math.floor(Math.max(0, xp) / 100) + 1;
}

export function addXp(current: number, result: { correct: number; total: number }): number {
  return current + result.correct * 10 + 10;
}

export function xpProgressInLevel(xp: number): number {
  return Math.max(0, xp) % 100;
}
