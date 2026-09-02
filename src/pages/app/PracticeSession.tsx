import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Headphones,
  FileText,
  Timer,
  Play,
  Pause,
  Volume2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  ArrowRight,
  ListChecks,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTimer } from "@/hooks/useTimer";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";
import { fetchQuestions, submitQuiz } from "@/api/practice";
import type { QuizFilters, QuizSubmissionResult } from "@/api/practice";
import type { Question } from "@/types";
import { formatClock } from "@/lib/format";
import { bandColor } from "@/lib/bands";
import { cn } from "@/lib/cn";
import { IELTS_TIMING } from "@/lib/ieltsConfig";

const SKILL_META = {
  listening: { label: "Listening", icon: Headphones, tone: "violet" as const },
  reading: { label: "Reading", icon: FileText, tone: "cyan" as const },
};

type Phase = "intro" | "quiz" | "results";

function AudioPlayer({ durationSec }: { durationSec: number }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= durationSec) {
          window.clearInterval(id);
          setPlaying(false);
          setFinished(true);
          return durationSec;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing, durationSec]);

  const restart = () => {
    setElapsed(0);
    setFinished(false);
    setPlaying(true);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
      <div className="flex items-center gap-4">
        <button
          onClick={() => (finished ? restart() : setPlaying((p) => !p))}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white shadow-sm transition hover:bg-brand-800 dark:bg-brand-600"
          aria-label={playing ? "Pause audio" : "Play audio"}
        >
          {playing ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 fill-current" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>
              {finished
                ? "Recording complete"
                : playing
                  ? "Playing…"
                  : "Ready — press play"}
            </span>
            <span>
              {formatClock(elapsed)} / {formatClock(durationSec)}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-brand-600 transition-all duration-300 dark:bg-brand-400"
              style={{ width: `${(elapsed / durationSec) * 100}%` }}
            />
          </div>
        </div>
        <Volume2 className="h-5 w-5 shrink-0 text-slate-400" />
      </div>
    </div>
  );
}

