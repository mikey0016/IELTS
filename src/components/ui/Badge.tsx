import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone =
  | "brand"
  | "violet"
  | "cyan"
  | "emerald"
  | "amber"
  | "rose"
  | "slate"
  | "white";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const TONES: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-200",
  violet:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-200",
  cyan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200",
  emerald:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200",
  rose: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  white:
    "bg-white text-slate-800 shadow-sm dark:bg-slate-200 dark:text-slate-900",
};

export function Badge({ className, tone = "brand", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
