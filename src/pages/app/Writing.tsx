import { useEffect, useMemo, useState } from "react";
import {
  PenLine,
  Timer,
  Send,
  Sparkles,
  Info,
  RefreshCw,
  Clock,
  Database,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTimer } from "@/hooks/useTimer";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";
import { getWritingPrompts } from "@/api/writing";
import { isRealApi } from "@/api/http";
import type { WritingPrompt } from "@/types";
import { countWords, formatClock, randomId } from "@/lib/format";
import { IELTS_TIMING } from "@/lib/ieltsConfig";
import { cn } from "@/lib/cn";
import { addCoins } from "@/lib/wallet";

type Phase = "select" | "writing" | "evaluating" | "results";
type WritingMode = "task1" | "task2" | "full";

interface Evaluation {
  id: string;
  date: string;
  criteria: { key: string; label: string; band: number; comment: string }[];
  overall: number;
  feedback: string;
  improvements: string[];
  diversity?: number;
  avgSentLen?: number;
  uniqueWords?: number;
}

const TASK_META: Record<WritingPrompt["type"], "brand" | "violet"> = {
  "academic-task1": "brand",
  "academic-task2": "brand",
  "gt-task1": "violet",
  "gt-task2": "violet",
};

export function Writing() {
  const progress = useProgress();
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("select");
  const [mode, setMode] = useState<WritingMode>("task1");
  const [prompt, setPrompt] = useState<WritingPrompt | null>(null);
  const [fullPrompts, setFullPrompts] = useState<WritingPrompt[]>([]);
  const [text, setText] = useState("");
  const [fullTexts, setFullTexts] = useState<string[]>(["", ""]);
  const [history, setHistory] = useState<Evaluation[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [prompts, setPrompts] = useState<WritingPrompt[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWritingPrompts()
      .then((data) => setPrompts(data))
      .catch(() => setPrompts([]))
      .finally(() => setLoading(false));
  }, []);

  const words = useMemo(() => countWords(text), [text]);
  const fullWords = useMemo(() => fullTexts.map(countWords), [fullTexts]);

  const timerSeconds = useMemo(() => {
    if (mode === "full") return IELTS_TIMING.writing.fullSec;
    if (mode === "task1") return IELTS_TIMING.writing.task1Sec;
    return IELTS_TIMING.writing.task2Sec;
  }, [mode]);

  const timer = useTimer("down", timerSeconds, () => {
    if (phase === "writing")
      toast("Vaqt tugadi — essay avtomatik topshirildi!", "info");
  });

  useEffect(() => {
    if (phase === "writing") {
      timer.reset();
      timer.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timerSeconds]);

  const chooseTask = (p: WritingPrompt) => {
    if (p.type.includes("task1")) setMode("task1");
    else setMode("task2");
    setPrompt(p);
    setText("");
    setPhase("writing");
  };

  const startFull = () => {
    if (!prompts || prompts.length === 0) {
      toast("No writing prompts available", "error");
      return;
    }
    const t1 =
      prompts.find((p) => p.type === "academic-task1") ??
      prompts[0];
    const t2 =
      prompts.find((p) => p.type === "academic-task2") ??
      prompts[1] ?? prompts[0];
    setMode("full");
    setFullPrompts([t1, t2]);
    setFullTexts(["", ""]);
    setPhase("writing");
  };

  const startTask1Only = () => {
    setMode("task1");
    toast("Task 1 ni tanlang — 20 minut, 150 so'z", "info");
  };

  const startTask2Only = () => {
    setMode("task2");
    toast("Task 2 ni tanlang — 40 minut, 250 so'z", "info");
  };

  const submit = () => {
    if (
      mode !== "full" &&
      words < Math.round((prompt?.minWords ?? 150) * 0.6)
    ) {
      toast(
        `Short essay (${words} words). Aim for ${prompt?.minWords}+ words.`,
        "error",
      );
    }
    if (mode === "full") {
      const w1 = fullWords[0] ?? 0;
      const w2 = fullWords[1] ?? 0;
      if (w1 < 120 || w2 < 200) {
        toast(`Task 1: ${w1}/150, Task 2: ${w2}/250 — to'ldiring!`, "info");
      }
    }
    timer.pause();
    setPhase("evaluating");
    window.setTimeout(() => {
      if (mode === "full") {
        const combinedText = fullTexts.join("\n\n");
        const combinedWords = fullWords[0] + fullWords[1];
        const ev = buildEvaluation(
          fullPrompts[1] ?? fullPrompts[0],
          combinedText,
          combinedWords,
        );
        setEvaluation(ev);
        setHistory((h) => [ev, ...h].slice(0, 5));
        progress.recordMinutes(60);
        const coins = Math.round(ev.overall * 6) + 10;
        try {
          addCoins(null, coins, `Writing Full ${ev.overall.toFixed(1)}`);
          window.dispatchEvent(
            new CustomEvent("xp:gain", {
              detail: { coins, xp: coins, msg: `Writing +${coins}🪙` },
            }),
          );
        } catch {}
      } else {
        const ev = buildEvaluation(prompt!, text, words);
        setEvaluation(ev);
        setHistory((h) => [ev, ...h].slice(0, 5));
        progress.recordMinutes(prompt?.timeLimitMin ?? 40);
        const coins = Math.round(ev.overall * 5) + 5;
        try {
          addCoins(null, coins, `Writing ${ev.overall.toFixed(1)}`);
          window.dispatchEvent(
            new CustomEvent("xp:gain", {
              detail: { coins, xp: coins, msg: `Writing +${coins}🪙` },
            }),
          );
        } catch {}
      }
      toast("Essay evaluated — check your feedback", "success");
      setPhase("results");
    }, 1600);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Premium header */}
      <div className="relative overflow-hidden rounded-[24px] bg-slate-900 p-7 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-violet-600 to-indigo-600 opacity-90" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur">
            <PenLine className="h-3.5 w-3.5" /> Writing — DB live
          </p>
          <h1 className="mt-3 font-display text-2xl font-black">IELTS Writing</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-white/80">
            Task 1 — 20 minut / 150 so'z · Task 2 — 40 minut / 250 so'z · Full — 60 minut. Vaqt tugagach avtomatik topshiriladi. DB dan jonli via <code className="rounded bg-white/20 px-1">GET /api/writing</code>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="white" className="shadow">
              <Database className="h-3 w-3" /> {isRealApi() ? "DB live" : "Mock"} · {prompts ? `${prompts.length} prompts` : "loading"}
            </Badge>
            <Badge tone="white"><Clock className="h-3 w-3" /> 60 min full</Badge>
          </div>
        </div>
      </div>

      {phase === "select" && (
        <div className="flex flex-wrap gap-3">
          <Button
            variant={mode === "full" ? "primary" : "outline"}
            className="rounded-full"
            size="sm"
            onClick={startFull}
          >
            <Clock className="h-4 w-4" /> Full Writing — 60 min (20+40)
          </Button>
          <Button
            variant={mode === "task1" ? "primary" : "outline"}
            className="rounded-full"
            size="sm"
            onClick={startTask1Only}
          >
            Task 1 — 20 min / 150w
          </Button>
          <Button
            variant={mode === "task2" ? "primary" : "outline"}
            className="rounded-full bg-violet-600 text-white hover:bg-violet-700 data-[outline]:bg-white"
            style={mode === "task2" ? {} : undefined}
            size="sm"
            onClick={startTask2Only}
          >
            Task 2 — 40 min / 250w
          </Button>
        </div>
      )}

      {phase === "select" && (
        <Card glass>
          <CardContent>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                {loading
                  ? "Loading..."
                  : mode === "full"
                    ? "Full Exam — ikkala task"
                    : mode === "task1"
                      ? "Task 1 ni tanlang (20 min)"
                      : mode === "task2"
                        ? "Task 2 ni tanlang (40 min)"
                        : "Choose a task"}
              </h2>
              <Badge
                tone={
                  mode === "full"
                    ? "brand"
                    : mode === "task1"
                      ? "amber"
                      : "violet"
                }
              >
                {mode === "full"
                  ? "60 min"
                  : mode === "task1"
                    ? "20 min"
                    : "40 min"}
              </Badge>
            </div>

            {loading ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[0, 1].map((i) => (
                  <div key={i} className="rounded-2xl border border-slate-100 p-5 dark:border-white/10">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="mt-3 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-3/4" />
                    <Skeleton className="mt-4 h-9 w-32 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : mode === "full" ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Haqiqiy imtihonda 60 minut ichida ikkala taskni bajarasiz. Task 1 ga 20 min, Task 2 ga 40 min ajrating.
                </p>
                <Button size="lg" className="rounded-2xl" onClick={startFull}>
                  Start Full Writing (60 min) <PenLine className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {(prompts ?? [])
                  .filter((p) =>
                    mode === "task1"
                      ? p.type.includes("task1")
                      : mode === "task2"
                        ? p.type.includes("task2")
                        : true,
                  )
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => chooseTask(p)}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
                    >
                      <div className="flex items-center justify-between">
                        <Badge tone={TASK_META[p.type]}>{p.task}</Badge>
                        <span className="text-xs font-semibold text-slate-400">
                          <Timer className="mr-1 inline h-3.5 w-3.5" />{" "}
                          {p.timeLimitMin} min · {p.minWords} words
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {p.prompt}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 dark:text-brand-400">
                        Start writing{" "}
                        <PenLine className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </button>
                  ))}
                {(prompts ?? []).filter((p) =>
                  mode === "task1"
                    ? p.type.includes("task1")
                    : p.type.includes("task2"),
                ).length === 0 && (
                  <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 dark:border-white/10">
                    <BookOpen className="h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-500">No prompts for this filter.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {phase === "writing" && mode !== "full" && prompt && (
        <Card glass>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge tone={TASK_META[prompt.type]}>
                {prompt.task} — {mode === "task1" ? "20 min" : "40 min"}
              </Badge>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-300">
                  <Timer className="mr-1.5 inline h-4 w-4 text-slate-400" />
                  <span
                    className={cn(
                      "font-mono text-lg font-bold",
                      timer.seconds < 300 && "text-rose-500",
                    )}
                  >
                    {formatClock(timer.seconds)}
                  </span>
                </span>
                <Badge tone={words >= prompt.minWords ? "emerald" : "amber"}>
                  {words} / {prompt.minWords} words
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-2xl"
                  onClick={() =>
                    timer.isRunning ? timer.pause() : timer.start()
                  }
                >
                  {timer.isRunning ? "Pause" : "Resume"}
                </Button>
              </div>
            </div>

            <ProgressBar
              value={((timerSeconds - timer.seconds) / timerSeconds) * 100}
              tone="brand"
            />

            <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100 dark:bg-slate-800/60 dark:ring-slate-700">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Task — {prompt.timeLimitMin} min
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {prompt.prompt}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {prompt.instructions.map((ins) => (
                <div
                  key={ins}
                  className="flex items-start gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 dark:border-slate-700"
                >
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {ins}
                  </p>
                </div>
              ))}
            </div>

            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your essay here…"
                className="min-h-[320px] w-full resize-y rounded-2xl border border-slate-300 bg-white p-5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <span className="absolute bottom-3 right-4 text-xs font-semibold text-slate-400">
                {words} words
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => {
                  timer.pause();
                  setPhase("select");
                  setPrompt(null);
                }}
              >
                <RefreshCw className="h-4 w-4" /> Change task
              </Button>
              <Button variant="accent" size="lg" className="rounded-2xl" onClick={submit}>
                <Send className="h-4 w-4" /> Submit for evaluation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "writing" && mode === "full" && (
        <Card glass>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge tone="brand">
                Full Writing — 60 min (Task 1: 20m + Task 2: 40m)
              </Badge>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-lg font-bold",
                    timer.seconds < 300
                      ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950/40"
                      : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white",
                  )}
                >
                  <Timer className="h-4 w-4" /> {formatClock(timer.seconds)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-2xl"
                  onClick={() =>
                    timer.isRunning ? timer.pause() : timer.start()
                  }
                >
                  {timer.isRunning ? "Pause" : "Resume"}
                </Button>
              </div>
            </div>
            <ProgressBar
              value={((timerSeconds - timer.seconds) / timerSeconds) * 100}
              tone="brand"
            />
            <p className="text-xs font-semibold text-slate-400">
              Task 1 ga 20 min, Task 2 ga 40 min ajrating. Vaqt tugagach avtomatik topshiriladi.
            </p>

            {fullPrompts.map((wp, idx) => (
              <div
                key={wp.id}
                className="space-y-3 rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      {wp.task} — {wp.timeLimitMin} min
                    </p>
                    <p className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                      {wp.prompt}
                    </p>
                  </div>
                  <Badge tone={idx === 0 ? "amber" : "brand"}>
                    {wp.timeLimitMin} min · ≥{wp.minWords}w
                  </Badge>
                </div>
                <textarea
                  value={fullTexts[idx] ?? ""}
                  onChange={(e) => {
                    const next = [...fullTexts];
                    next[idx] = e.target.value;
                    setFullTexts(next);
                  }}
                  placeholder={`Write your ${wp.task.toLowerCase()} here...`}
                  rows={10}
                  className="min-h-[180px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={cn(
                      "font-semibold",
                      (fullWords[idx] ?? 0) < wp.minWords
                        ? "text-amber-600"
                        : "text-emerald-600",
                    )}
                  >
                    {fullWords[idx]} words{" "}
                    {(fullWords[idx] ?? 0) < wp.minWords &&
                      `· need ${wp.minWords}`}
                  </span>
                </div>
              </div>
            ))}

            <div className="flex justify-between">
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => {
                  timer.pause();
                  setPhase("select");
                }}
              >
                <RefreshCw className="h-4 w-4" /> Exit
              </Button>
              <Button variant="accent" size="lg" className="rounded-2xl" onClick={submit}>
                <Send className="h-4 w-4" /> Submit both tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "evaluating" && (
        <Card glass>
          <CardContent className="space-y-4 py-10">
            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
              <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-900/50">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
                AI is evaluating your essay…
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Analysing cohesion, vocabulary range and grammar accuracy.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2.5">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "results" && evaluation && (
        <EvaluationView
          prompt={prompt ?? fullPrompts[1]}
          evaluation={evaluation}
          words={mode === "full" ? fullWords[0] + fullWords[1] : words}
          onRetry={() => setPhase("select")}
        />
      )}

      {history.length > 0 && phase !== "select" && phase !== "writing" && (
        <Card glass>
          <CardContent>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Recent evaluations
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {history.map((h) => (
                <Badge
                  key={h.id}
                  tone="violet"
                  className="cursor-pointer rounded-full"
                  onClick={() => {
                    setEvaluation(h);
                    setPhase("results");
                  }}
                >
                  Band {h.overall.toFixed(1)} · {h.date}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EvaluationView({
  prompt,
  evaluation,
  words,
  onRetry,
}: {
  prompt: WritingPrompt;
  evaluation: Evaluation;
  words: number;
  onRetry: () => void;
}) {
  return (
    <div className="space-y-6">
      <Card glass className="overflow-hidden">
        <div className="bg-gradient-to-br from-violet-600 to-brand-800 p-7 text-center text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-200">
            AI Band Predictor v2 — Estimated band
          </p>
          <p className="mt-1 font-display text-6xl font-extrabold">
            {evaluation.overall.toFixed(1)}
          </p>
          <p className="mt-2 text-sm text-violet-100">
            {prompt.task} · {words} words · {evaluation.date}
            {typeof evaluation.diversity === "number" &&
              ` · Diversity ${(evaluation.diversity * 100).toFixed(0)}%`}
          </p>
        </div>
      </Card>
      {typeof evaluation.diversity === "number" && (
        <Card glass>
          <CardContent className="grid gap-4 pt-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/50">
              <p className="text-xs font-bold text-slate-500">
                Lexical Diversity
              </p>
              <p className="mt-1 text-xl font-black text-violet-600">
                {(evaluation.diversity * 100).toFixed(0)}%
              </p>
              <ProgressBar
                value={evaluation.diversity * 100}
                tone="violet"
                className="mt-2"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                {evaluation.uniqueWords} unique / {words} words
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/50">
              <p className="text-xs font-bold text-slate-500">Avg Sentence</p>
              <p className="mt-1 text-xl font-black text-brand-600">
                {(evaluation.avgSentLen || 0).toFixed(1)} words
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {(evaluation.avgSentLen || 0) < 12
                  ? "Too short — add complex"
                  : (evaluation.avgSentLen || 0) > 22
                    ? "Long — check clarity"
                    : "Ideal 14-20"}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-950/20">
              <p className="text-xs font-bold text-emerald-700">Coins Earned</p>
              <p className="mt-1 text-xl font-black text-emerald-600">
                +{Math.round(evaluation.overall * 5) + 5}🪙
              </p>
              <p className="text-[11px] text-emerald-700">Band ×5 + bonus</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {evaluation.criteria.map((c) => (
          <Card key={c.key} glass>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {c.label}
                </p>
                <Badge tone="violet" className="font-display">
                  {c.band.toFixed(1)}
                </Badge>
              </div>
              <ProgressBar
                value={(c.band / 9) * 100}
                tone="violet"
                className="mt-3"
              />
              <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {c.comment}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card glass>
        <CardContent>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Detailed feedback
            </h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {evaluation.feedback}
          </p>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Suggested improvements
            </p>
            <ul className="mt-2 space-y-2">
              {evaluation.improvements.map((imp) => (
                <li
                  key={imp}
                  className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={onRetry} className="w-full rounded-2xl">
        <RefreshCw className="h-4 w-4" /> Write another task
      </Button>
    </div>
  );
}

function buildEvaluation(
  prompt: WritingPrompt,
  text: string,
  words: number,
): Evaluation {
  const trimmed = text.trim();
  const meaningfulWords = trimmed ? trimmed.split(/\s+/).length : 0;
  const effectiveWords = Math.max(meaningfulWords, words);

  let base: number;
  if (effectiveWords < 20) {
    base = 3.0;
  } else if (effectiveWords < 50) {
    base = 3.5;
  } else if (effectiveWords < 100) {
    base = 4.0;
  } else if (effectiveWords < 150) {
    base = 4.5;
  } else if (effectiveWords < prompt.minWords * 0.8) {
    base = 5.0;
  } else if (effectiveWords >= prompt.minWords) {
    base = 6.5;
  } else {
    base = 5.5;
  }

  const hasFullStructure =
    /^(Dear\s+\w+|It\s+is\s+argued|In\s+recent\s+years|Nowadays)/im.test(
      trimmed,
    );
  const hasExamples = /for\s+example|for\s+instance|such\s+as|namely/i.test(
    trimmed,
  );
  const hasLinking =
    /however|moreover|furthermore|nevertheless|consequently|in\s+addition/i.test(
      trimmed,
    );
  const hasComplexGrammar =
    /although|despite|whereas|while|unless|if\s+\w+\s+were/i.test(trimmed);
  const tokens = trimmed.toLowerCase().match(/\b[a-z']+\b/g) || [];
  const unique = new Set(tokens);
  const diversity = tokens.length ? unique.size / tokens.length : 0;
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentLen = sentences.length ? tokens.length / sentences.length : 0;

  const task = Math.min(8, base + (hasFullStructure ? 0.5 : 0));
  const coherence = Math.min(
    8,
    base +
      (hasLinking ? 0.3 : -0.2) +
      (avgSentLen >= 14 && avgSentLen <= 20 ? 0.2 : 0),
  );
  const lexical = Math.min(
    8,
    base +
      (hasExamples ? 0.2 : -0.1) +
      (effectiveWords > 250 ? 0.3 : 0) +
      (diversity > 0.65 ? 0.4 : diversity > 0.5 ? 0.15 : -0.3),
  );
  const grammar = Math.min(
    8,
    base +
      (hasComplexGrammar ? 0.4 : 0) -
      (trimmed.length < 30 ? 0.5 : 0) +
      (avgSentLen > 25 ? -0.2 : 0),
  );

  const overall =
    Math.round(((task + coherence + lexical + grammar) / 4) * 2) / 2;

  return {
    id: randomId("eval"),
    date: new Date().toISOString().slice(0, 10),
    diversity,
    avgSentLen,
    uniqueWords: unique.size,
    criteria: [
      {
        key: "task",
        label: "Task Achievement",
        band: Math.max(3, task),
        comment:
          effectiveWords < prompt.minWords * 0.8
            ? "Task underdeveloped — without the minimum word count the examiner cannot award above Band 6 for this criterion."
            : prompt.type === "academic-task1"
              ? "The overview is present and data is grouped sensibly. Ensure every statement includes a figure."
              : "All parts of the task are addressed and the position is consistent.",
      },
      {
        key: "coherence",
        label: "Coherence & Cohesion",
        band: Math.max(3, coherence),
        comment: buildCoherenceComment(hasLinking, trimmed),
      },
      {
        key: "lexical",
        label: "Lexical Resource",
        band: Math.max(3, lexical),
        comment: buildLexicalComment(effectiveWords, trimmed),
      },
      {
        key: "grammar",
        label: "Grammatical Range & Accuracy",
        band: Math.max(3, grammar),
        comment: buildGrammarComment(hasComplexGrammar, trimmed),
      },
    ],
    overall: Math.max(3, overall),
    feedback: buildFeedback(
      base,
      effectiveWords,
      prompt.minWords,
      hasFullStructure,
      hasExamples,
      hasLinking,
      hasComplexGrammar,
    ),
    improvements: buildImprovements(
      base,
      effectiveWords,
      prompt.minWords,
      hasFullStructure,
      hasExamples,
      hasLinking,
      hasComplexGrammar,
    ),
  };
}

function buildCoherenceComment(hasLinking: boolean, text: string): string {
  if (text.trim().length < 30)
    return "Response too short to demonstrate coherent organisation.";
  if (!hasLinking)
    return "Add linking words (however, moreover, consequently) to connect ideas between sentences and paragraphs.";
  return "Good use of cohesive devices. Ensure each paragraph has a clear central topic and logical progression.";
}

function buildLexicalComment(words: number, text: string): string {
  if (text.trim().length < 30)
    return "Too little vocabulary to assess lexical range.";
  if (words > 250)
    return "Good range of topic vocabulary. Try academic synonyms for repeated words to reach Band 7+.";
  if (words > 150)
    return "Adequate vocabulary for the task. Include more precise collocations and avoid repetition.";
  return 'Limited vocabulary range — use topic-specific words and avoid repeating simple terms like "good" and "people".';
}

function buildGrammarComment(hasComplex: boolean, text: string): string {
  if (text.trim().length < 30)
    return "Too short to demonstrate grammatical range.";
  if (hasComplex)
    return "Good mix of complex structures. Check subject–verb agreement and article use in longer sentences.";
  return "Mostly simple sentences — add subordinate clauses (although, if, while) and passive voice to boost your band.";
}

function buildFeedback(
  base: number,
  words: number,
  minWords: number,
  hasStructure: boolean,
  hasExamples: boolean,
  hasLinking: boolean,
  hasComplex: boolean,
): string {
  if (words < 30) {
    return "Your response is too short to be assessed properly. Write at least a few sentences with an introduction, body and conclusion.";
  }
  const issues: string[] = [];
  if (!hasStructure) issues.push("write a clear introduction and conclusion");
  if (!hasExamples) issues.push("support ideas with specific examples");
  if (!hasLinking) issues.push("use linking words to connect paragraphs");
  if (!hasComplex) issues.push("include complex sentence structures");

  if (issues.length === 0) {
    return `A well-organised response with good language use. To reach Band 7+, focus on more sophisticated vocabulary and flawless grammar.`;
  }
  return `Your essay shows some effort but needs improvement. Try to ${issues.slice(0, 2).join(" and ")}.`;
}

function buildImprovements(
  base: number,
  words: number,
  minWords: number,
  hasStructure: boolean,
  hasExamples: boolean,
  hasLinking: boolean,
  hasComplex: boolean,
): string[] {
  const tips: string[] = [];
  if (words < minWords)
    tips.push(
      `Expand your essay to at least ${minWords} words — underlength responses lose marks in Task Achievement.`,
    );
  if (!hasStructure)
    tips.push(
      "Add a clear introduction that paraphrases the prompt and a conclusion that summarises your position.",
    );
  if (!hasExamples)
    tips.push(
      "Include one concrete example in each body paragraph (statistics, studies, or real-world cases).",
    );
  if (!hasLinking)
    tips.push(
      "Use discourse markers (however, furthermore, consequently) to improve flow.",
    );
  if (!hasComplex)
    tips.push(
      "Add complex sentences with subordinate clauses and passive voice.",
    );
  if (tips.length === 0)
    tips.push(
      "Focus on more sophisticated vocabulary and fewer minor errors to reach Band 7+.",
    );
  return tips.slice(0, 4);
}
