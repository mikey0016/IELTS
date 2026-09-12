import type { SpeakingPrompt } from "@/types";
import { SPEAKING_PROMPTS } from "@/data/speaking";
import { mockRequest } from "./mockClient";
import { apiFetch, isRealApi } from "./http";

export async function getSpeakingPrompts(): Promise<SpeakingPrompt[]> {
  if (isRealApi()) {
    try {
      const data = await apiFetch("/api/speaking");
      const list = data as SpeakingPrompt[];
      if (list && list.length > 0) return list;
    } catch {}
  }
  return mockRequest(() => [...SPEAKING_PROMPTS], 400);
}

export async function getSpeakingPrompt(id: string): Promise<SpeakingPrompt | undefined> {
  const all = await getSpeakingPrompts();
  return all.find((p) => p.id === id);
}
