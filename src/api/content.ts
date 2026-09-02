import type { Course, GrammarTopic } from "@/data/content";
import { COURSES, GRAMMAR_TOPICS, VOCAB_PACKS } from "@/data/content";
import { mockRequest } from "./mockClient";

export function getCourses(): Promise<Course[]> {
  return mockRequest(() => COURSES, 400);
}

export function getGrammarTopics(): Promise<GrammarTopic[]> {
  return mockRequest(() => GRAMMAR_TOPICS, 400);
}

export function getVocabPacks() {
  return mockRequest(() => VOCAB_PACKS, 300);
}

export function courseForSkill(skill: string): Course | undefined {
  return COURSES.find((c) => c.key === skill);
}
