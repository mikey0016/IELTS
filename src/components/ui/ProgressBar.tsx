import { cn } from "@/lib/cn";

export interface ProgressBarProps { value: number; max?: number; size?: "sm" | "md" | "lg"; tone?: "brand" | "violet" | "cyan" | "emerald" | "amber" | "rose" | "white"; stripes?: boolean; className?: string; }
const TONES: Record<string, string> = {
  brand: "bg-gradient-to-r from-brand-600 via-violet-600 to-brand-500",
  violet: "bg-gradient-to-r from-violet-600 to-indigo-600",
  cyan: "bg-gradient-to-r from-cyan-500 to-blue-600",
  emerald: "bg-gradient-to-r from-emerald-500 to-cyan-500",
  amber: "bg-gradient-to-r from-amber-500 to-orange-500",
  rose: "bg-gradient-to-r from-rose-500 to-pink-600",
  white: "bg-white",
};
const SIZES = { sm: "h-1.5", md: "h-2.5", lg: "h-3" };
export function ProgressBar({ value, max = 100, size = "md", tone = "brand", stripes, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={max} className={cn("w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10 p-0.5 shadow-inner", SIZES[size], className)}>
      <div className={cn("h-full rounded-full transition-all duration-700 ease-out shadow-sm relative overflow-hidden", TONES[tone], stripes && "animate-progress-stripes bg-[linear-gradient(45deg,rgba(255,255,255,.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.25)_50%,rgba(255,255,255,.25)_75%,transparent_75%)] bg-[length:1rem_1rem]")} style={{ width: `${pct}%` }}>
        <span className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
      </div>
    </div>
  );
}
export function CircularProgress({ value, size = 140, stroke = 12, tone = "#4f46e5", label, sublabel, track = "#e2e8f0" }: { value: number; size?: number; stroke?: number; tone?: string; label?: string; sublabel?: string; track?: string; }) {
  const radius = (size - stroke) / 2; const circumference = 2 * Math.PI * radius; const offset = circumference - (Math.min(100, value) / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90"><circle cx={size / 2} cy={size / 2} r={radius} stroke={track} strokeWidth={stroke} fill="none" className="dark:[stroke:#ffffff14]" /><circle cx={size / 2} cy={size / 2} r={radius} stroke={tone} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-[stroke-dashoffset] duration-1000 ease-out drop-shadow" style={{ filter: `drop-shadow(0 0 6px ${tone}40)` }} /></svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{label && <span className="font-display text-2xl font-black tracking-tight dark:text-white">{label}</span>}{sublabel && <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{sublabel}</span>}</div>
    </div>
  );
}
