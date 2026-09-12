import type { AchievementDef } from "@/types";
import { ACHIEVEMENTS } from "@/data/achievements";
import { mockRequest } from "./mockClient";
import { apiFetch, isRealApi } from "./http";

export async function getAchievements(): Promise<AchievementDef[]> {
  if (isRealApi()) {
    try {
      const data = await apiFetch("/api/achievements");
      const list = data as AchievementDef[];
      if (list && list.length > 0) return list;
    } catch {}
  }
  return mockRequest(() => ACHIEVEMENTS, 300);
}
