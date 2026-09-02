import type { Skill } from "@/types";
import { Headphones, FileText, PenLine, Mic } from "lucide-react";

export interface Lesson {
  id: string;
  title: string;
  meta: string;
  minutes: number;
  skill: Skill;
}

export interface Course {
  key: Skill;
  title: string;
  description: string;
  lessons: Lesson[];
  icon: typeof Headphones;
  color: string;
}

export const COURSES: Course[] = [
  {
    key: "listening",
    title: "Listening",
    description:
      "Section-by-section training with audio drills, maps and note-taking.",
    icon: Headphones,
    color: "violet",
    lessons: [
      {
        id: "lesson_listening_s1",
        title: "Section 1 essentials — forms & bookings",
        meta: "Introduction · vocabulary · numbers",
        minutes: 24,
        skill: "listening",
      },
      {
        id: "lesson_listening_s2",
        title: "Section 2 — Maps & directions",
        meta: "Orientation · prepositions · landmarks",
        minutes: 28,
        skill: "listening",
      },
      {
        id: "lesson_listening_s3",
        title: "Section 3 — University discussions",
        meta: "Opinions · agreement · distractors",
        minutes: 30,
        skill: "listening",
      },
      {
        id: "lesson_listening_s4",
        title: "Section 4 — Academic lectures",
        meta: "Note-taking · signpost language",
        minutes: 32,
        skill: "listening",
      },
      {
        id: "lesson_listening_numbers",
        title: "Numbers, prices & dates",
        meta: "High-frequency dictation drills",
        minutes: 18,
        skill: "listening",
      },
      {
        id: "lesson_listening_tfng",
        title: "True / False / Not Given (Listening)",
        meta: "Statement matching strategies",
        minutes: 20,
        skill: "listening",
      },
    ],
  },
  {
    key: "reading",
    title: "Reading",
    description:
      "Skimming, scanning, TFNG and matching strategies with real passages.",
    icon: FileText,
    color: "cyan",
    lessons: [
      {
        id: "lesson_reading_skim",
        title: "Skimming for main ideas",
        meta: "Speed reading · paragraph purposes",
        minutes: 26,
        skill: "reading",
      },
      {
        id: "lesson_reading_tfng",
        title: "True / False / Not Given",
        meta: "The reading strategy that wins bands",
        minutes: 30,
        skill: "reading",
      },
      {
        id: "lesson_reading_headers",
        title: "Matching headings",
        meta: "Paragraph mapping techniques",
        minutes: 28,
        skill: "reading",
      },
      {
        id: "lesson_reading_summary",
        title: "Summary completion",
        meta: "Grammar cues · synonym hunt",
        minutes: 24,
        skill: "reading",
      },
      {
        id: "lesson_reading_mcq",
        title: "Multiple choice mastery",
        meta: "Elimination and distractor traps",
        minutes: 22,
        skill: "reading",
      },
      {
        id: "lesson_reading_speed",
        title: "Time management challenge",
        meta: "The 20-minute rule per passage",
        minutes: 18,
        skill: "reading",
      },
    ],
  },
  {
    key: "writing",
    title: "Writing",
    description:
      "Task 1 & Task 2 frameworks, model answers and AI feedback loops.",
    icon: PenLine,
    color: "brand",
    lessons: [
      {
        id: "lesson_writing_t1report",
        title: "Academic Task 1 — report structure",
        meta: "Overview first · grouping data",
        minutes: 32,
        skill: "writing",
      },
      {
        id: "lesson_writing_t2intro",
        title: "Task 2 — powerful introductions",
        meta: "Paraphrasing · thesis statements",
        minutes: 28,
        skill: "writing",
      },
      {
        id: "lesson_writing_coherence",
        title: "Coherence & cohesion",
        meta: "Linking devices · paragraph flow",
        minutes: 26,
        skill: "writing",
      },
      {
        id: "lesson_writing_lexical",
        title: "Lexical resource boosters",
        meta: "Collocations · topic vocabulary",
        minutes: 24,
        skill: "writing",
      },
      {
        id: "lesson_writing_grammar",
        title: "Grammatical range",
        meta: "Complex sentences · conditionals",
        minutes: 30,
        skill: "writing",
      },
      {
        id: "lesson_writing_gt1",
        title: "General Training letters",
        meta: "Formal vs informal registers",
        minutes: 22,
        skill: "writing",
      },
    ],
  },
  {
    key: "speaking",
    title: "Speaking",
    description:
      "Part 1, 2 and 3 training with cue cards, timers and pronunciation tips.",
    icon: Mic,
    color: "emerald",
    lessons: [
      {
        id: "lesson_speaking_p1",
        title: "Part 1 — fluency basics",
        meta: "Short answers that shine",
        minutes: 20,
        skill: "speaking",
      },
      {
        id: "lesson_speaking_p2",
        title: "Part 2 — the 60-second plan",
        meta: "Cue card planning framework",
        minutes: 26,
        skill: "speaking",
      },
      {
        id: "lesson_speaking_p3",
        title: "Part 3 — discussion skills",
        meta: "Developed answers · examples",
        minutes: 28,
        skill: "speaking",
      },
      {
        id: "lesson_speaking_pron",
        title: "Pronunciation & intonation",
        meta: "Stress patterns · connected speech",
        minutes: 22,
        skill: "speaking",
      },
      {
        id: "lesson_speaking_grammar",
        title: "Grammar for speaking",
        meta: "Range on the spot",
        minutes: 24,
        skill: "speaking",
      },
      {
        id: "lesson_speaking_structures",
        title: "Linking structures for fluency",
        meta: "From hesitating to flowing",
        minutes: 18,
        skill: "speaking",
      },
    ],
  },
];

