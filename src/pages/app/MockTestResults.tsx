import { useMemo } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import {
  Trophy,
  RotateCcw,
  ArrowLeft,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Award,
  Target,
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
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useProgress } from "@/context/ProgressContext";
import { bandColor } from "@/lib/bands";
import type { MockResult } from "@/types";
import { cn } from "@/lib/cn";

export function MockTestResults() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation() as { state?: { result?: MockResult } };
  const progress = useProgress();

  const resultId = searchParams.get("resultId");

  const result: MockResult | undefined = useMemo(() => {
    if (location.state?.result && location.state.result.testId === id)
      return location.state.result;
    if (resultId) {
      const found = progress.mockHistory.find((m) => m.id === resultId);
      if (found) return found;
    }
    // fallback: last mock for this test, or latest overall
    const forTest = progress.mockHistory.filter((m) => m.testId === id);
    if (forTest.length > 0) return forTest[0];
    return progress.mockHistory[0];
  }, [id, resultId, progress.mockHistory, location.state]);

  if (
    !result ||
    (id &&
      result.testId !== id &&
      !progress.mockHistory.find((m) => m.testId === id))
  ) {
    // if result exists but mismatched testId, still show it if it's the latest
    if (!result) {
      return (
        <div className="space-y-6">
          <PageHeader
            eyebrow="Results"
            title="Mock Test Results"
            description="Your estimated band and feedback."
          />
          <EmptyState
            title="No results yet"
            description="Complete a mock test to see your estimated band, strengths and next steps."
            action={
              <Link to="/app/mock-test">
                <Button>Browse mock tests</Button>
              </Link>
            }
          />
        </div>
      );
    }
  }

  if (!result) {
    return (
      <EmptyState
        title="No results"
        description="No mock results found for this test."
        action={
          <Link to="/app/mock-test">
            <Button>Back to mock tests</Button>
          </Link>
        }
      />
    );
  }

  const overallPct = Math.round((result.overall / 9) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Results"
        title="Mock Test Results"
        description={`Test: ${result.testId} · ${result.date} · Result ${result.id}`}
        actions={
          <div className="flex gap-2">
            <Link to="/app/mock-test">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" /> Mock tests
              </Button>
            </Link>
            <Link to={`/app/mock-test/start/${result.testId}`}>
              <Button size="sm" variant="accent">
                <RotateCcw className="h-4 w-4" /> Retake
              </Button>
            </Link>
          </div>
        }
      />

      {/* Overall band */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-brand-700 via-brand-800 to-slate-950 p-8 text-center text-white sm:p-10">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-200">
            <Trophy className="h-3.5 w-3.5" /> Overall estimated band
          </p>
          <p className="mt-4 font-display text-7xl font-extrabold tracking-tight">
            {result.overall.toFixed(1)}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-300">
            Band {result.overall.toFixed(1)} of 9 ·{" "}
            {result.overall >= 7
              ? "Great job — above target for most universities"
              : result.overall >= 6
                ? "Solid base — polish weak skills to reach 7+"
                : "Keep practising with a focused plan"}
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <ProgressBar
              value={overallPct}
              tone="white"
              className="bg-white/20"
              stripes
              size="lg"
            />
            <p className="mt-2 text-xs font-semibold text-white/70">
              {overallPct}% of maximum band
            </p>
          </div>
        </div>
        <CardContent className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {result.sections.map((section) => (
            <div
              key={section.key}
              className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {section.title}
                </span>
                <Award className="h-4 w-4 text-slate-300" />
              </div>
              <p
                className={cn(
                  "mt-2 font-display text-3xl font-extrabold",
                  bandColor(section.band),
                )}
              >
                {section.band.toFixed(1)}
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {section.correct !== undefined && section.total !== undefined
                  ? `${section.correct} / ${section.total} correct`
                  : "Estimated from responses"}
              </p>
              <ProgressBar
                value={(section.band / 9) * 100}
                tone="brand"
                size="sm"
                className="mt-3"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Strengths
            </CardTitle>
            <CardDescription>
              What you did best — keep reinforcing these.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {result.strengths.map((s, i) => (
              <div
                key={i}
                className="flex gap-2.5 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-200">
                  {s}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Weaknesses
            </CardTitle>
            <CardDescription>Areas holding your band back.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {result.weaknesses.map((w, i) => (
              <div
                key={i}
                className="flex gap-2.5 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-950/30"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                  !
                </span>
                <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
                  {w}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5 text-brand-500" /> Next steps
            </CardTitle>
            <CardDescription>
              Your tailored action plan for the next 2 weeks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {result.nextSteps.map((step, i) => (
              <div
                key={i}
                className="flex gap-2.5 rounded-xl bg-brand-50 px-4 py-3 dark:bg-brand-950/30"
              >
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" />
                <p className="text-sm leading-relaxed text-brand-900 dark:text-brand-200">
                  {step}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detailed section breakdown */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Section breakdown</CardTitle>
            <CardDescription>Band and accuracy per skill.</CardDescription>
          </div>
          <Badge tone="slate">
            <TrendingUp className="h-3 w-3" />{" "}
            {result.overall >= 6.5 ? "On track" : "Focus needed"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wide text-slate-400 dark:border-slate-800">
                  <th className="px-5 py-3">Section</th>
                  <th className="px-3 py-3 text-center">Band</th>
                  <th className="px-3 py-3 text-center">Correct</th>
                  <th className="px-3 py-3">Progress</th>
                </tr>
              </thead>
              <tbody>
                {result.sections.map((s) => (
                  <tr
                    key={s.key}
                    className="border-b border-slate-50 dark:border-slate-800"
                  >
                    <td className="px-5 py-3 font-bold capitalize text-slate-800 dark:text-slate-100">
                      {s.title}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Badge
                        tone={
                          s.band >= 7
                            ? "emerald"
                            : s.band >= 6
                              ? "brand"
                              : "amber"
                        }
                      >
                        {s.band.toFixed(1)}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-center text-slate-600 dark:text-slate-300">
                      {s.correct !== undefined && s.total !== undefined
                        ? `${s.correct} / ${s.total}`
                        : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <ProgressBar
                        value={(s.band / 9) * 100}
                        size="sm"
                        tone={
                          s.band >= 7
                            ? "emerald"
                            : s.band >= 6
                              ? "brand"
                              : "amber"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to={`/app/mock-test/start/${result.testId}`}
          className="sm:flex-1"
        >
          <Button variant="accent" className="w-full">
            <RotateCcw className="h-4 w-4" /> Retake this test
          </Button>
        </Link>
        <Link to="/app/mock-test" className="sm:flex-1">
          <Button variant="outline" className="w-full">
            Back to mock tests <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
