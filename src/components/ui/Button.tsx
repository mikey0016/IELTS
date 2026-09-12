import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent" | "white" | "glass" | "aurora";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "relative overflow-hidden bg-[linear-gradient(135deg,#4f46e5_0%,#7c3aed_50%,#6366f1_100%)] text-white shadow-[0_2px_8px_rgb(79_70_229/0.25),0_8px_24px_rgb(79_70_229/0.22)] hover:shadow-[0_4px_16px_rgb(79_70_229/0.35),0_12px_32px_rgb(79_70_229/0.3)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 border border-white/15",
  accent:
    "relative overflow-hidden bg-[linear-gradient(135deg,#7c3aed_0%,#4f46e5_100%)] text-white shadow-[0_2px_8px_rgb(124_58_237/0.25),0_8px_24px_rgb(124_58_237/0.2)] hover:shadow-[0_8px_24px_rgb(124_58_237/0.35)] hover:-translate-y-[1px] active:scale-[0.98] disabled:opacity-60 border border-white/10",
  aurora:
    "relative overflow-hidden bg-[linear-gradient(135deg,#6366f1_0%,#ec4899_50%,#06b6d4_100%)] text-white shadow-[0_8px_24px_rgb(99_102_241/0.3)] hover:shadow-[0_12px_32px_rgb(236_72_153/0.35)] hover:-translate-y-[1px] active:scale-[0.98] border border-white/20",
  secondary:
    "bg-[#0a0a0f] text-white hover:bg-[#1a1a23] hover:-translate-y-[1px] active:scale-[0.98] shadow-[0_4px_12px_rgb(10_10_15/0.15)] dark:bg-white dark:text-[#0a0a0f] dark:hover:bg-slate-100 border border-transparent dark:border-white/0",
  outline:
    "bg-white text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-[0.5px] active:scale-[0.98] shadow-sm hover:shadow-md dark:bg-white/[0.06] dark:border-white/10 dark:text-white dark:hover:bg-white/[0.10] dark:hover:border-white/15",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white border border-transparent",
  danger:
    "bg-gradient-to-br from-rose-600 to-rose-500 text-white shadow-[0_4px_16px_rgb(244_63_94/0.3)] hover:shadow-[0_8px_24px_rgb(244_63_94/0.4)] hover:-translate-y-[1px] active:scale-[0.98] disabled:opacity-60 border border-white/10",
  white:
    "bg-white text-[#0a0a0f] shadow-[0_2px_8px_rgb(10_10_15/0.08),0_8px_24px_rgb(10_10_15/0.06)] hover:shadow-[0_8px_24px_rgb(10_10_15/0.12)] hover:-translate-y-[1px] active:scale-[0.98] border border-slate-200/60 dark:bg-white dark:text-slate-900",
  glass:
    "backdrop-blur-xl bg-white/80 border border-white/60 text-slate-900 shadow-glass hover:bg-white/90 hover:-translate-y-[0.5px] dark:bg-white/[0.08] dark:border-white/10 dark:text-white dark:hover:bg-white/[0.12] active:scale-[0.98]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px] gap-1.5 rounded-full font-semibold tracking-tight",
  md: "h-[42px] px-5 text-[14px] gap-2 rounded-full font-semibold tracking-tight",
  lg: "h-[48px] px-7 text-[15px] gap-2.5 rounded-full font-bold tracking-tight",
  icon: "h-10 w-10 rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, ...props },
  ref,
) {
  const isGradient = variant === "primary" || variant === "accent" || variant === "aurora";
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed select-none",
        VARIANTS[variant],
        SIZES[size],
        loading && "cursor-wait",
        className,
      )}
      {...props}
    >
      {isGradient && <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/12 to-transparent opacity-60" aria-hidden />}
      {isGradient && <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" aria-hidden />}
      {loading && <Loader2 className="h-4 w-4 animate-spin relative z-10" />}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
});
