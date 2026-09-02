import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface Tab {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="scrollbar-none flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            aria-selected={selected}
            role="tab"
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150",
              selected
                ? "bg-brand-700 text-white shadow-sm dark:bg-brand-600"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
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
