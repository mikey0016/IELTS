import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "brand" | "violet" | "cyan" | "emerald" | "amber" | "rose" | "slate" | "white" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const TONES: Record<Tone, string> = {
  brand: "bg-brand-600 text-white shadow-[0_2px_8px_rgb(79_70_229/0.25)] border border-white/10",
  violet: "bg-violet-600 text-white shadow-[0_2px_8px_rgb(124_58_237/0.25)] border border-white/10",
  cyan: "bg-cyan-600 text-white shadow-[0_2px_8px_rgb(6_182_214/0.25)] border border-white/10",
  emerald: "bg-emerald-600 text-white shadow-[0_2px_8px_rgb(16_185_129/0.25)] border border-white/10",
  amber: "bg-amber-500 text-white shadow-[0_2px_8px_rgb(245_158_11/0.25)] border border-white/10",
  rose: "bg-rose-600 text-white shadow-[0_2px_8px_rgb(244_63_94/0.25)] border border-white/10",
  slate: "bg-[#0a0a0f] text-white dark:bg-white dark:text-[#0a0a0f] border border-transparent",
  white: "bg-white text-slate-900 shadow-sm border border-slate-200 dark:bg-white/10 dark:text-white dark:border-white/10 backdrop-blur",
  neutral: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/10",
};

export function Badge({ className, tone = "brand", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] leading-none",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
