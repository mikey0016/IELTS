import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse-soft rounded-xl bg-slate-200/80 dark:bg-slate-800/70",
        className,
      )}
    />
  );
}
