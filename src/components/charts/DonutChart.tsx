import type { ReactNode } from "react";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerTitle?: string;
  centerSubtitle?: string;
  legend?: boolean;
  formatValue?: (v: number) => string;
}

export function DonutChart({
  segments,
  size = 180,
  thickness = 20,
  centerTitle,
  centerSubtitle,
  legend = true,
  formatValue = (v) => `${Math.round(v)}%`,
}: DonutChartProps) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={thickness}
            className="dark:[stroke:oklch(0.32_0.02_256)]"
          />
          {segments.map((seg) => {
            const dash = (seg.value / total) * circumference;
            const segStart = offset;
            offset += dash;
            return (
              <circle
                key={seg.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-segStart}
                className="transition-all duration-700"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerTitle && (
            <span className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
              {centerTitle}
            </span>
          )}
          {centerSubtitle && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {centerSubtitle}
            </span>
          )}
        </div>
      </div>
      {legend && (
        <ul className="space-y-2">
          {segments.map((seg) => (
            <li key={seg.label} className="flex items-center gap-2 text-sm">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {seg.label}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatValue(seg.value)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ChartLegend({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
      {children}
    </div>
  );
}

export function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
