import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10 relative overflow-hidden", className)}><div className="absolute inset-0 shimmer opacity-30" /></div>;
}
