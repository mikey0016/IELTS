import type { WeeklyDay, BandPoint, Skill } from "@/types";

/** Baseline learning data used as a realistic starting point for the demo. */
export const BASELINE = {
  weeklyActivity: (): WeeklyDay[] => [
    { day: "Monday", label: "M", minutes: 40 },
    { day: "Tuesday", label: "T", minutes: 25 },
    { day: "Wednesday", label: "W", minutes: 60 },
    { day: "Thursday", label: "T", minutes: 35 },
    { day: "Friday", label: "F", minutes: 75 },
    { day: "Saturday", label: "S", minutes: 20 },
    { day: "Sunday", label: "S", minutes: 55 },
  ],

  skills: (): Record<
    Skill,
    { band: number; accuracy: number; questionsDone: number; minutes: number }
  > => ({
    listening: { band: 7.2, accuracy: 0.72, questionsDone: 214, minutes: 180 },
    reading: { band: 6.5, accuracy: 0.65, questionsDone: 186, minutes: 205 },
    writing: { band: 5.8, accuracy: 0.58, questionsDone: 42, minutes: 120 },
    speaking: { band: 7.1, accuracy: 0.71, questionsDone: 58, minutes: 95 },
  }),

  bandHistory: (): BandPoint[] => [
    { month: "Jan", band: 5.5 },
    { month: "Feb", band: 5.5 },
    { month: "Mar", band: 6.0 },
    { month: "Apr", band: 6.0 },
    { month: "May", band: 6.5 },
    { month: "Jun", band: 6.5 },
  ],

  weeklyHours: (): { week: string; hours: number }[] => [
    { week: "W1", hours: 4.2 },
    { week: "W2", hours: 5.5 },
    { week: "W3", hours: 4.8 },
    { week: "W4", hours: 6.2 },
    { week: "W5", hours: 7.1 },
    { week: "W6", hours: 6.8 },
  ],

  vocabGrowth: (): { month: string; words: number }[] => [
    { month: "Jan", words: 30 },
    { month: "Feb", words: 55 },
    { month: "Mar", words: 90 },
    { month: "Apr", words: 120 },
    { month: "May", words: 160 },
    { month: "Jun", words: 205 },
  ],

  accuracyHistory: (): { month: string; accuracy: number }[] => [
    { month: "Jan", accuracy: 0.45 },
    { month: "Feb", accuracy: 0.5 },
    { month: "Mar", accuracy: 0.55 },
    { month: "Apr", accuracy: 0.58 },
    { month: "May", accuracy: 0.62 },
    { month: "Jun", accuracy: 0.65 },
  ],
};

export const MOCK_HISTORY_ITEMS = [
  {
    id: "mock_hist_1",
    testId: "mock_academic_1",
    date: "2026-06-18",
    overall: 6.0,
    sections: [
      {
        key: "listening" as const,
        title: "Listening",
        band: 6.5,
        correct: 24,
        total: 40,
      },
      {
        key: "reading" as const,
        title: "Reading",
        band: 6.0,
        correct: 25,
        total: 40,
      },
      {
        key: "writing" as const,
        title: "Writing",
        band: 5.5,
        correct: undefined,
        total: undefined,
      },
      {
        key: "speaking" as const,
        title: "Speaking",
        band: 6.5,
        correct: undefined,
        total: undefined,
      },
    ],
    strengths: ["Listening note-taking", "Introduction answering"],
    weaknesses: ["Writing Task 2 cohesion", "Reading True/False/Not Given"],
    nextSteps: [
      "Review Writing Task 2 linking words",
      "Practice TFNG strategy questions",
    ],
  },
  {
    id: "mock_hist_2",
    testId: "mock_general_1",
    date: "2026-05-30",
    overall: 5.5,
    sections: [
      {
        key: "listening" as const,
        title: "Listening",
        band: 6.0,
        correct: 23,
        total: 40,
      },
      {
        key: "reading" as const,
        title: "Reading",
        band: 5.5,
        correct: 22,
        total: 40,
      },
      {
        key: "writing" as const,
        title: "Writing",
        band: 5.0,
        correct: undefined,
        total: undefined,
      },
      {
        key: "speaking" as const,
        title: "Speaking",
        band: 6.0,
        correct: undefined,
        total: undefined,
      },
    ],
    strengths: ["General vocabulary range", "Speaking fluency"],
    weaknesses: ["Grammatical range", "Time management in Reading"],
    nextSteps: [
      "Practice timed reading passages",
      "Complete 2 Grammar lessons this week",
    ],
  },
];

export const RECOMMENDATIONS = [
  {
    id: "rec_1",
    skill: "writing" as Skill,
    title: "Writing Task 2 — Opinion essays",
    reason:
      "Your weakest skill (Band 5.8). A 30-minute essay now will raise your coherence score.",
    intensity: "High impact",
  },
  {
    id: "rec_2",
    skill: "listening" as Skill,
    title: "Listening — Section 3 (Discussion)",
    reason: "You answer discussion questions 14% slower than average.",
    intensity: "Recommended",
  },
  {
    id: "rec_3",
    skill: "vocabulary" as const,
    title: "Academic Collocations Pack #4",
    reason: "Synonyms review is due for 6 words in your deck.",
    intensity: "Due today",
  },
];
