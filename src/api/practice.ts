import type { Question, Difficulty, QuestionResult, QuizResult } from "@/types";
import { QUESTION_BANK } from "@/data/questions";
import { mockRequest } from "./mockClient";
import { bandFromCorrect } from "@/lib/bands";
import { randomId } from "@/lib/format";
import { storage } from "@/lib/storage";
import { apiFetch, isRealApi } from "./http";

const ADMIN_QUESTIONS_KEY = "ielts-master:admin_questions";

function sanitizePassage(p: string | undefined): string | undefined {
  if (!p) return p;
  if (!p.includes("Go to submission page") && !p.includes("Options")) return p;
  const markers = ["Dolls through the ages", "Dolls have been a part"];
  for (const m of markers) {
    const idx = p.indexOf(m);
    if (idx > 0)
      return p
        .slice(idx)
        .replace(/^Options.*?Text size\s*/i, "")
        .trim();
  }
  return (
    p
      .replace(/^[\s\S]*?Reading Passage \d+\s*/i, "")
      .replace(/^Options[\s\S]*?Text size\s*/i, "")
      .trim() || p
  );
}

function getAdminQuestions(): Question[] {
  try {
    const { storage } = require("@/lib/storage") as { storage: typeof import("@/lib/storage").storage };
    const raw = storage.get<any>(ADMIN_QUESTIONS_KEY.replace("ielts-master:", ""), null);
    let rawStr: string | null = null;
    if (raw) rawStr = typeof raw === "string" ? raw : JSON.stringify(raw);
    else rawStr = localStorage.getItem(ADMIN_QUESTIONS_KEY);
    if (!rawStr) return [];
    let parsed = JSON.parse(rawStr) as Question[];
    // sanitize passages
    parsed = parsed.map((q) => ({ ...q, passage: sanitizePassage(q.passage) }));
    // auto-fix corrupted Dolls prompts (from old import)
    const DOLLS_TOPIC = "Dolls through the ages";
    const dolls = parsed.filter(
      (q) =>
        (q.topic === DOLLS_TOPIC || q.topic.includes("Dolls Through")) &&
        q.skill === "reading",
    );
    const isCorrupted =
      dolls.length > 0 &&
      dolls.some(
        (q) =>
          q.prompt === "Questions 1-6" ||
          q.prompt.includes("Question 1 — Fill") ||
          (q.type === "fill-blank" && !q.correctAnswer),
      );
    if (isCorrupted || (dolls.length > 0 && dolls.length !== 13)) {
      // remove corrupted dolls and re-add via admin store on next admin load; for now just filter them out so practice can still work until admin fix runs
      // we keep them but sanitize prompt fallback: if prompt is generic, replace with proper bullet prompt
      const correctPrompts: Record<
        string,
        {
          prompt: string;
          type: "fill-blank" | "true-false";
          correctAnswer?: string;
          correctIndex?: number;
          options?: string[];
        }
      > = {
        "1": {
          prompt: "___ was used for the hair",
          type: "fill-blank",
          correctAnswer: "clay",
        },
        "2": {
          prompt: "dolls were given to ___ by older girls",
          type: "fill-blank",
          correctAnswer: "goddesses",
        },
        "3": {
          prompt:
            "realistic dolls had separate clothes and ___ that could be put in different positions",
          type: "fill-blank",
          correctAnswer: "limbs",
        },
        "4": {
          prompt: "dolls made of ___ became more common",
          type: "fill-blank",
          correctAnswer: "wax",
        },
        "5": {
          prompt: "moulds made of ___",
          type: "fill-blank",
          correctAnswer: "plaster",
        },
        "6": {
          prompt: "new group of mixtures known as ___",
          type: "fill-blank",
          correctAnswer: "composition",
        },
        "7": {
          prompt:
            "Bisque dolls appear less realistic than dolls made of China.",
          type: "true-false",
          correctIndex: 1,
          options: ["TRUE", "FALSE", "NOT GIVEN"],
        },
        "8": {
          prompt: "French dolls tended to cost more than German bisque dolls.",
          type: "true-false",
          correctIndex: 0,
          options: ["TRUE", "FALSE", "NOT GIVEN"],
        },
        "9": {
          prompt: "The first rag dolls were made in the 1850s.",
          type: "true-false",
          correctIndex: 1,
          options: ["TRUE", "FALSE", "NOT GIVEN"],
        },
        "10": {
          prompt:
            "Only dolls made of cotton or linen are classified as cloth dolls.",
          type: "true-false",
          correctIndex: 0,
          options: ["TRUE", "FALSE", "NOT GIVEN"],
        },
        "11": {
          prompt: "Dolls made of celluloid tended to lose their colour.",
          type: "true-false",
          correctIndex: 0,
          options: ["TRUE", "FALSE", "NOT GIVEN"],
        },
        "12": {
          prompt:
            "Composition dolls lasted longer than the plastic dolls that were made in the 1940s.",
          type: "true-false",
          correctIndex: 1,
          options: ["TRUE", "FALSE", "NOT GIVEN"],
        },
        "13": {
          prompt:
            "Doll collectors prefer a doll to be dressed in its original clothing.",
          type: "true-false",
          correctIndex: 2,
          options: ["TRUE", "FALSE", "NOT GIVEN"],
        },
      };
      parsed = parsed.map((q) => {
        if (
          (q.topic === DOLLS_TOPIC || q.topic.includes("Dolls Through")) &&
          q.skill === "reading"
        ) {
          const order = dolls.indexOf(q) + 1;
          const key = String(order);
          const fix = correctPrompts[key];
          if (fix) {
            return {
              ...q,
              prompt: fix.prompt,
              type: fix.type,
              correctAnswer: fix.correctAnswer,
              correctIndex: fix.correctIndex,
              options: fix.options,
              passage: q.passage,
            };
          }
        }
        return q;
      });
      try {
        localStorage.setItem(ADMIN_QUESTIONS_KEY, JSON.stringify(parsed));
      } catch {}
    }
    return parsed;
  } catch {
    return [];
  }
}