export interface GrammarTopic {
  id: string;
  title: string;
  level:
    | "Intermediate (Band 5–6)"
    | "Upper-Intermediate (Band 6.5-7)"
    | "Advanced (Band 7.5+)";
  summary: string;
  example: string;
  minutes: number;
  description?: string;
  rules?: string[];
  examples?: string[];
}

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: "g1",
    title: "Articles: a, an, the, zero",
    level: "Intermediate (Band 5–6)",
    summary:
      "Master when to use articles with countable and uncountable nouns — one of the most common band-limiters.",
    example: "✓ An increase was recorded.",
    minutes: 25,
  },
  {
    id: "g2",
    title: "Present Perfect for IELTS",
    level: "Intermediate (Band 5–6)",
    summary:
      "Use present perfect for recent changes and life experience — essential for Writing Task 1 trends and Speaking.",
    example: "The population has grown by 10% since 2010.",
    minutes: 20,
  },
  {
    id: "g3",
    title: "Conditionals: types 0–3",
    level: "Upper-Intermediate (Band 6.5-7)",
    summary:
      "First, second and third conditionals for hypothetical discussion — the backbone of Speaking Part 3.",
    example: "If governments invested more, cities would become cleaner.",
    minutes: 30,
  },
  {
    id: "g4",
    title: "Passive voice in reports",
    level: "Upper-Intermediate (Band 6.5-7)",
    summary:
      "Report data objectively with the passive — a key feature of Academic Task 1.",
    example: "The figures were collected over a ten-year period.",
    minutes: 22,
  },
  {
    id: "g5",
    title: "Relative clauses for detail",
    level: "Upper-Intermediate (Band 6.5-7)",
    summary:
      "Adding precise detail with who/which/where clauses lifts both writing and speaking quality.",
    example: "Students who practise daily improve faster.",
    minutes: 24,
  },
  {
    id: "g6",
    title: "Complex sentences & subordination",
    level: "Advanced (Band 7.5+)",
    summary:
      "Although, despite, while, whereas — combine ideas like a fluent writer.",
    example:
      "Although online learning is flexible, it cannot fully replace classrooms.",
    minutes: 28,
  },
  {
    id: "g7",
    title: "Nominalisation",
    level: "Advanced (Band 7.5+)",
    summary: "Turn verbs into nouns for a formal, academic tone.",
    example: "The achievement of targets requires planning.",
    minutes: 26,
  },
  {
    id: "g8",
    title: "Inversion for emphasis",
    level: "Advanced (Band 7.5+)",
    summary:
      "Rarely have candidates mastered this — use inversion to stand out.",
    example: "Not only is it cheap, but it is also effective.",
    minutes: 24,
  },
];

export const VOCAB_PACKS = [
  {
    id: "vocab_collocations",
    title: "Academic Collocations Pack #3",
    meta: "12 words · 10 min",
    minutes: 10,
  },
  {
    id: "vocab_topic_environment",
    title: "Environment topic vocabulary",
    meta: "18 words · 15 min",
    minutes: 15,
  },
  {
    id: "vocab_topic_education",
    title: "Education & technology words",
    meta: "15 words · 12 min",
    minutes: 12,
  },
  {
    id: "vocab_phrasal",
    title: "Linking & opinion phrases",
    meta: "10 phrases · 8 min",
    minutes: 8,
  },
];
