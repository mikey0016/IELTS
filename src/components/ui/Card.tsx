import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
  children: ReactNode;
}

export function Card({ className, hover = false, glass = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-[22px] border bg-white shadow-card overflow-hidden",
        "dark:bg-[#12121a] dark:border-white/[0.06]",
        glass && "backdrop-blur-xl bg-white/70 border-white/50 shadow-glass dark:bg-white/[0.05] dark:border-white/10",
        !glass && "border-slate-200/60",
        hover &&
          "transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover hover:border-slate-200 dark:hover:border-white/10 hover:shadow-[0_16px_40px_rgb(10_10_15/0.12)]",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[22px] before:bg-gradient-to-b before:from-white/60 before:to-transparent before:opacity-60 dark:before:from-white/[0.03] dark:before:opacity-100",
        className,
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative z-10 flex items-start justify-between gap-4 p-6 pb-0", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-[16.5px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative z-10 p-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative z-10 flex items-center gap-3 p-6 pt-0", className)} {...props} />;
}
