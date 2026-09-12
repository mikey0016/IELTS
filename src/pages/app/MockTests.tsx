import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  FileQuestion,
  Play,
  Timer,
  Trophy,
  Calendar,
  ArrowRight,
  Award,
  History,
  Sparkles,
  Database,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProgress } from "@/context/ProgressContext";
import { listMockTests } from "@/api/mockTests";
import { isRealApi } from "@/api/http";
import type { MockTestMeta } from "@/types";

function MockTestCardSkeleton() {
  return (
    <Card glass>
      <CardContent className="space-y-4">
        <Skeleton className="h-6 w-48 rounded-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-10 w-32 rounded-2xl" />
      </CardContent>
    </Card>
  );
}

function difficultyTone(type: string) {
  return type === "Academic" ? ("brand" as const) : ("violet" as const);
}

export function MockTests() {
  const progress = useProgress();
  const [tests, setTests] = useState<MockTestMeta[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMockTests()
      .then((data) => setTests(data))
      .catch(() => setTests([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Premium header */}
      <div className="relative overflow-hidden rounded-[24px] bg-slate-900 p-7 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-brand-600 opacity-90" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur">
              <Trophy className="h-3.5 w-3.5" /> Mock Tests — DB live
            </p>
            <h1 className="mt-3 font-display text-2xl font-black tracking-tight">Full IELTS mock exams</h1>
            <p className="mt-1.5 max-w-xl text-sm text-white/80">
              Mirror the real test — timed conditions across Listening, Reading, Writing and Speaking. DB dan jonli via <code className="rounded bg-white/20 px-1">GET /api/mocks</code>.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="white" className="shadow">
                <Database className="h-3 w-3" /> {isRealApi() ? "DB live" : "Mock"} · {tests ? `${tests.length} tests` : "loading"}
              </Badge>
              <Badge tone="white">
                <Sparkles className="h-3 w-3" /> Band 0-9
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
            <Trophy className="h-5 w-5 text-amber-300" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-white/70">Completed</p>
              <p className="font-display text-lg font-black">{progress.mockHistory.length} mocks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mock tests list */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <MockTestCardSkeleton key={i} />
            ))
          : tests?.map((test) => (
              <Card key={test.id} hover glass className="flex flex-col overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
                <CardHeader>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={difficultyTone(test.type)}>
                        {test.type}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        {test.durationMin} min
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                        <FileQuestion className="h-3.5 w-3.5" />
                        {test.questions} questions
                      </span>
                    </div>
                    <CardTitle className="mt-3 text-lg">{test.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {test.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {test.sections.map((section) => (
                      <span
                        key={section.key}
                        className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {section.title} · {section.durationMin}m
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <Timer className="h-3.5 w-3.5" /> Timed exam
                    </span>
                    <Link to={`/app/mock-test/start/${test.id}`}>
                      <Button size="sm" className="rounded-2xl">
                        <Play className="h-4 w-4 fill-current" /> Start
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {!loading && tests?.length === 0 && (
        <Card glass>
          <CardContent className="py-12 text-center">
            <EmptyState
              title="No mock tests yet"
              description="DB da hech qanday mock topilmadi. Admin paneldan qo'shing."
            />
          </CardContent>
        </Card>
      )}

      {/* Mock history table */}
      <Card glass>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-slate-400" />
              Mock history
            </CardTitle>
            <CardDescription>
              Your recent attempts and estimated bands per skill.
            </CardDescription>
          </div>
          {progress.mockHistory.length > 0 && (
            <Badge tone="slate">
              <Award className="h-3 w-3" /> Best{" "}
              {Math.max(...progress.mockHistory.map((m) => m.overall)).toFixed(
                1,
              )}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {progress.mockHistory.length === 0 ? (
            <EmptyState
              title="No mock tests yet"
              description="Start a full mock exam above — your results and band progression will appear here."
              action={
                tests && tests[0] ? (
                  <Link to={`/app/mock-test/start/${tests[0].id}`}>
                    <Button size="sm" className="rounded-2xl">
                      Take first mock test <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="-mx-5 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wide text-slate-400 dark:border-slate-800">
                    <th className="px-5 py-3">Date</th>
                    <th className="px-3 py-3">Test</th>
                    <th className="px-3 py-3 text-center">Overall</th>
                    <th className="px-3 py-3 text-center">Listening</th>
                    <th className="px-3 py-3 text-center">Reading</th>
                    <th className="px-3 py-3 text-center">Writing</th>
                    <th className="px-3 py-3 text-center">Speaking</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {progress.mockHistory.map((entry) => {
                    const map: Record<string, number | undefined> = {};
                    entry.sections.forEach((s) => {
                      map[s.key] = s.band;
                    });
                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-slate-50 transition hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40"
                      >
                        <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-700 dark:text-slate-200">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {entry.date}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 font-semibold text-slate-800 dark:text-slate-100">
                          {entry.testId === "mock_academic_1"
                            ? "Academic Full Test"
                            : entry.testId === "mock_general_1"
                              ? "General Training Full Test"
                              : entry.testId === "mock_quick_1"
                                ? "Quick Listening Mini"
                                : entry.testId}
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-xs font-extrabold text-white dark:bg-brand-600">
                            {entry.overall.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-center font-bold text-slate-600 dark:text-slate-300">
                          {map.listening !== undefined
                            ? map.listening.toFixed(1)
                            : "—"}
                        </td>
                        <td className="px-3 py-3.5 text-center font-bold text-slate-600 dark:text-slate-300">
                          {map.reading !== undefined
                            ? map.reading.toFixed(1)
                            : "—"}
                        </td>
                        <td className="px-3 py-3.5 text-center font-bold text-slate-600 dark:text-slate-300">
                          {map.writing !== undefined
                            ? map.writing.toFixed(1)
                            : "—"}
                        </td>
                        <td className="px-3 py-3.5 text-center font-bold text-slate-600 dark:text-slate-300">
                          {map.speaking !== undefined
                            ? map.speaking.toFixed(1)
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            to={`/app/mock-test/results/${entry.testId}?resultId=${entry.id}`}
                          >
                            <Button variant="ghost" size="sm" className="rounded-2xl">
                              View <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
