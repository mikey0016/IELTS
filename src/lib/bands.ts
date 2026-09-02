/**
 * IELTS band helpers.
 * Band reporting table (Academic): raw score 39-40 => 9, 37-38 => 8.5 ...
 * We approximate an estimated band from a ratio of correct answers
 * and provide the official raw-score lookup for Listening.
 */

export function bandFromScore(ratio: number): number {
  const raw = 1 + ratio * 8;
  return Math.max(1, Math.round(raw * 2) / 2);
}

export function bandFromCorrect(correct: number, total: number): number {
  if (total <= 0) return 1;
  return bandFromScore(correct / total);
}

/** Official Listening raw -> band lookup (40 questions). */
const LISTENING_BANDS: Array<[number, number]> = [
  [39, 9.0],
  [37, 8.5],
  [35, 8.0],
  [32, 7.5],
  [30, 7.0],
  [26, 6.5],
  [23, 6.0],
  [18, 5.5],
  [16, 5.0],
  [13, 4.5],
  [10, 4.0],
];

export function listeningBandFromRaw(raw: number): number {
  for (const [min, band] of LISTENING_BANDS) {
    if (raw >= min) return band;
  }
  return 3.5;
}

export function overallBand(bands: number[]): number {
  if (bands.length === 0) return 1;
  const avg = bands.reduce((a, b) => a + b, 0) / bands.length;
  return Math.round(avg * 2) / 2;
}

export function bandColor(band: number): string {
  if (band >= 7.5) return "text-emerald-600 dark:text-emerald-400";
  if (band >= 6.5) return "text-brand-600 dark:text-brand-400";
  if (band >= 5.5) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}
