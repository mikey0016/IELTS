import type { Course, GrammarTopic } from "@/data/content";
import { COURSES, GRAMMAR_TOPICS, VOCAB_PACKS } from "@/data/content";
import { mockRequest } from "./mockClient";
import { apiFetch, isRealApi } from "./http";
import { Headphones, FileText, PenLine, Mic } from "lucide-react";

const ICON_MAP: Record<string, typeof Headphones> = {
  listening: Headphones,
  reading: FileText,
  writing: PenLine,
  speaking: Mic,
};

function hydrateCourses(courses: any[]): Course[] {
  return courses.map((c) => ({
    ...c,
    icon: ICON_MAP[c.key] ?? Headphones,
    lessons: c.lessons || [],
  }));
}

export async function getCourses(): Promise<Course[]> {
  if (isRealApi()) {
    try {
      const data = await apiFetch("/api/courses");
      return hydrateCourses(data as any[]);
    } catch {
      return mockRequest(() => COURSES, 400);
    }
  }
  return mockRequest(() => COURSES, 400);
}

export async function getGrammarTopics(): Promise<GrammarTopic[]> {
  if (isRealApi()) {
    try {
      const data = await apiFetch("/api/grammar");
      return data as GrammarTopic[];
    } catch {
      return mockRequest(() => GRAMMAR_TOPICS, 400);
    }
  }
  return mockRequest(() => GRAMMAR_TOPICS, 400);
}

export async function getVocabPacks() {
  if (isRealApi()) {
    try {
      // vocab packs are derived from vocabulary words grouped by topic — fallback to static if empty
      const words: any[] = await apiFetch("/api/vocabulary");
      if (words && words.length > 0) {
        const topics = Array.from(new Set(words.map((w) => w.topic || "General")));
        return topics.slice(0, 4).map((t, i) => ({
          id: `vocab_${i}`,
          title: `${t} vocabulary`,
          meta: `${words.filter((w) => (w.topic || "General") === t).length} words`,
          minutes: 10,
        }));
      }
    } catch {}
  }
  return mockRequest(() => VOCAB_PACKS, 300);
}

export function courseForSkill(skill: string): Course | undefined {
  return COURSES.find((c) => c.key === skill);
}

export async function courseForSkillAsync(skill: string): Promise<Course | undefined> {
  const courses = await getCourses();
  return courses.find((c) => c.key === skill);
}
