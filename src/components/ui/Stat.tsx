import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface StatProps { label: string; value: ReactNode; icon?: ReactNode; trend?: { value: string; up?: boolean }; tone?: "brand" | "violet" | "cyan" | "emerald" | "amber" | "rose"; }
const TONES: Record<string, string> = {
  brand: "bg-brand-600 text-white shadow-brand-500/20",
  violet: "bg-violet-600 text-white shadow-violet-500/20",
  cyan: "bg-cyan-500 text-white shadow-cyan-500/20",
  emerald: "bg-emerald-500 text-white shadow-emerald-500/20",
  amber: "bg-amber-500 text-white shadow-amber-500/20",
  rose: "bg-rose-500 text-white shadow-rose-500/20",
};
export function Stat({ label, value, icon, trend, tone = "brand" }: StatProps) {
  return (
    <div className="flex items-center gap-4 rounded-[20px] border border-slate-200 bg-white p-5 shadow-card dark:border-white/10 dark:bg-white/[0.04]">
      {icon && <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow", TONES[tone])}>{icon}</div>}
      <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><div className="flex items-baseline gap-2"><span className="font-display text-xl font-black dark:text-white">{value}</span>{trend && <span className={cn("text-xs font-bold", trend.up ? "text-emerald-500" : "text-rose-500")}>{trend.value}</span>}</div></div>
    </div>
  );
}
