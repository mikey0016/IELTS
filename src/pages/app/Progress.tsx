import {
  TrendingUp,
  AlertTriangle,
  Info,
  Award,
  Clock,
  Target,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { useProgress } from "@/context/ProgressContext";
import { buildInsights } from "@/api/progress";
import { cn } from "@/lib/cn";

const SKILL_COLORS: Record<string, string> = {
  listening: "#7c3aed",
  reading: "#06b6d4",
  writing: "#305c8d",
  speaking: "#10b981",
};

export function Progress() {
  const state = useProgress();
  const insights = buildInsights(state);

  const bestDay = state.weeklyActivity.reduce(
    (a, b) => (a.minutes > b.minutes ? a : b),
    state.weeklyActivity[0],
  );
  const totalMinutes = state.weeklyActivity.reduce((a, d) => a + d.minutes, 0);
  const avgBand = state.bandHistory[state.bandHistory.length - 1]?.band ?? 0;
  const vocabTotal =
    state.vocabGrowth[state.vocabGrowth.length - 1]?.words ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Progress Analytics"
        description="Band improvement, study consistency and skill breakdowns from your real practice data."
        actions={
          <div className="flex items-center gap-2">
            <Badge tone="brand">
              <Award className="h-3 w-3" /> Band {avgBand.toFixed(1)}
            </Badge>
            <Badge tone="slate">
              <Clock className="h-3 w-3" /> {Math.round(totalMinutes / 60)}h
              this week
            </Badge>
          </div>
        }
      />

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-brand-600" /> Insights
          </CardTitle>
          <CardDescription>
            Automatic highlights from your learning curve.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className={cn(
                "flex gap-3 rounded-2xl border p-4",
                ins.icon === "up"
                  ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30"
                  : ins.icon === "warn"
                    ? "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/30"
                    : "border-brand-200 bg-brand-50/60 dark:border-brand-900 dark:bg-brand-950/30",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                  ins.icon === "up"
                    ? "bg-emerald-500 text-white"
                    : ins.icon === "warn"
                      ? "bg-amber-500 text-white"
                      : "bg-brand-600 text-white",
                )}
              >
                {ins.icon === "up" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : ins.icon === "warn" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
              </span>
              <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-200">
                {ins.text}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Band improvement */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Band score improvement</CardTitle>
              <CardDescription>
                Estimated overall band over the last 6 months.
              </CardDescription>
            </div>
            <Badge tone="emerald">
              <TrendingUp className="h-3 w-3" /> +
              {(
                state.bandHistory[state.bandHistory.length - 1].band -
                state.bandHistory[0].band
              ).toFixed(1)}
            </Badge>
          </CardHeader>
          <CardContent>
            <LineChart
              data={state.bandHistory.map((p) => ({
                label: p.month,
                value: p.band,
              }))}
              stroke="#305c8d"
              formatValue={(v) => v.toFixed(1)}
              formatY={(v) => v.toFixed(1)}
            />
            <p className="mt-3 text-xs text-slate-400">
              Band is estimated from your quiz and mock performance. Real exam
              banding rounds to the nearest 0.5.
            </p>
          </CardContent>
        </Card>

        {/* Weekly study hours */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Weekly study hours</CardTitle>
              <CardDescription>
                Hours practised per week — aim for 5–7h consistently.
              </CardDescription>
            </div>
            <Badge tone="violet">
              <Clock className="h-3 w-3" />{" "}
              {state.weeklyHours[state.weeklyHours.length - 1]?.hours.toFixed(
                1,
              )}
              h last week
            </Badge>
          </CardHeader>
          <CardContent>
            <BarChart
              data={state.weeklyHours.map((w) => ({
                label: w.week,
                value: w.hours,
              }))}
              formatValue={(v) => `${v.toFixed(1)}h`}
              highlightColor="#7c3aed"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skill performance */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Skill performance</CardTitle>
              <CardDescription>Current band per IELTS skill.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(state.skills).map(([key, s]) => (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold capitalize text-slate-700 dark:text-slate-200">
                    {key}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {s.band.toFixed(1)} · {(s.accuracy * 100).toFixed(0)}%
                    accuracy
                  </span>
                </div>
                <ProgressBar
                  value={(s.band / 9) * 100}
                  tone={
                    key === "listening"
                      ? "violet"
                      : key === "reading"
                        ? "cyan"
                        : key === "writing"
                          ? "brand"
                          : "emerald"
                  }
                />
                <p className="text-xs text-slate-400">
                  {s.questionsDone} questions done · {s.minutes} minutes
                </p>
              </div>
            ))}
            <div className="pt-2">
              <BarChart
                data={Object.entries(state.skills).map(([k, s]) => ({
                  label: k.slice(0, 1).toUpperCase() + k.slice(1, 3),
                  value: s.band,
                  color: SKILL_COLORS[k],
                }))}
                formatValue={(v) => v.toFixed(1)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Practice accuracy */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Practice accuracy</CardTitle>
              <CardDescription>
                Share of correct answers per month.
              </CardDescription>
            </div>
            <Badge tone="cyan">
              {Math.round(
                (state.accuracyHistory[state.accuracyHistory.length - 1]
                  ?.accuracy ?? 0) * 100,
              )}
              % current
            </Badge>
          </CardHeader>
          <CardContent>
            <LineChart
              data={state.accuracyHistory.map((p) => ({
                label: p.month,
                value: p.accuracy * 100,
              }))}
              stroke="#06b6d4"
              formatValue={(v) => `${Math.round(v)}%`}
              formatY={(v) => `${Math.round(v)}%`}
            />
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
              Accuracy above 65% typically maps to Band 6.5+ on
              Reading/Listening. Keep pushing past 75% for Band 7.5.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Vocabulary growth */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-slate-400" /> Vocabulary
                growth
              </CardTitle>
              <CardDescription>Total words learned over time.</CardDescription>
            </div>
            <Badge tone="emerald">{vocabTotal} words</Badge>
          </CardHeader>
          <CardContent>
            <LineChart
              data={state.vocabGrowth.map((p) => ({
                label: p.month,
                value: p.words,
              }))}
              stroke="#10b981"
              formatValue={(v) => String(Math.round(v))}
            />
          </CardContent>
        </Card>

        {/* Weekly activity */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Weekly activity</CardTitle>
              <CardDescription>
                Minutes per day — your best day was {bestDay.label} (
                {bestDay.minutes} min).
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <BarChart
              data={state.weeklyActivity.map((d) => ({
                label: d.label,
                value: d.minutes,
              }))}
              formatValue={(v) => `${v}m`}
            />
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs dark:bg-slate-800/60">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Total this week: {totalMinutes} minutes
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {state.streak}-day streak
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mock test history */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Mock test history</CardTitle>
            <CardDescription>
              All attempts — overall and per-section bands.
            </CardDescription>
          </div>
          <Badge tone="slate">{state.mockHistory.length} tests</Badge>
        </CardHeader>
        <CardContent>
          {state.mockHistory.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No mock tests yet — finish one to populate your history.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto -mx-5">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wide text-slate-400 dark:border-slate-800">
                      <th className="px-5 py-3">Date</th>
                      <th className="px-3 py-3">Test</th>
                      <th className="px-3 py-3 text-center">Overall</th>
                      <th className="px-3 py-3 text-center">Listening</th>
                      <th className="px-3 py-3 text-center">Reading</th>
                      <th className="px-3 py-3 text-center">Writing</th>
                      <th className="px-3 py-3 text-center">Speaking</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.mockHistory.map((m) => {
                      const byKey: Record<string, number> = {};
                      m.sections.forEach((s) => (byKey[s.key] = s.band));
                      return (
                        <tr
                          key={m.id}
                          className="border-b border-slate-50 dark:border-slate-800"
                        >
                          <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">
                            {m.date}
                          </td>
                          <td className="px-3 py-3 font-semibold text-slate-800 dark:text-slate-100">
                            {m.testId}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs font-extrabold text-white">
                              {m.overall.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-slate-600 dark:text-slate-300">
                            {byKey.listening?.toFixed(1) ?? "—"}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-slate-600 dark:text-slate-300">
                            {byKey.reading?.toFixed(1) ?? "—"}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-slate-600 dark:text-slate-300">
                            {byKey.writing?.toFixed(1) ?? "—"}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-slate-600 dark:text-slate-300">
                            {byKey.speaking?.toFixed(1) ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Overall band trend
                </p>
                <LineChart
                  data={[...state.mockHistory]
                    .reverse()
                    .map((m, i) => ({
                      label: m.date.slice(5),
                      value: m.overall,
                    }))}
                  stroke="#f59e0b"
                  formatValue={(v) => v.toFixed(1)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
