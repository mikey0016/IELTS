/**
 * Real IELTS exam timings — single source of truth.
 * All timers across the app should derive from here.
 */

export const IELTS_TIMING = {
  reading: {
    /** One passage ≈ 13-14 questions, 20 minutes */
    passageMin: 20,
    passageSec: 20 * 60,
    /** Full IELTS Reading: 3 passages, 40 questions, 60 minutes */
    fullMin: 60,
    fullSec: 60 * 60,
    fullQuestions: 40,
    passages: 3,
    label: "Reading",
  },
  listening: {
    /** Full IELTS Listening: 4 sections × 10 min = 40 min (30 min audio + 10 min transfer) */
    fullMin: 40,
    fullSec: 40 * 60,
    fullQuestions: 40,
    sections: 4,
    sectionMin: 10,
    sectionSec: 10 * 60,
    label: "Listening",
  },
  writing: {
    task1Min: 20,
    task1Sec: 20 * 60,
    task1Words: 150,
    task2Min: 40,
    task2Sec: 40 * 60,
    task2Words: 250,
    fullMin: 60,
    fullSec: 60 * 60,
    label: "Writing",
  },
  speaking: {
    /** Per-question speaking time (not total section) */
    part1Sec: 30,
    part1PrepSec: 0,
    part2Sec: 120, // 2 minutes
    part2PrepSec: 60, // 1 minute prep
    part3Sec: 45,
    part3PrepSec: 0,
    label: "Speaking",
  },
} as const;

export type ReadingMode = "single-passage" | "full";
export type WritingMode = "task1" | "task2" | "full";
export type ListeningMode = "single" | "full";

export function formatMinSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
