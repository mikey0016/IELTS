import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant =
  "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent" | "white";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white shadow-sm hover:bg-brand-800 active:scale-[0.98] disabled:bg-brand-300 dark:bg-brand-600 dark:hover:bg-brand-500",
  accent:
    "bg-violet-600 text-white shadow-sm hover:bg-violet-700 active:scale-[0.98] disabled:bg-violet-300 dark:bg-violet-500 dark:hover:bg-violet-400",
  secondary:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-[0.98] dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
  outline:
    "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/60",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
  danger:
    "bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:scale-[0.98] disabled:bg-rose-300 dark:bg-rose-500 dark:hover:bg-rose-400",
  white:
    "bg-white text-brand-900 shadow-sm hover:bg-brand-50 active:scale-[0.98] dark:bg-slate-100 dark:text-slate-900",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
  icon: "h-10 w-10 rounded-xl text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-70",
          VARIANTS[variant],
          SIZES[size],
          loading && "cursor-wait",
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