export function getAdminQuestionsForSkill(
  skill: "listening" | "reading",
): Question[] {
  return getAdminQuestions().filter((q) => q.skill === skill);
}

export interface QuizFilters {
  difficulty?: Difficulty | "all";
  topic?: string | "all";
  type?: string | "all";
  limit?: number;
}

export async function fetchQuestions(
  skill: "listening" | "reading",
  filters: QuizFilters,
): Promise<Question[]> {
  // Real DB mode — fetch from FastAPI
  if (isRealApi()) {
    try {
      const params = new URLSearchParams();
      params.set("skill", skill);
      if (filters.difficulty && filters.difficulty !== "all") params.set("difficulty", filters.difficulty);
      if (filters.type && filters.type !== "all") params.set("type", filters.type);
      if (filters.topic && filters.topic !== "all") params.set("topic", filters.topic);
      if (filters.limit) params.set("limit", String(filters.limit));
      const data = await apiFetch(`/api/questions?${params.toString()}`);
      return (data as Question[]).slice(0, filters.limit ?? (data as Question[]).length);
    } catch {
      // fallback to mock below
    }
  }

  const staticSource = QUESTION_BANK[skill] || [];
  const adminSource = getAdminQuestions().filter((q) => q.skill === skill);
  const combined = [...staticSource, ...adminSource];
  const unique = Array.from(new Map(combined.map((q) => [q.id, q])).values());

  return mockRequest(() => {
    let list = [...unique];
    if (filters.difficulty && filters.difficulty !== "all") {
      list = list.filter((q) => q.difficulty === filters.difficulty);
    }
    if (filters.type && filters.type !== "all") {
      list = list.filter((q) => q.type === filters.type);
    }
    if (filters.topic && filters.topic !== "all") {
      const topicQuery = filters.topic
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim();
      list = list.filter((q) => {
        const qTopic = (q.topic || "")
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .trim();
        return qTopic === topicQuery;
      });
    }
    return list.slice(0, filters.limit ?? list.length);
  }, 550);
}

export interface QuizSubmissionInput {
  skill: "listening" | "reading";
  difficulty: Difficulty;
  answers: Record<string, number | string>;
}

export interface QuizSubmissionResult {
  result: QuizResult;
  results: QuestionResult[];
}

export function submitQuiz(
  input: QuizSubmissionInput,
): Promise<QuizSubmissionResult> {
  const staticQuestions = QUESTION_BANK[input.skill] || [];
  const adminQuestions = getAdminQuestions().filter(
    (q) => q.skill === input.skill,
  );
  const allQuestions = [...staticQuestions, ...adminQuestions];

  return mockRequest(() => {
    const questions = allQuestions.filter(
      (q) => input.answers[q.id] !== undefined,
    );
    const results: QuestionResult[] = questions.map((q) => {
      const raw = input.answers[q.id];
      let isCorrect = false;
      let selectedIndex: number | undefined;
      let selectedAnswer: string | undefined;
      if (typeof raw === "number") {
        selectedIndex = raw;
        if (q.correctIndex !== undefined) isCorrect = raw === q.correctIndex;
        else if (q.correctAnswer !== undefined) {
          const opts = q.options;
          const chosen = opts?.[raw];
          if (chosen)
            isCorrect =
              chosen.trim().toLowerCase() ===
              q.correctAnswer.trim().toLowerCase();
        }
      } else if (typeof raw === "string") {
        selectedAnswer = raw;
        if (q.correctAnswer !== undefined)
          isCorrect =
            raw.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        else if (q.correctIndex !== undefined && q.options) {
          const idx = q.options.findIndex(
            (o) => o.trim().toLowerCase() === raw.trim().toLowerCase(),
          );
          if (idx >= 0) {
            selectedIndex = idx;
            isCorrect = idx === q.correctIndex;
          }
        }
      }
      return {
        question: q,
        selectedIndex,
        selectedAnswer,
        isCorrect,
      };
    });
    const correct = results.filter((r) => r.isCorrect).length;
    const total = results.length;
    return {
      result: {
        id: randomId("quiz"),
        skill: input.skill,
        date: new Date().toISOString().slice(0, 10),
        score: correct,
        total,
        correct,
        band: bandFromCorrect(correct, total),
        difficulty: input.difficulty,
      },
      results,
    };
  }, 800);
}

export function recommendedLessons(
  weakest: "listening" | "reading" | "writing" | "speaking",
): string[] {
  const map = {
    listening: [
      "Listening — Section 3 discussion skills",
      "Listening — Distractors and negations",
    ],
    reading: [
      "Reading — True / False / Not Given",
      "Reading — Paraphrasing statements",
    ],
    writing: [
      "Writing — Coherence & cohesion",
      "Writing — Lexical resource boosters",
    ],
    speaking: [
      "Speaking — Part 3 discussion skills",
      "Speaking — Linking structures for fluency",
    ],
  };
  return map[weakest];
}
