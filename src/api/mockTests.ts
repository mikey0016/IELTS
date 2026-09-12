import type {
  MockTestMeta,
  MockResult,
  MockTestSection,
  Question,
} from "@/types";
import { MOCK_TESTS } from "@/data/mockTests";
import { mockRequest } from "./mockClient";
import {
  listeningBandFromRaw,
  bandFromCorrect,
  overallBand,
} from "@/lib/bands";
import { randomId } from "@/lib/format";
import { apiFetch, isRealApi } from "./http";

export async function listMockTests(): Promise<MockTestMeta[]> {
  if (isRealApi()) {
    try {
      const data = await apiFetch("/api/mocks");
      const mocks = data as MockTestMeta[];
      if (mocks && mocks.length > 0) return mocks;
    } catch {}
  }
  return mockRequest(() => MOCK_TESTS, 500);
}

export async function getMockTest(id: string): Promise<MockTestMeta | undefined> {
  if (isRealApi()) {
    try {
      const mocks = (await apiFetch("/api/mocks")) as MockTestMeta[];
      const found = mocks.find((t) => t.id === id);
      if (found) return found;
    } catch {}
  }
  return mockRequest(() => MOCK_TESTS.find((t) => t.id === id), 400);
}

export interface MockSubmissionInput {
  testId: string;
  listAnswers: Record<string, number>;
  writingWordCounts: number[];
  speakingWordEstimate: number;
}

export function submitMockTest(
  input: MockSubmissionInput,
): Promise<MockResult> {
  return mockRequest(() => {
    const test = MOCK_TESTS.find((t) => t.id === input.testId);
    if (!test) throw new Error("Mock test not found");

    const sections = test.sections.map((section) =>
      evaluateSection(section, input),
    );
    const overall = overallBand(sections.map((s) => s.band));
    const sorted = [...sections].sort((a, b) => b.band - a.band);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];

    return {
      id: randomId("mock"),
      testId: input.testId,
      date: new Date().toISOString().slice(0, 10),
      overall,
      sections,
      strengths: [
        `${strongest.title} is your strongest section at Band ${strongest.band.toFixed(1)} — keep the momentum with weekly retention quizzes.`,
        bandFromRaw(strongest.correct, strongest.total),
      ],
      weaknesses: [
        `${weakest.title} is holding your overall band back. Dedicate at least 30 minutes daily to this skill.`,
        bandFromRaw(weakest.correct, weakest.total),
      ],
      nextSteps: [
        `Book 3 focused ${weakest.title} practice sessions this week.`,
        "Review every incorrect answer in the explanations before moving on.",
        "Retake this mock test in 2 weeks to measure improvement.",
      ],
    };
  }, 1200);
}

function bandFromRaw(
  correct: number | undefined,
  total: number | undefined,
): string {
  if (correct === undefined || total === undefined) return "";
  if (total === 0) return "";
  const ratio = correct / total;
  if (ratio >= 0.9) return "Excellent accuracy — examiner-level precision.";
  if (ratio >= 0.75)
    return "Strong accuracy — a couple of careless errors to clean up.";
  if (ratio >= 0.6) return "Good base — focus on the error types below.";
  return "Needs work — rebuild fundamentals with the recommended lessons.";
}

function evaluateSection(section: MockTestSection, input: MockSubmissionInput) {
  if (section.questions && section.questions.length > 0) {
    const correct = section.questions.filter((q: Question) => {
      const answer = input.listAnswers[q.id];
      return (
        answer !== undefined &&
        q.correctIndex !== undefined &&
        answer === q.correctIndex
      );
    }).length;
    const total = section.questions.length;
    const band =
      section.key === "listening"
        ? listeningBandFromRaw(correct)
        : bandFromCorrect(correct, total);
    return {
      key: section.key,
      title: section.title,
      band,
      correct,
      total,
    };
  }

  if (section.key === "writing") {
    const words = input.writingWordCounts[0] ?? 0;
    const words2 = input.writingWordCounts[1] ?? 0;
    const band =
      Math.round(
        (5.5 + (words >= 150 ? 0.4 : 0) + (words2 >= 250 ? 0.4 : 0) + 0.4) * 2,
      ) / 2;
    return {
      key: section.key,
      title: section.title,
      band: Math.min(8.5, band),
    };
  }

  if (section.key === "speaking") {
    return { key: section.key, title: section.title, band: 6.5 };
  }

  return { key: section.key, title: section.title, band: 6.0 };
}
