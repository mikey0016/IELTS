import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface StatProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: { value: string; up?: boolean };
  tone?: "brand" | "violet" | "cyan" | "emerald" | "amber" | "rose";
}

const TONES: Record<string, string> = {
  brand: "bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300",
  violet:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
  emerald:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
};

export function Stat({ label, value, icon, trend, tone = "brand" }: StatProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900",
      )}
    >
      {icon && (
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            TONES[tone],
          )}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl font-extrabold text-slate-900 dark:text-white">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "text-xs font-bold",
                trend.up
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400",
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
