import type { PlanTask, StudyPlan } from "@/types";
import { randomId } from "@/lib/format";

interface PlanInput {
  currentBand: number;
  targetBand: number;
  examDate: string;
  dailyMinutes: number;
}

// FAQAT IELTS 4 skill — eski vocabulary/grammar/mock o'chirildi
const TASK_GROUPS = {
  listening: [
    "Listening — Section 1: form completion (10 Q)",
    "Listening — Section 2: map labelling drill",
    "Listening — Section 3: academic discussion (hard)",
    "Listening — Section 4: lecture note completion",
    "Listening — Full Test 40 Q timed (30 min)",
    "Listening — numbers & dates speed drill",
  ],
  reading: [
    "Reading — Passage 1 skimming & True/False",
    "Reading — Passage 2 matching headings",
    "Reading — Passage 3 multiple choice (hard)",
    "Reading — Full Reading 40 Q timed (60 min)",
    "Reading — TFNG + sentence completion set",
    "Reading — speed drill 15 min / passage",
  ],
  writing: [
    "Writing — Academic Task 1: bar chart report (150w)",
    "Writing — Academic Task 1: process diagram",
    "Writing — Task 2: opinion essay (250w)",
    "Writing — Task 2: discussion + opinion",
    "Writing — Full Writing Task 1+2 timed (60 min)",
    "Writing — AI check & grammar polish",
  ],
  speaking: [
    "Speaking — Part 1: short answers (5 min)",
    "Speaking — Part 2: cue card 2-min talk",
    "Speaking — Part 3: discussion (5 min)",
    "Speaking — Full Mock 14 min interview",
    "Speaking — pronunciation & fluency drill",
    "Speaking — shadowing native audio 10 min",
  ],
} as const;

const SKILLS: Array<"listening" | "reading" | "writing" | "speaking"> = [
  "listening",
  "reading",
  "writing",
  "speaking",
];

export function generatePlan(input: PlanInput): StudyPlan {
  const days: PlanTask[] = [];

  for (let day = 0; day < 7; day++) {
    const alloc = Math.max(30, input.dailyMinutes);
    // 3 tasks per day, har kuni 3 xil skill — haftada 4 skill teng taqsimlanadi
    const slot = Math.max(15, Math.round(alloc / 3));
    const skillA = SKILLS[day % 4];
    const skillB = SKILLS[(day + 1) % 4];
    const skillC = SKILLS[(day + 2) % 4];

    const idxA = Math.floor(day / 2);
    const idxB = Math.floor((day + 1) / 2);
    const idxC = Math.floor((day + 2) / 2);

    const tasksForDay: Array<{ skill: (typeof SKILLS)[number]; idx: number }> =
      [
        { skill: skillA, idx: idxA },
        { skill: skillB, idx: idxB },
        { skill: skillC, idx: idxC },
      ];

    // Shanba/Yakshanba — 4-task: Full mock qo'shamiz (faqat IELTS 4 skill ichidan)
    if (day === 5 || day === 6) {
      const mockSkill = SKILLS[day % 4];
      tasksForDay.push({ skill: mockSkill, idx: 4 }); // Full Test
    }

    tasksForDay.forEach(({ skill, idx }, i) => {
      const group = TASK_GROUPS[skill];
      days.push({
        id: `${day}_${skill}_${i}`,
        day,
        label: skillLabel(skill),
        detail: group[idx % group.length],
        skill: skill as PlanTask["skill"],
        minutes: i === 3 ? 45 : slot, // mock/full uchun 45 min
        done: false,
      });
    });
  }

  return {
    id: randomId("plan"),
    currentBand: input.currentBand,
    targetBand: input.targetBand,
    examDate: input.examDate,
    dailyMinutes: input.dailyMinutes,
    createdAt: new Date().toISOString(),
    weeks: days,
  };
}

function skillLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
