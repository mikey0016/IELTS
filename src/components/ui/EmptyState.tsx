import type { ReactNode } from "react";
import { Inbox, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string; }

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center dark:border-white/10 dark:bg-white/[0.03]", className)}>
      {icon ?? <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand text-white shadow-glow-brand"><Inbox className="h-7 w-7" /></div>}
      <h3 className="font-display text-base font-bold dark:text-white flex items-center gap-1.5">{title} <Sparkles className="h-3.5 w-3.5 text-amber-500" /></h3>
      {description && <p className="max-w-sm text-sm leading-relaxed text-slate-500 dark:text-white/60">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
