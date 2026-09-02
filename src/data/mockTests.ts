import type { MockTestMeta } from "@/types";
import { LISTENING_QUESTIONS, READING_QUESTIONS } from "./questions";
import { WRITING_PROMPTS } from "./writing";
import { SPEAKING_PROMPTS } from "./speaking";

export const MOCK_TESTS: MockTestMeta[] = [
  {
    id: "mock_academic_1",
    title: "Academic Full Test — Real Exam",
    type: "Academic",
    durationMin: 175,
    questions: 16,
    description:
      "Haqiqiy IELTS formati: Listening 40 min (40 savol), Reading 60 min (3 passage × 20 min, 40 savol), Writing 60 min (Task 1 = 20m, Task 2 = 40m), Speaking 11-15 min.",
    sections: [
      {
        key: "listening",
        title: "Listening",
        durationMin: 40,
        instructions:
          "Haqiqiy imtihon: har bir yozuv faqat 1 marta eshitiladi. 30 min tinglash + 10 min javoblarni ko'chirish. 40 savol.",
        questions: LISTENING_QUESTIONS,
        audio: true,
      },
      {
        key: "reading",
        title: "Reading",
        durationMin: 60,
        instructions:
          "3 ta passage, har biri 20 minutdan. Jami 40 savol. Vaqt tugagach avtomatik topshiriladi.",
        questions: READING_QUESTIONS,
        audio: false,
      },
      {
        key: "writing",
        title: "Writing",
        durationMin: 60,
        instructions:
          "Task 1 — 20 minut, kamida 150 so'z. Task 2 — 40 minut, kamida 250 so'z. Jami 60 minut.",
        writingPrompts: [WRITING_PROMPTS[0], WRITING_PROMPTS[1]],
        audio: false,
      },
      {
        key: "speaking",
        title: "Speaking",
        durationMin: 15,
        instructions:
          "Part 1: 30 sek/jawob, Part 2: 1 min tayyorgarlik + 2 min gapirish, Part 3: 45 sek/jawob. Jami 11-15 min.",
        speakingPrompts: [
          SPEAKING_PROMPTS[0],
          SPEAKING_PROMPTS[2],
          SPEAKING_PROMPTS[5],
        ],
        audio: false,
      },
    ],
  },
  {
    id: "mock_general_1",
    title: "General Training Full Test",
    type: "General Training",
    durationMin: 175,
    questions: 14,
    description:
      "General Training — haqiqiy timing: Listening 40m, Reading 60m (3×20m), Writing 60m (20+40), Speaking 15m.",
    sections: [
      {
        key: "listening",
        title: "Listening",
        durationMin: 40,
        instructions:
          "Listen to each recording once and answer the questions as you go. 40 min total.",
        questions: [
          LISTENING_QUESTIONS[0],
          LISTENING_QUESTIONS[1],
          LISTENING_QUESTIONS[3],
          LISTENING_QUESTIONS[5],
          LISTENING_QUESTIONS[6],
        ],
        audio: true,
      },
      {
        key: "reading",
        title: "Reading",
        durationMin: 60,
        instructions:
          "3 passages × 20 min. Answer all questions. Jami 60 minut.",
        questions: [
          READING_QUESTIONS[3],
          READING_QUESTIONS[7],
          READING_QUESTIONS[0],
        ],
        audio: false,
      },
      {
        key: "writing",
        title: "Writing",
        durationMin: 60,
        instructions:
          "Task 1 is a letter (20 min, 150w); Task 2 is an essay (40 min, 250w).",
        writingPrompts: [WRITING_PROMPTS[2], WRITING_PROMPTS[3]],
        audio: false,
      },
      {
        key: "speaking",
        title: "Speaking",
        durationMin: 15,
        instructions: "Part 1 30s · Part 2 60s prep + 120s speak · Part 3 45s",
        speakingPrompts: [
          SPEAKING_PROMPTS[1],
          SPEAKING_PROMPTS[3],
          SPEAKING_PROMPTS[4],
        ],
        audio: false,
      },
    ],
  },
  {
    id: "mock_reading_full",
    title: "Reading — Full 60 min (40 savol)",
    type: "Academic",
    durationMin: 60,
    questions: 40,
    description:
      "Haqiqiy Reading: 3 ta passage, har biri 20 minut. Jami 60 minut / 40 savol.",
    sections: [
      {
        key: "reading",
        title: "Reading",
        durationMin: 60,
        instructions:
          "3 passages, each 20 minutes. Jami 40 savol. Har bir passage 20 minut.",
        questions: READING_QUESTIONS,
        audio: false,
      },
    ],
  },
  {
    id: "mock_reading_passage",
    title: "Reading — 1 Passage (20 min)",
    type: "Academic",
    durationMin: 20,
    questions: 13,
    description: "Bitta passage mashqi — 20 minut. Haqiqiy imtihondagi kabi.",
    sections: [
      {
        key: "reading",
        title: "Reading — Passage 1",
        durationMin: 20,
        instructions: "Bitta passage, 20 minut. Savollarga javob bering.",
        questions: [
          READING_QUESTIONS[0],
          READING_QUESTIONS[1],
          READING_QUESTIONS[2],
        ],
        audio: false,
      },
    ],
  },
  {
    id: "mock_listening_full",
    title: "Listening — Full 40 min",
    type: "Academic",
    durationMin: 40,
    questions: 40,
    description: "Haqiqiy Listening: 4 section, 40 savol, 40 minut.",
    sections: [
      {
        key: "listening",
        title: "Listening",
        durationMin: 40,
        instructions: "4 sections, har biri 10 min. Jami 40 min, 40 savol.",
        questions: LISTENING_QUESTIONS,
        audio: true,
      },
    ],
  },
  {
    id: "mock_writing_full",
    title: "Writing — Full 60 min (20 + 40)",
    type: "Academic",
    durationMin: 60,
    questions: 2,
    description:
      "Task 1 — 20 min (150w), Task 2 — 40 min (250w). Jami 60 minut.",
    sections: [
      {
        key: "writing",
        title: "Writing",
        durationMin: 60,
        instructions:
          "Task 1: 20 min / 150w, Task 2: 40 min / 250w. Vaqtni to'g'ri taqsimlang.",
        writingPrompts: [WRITING_PROMPTS[0], WRITING_PROMPTS[1]],
        audio: false,
      },
    ],
  },
  {
    id: "mock_quick_1",
    title: "Quick Listening Mini Test",
    type: "Academic",
    durationMin: 15,
    questions: 8,
    description:
      "A focused 15-minute Listening warm-up to check your current level fast.",
    sections: [
      {
        key: "listening",
        title: "Listening",
        durationMin: 15,
        instructions: "Answer all questions based on the short recordings.",
        questions: LISTENING_QUESTIONS,
        audio: true,
      },
      {
        key: "reading",
        title: "Reading",
        durationMin: 20,
        instructions:
          "A short reading passage — 20 min per passage in real exam.",
        questions: [READING_QUESTIONS[0], READING_QUESTIONS[1]],
        audio: false,
      },
    ],
  },
];

export default MOCK_TESTS;
