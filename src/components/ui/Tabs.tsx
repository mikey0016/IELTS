import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface Tab { id: string; label: ReactNode; icon?: ReactNode; }

export interface TabsProps { tabs: Tab[]; active: string; onChange: (id: string) => void; }

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="scrollbar-none flex items-center gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-[#12121a]">
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            aria-selected={selected}
            role="tab"
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-bold transition-all duration-200",
              selected ? "bg-[#0a0a0f] text-white shadow-md dark:bg-white dark:text-[#0a0a0f]" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
