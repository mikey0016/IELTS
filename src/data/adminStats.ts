/**
 * Helpers for admin analytics.
 * Pure functions used by src/api/admin.ts — kept separate so
 * dashboards can import without pulling the whole mock API.
 */
import type { UserProfile } from "@/types";

export interface WeeklySignup {
  label: string;
  count: number;
  date: string;
}

export interface Distribution<T extends string> {
  key: T;
  count: number;
}

export function computeRevenueEstimate(users: UserProfile[]): number {
  const premium = users.filter((u) => u.planType === "premium").length;
  const pro = users.filter((u) => u.planType === "pro").length;
  return premium * 12 + pro * 29;
}

export function computeWeeklySignups(
  users: UserProfile[],
  days = 7,
): WeeklySignup[] {
  const out: WeeklySignup[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const count = users.filter((u) => {
      try {
        return new Date(u.createdAt).toISOString().slice(0, 10) === iso;
      } catch {
        return false;
      }
    }).length;
    out.push({ label, count, date: iso });
  }
  return out;
}

export function computeBandDistribution(
  users: UserProfile[],
): Array<{ band: string; count: number }> {
  const buckets: Record<string, number> = {};
  for (const u of users) {
    const key = u.targetBand.toFixed(1);
    buckets[key] = (buckets[key] ?? 0) + 1;
  }
  return Object.entries(buckets)
    .map(([band, count]) => ({ band, count }))
    .sort((a, b) => Number(a.band) - Number(b.band));
}

export function computePlanDistribution(
  users: UserProfile[],
): Array<{ plan: UserProfile["planType"]; count: number }> {
  const map: Record<string, number> = {};
  for (const u of users) map[u.planType] = (map[u.planType] ?? 0) + 1;
  return Object.entries(map).map(([plan, count]) => ({
    plan: plan as UserProfile["planType"],
    count,
  }));
}

export function recentActivityFromUsers(users: UserProfile[], limit = 5) {
  return [...users]
    .sort(
      (a, b) =>
        new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime(),
    )
    .slice(0, limit)
    .map((u) => ({
      id: u.id,
      user: u.name,
      email: u.email,
      action:
        u.status === "banned"
          ? `Banned: ${u.bannedReason ?? "—"}`
          : `Active · ${u.planType} · Band ${u.targetBand}`,
      time: u.lastActiveAt,
    }));
}
