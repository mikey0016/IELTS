import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface PageHeaderProps { title: ReactNode; description?: ReactNode; actions?: ReactNode; eyebrow?: string; className?: string; }

export function PageHeader({ title, description, actions, eyebrow, className }: PageHeaderProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-[28px] p-7 text-white sm:p-8 border border-white/10", className)} style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #1e1b4b 35%, #312e81 70%, #4f46e5 100%)" }}>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-violet-600/20 to-cyan-500/10" />
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && <p className="mb-3 inline-flex rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] backdrop-blur border border-white/20">{eyebrow}</p>}
          <h1 className="font-display text-2xl font-black tracking-[-0.02em] sm:text-[30px] leading-tight">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-white/75">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
