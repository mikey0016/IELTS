import type { VocabularyWord, ReviewState } from "@/types";
import { VOCAB_DECK, wordById } from "@/data/vocabulary";
import { mockRequest, mockItem } from "./mockClient";

export function getDeck(): Promise<VocabularyWord[]> {
  return mockRequest(() => VOCAB_DECK, 400);
}

export function getWordOfDay(): Promise<VocabularyWord> {
  const index = new Date().getDate() % VOCAB_DECK.length;
  return mockItem(VOCAB_DECK[index], 300);
}

export function getReviewQueue(
  reviews: Record<string, ReviewState>,
  learnedIds: string[],
): VocabularyWord[] {
  const now = Date.now();
  const dueIds = Object.entries(reviews)
    .filter(([, r]) => r.due <= now)
    .map(([id]) => id);
  const mix = new Set<string>([...dueIds, ...(learnedIds ?? []).slice(0, 8)]);
  return VOCAB_DECK.filter((w) => mix.has(w.id)).slice(0, 10);
}

export function getFavoriteWords(favoriteIds: string[]): VocabularyWord[] {
  return favoriteIds
    .map(wordById)
    .filter((w): w is VocabularyWord => Boolean(w));
}

export function getDailyPack(count = 8): VocabularyWord[] {
  const start = new Date().getDate() % VOCAB_DECK.length;
  const out: VocabularyWord[] = [];
  for (let i = 0; i < count; i++) {
    out.push(VOCAB_DECK[(start + i) % VOCAB_DECK.length]);
  }
  return out;
}
