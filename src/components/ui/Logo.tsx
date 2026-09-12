import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";

export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  const navigate = useNavigate();
  return (
    <button onClick={onClick ?? (() => navigate("/"))} className={cn("group flex items-center gap-3", className)} aria-label="IELTS with Doniyor home">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0a0a0f] text-white shadow-[0_4px_16px_rgb(10_10_15/0.25)] transition-all duration-300 group-hover:scale-[1.04] group-hover:rotate-[-2deg] dark:bg-white dark:text-[#0a0a0f] overflow-hidden">
        <span className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="relative text-[16px] font-black tracking-tighter">I</span>
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-brand-600 text-white shadow">
          <Sparkles className="h-2.5 w-2.5" />
        </span>
      </span>
      <span className="flex flex-col items-start leading-none">
        <span className="font-display text-[15px] font-black tracking-[-0.02em] text-[#0a0a0f] dark:text-white">IELTS<span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-violet-400"> with Doniyor</span></span>
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-white/40 -mt-0.5">Prepare Smarter</span>
      </span>
    </button>
  );
}
