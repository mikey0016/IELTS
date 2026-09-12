import type { VocabularyWord, ReviewState } from "@/types";
import { VOCAB_DECK, wordById } from "@/data/vocabulary";
import { mockRequest, mockItem } from "./mockClient";
import { apiFetch, isRealApi } from "./http";

export async function getDeck(): Promise<VocabularyWord[]> {
  if (isRealApi()) {
    try {
      const data = await apiFetch("/api/vocabulary");
      const words = data as VocabularyWord[];
      if (words && words.length > 0) return words;
    } catch {}
  }
  return mockRequest(() => VOCAB_DECK, 400);
}

export async function getWordOfDay(): Promise<VocabularyWord> {
  if (isRealApi()) {
    try {
      const words = (await apiFetch("/api/vocabulary")) as VocabularyWord[];
      if (words && words.length > 0) {
        const index = new Date().getDate() % words.length;
        return words[index];
      }
    } catch {}
  }
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
