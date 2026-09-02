import { GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";

export function Logo({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={onClick ?? (() => navigate("/"))}
      className={cn("group flex items-center gap-2.5", className)}
      aria-label="IELTS Master home"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm transition-transform group-hover:scale-105 group-hover:-rotate-3 dark:bg-brand-600">
        <GraduationCap className="h-5 w-5" />
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
        IELTS<span className="text-brand-600 dark:text-brand-400"> Master</span>
      </span>
    </button>
  );
}
