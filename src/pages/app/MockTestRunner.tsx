import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Timer,
  FileText,
  Headphones,
  PenLine,
  Mic,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";
import { useTimer } from "@/hooks/useTimer";
import { getMockTest, submitMockTest } from "@/api/mockTests";
import { countWords, formatClock } from "@/lib/format";
import type { MockTestMeta } from "@/types";
import { cn } from "@/lib/cn";

export function MockTestRunner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const progress = useProgress();
  const { toast } = useToast();

  const [test, setTest] = useState<MockTestMeta | null | undefined>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [listAnswers, setListAnswers] = useState<Record<string, number>>({});
  const [writingTexts, setWritingTexts] = useState<string[]>(["", ""]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getMockTest(id).then((res) => {
      setTest(res ?? null);
      setLoading(false);
    });
  }, [id]);

  const totalSeconds = useMemo(() => {
    if (!test) return 0;
    return test.durationMin * 60;
  }, [test]);

  const timer = useTimer("down", totalSeconds, () => {
    toast("Time is up — submitting your mock test automatically.", "info");
    handleSubmit();
  });

  useEffect(() => {
    if (test && totalSeconds > 0) {
      timer.reset();
      timer.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test?.id, totalSeconds]);

  const currentSection = test?.sections[activeSection];

  const allQuestions = useMemo(() => {
    if (!test) return [];
    const arr: Array<{
      sectionIndex: number;
      questionIndex: number;
      id: string;
    }> = [];
    test.sections.forEach((section, si) => {
      section.questions?.forEach((q, qi) => {
        arr.push({ sectionIndex: si, questionIndex: qi, id: q.id });
      });
    });
    return arr;
  }, [test]);

  const answeredCount = Object.keys(listAnswers).length;
  const writingWordCounts = writingTexts.map((t) => countWords(t));

  const selectAnswer = (qid: string, idx: number) => {
    setListAnswers((prev) => ({ ...prev, [qid]: idx }));
  };

  const handleSubmit = async () => {
    if (!test) return;
    setSubmitting(true);
    try {
      const result = await submitMockTest({
        testId: test.id,
        listAnswers,
        writingWordCounts,
        speakingWordEstimate: 200,
      });
      progress.recordMock(result);
      progress.recordMinutes(test.durationMin);
      toast("Mock test submitted — results ready!", "success");
      navigate(`/app/mock-test/results/${test.id}?resultId=${result.id}`, {
        state: { result },
      });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full" />
        <Card className="p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    );
  }

  if (!test) {
    return (
      <EmptyState
        title="Mock test not found"
        description="This mock test does not exist. Return to the mock test catalog."
        action={
          <Link to="/app/mock-test">
            <Button>Back to mock tests</Button>
          </Link>
        }
      />
    );
  }

  const flatQuestionForNav = currentSection?.questions?.[activeQuestion];
  const isLastSection = activeSection === test.sections.length - 1;
  const isLastQuestionInSection = currentSection?.questions
    ? activeQuestion === currentSection.questions.length - 1
    : true;

  const sectionIcon = (key: string) => {
    if (key === "listening") return Headphones;
    if (key === "reading") return FileText;
    if (key === "writing") return PenLine;
    return Mic;
  };

  return (
    <div className="space-y-5">
      {/* Header with timer */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Mock Test
          </p>
          <h1 className="font-display text-xl font-extrabold text-slate-900 dark:text-white">
            {test.title}
          </h1>
          <p className="text-xs font-semibold text-slate-400">
            {test.type} · {test.durationMin} minutes · {test.questions}{" "}
            questions · {answeredCount} answered
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2",
              timer.seconds < 300
                ? "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40"
                : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800",
            )}
          >
            <Timer
              className={cn(
                "h-4 w-4",
                timer.seconds < 300 ? "text-rose-500" : "text-slate-400",
              )}
            />
            <span
              className={cn(
                "font-mono text-lg font-bold",
                timer.seconds < 300
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-800 dark:text-white",
              )}
            >
              {formatClock(timer.seconds)}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (timer.isRunning ? timer.pause() : timer.start())}
          >
            {timer.isRunning ? "Pause" : "Resume"}
          </Button>
          <Button
            size="sm"
            variant="accent"
            onClick={handleSubmit}
            loading={submitting}
          >
            <Flag className="h-4 w-4" /> Submit
          </Button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {test.sections.map((section, idx) => {
          const Icon = sectionIcon(section.key);
          const active = idx === activeSection;
          return (
            <button
              key={section.key + idx}
              onClick={() => {
                setActiveSection(idx);
                setActiveQuestion(0);
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition",
                active
                  ? "border-brand-600 bg-brand-600 text-white shadow-sm dark:border-brand-500 dark:bg-brand-600"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
              )}
            >
              <Icon className="h-4 w-4" />
              {section.title}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs",
                  active
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800",
                )}
              >
                {section.durationMin}m
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={
          allQuestions.length > 0
            ? (answeredCount / allQuestions.length) * 100
            : 0
        }
        tone="brand"
      />
      <p className="text-xs font-semibold text-slate-400">
        Progress: {answeredCount} / {allQuestions.length} questions answered ·
        Writing words: {writingWordCounts.join(" / ")} · Section{" "}
        {activeSection + 1} of {test.sections.length}
      </p>

      {/* Current section content */}
      {currentSection && (
        <Card>
          <CardContent className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge
                  tone={
                    currentSection.key === "listening"
                      ? "violet"
                      : currentSection.key === "reading"
                        ? "cyan"
                        : currentSection.key === "writing"
                          ? "brand"
                          : "emerald"
                  }
                >
                  {currentSection.title}
                </Badge>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {currentSection.instructions}
                </p>
              </div>
              <span className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Clock className="mr-1 inline h-3 w-3" />
                {currentSection.durationMin} min
              </span>
            </div>

            {/* Listening / Reading */}
            {currentSection.questions && currentSection.questions.length > 0 ? (
              <>
                {/* question pills */}
                <div className="flex flex-wrap gap-1.5">
                  {currentSection.questions.map((q, idx) => {
                    const answered = listAnswers[q.id] !== undefined;
                    const isActive = idx === activeQuestion;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setActiveQuestion(idx)}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition",
                          isActive
                            ? "bg-brand-700 text-white shadow dark:bg-brand-600"
                            : answered
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400",
                        )}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {flatQuestionForNav && (
                  <div className="space-y-4">
                    {flatQuestionForNav.passage && (
                      <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100 dark:bg-slate-800/60 dark:ring-slate-700">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Passage
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                          {flatQuestionForNav.passage}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Question {activeQuestion + 1} of{" "}
                        {currentSection.questions.length}
                      </p>
                      <p className="mt-1 font-display text-lg font-bold leading-snug text-slate-900 dark:text-white">
                        {flatQuestionForNav.prompt}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        {flatQuestionForNav.topic} ·{" "}
                        {flatQuestionForNav.difficulty}
                      </p>
                    </div>
                    {flatQuestionForNav.audioDurationSec &&
                      currentSection.key === "listening" && (
                        <p className="rounded-xl bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                          🎧 Audio duration:{" "}
                          {formatClock(flatQuestionForNav.audioDurationSec)} —
                          play once in the real exam.
                        </p>
                      )}
                    <div className="space-y-2.5">
                      {flatQuestionForNav.options?.map((option, i) => {
                        const selected =
                          listAnswers[flatQuestionForNav.id] === i;
                        return (
                          <button
                            key={option}
                            onClick={() =>
                              selectAnswer(flatQuestionForNav.id, i)
                            }
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
                      {!flatQuestionForNav.options &&
                        flatQuestionForNav.correctAnswer && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              Type your answer (one word/number):
                            </p>
                            <input
                              value={
                                listAnswers[flatQuestionForNav.id] !== undefined
                                  ? String(listAnswers[flatQuestionForNav.id])
                                  : ""
                              }
                              onChange={(e) => {
                                const val = e.target.value.trim().toLowerCase();
                                const correct =
                                  flatQuestionForNav.correctAnswer?.toLowerCase();
                                const fakeIndex =
                                  val === correct ? 0 : val ? 1 : undefined;
                                if (fakeIndex === undefined) {
                                  const next = { ...listAnswers };
                                  delete next[flatQuestionForNav.id];
                                  setListAnswers(next);
                                } else {
                                  // store as 0 for correct, 1 for incorrect to keep Record<string,number> shape; not ideal but works for word-answering demo
                                  // Actually for fill-blank we treat as numeric index mock: 0 = correct, 1 = wrong
                                  setListAnswers((prev) => ({
                                    ...prev,
                                    [flatQuestionForNav.id]: fakeIndex,
                                  }));
                                }
                              }}
                              placeholder="Your answer..."
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                            <p className="text-xs text-slate-400">
                              Tip: fill-blank answers are case-insensitive.
                            </p>
                          </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setActiveQuestion((i) => Math.max(0, i - 1))
                        }
                        disabled={activeQuestion === 0}
                      >
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </Button>
                      {isLastQuestionInSection ? (
                        isLastSection ? (
                          <Button
                            variant="accent"
                            onClick={handleSubmit}
                            loading={submitting}
                          >
                            <Flag className="h-4 w-4" /> Submit exam
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              setActiveSection((s) => s + 1);
                              setActiveQuestion(0);
                            }}
                          >
                            Next section <ChevronRight className="h-4 w-4" />
                          </Button>
                        )
                      ) : (
                        <Button onClick={() => setActiveQuestion((i) => i + 1)}>
                          Next <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : null}

            {/* Writing */}
            {currentSection.writingPrompts &&
              currentSection.writingPrompts.length > 0 && (
                <div className="space-y-6">
                  {currentSection.writingPrompts.map((wp, idx) => (
                    <div
                      key={wp.id}
                      className="space-y-3 rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            {wp.task}
                          </p>
                          <p className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                            {wp.prompt}
                          </p>
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-500 dark:text-slate-400">
                            {wp.instructions.map((ins) => (
                              <li key={ins}>{ins}</li>
                            ))}
                          </ul>
                        </div>
                        <Badge tone="amber">
                          {wp.timeLimitMin} min · ≥{wp.minWords} words
                        </Badge>
                      </div>
                      <textarea
                        value={writingTexts[idx] ?? ""}
                        onChange={(e) => {
                          const next = [...writingTexts];
                          next[idx] = e.target.value;
                          setWritingTexts(next);
                        }}
                        placeholder={`Write your ${wp.task.toLowerCase()} answer here...`}
                        rows={10}
                        className="min-h-[180px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={cn(
                            "font-semibold",
                            (writingTexts[idx]
                              ?.trim()
                              .split(/\s+/)
                              .filter(Boolean).length ?? 0) < wp.minWords
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-emerald-600 dark:text-emerald-400",
                          )}
                        >
                          {countWords(writingTexts[idx] ?? "")} words
                          {(writingTexts[idx]
                            ?.trim()
                            .split(/\s+/)
                            .filter(Boolean).length ?? 0) < wp.minWords &&
                            ` · need ${wp.minWords} minimum`}
                        </span>
                        <span className="text-slate-400">{wp.type}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setActiveSection((s) => Math.max(0, s - 1))
                      }
                      disabled={activeSection === 0}
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous section
                    </Button>
                    {isLastSection ? (
                      <Button
                        variant="accent"
                        onClick={handleSubmit}
                        loading={submitting}
                      >
                        <Flag className="h-4 w-4" /> Submit exam
                      </Button>
                    ) : (
                      <Button onClick={() => setActiveSection((s) => s + 1)}>
                        Next section <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

            {/* Speaking */}
            {currentSection.speakingPrompts &&
              currentSection.speakingPrompts.length > 0 && (
                <div className="space-y-5">
                  {currentSection.speakingPrompts.map((sp) => (
                    <div
                      key={sp.id}
                      className="space-y-3 rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <Badge tone="emerald">Part {sp.part}</Badge>
                        <span className="text-xs font-semibold text-slate-400">
                          Prep {sp.prepTimeSec}s · Speak {sp.speakingTimeSec}s
                        </span>
                      </div>
                      <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:ring-amber-900">
                        <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                          Cue card — {sp.cueCardTitle}
                        </p>
                        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-900 dark:text-white">
                          {sp.prompt}
                        </p>
                        {sp.followUps.length > 0 && (
                          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-amber-800 dark:text-amber-200">
                            {sp.followUps.map((f) => (
                              <li key={f}>{f}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-600">
                        <Mic className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                        <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                          Speaking is practice-only in this mock
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Record your answer aloud for 1–2 minutes, then
                          self-assess using the band descriptors. In the real
                          exam this section is examiner-led.
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setActiveSection((s) => Math.max(0, s - 1))
                      }
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <Button
                      variant="accent"
                      onClick={handleSubmit}
                      loading={submitting}
                    >
                      <Flag className="h-4 w-4" /> Submit exam
                    </Button>
                  </div>
                </div>
              )}

            {/* Warning for unanswered */}
            {currentSection.questions && (
              <p className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                <AlertTriangle className="h-3.5 w-3.5" />
                Unanswered questions are marked incorrect at submission.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
