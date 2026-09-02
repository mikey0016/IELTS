import { cn } from "@/lib/cn";

export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  tone?: "brand" | "violet" | "cyan" | "emerald" | "amber" | "rose" | "white";
  stripes?: boolean;
  className?: string;
}

const TONES: Record<string, string> = {
  brand: "bg-brand-600 dark:bg-brand-500",
  violet: "bg-violet-600 dark:bg-violet-500",
  cyan: "bg-cyan-500 dark:bg-cyan-400",
  emerald: "bg-emerald-500 dark:bg-emerald-400",
  amber: "bg-amber-500 dark:bg-amber-400",
  rose: "bg-rose-500 dark:bg-rose-400",
  white: "bg-white",
};

const SIZES = { sm: "h-1.5", md: "h-2", lg: "h-3" };

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  tone = "brand",
  stripes,
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        "w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
        SIZES[size],
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-700 ease-out",
          TONES[tone],
          stripes &&
            "animate-progress-stripes bg-[linear-gradient(45deg,rgba(255,255,255,.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.25)_50%,rgba(255,255,255,.25)_75%,transparent_75%)] bg-[length:1rem_1rem]",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function CircularProgress({
  value,
  size = 140,
  stroke = 12,
  tone = "#305c8d",
  label,
  sublabel,
  track = "#e2e8f0",
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: string;
  label?: string;
  sublabel?: string;
  track?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, value) / 100) * circumference;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={track}
          strokeWidth={stroke}
          fill="none"
          className="dark:[stroke:oklch(0.32_0.02_256)]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tone}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
