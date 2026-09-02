export interface LineDatum {
  label: string;
  value: number;
}

export interface LineChartProps {
  data: LineDatum[];
  height?: number;
  stroke?: string;
  fillFrom?: number;
  formatY?: (v: number) => string;
  formatValue?: (v: number) => string;
  showArea?: boolean;
}

export function LineChart({
  data,
  height = 180,
  stroke = "#305c8d",
  fillFrom,
  formatY,
  formatValue = (v) => String(v),
  showArea = true,
}: LineChartProps) {
  const width = 560;
  const padding = { top: 20, right: 16, bottom: 28, left: 36 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const minV = Math.min(...data.map((d) => d.value));
  const maxV = Math.max(...data.map((d) => d.value));
  const range = maxV - minV || 1;
  const low = minV - range * 0.15;
  const high = maxV + range * 0.15;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * innerW;
    const y = padding.top + (1 - (d.value - low) / (high - low || 1)) * innerH;
    return { x, y, ...d };
  });

  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaBase = fillFrom ?? padding.top + innerH;
  const area = `M ${points[0]?.x ?? 0},${areaBase} L ${points.map((p) => `${p.x},${p.y}`).join(" L ")} L ${points[points.length - 1]?.x ?? 0},${areaBase} Z`;

  const gridLines = [0.25, 0.5, 0.75].map((t) => ({
    y: padding.top + t * innerH,
    val: high - (high - low) * t,
  }));

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Line chart"
      >
        <defs>
          <linearGradient id="linearea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.2" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={g.y}
              x2={width - padding.right}
              y2={g.y}
              stroke="#e2e8f0"
              strokeDasharray="3 4"
              className="dark:[stroke:#1e293b]"
            />
            {formatY && (
              <text
                x={padding.left - 8}
                y={g.y + 3}
                textAnchor="end"
                fontSize="10"
                className="fill-slate-400"
              >
                {formatY(g.val)}
              </text>
            )}
          </g>
        ))}
        {showArea && <path d={area} fill="url(#linearea)" />}
        <polyline
          points={line}
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill={stroke}
              className="[stroke-width:0]"
            />
            <text
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              className="fill-slate-400"
            >
              {p.label}
            </text>
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              className="fill-slate-600 dark:fill-slate-300"
            >
              {formatValue(p.value)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
