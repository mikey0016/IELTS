export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarDatum[];
  height?: number;
  formatValue?: (v: number) => string;
  highlightColor?: string;
}

export function BarChart({
  data,
  height = 180,
  formatValue = (v) => String(v),
  highlightColor = "#305c8d",
}: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const baseColor = "#cbd5e1";

  return (
    <div>
      <div className="flex items-end gap-2" style={{ height }} aria-hidden>
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 28);
          const isHighlight = i === data.length - 1;
          return (
            <div
              key={d.label}
              className="flex flex-1 flex-col items-center justify-end gap-1.5 self-stretch"
            >
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {formatValue(d.value)}
              </span>
              <div
                className="w-full max-w-[42px] rounded-t-lg transition-all duration-700 ease-out hover:opacity-80"
                style={{
                  height: Math.max(4, h),
                  backgroundColor: isHighlight
                    ? highlightColor
                    : (d.color ?? baseColor),
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
        {data.map((d) => (
          <span
            key={d.label}
            className="flex-1 text-center text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