export function PracticeSession() {
  const [params] = useSearchParams();
  const progress = useProgress();
  const { toast } = useToast();

  const skill =
    (params.get("skill") as "listening" | "reading" | null) ?? "listening";
  const examMode = params.get("examMode") as "passage" | "full" | null;
  const meta = SKILL_META[skill];
  const isListening = skill === "listening";
  const isReading = skill === "reading";

  const [loadedQuestions, setLoadedQuestions] = useState<Question[] | null>(
    null,
  );
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [showTranscript, setShowTranscript] = useState(false);
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const questionId = params.get("questionId");
    const filters: QuizFilters = {
      difficulty:
        (params.get("difficulty") as QuizFilters["difficulty"]) ?? "all",
      type: params.get("type") ?? "all",
      topic: params.get("topic") ?? "all",
      limit: Number(params.get("limit") ?? 6),
    };

    const loadQuestions = () => {
      fetchQuestions(skill, filters).then((all) => {
        if (questionId && all.some((q) => q.id === questionId)) {
          const target = all.find((q) => q.id === questionId);
          if (target) {
            const related = all.filter(
              (q) =>
                q.topic === target.topic && q.difficulty === target.difficulty,
            );
            setLoadedQuestions(
              related.length > 0
                ? related.slice(0, Number(filters.limit) || 6)
                : [target],
            );
          } else {
            setLoadedQuestions(all.slice(0, Number(filters.limit) || 6));
          }
        } else {
          setLoadedQuestions(all.slice(0, Number(filters.limit) || 6));
        }
      });
    };

    loadQuestions();
  }, [skill, params]);

  const current = loadedQuestions?.[index];

  // Determine real exam timings
  const examTiming = useMemo(() => {
    if (isReading && examMode === "passage")
      return {
        sec: IELTS_TIMING.reading.passageSec,
        label: "1 Passage — 20 min",
      };
    if (isReading && examMode === "full")
      return {
        sec: IELTS_TIMING.reading.fullSec,
        label: "Full Reading — 60 min / 40 savol",
      };
    if (isListening && examMode === "full")
      return {
        sec: IELTS_TIMING.listening.fullSec,
        label: "Full Listening — 4×10 min = 40 min",
      };
    if (isListening && examMode === "passage")
      return {
        sec: IELTS_TIMING.listening.sectionSec,
        label: "Listening Section — 10 min",
      };
    return null;
  }, [isReading, isListening, examMode]);

  // Listening: split into 4 sections ×10 min
  const listeningSections = useMemo(() => {
    if (!isListening || examMode !== "full" || !loadedQuestions) return [];
    const per = Math.ceil(loadedQuestions.length / 4);
    return Array.from({ length: 4 }, (_, i) =>
      loadedQuestions.slice(i * per, (i + 1) * per),
    );
  }, [isListening, examMode, loadedQuestions]);
  const [listeningSection, setListeningSection] = useState(0);
  const sectionTimer = useTimer(
    "down",
    IELTS_TIMING.listening.sectionSec,
    () => {
      if (phase === "quiz" && isListening && examMode === "full") {
        if (listeningSection < 3) {
          toast(
            `Section ${listeningSection + 1} vaqti tugadi — keyingi sectionga o'tildi (10 min)`,
            "info",
          );
          setListeningSection((s) => s + 1);
        } else {
          toast("Listening vaqti tugadi — avtomatik topshirilmoqda", "info");
          handleSubmitInternal();
        }
      }
    },
  );
  useEffect(() => {
    if (phase === "quiz" && isListening && examMode === "full") {
      sectionTimer.reset();
      sectionTimer.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listeningSection, phase]);
  useEffect(() => {
    if (phase === "quiz" && isListening && examMode === "full") {
      // when entering quiz, reset to section 0
      setListeningSection(0);
    }
  }, [phase, isListening, examMode]);

  const isRealExam = !!examTiming;

  // Per-question timer — only when NOT in real exam mode
  const perQuestionTimer = useTimer("down", current?.timeLimitSec ?? 90, () => {
    if (phase === "quiz" && !isRealExam)
      toast("Time is up for this question — move to the next one.", "info");
  });

  // Global exam timer
  const globalTimer = useTimer("down", examTiming?.sec ?? 0, () => {
    if (phase === "quiz" && isRealExam) {
      toast("Vaqt tugadi — javoblar avtomatik topshirilmoqda!", "info");
      handleSubmitInternal();
    }
  });

  // Reset per-question timer on index change (only when not real exam)
  useEffect(() => {
    if (!isRealExam) {
      perQuestionTimer.reset();
      if (phase === "quiz") perQuestionTimer.start();
    }
    setShowTranscript(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, current?.id, phase, isRealExam]);

  // Start correct timer when entering quiz
  useEffect(() => {
    if (phase !== "quiz") return;
    if (isRealExam) {
      globalTimer.reset();
      globalTimer.start();
    } else {
      perQuestionTimer.reset();
      perQuestionTimer.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isRealExam, examTiming?.sec]);

  const selectAnswer = (qid: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: optionIndex }));
  };

  const answeredCount = Object.keys(answers).length;
  const total = loadedQuestions?.length ?? 0;

  const handleSubmitInternal = async () => {
    // used by timer auto-submit
    await submit();
  };

  const submit = async () => {
    const unanswered = total - answeredCount;
    if (unanswered > 0) {
      toast(
        `${unanswered} question${unanswered > 1 ? "s" : ""} left unanswered — submit anyway?`,
        "info",
      );
    }
    setSubmitting(true);
    try {
      const res = await submitQuiz({ skill, difficulty: "medium", answers });
      setResult(res);
      progress.recordQuiz(res.result);
      const minutes = isRealExam
        ? Math.round((examTiming?.sec ?? 0) / 60)
        : Math.round(total * 1.2);
      progress.recordMinutes(minutes);
      setPhase("results");
      // pause timers
      globalTimer.pause();
      perQuestionTimer.pause();
      toast("Practice complete — score saved!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!loadedQuestions) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Card className="p-6">
          <Skeleton className="h-32 w-full" />
        </Card>
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (loadedQuestions.length === 0) {
    return (
      <EmptyState
        title="No questions match those filters"
        description="Try a different difficulty, topic or question type."
        action={
          <Link to="/app/practice">
            <Button variant="outline">
              <RotateCcw className="h-4 w-4" /> Back to filters
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              isListening
                ? "bg-violet-100 text-violet-700 dark:bg-violet-900/60"
                : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60",
            )}
          >
            <meta.icon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-xl font-extrabold text-slate-900 dark:text-white">
              {meta.label} exercise
            </h1>
            <p className="text-xs text-slate-400">
              Question {index + 1} of {total || "…"} · answered {answeredCount}
              {isRealExam && ` · ${examTiming?.label}`}
            </p>
          </div>
        </div>
        {phase === "quiz" && (
          <div className="flex flex-wrap items-center gap-2">
            {isRealExam ? (
              <>
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-4 py-2",
                    globalTimer.seconds < 300
                      ? "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
                  )}
                >
                  <Clock
                    className={cn(
                      "h-4 w-4",
                      globalTimer.seconds < 300
                        ? "text-rose-500"
                        : "text-slate-400",
                    )}
                  />
                  <span
                    className={cn(
                      "font-mono text-lg font-bold",
                      globalTimer.seconds < 300
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-slate-800 dark:text-white",
                    )}
                  >
                    {formatClock(globalTimer.seconds)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {examTiming?.label}
                  </span>
                </div>
                {isListening && examMode === "full" && (
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2",
                      sectionTimer.seconds < 120
                        ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                        : "border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-900/30",
                    )}
                  >
                    <Timer className="h-4 w-4 text-violet-500" />
                    <span
                      className={cn(
                        "font-mono text-sm font-bold",
                        sectionTimer.seconds < 60
                          ? "text-rose-600"
                          : "text-violet-700 dark:text-violet-300",
                      )}
                    >
                      {formatClock(sectionTimer.seconds)}
                    </span>
                    <span className="text-[11px] font-bold text-violet-600 dark:text-violet-300">
                      Section {listeningSection + 1}/4 · 10 min
                    </span>
                  </div>
                )}
                {isListening && examMode === "passage" && (
                  <div className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 dark:border-violet-800 dark:bg-violet-900/30">
                    <Timer className="h-4 w-4 text-violet-500" />
                    <span className="font-mono text-sm font-bold text-violet-700 dark:text-violet-300">
                      {formatClock(globalTimer.seconds)}
                    </span>
                    <span className="text-[11px] font-bold text-violet-600">
                      Section · 10 min
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
                <Timer className="h-4 w-4 text-slate-400" />
                <span className="font-mono text-lg font-bold text-slate-800 dark:text-white">
                  {formatClock(perQuestionTimer.seconds)}
                </span>
              </div>
            )}
            {isRealExam && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isListening && examMode === "full") {
                    if (globalTimer.isRunning) {
                      globalTimer.pause();
                      sectionTimer.pause();
                    } else {
                      globalTimer.start();
                      sectionTimer.start();
                    }
                  } else {
                    globalTimer.isRunning
                      ? globalTimer.pause()
                      : globalTimer.start();
                  }
                }}
              >
                {globalTimer.isRunning ? "Pause" : "Resume"}
              </Button>
            )}
          </div>
        )}
      </div>

      {phase !== "intro" && (
        <ProgressBar
          value={
            phase === "quiz" ? ((index + 1) / Math.max(1, total)) * 100 : 100
          }
          tone={isListening ? "violet" : "cyan"}
        />
      )}

      {phase === "intro" && (
        <Card>
          <CardContent className="space-y-5 py-8">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              <Badge tone={isListening ? "violet" : "cyan"}>
                {meta.label} · {total} questions{" "}
                {isRealExam && `· ${examTiming?.label}`}
              </Badge>
              <h2 className="mt-4 font-display text-2xl font-extrabold text-slate-900 dark:text-white">
                Haqiqiy IELTS timing
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {isReading &&
                  examMode === "passage" &&
                  "Har bir passage 20 minut. Bitta passage ichida vaqt umumiy — savollar orasida erkin o'tishingiz mumkin."}
                {isReading &&
                  examMode === "full" &&
                  "3 ta passage, jami 40 savol, 60 minut. Har bir passage o'rtacha 20 minut. Vaqt tugagach avtomatik topshiriladi."}
                {isListening &&
                  examMode === "full" &&
                  "Full Listening — 40 minut, 4 section, 40 savol. Haqiqiy imtihondagi kabi audio faqat 1 marta."}
                {!isRealExam &&
                  "Har bir savol alohida timer bilan. Javob berib keyingisiga o'ting — natijani oxirida ko'rasiz."}
              </p>
            </div>
            {isListening && (
              <p className="rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-800 dark:bg-violet-950/50 dark:text-violet-200">
                🎧 Listening is played once only, just like the real exam.{" "}
                {isRealExam && "40 min ichida barcha sectionlar."}
              </p>
            )}
            {isReading && isRealExam && (
              <p className="rounded-xl bg-cyan-50 px-4 py-3 text-sm text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-200">
                📖 Reading:{" "}
                {examMode === "passage"
                  ? "20 min — 1 passage"
                  : "60 min — 3 passages (40 savol)"}{" "}
                — passage ichidagi savollarni erkin almashtirishingiz mumkin.
              </p>
            )}
            <div className="flex justify-center">
              <Button size="lg" onClick={() => setPhase("quiz")}>
                Begin exercise <Play className="h-4 w-4 fill-current" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real exam — Reading passage: all questions on one scrollable page (chap passage, o'ng barcha savollar) */}
      {phase === "quiz" && isRealExam && isReading && loadedQuestions && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="grid lg:grid-cols-[1.15fr_1fr]">
              {/* Left — passage sticky */}
              <div className="border-b border-slate-200 bg-slate-50 p-6 lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto lg:border-b-0 lg:border-r dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <Badge tone="cyan">
                    {loadedQuestions[0].passageLabel || "Passage"}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-500">
                    IELTS Reading Test - {loadedQuestions[0].topic}
                  </span>
                </div>
                <h2 className="mt-4 text-center font-display text-lg font-bold text-slate-900 dark:text-white">
                  {loadedQuestions[0].topic}
                </h2>
                <div className="mt-3 space-y-4 text-[14px] leading-[1.75] text-slate-700 dark:text-slate-200">
                  {(() => {
                    const raw = loadedQuestions[0].passage || "";
                    let paras = raw
                      .split(/\n\s*\n/)
                      .flatMap((b) => b.split("\n"))
                      .map((p) => p.trim())
                      .filter(Boolean);
                    // Fallback: if stored as one huge block without \n (old import), split by sentences into paragraphs
                    if (paras.length === 1 && paras[0].length > 600) {
                      const sents = paras[0]
                        .split(/(?<=\.)\s+(?=[A-Z])/)
                        .map((s) => s.trim())
                        .filter(Boolean);
                      paras = [];
                      for (let i = 0; i < sents.length; i += 3) {
                        paras.push(sents.slice(i, i + 3).join(" "));
                      }
                      // restore title/subtitle as first two paras if missing
                      if (!paras[0].includes("Dolls through the ages")) {
                        paras.unshift(
                          "What is today a simple children’s toy has a surprisingly rich history",
                          "Dolls through the ages",
                        );
                        paras = paras.slice(0, -1);
                      }
                    }
                    return paras.map((paragraph, i) => {
                      const isSubtitle = paragraph
                        .toLowerCase()
                        .includes("what is today a simple");
                      if (isSubtitle)
                        return (
                          <p
                            key={i}
                            className="text-center text-sm italic text-slate-500 dark:text-slate-400"
                          >
                            {paragraph}
                          </p>
                        );
                      return (
                        <p key={i} className="text-justify">
                          {paragraph}
                        </p>
                      );
                    });
                  })()}
                </div>
              </div>
              {/* Right — all questions scrollable */}
              <div className="max-h-[calc(100vh-180px)] overflow-y-auto bg-white p-6 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Questions 1-{total} · {answeredCount}/{total} answered
                  </p>
                  <Badge tone={answeredCount === total ? "emerald" : "amber"}>
                    {answeredCount}/{total}
                  </Badge>
                </div>
                <div className="space-y-5">
                  {loadedQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-800/30"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                          {idx + 1}
                        </span>
                        <p className="flex-1 text-sm font-semibold leading-snug text-slate-900 dark:text-white">
                          {q.prompt}
                        </p>
                      </div>
                      {q.type === "fill-blank" && (
                        <input
                          value={(answers[q.id] as string) ?? ""}
                          onChange={(e) =>
                            setAnswers((prev) => ({
                              ...prev,
                              [q.id]: e.target.value,
                            }))
                          }
                          placeholder="ONE WORD ONLY — yozing"
                          autoComplete="off"
                          className="mt-3 h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                        />
                      )}
                      {q.type === "true-false" && q.options && (
                        <div className="mt-3 grid gap-2">
                          {q.options.map((opt: string, i: number) => {
                            const selected = answers[q.id] === i;
                            return (
                              <button
                                key={opt}
                                onClick={() =>
                                  setAnswers((prev) => ({ ...prev, [q.id]: i }))
                                }
                                className={cn(
                                  "flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm font-bold transition",
                                  selected
                                    ? "border-brand-500 bg-brand-600 text-white shadow"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200",
                                )}
                              >
                                {opt}
                                {selected && <Check className="h-4 w-4" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {q.type === "multiple-choice" && q.options && (
                        <div className="mt-3 space-y-2">
                          {q.options.map((opt: string, i: number) => {
                            const selected = answers[q.id] === i;
                            return (
                              <button
                                key={opt}
                                onClick={() =>
                                  setAnswers((prev) => ({ ...prev, [q.id]: i }))
                                }
                                className={cn(
                                  "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition",
                                  selected
                                    ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20 dark:border-brand-500 dark:bg-brand-950/30"
                                    : "border-slate-200 bg-white hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800",
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                    selected
                                      ? "bg-brand-600 text-white"
                                      : "bg-slate-100 text-slate-500 dark:bg-slate-700",
                                  )}
                                >
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                  {opt}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="sticky bottom-0 -mx-6 mt-6 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                  <Button
                    size="lg"
                    variant="accent"
                    onClick={submit}
                    loading={submitting}
                    className="w-full"
                  >
                    <Flag className="h-4 w-4" /> Submit all answers (
                    {answeredCount}/{total})
                  </Button>
                  <p className="mt-2 text-center text-xs font-semibold text-slate-400">
                    Scroll bilan barcha savollarni ko'ring — har biri chapdagi
                    passage ga asoslangan
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Listening — 4 sections ×10 min */}
      {phase === "quiz" && isRealExam && isListening && loadedQuestions && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Section tabs */}
            <div className="flex gap-2 border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              {[0, 1, 2, 3].map((s) => {
                const active = s === listeningSection;
                const secQuestions = listeningSections[s] || [];
                const answeredInSec = secQuestions.filter(
                  (q) => answers[q.id] !== undefined,
                ).length;
                return (
                  <button
                    key={s}
                    onClick={() => setListeningSection(s)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition",
                      active
                        ? "border-violet-600 bg-violet-600 text-white shadow"
                        : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900",
                    )}
                  >
                    Section {s + 1}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-xs",
                        active
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {answeredInSec}/{secQuestions.length}
                    </span>
                    <span className="text-[11px] font-semibold opacity-70">
                      10 min
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                  Section {listeningSection + 1} — 10 min ·{" "}
                  {listeningSections[listeningSection]?.length || 0} savol
                </p>
                <Badge tone={sectionTimer.seconds < 120 ? "rose" : "violet"}>
                  {formatClock(sectionTimer.seconds)} / 10:00
                </Badge>
              </div>
              <div className="space-y-4">
                {(listeningSections[listeningSection] || []).map((q, idx) => {
                  const globalIdx =
                    listeningSections
                      .slice(0, listeningSection)
                      .reduce((acc, sec) => acc + sec.length, 0) + idx;
                  return (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-800/30"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                          {globalIdx + 1}
                        </span>
                        <p className="flex-1 text-sm font-semibold leading-snug text-slate-900 dark:text-white">
                          {q.prompt}
                        </p>
                      </div>
                      {q.type === "fill-blank" && (
                        <input
                          value={(answers[q.id] as string) ?? ""}
                          onChange={(e) =>
                            setAnswers((prev) => ({
                              ...prev,
                              [q.id]: e.target.value,
                            }))
                          }
                          placeholder="Type your answer..."
                          autoComplete="off"
                          className="mt-3 h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-sm font-medium outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                        />
                      )}
                      {q.type === "true-false" && q.options && (
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          {q.options.map((opt: string, i: number) => {
                            const selected = answers[q.id] === i;
                            return (
                              <button
                                key={opt}
                                onClick={() =>
                                  setAnswers((prev) => ({ ...prev, [q.id]: i }))
                                }
                                className={
                                  selected
                                    ? "rounded-xl border border-violet-600 bg-violet-600 px-4 py-2.5 text-sm font-bold text-white"
                                    : "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                }
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {q.type === "multiple-choice" && q.options && (
                        <div className="mt-3 space-y-2">
                          {q.options.map((opt: string, i: number) => {
                            const selected = answers[q.id] === i;
                            return (
                              <button
                                key={opt}
                                onClick={() =>
                                  setAnswers((prev) => ({ ...prev, [q.id]: i }))
                                }
                                className={cn(
                                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left",
                                  selected
                                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                                    : "border-slate-200 bg-white dark:border-slate-700",
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                                    selected
                                      ? "bg-violet-600 text-white"
                                      : "bg-slate-100 text-slate-500",
                                  )}
                                >
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <span className="text-sm font-medium">
                                  {opt}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {q.transcript && (
                        <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400">
                          Transcript: {q.transcript.slice(0, 120)}…
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => setListeningSection((s) => Math.max(0, s - 1))}
                  disabled={listeningSection === 0}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous section
                </Button>
                {listeningSection < 3 ? (
                  <Button onClick={() => setListeningSection((s) => s + 1)}>
                    Next section (10 min) <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="accent"
                    onClick={submit}
                    loading={submitting}
                  >
                    <Flag className="h-4 w-4" /> Submit listening
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Single-question mode (mashq) */}
      {phase === "quiz" &&
        current &&
        !(isRealExam && (isReading || isListening)) && (
          <Card>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <Badge
                  tone={
                    current.difficulty === "easy"
                      ? "emerald"
                      : current.difficulty === "hard"
                        ? "rose"
                        : "amber"
                  }
                >
                  {current.difficulty}
                </Badge>
                <span className="text-xs font-semibold text-slate-400">
                  {current.topic}
                </span>
              </div>

              {current.passage && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100 dark:bg-slate-800/60 dark:ring-slate-700">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      {current.passageLabel || "Passage"}
                    </p>
                    <div className="mt-3 max-h-[60vh] overflow-y-auto space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                      {(() => {
                        const raw = current.passage || "";
                        let paras = raw
                          .split(/\n\s*\n/)
                          .flatMap((b) => b.split("\n"))
                          .map((p) => p.trim())
                          .filter(Boolean);
                        if (paras.length === 1 && paras[0].length > 600) {
                          const sents = paras[0]
                            .split(/(?<=\.)\s+(?=[A-Z])/)
                            .map((s) => s.trim())
                            .filter(Boolean);
                          paras = [];
                          for (let i = 0; i < sents.length; i += 3)
                            paras.push(sents.slice(i, i + 3).join(" "));
                          if (!paras[0].includes("Dolls through the ages"))
                            paras.unshift(
                              "Dolls through the ages",
                              "What is today a simple children’s toy has a surprisingly rich history",
                            );
                        }
                        return paras.map((paragraph, i) => {
                          const isSubtitle = paragraph
                            .toLowerCase()
                            .includes("what is today a simple");
                          if (isSubtitle)
                            return (
                              <p
                                key={i}
                                className="text-center text-sm italic text-slate-500"
                              >
                                {paragraph}
                              </p>
                            );
                          return (
                            <p key={i} className="text-justify">
                              {paragraph}
                            </p>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  <div className="space-y-5">
                    {isListening && current.audioDurationSec && (
                      <AudioPlayer durationSec={current.audioDurationSec} />
                    )}

                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                        Question {index + 1}
                      </p>
                      <p className="mt-1.5 font-display text-lg font-bold leading-snug text-slate-900 dark:text-white">
                        {current.prompt}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {current.options?.map((option: string, i: number) => {
                        const selected = answers[current.id] === i;
                        return (
                          <button
                            key={option}
                            onClick={() => selectAnswer(current.id, i)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-150",
                              selected
                                ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/25 dark:border-brand-500 dark:bg-brand-950/40"
                                : "border-slate-200 bg-white hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-700",
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                selected
                                  ? "bg-brand-600 text-white"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300",
                              )}
                            >
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                              {option}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {current.type === "fill-blank" && (
                      <input
                        value={(answers[current.id] as string) ?? ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [current.id]: e.target.value,
                          }))
                        }
                        placeholder="Type your answer..."
                        autoComplete="off"
                        className="h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-sm font-medium outline-none focus:border-brand dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                      />
                    )}
                  </div>
                </div>
              )}

              {!current.passage && (
                <>
                  {isListening && current.audioDurationSec && (
                    <AudioPlayer durationSec={current.audioDurationSec} />
                  )}

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                      Question {index + 1}
                    </p>
                    <p className="mt-1.5 font-display text-lg font-bold leading-snug text-slate-900 dark:text-white">
                      {current.prompt}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {current.options?.map((option: string, i: number) => {
                      const selected = answers[current.id] === i;
                      return (
                        <button
                          key={option}
                          onClick={() => selectAnswer(current.id, i)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-150",
                            selected
                              ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/25 dark:border-brand-500 dark:bg-brand-950/40"
                              : "border-slate-200 bg-white hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-700",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                              selected
                                ? "bg-brand-600 text-white"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300",
                            )}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {current.type === "fill-blank" && (
                    <input
                      value={(answers[current.id] as string) ?? ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [current.id]: e.target.value,
                        }))
                      }
                      placeholder="Type your answer..."
                      autoComplete="off"
                      className="h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-sm font-medium outline-none focus:border-brand dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    />
                  )}

                  {isListening && current.transcript && (
                    <div>
                      <button
                        onClick={() => setShowTranscript((s) => !s)}
                        className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
                      >
                        {showTranscript ? "Hide transcript" : "Show transcript"}
                      </button>
                      {showTranscript && (
                        <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm italic text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                          {current.transcript}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={index === 0}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                {index < total - 1 ? (
                  <Button
                    onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={submit}
                    loading={submitting}
                    variant="accent"
                  >
                    Submit answers <Flag className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

      {phase === "results" && result && (
        <ResultsView
          result={result}
          onRetry={() => {
            setPhase("intro");
            setAnswers({});
            setResult(null);
            setIndex(0);
          }}
        />
      )}
    </div>
  );
}

function ResultsView({
  result,
  onRetry,
}: {
  result: QuizSubmissionResult;
  onRetry: () => void;
}) {
  const { result: summary, results } = result;
  const incorrect = results.filter((r) => !r.isCorrect);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-center text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-200">
            Your score
          </p>
          <p className="mt-2 font-display text-6xl font-extrabold">
            {summary.correct}
            <span className="text-2xl text-brand-200">/{summary.total}</span>
          </p>
          <p className="mt-2 text-sm font-semibold text-brand-100">
            Estimated band:{" "}
            <span
              className={cn(
                "font-display text-2xl font-extrabold",
                bandColor(summary.band),
              )}
            >
              {summary.band.toFixed(1)}
            </span>
          </p>
          <div className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-4">
            <Badge tone="white">
              <Check className="h-3 w-3" /> {summary.correct} correct
            </Badge>
            <Badge tone="white">
              <X className="h-3 w-3" /> {incorrect.length} incorrect
            </Badge>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Answer review
        </h3>
        {results.map((r, i) => {
          const q = r.question;
          const correctOption = q.options?.[q.correctIndex ?? -1];
          return (
            <Card
              key={q.id}
              className={cn(
                "border-l-4",
                r.isCorrect ? "border-l-emerald-500" : "border-l-rose-500",
              )}
            >
              <CardContent>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {i + 1}. {q.prompt}
                  </p>
                  {r.isCorrect ? (
                    <Check className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <X className="h-5 w-5 shrink-0 text-rose-500" />
                  )}
                </div>
                {!r.isCorrect && r.selectedIndex !== undefined && (
                  <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
                    You chose: {q.options?.[r.selectedIndex] ?? "—"}
                  </p>
                )}
                {!r.isCorrect && (
                  <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    Correct answer: {correctOption ?? q.correctAnswer}
                  </p>
                )}
                <p className="mt-3 rounded-xl bg-slate-50 p-3.5 text-sm leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                  <b>Explanation:</b> {q.explanation}
                </p>
                <p className="mt-2 text-xs font-semibold text-brand-600 dark:text-brand-400">
                  <ListChecks className="mr-1 inline h-3.5 w-3.5" />
                  Recommended lesson: {q.recommendLesson}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={onRetry} className="sm:flex-1">
          <RotateCcw className="h-4 w-4" /> Practice again
        </Button>
        <Link to="/app/practice" className="sm:flex-1">
          <Button className="w-full">
            More exercises <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
