import type { WritingPrompt } from "@/types";
import { WRITING_PROMPTS } from "@/data/writing";
import { mockRequest } from "./mockClient";
import { apiFetch, isRealApi } from "./http";

export async function getWritingPrompts(): Promise<WritingPrompt[]> {
  if (isRealApi()) {
    try {
      const data = await apiFetch("/api/writing");
      const list = data as WritingPrompt[];
      if (list && list.length > 0) return list;
    } catch {}
  }
  return mockRequest(() => [...WRITING_PROMPTS], 400);
}

export async function getWritingPrompt(id: string): Promise<WritingPrompt | undefined> {
  const all = await getWritingPrompts();
  return all.find((p) => p.id === id);
}
