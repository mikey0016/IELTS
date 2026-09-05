import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Play,
  Clock,
  PenLine,
  Mic,
  Headphones,
  FileText,
  BookOpen,
  Timer,
  Filter,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";
import { courseForSkill } from "@/api/content";
import { fetchQuestions, getAdminQuestionsForSkill } from "@/api/practice";
import type { Question } from "@/types";
import type { Skill } from "@/types";
import { IELTS_TIMING } from "@/lib/ieltsConfig";

const ICONS = {
  listening: Headphones,
  reading: FileText,
  writing: PenLine,
  speaking: Mic,
};
const COLORS: Record<string, string> = {
  listening: "from-violet-500 to-violet-600",
  reading: "from-cyan-500 to-cyan-600",
  writing: "from-brand-600 to-brand-800",
  speaking: "from-emerald-500 to-emerald-600",
};
const TONES: Record<string, "violet" | "cyan" | "brand" | "emerald"> = {
  listening: "violet",
  reading: "cyan",
  writing: "brand",
  speaking: "emerald",
};

const SKILL_LABELS: Record<Skill, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

export function SkillPage({ skill }: { skill: Skill }) {
  const progress = useProgress();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [course, setCourse] = useState<ReturnType<
    typeof courseForSkill
  > | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [examMode, setExamMode] = useState<"passage" | "full" | "single">(
    "passage",
  );

  useEffect(() => {
    setCourse(courseForSkill(skill));
  }, [skill]);

  useEffect(() => {
    if (skill === "writing" || skill === "speaking") {
      setLoading(false);
      return;
    }
    setLoading(true);
    const filters: any = {
      difficulty: selectedDifficulty,
      type: selectedType,
      topic: selectedTopic,
      limit: 50,
    };
    fetchQuestions(skill, filters)
      .then(setQuestions)
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [skill, selectedDifficulty, selectedType, selectedTopic]);

  const Icon = ICONS[skill];
  const stats = progress.skills[skill];
  const adminQuestions =
    skill === "writing" || skill === "speaking"
      ? []
      : getAdminQuestionsForSkill(skill);
  const totalQuestions = questions.length;
  const adminCount = adminQuestions.length;

  const filteredQuestions = questions.filter((q) => {
    if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty)
      return false;
    if (selectedType !== "all" && q.type !== selectedType) return false;
    if (selectedTopic !== "all" && q.topic !== selectedTopic) return false;
    return true;
  });

  // Group questions by passage — for reading AND listening, and any imported task: same passage + topic + label = 1 card (Dolls 13Q → 1)
  const groupedByPassage = (() => {
    if (skill === "writing" || skill === "speaking")
      return [] as Array<{
        key: string;
        topic: string;
        passageLabel?: string;
        passage?: string;
        questions: Question[];
      }>;
    const map = new Map<
      string,
      {
        key: string;
        topic: string;
        passageLabel?: string;
        passage?: string;
        questions: Question[];
      }
    >();
    for (const q of filteredQuestions) {
      const passageKey = (q.passage || "").slice(0, 2000);
      const key = `${passageKey}__${q.topic}__${q.passageLabel || ""}`;
      if (!map.has(key))
        map.set(key, {
          key,
          topic: q.topic,
          passageLabel: q.passageLabel,
          passage: q.passage,
          questions: [],
        });
      map.get(key)!.questions.push(q);
    }
    return Array.from(map.values()).sort((a, b) => {
      // keep import order stable: larger groups first, then topic
      if (b.questions.length !== a.questions.length)
        return b.questions.length - a.questions.length;
      return a.topic.localeCompare(b.topic);
    });
  })();
  const readingGroups = groupedByPassage;
  const useGroupedView =
    examMode !== "single" && (skill === "reading" || skill === "listening");

  const startPractice = () => {
    navigate("/app/cdi-practice");
  };

  const topics = Array.from(
    new Set(questions.map((q) => q.topic).filter(Boolean)),
  );
  const types = Array.from(
    new Set(questions.map((q) => q.type).filter(Boolean)),
  );
  const difficulties = Array.from(
    new Set(questions.map((q) => q.difficulty).filter(Boolean)),
  );

  return (
    <div className="space-y-6">
      <div
        className={`rounded-3xl bg-gradient-to-br ${COLORS[skill]} p-6 text-white shadow-card sm:p-8`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Icon className="h-7 w-7" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
                {course?.title ?? SKILL_LABELS[skill]}
              </h1>
              <p className="mt-0.5 text-sm text-white/85">
                {course?.description ?? "Practice and improve this skill."}
              </p>
              {adminCount > 0 && (
                <p className="mt-1 text-xs text-white/70">
                  {adminCount} imported task{adminCount !== 1 ? "s" : ""}{" "}
                  available
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6 rounded-2xl bg-white/10 px-5 py-3 backdrop-blur">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                Band
              </p>
              <p className="font-display text-2xl font-extrabold">
                {stats.band.toFixed(1)}
              </p>
            </div>
            <div className="h-9 w-px bg-white/20" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                Accuracy
              </p>
              <p className="font-display text-2xl font-extrabold">
                {Math.round(stats.accuracy * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {skill === "writing" || skill === "speaking" ? (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <BookOpen className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </span>
              <div>
                <p className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {skill === "writing"
                    ? "Writing Practice"
                    : "Speaking Practice"}
                </p>
                <p className="text-sm text-slate-500">
                  {skill === "writing"
                    ? "Write essays under exam conditions with AI evaluation."
                    : "Practice speaking with cue cards and recording."}
                </p>
              </div>
            </div>
            <Button size="lg" onClick={startPractice}>
              Start Practice <Play className="h-4 w-4 fill-current" />
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {!course ? (
            <Card className="p-5">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-20 w-full rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </Card>
          ) : (
            <Card>
              <div className="border-b border-slate-200 p-5 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Practice Tasks
                    </h3>
                    <p className="text-sm text-slate-500">
                      {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}{" "}
                      available
                      {adminCount > 0 && (
                        <span className="ml-2 text-brand-600">
                          ({adminCount} imported)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">
                      {filteredQuestions.length} shown
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Difficulty
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="all">All levels</option>
                      {difficulties.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="all">All types</option>
                      {types.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Topic
                    </label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="all">All topics</option>
                      {topics.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {(skill === "reading" || skill === "listening") &&
                  filteredQuestions.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {skill === "reading" && (
                        <>
                          <button
                            onClick={() => setExamMode("passage")}
                            className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${examMode === "passage" ? "border-cyan-600 bg-cyan-600 text-white" : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900"}`}
                          >
                            1 Passage — 20 min
                          </button>
                          <button
                            onClick={() => setExamMode("full")}
                            className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${examMode === "full" ? "border-cyan-600 bg-cyan-600 text-white" : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900"}`}
                          >
                            Full 60 min / 40 savol
                          </button>
                          <button
                            onClick={() => setExamMode("single")}
                            className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${examMode === "single" ? "border-slate-600 bg-slate-600 text-white" : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900"}`}
                          >
                            Mashq
                          </button>
                        </>
                      )}
                      {skill === "listening" && (
                        <>
                          <button
                            onClick={() => setExamMode("single")}
                            className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${examMode === "single" ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900"}`}
                          >
                            Mashq
                          </button>
                          <button
                            onClick={() => setExamMode("full")}
                            className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${examMode === "full" ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900"}`}
                          >
                            Full 40 min
                          </button>
                        </>
                      )}
                    </div>
                  )}

                {loading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800"
                      />
                    ))}
                  </div>
                ) : filteredQuestions.length === 0 ? (
                  <div className="py-12 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-3 text-sm text-slate-500">
                      No practice tasks found for the selected filters.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => {
                        setSelectedDifficulty("all");
                        setSelectedType("all");
                        setSelectedTopic("all");
                      }}
                    >
                      Reset filters
                    </Button>
                  </div>
                ) : useGroupedView ? (
                  <div className="grid gap-4 sm:grid-cols-1">
                    {readingGroups.map((group) => {
                      const paragraphs = (group.passage || "")
                        .split("\n\n")
                        .filter(Boolean);
                      const preview = paragraphs
                        .slice(0, 2)
                        .join(" ")
                        .slice(0, 220);
                      return (
                        <div
                          key={group.key}
                          className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-cyan-300 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-700"
                        >
                          <div className="grid gap-0 lg:grid-cols-[1.15fr_1fr]">
                            <div className="bg-slate-50 p-5 dark:bg-slate-800/40">
                              <div className="flex items-center gap-2">
                                <Badge
                                  tone={
                                    skill === "listening" ? "violet" : "cyan"
                                  }
                                >
                                  {group.passageLabel ||
                                    (skill === "listening"
                                      ? "Listening Section"
                                      : "Reading Passage")}
                                </Badge>
                                <Badge
                                  tone={
                                    group.questions.length >= 10
                                      ? "brand"
                                      : "violet"
                                  }
                                >
                                  {group.questions.length} savol
                                </Badge>
                                <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-slate-400">
                                  <Timer className="h-3.5 w-3.5" />{" "}
                                  {skill === "listening"
                                    ? examMode === "full"
                                      ? "40 min"
                                      : "—"
                                    : group.questions.length >= 13
                                      ? "20 min"
                                      : `${Math.min(20, Math.max(10, group.questions.length * 2))} min`}
                                </span>
                              </div>
                              <h4 className="mt-3 font-display text-base font-bold leading-snug text-slate-900 dark:text-white line-clamp-2">
                                {group.topic}
                              </h4>
                              {group.passage && (
                                <div className="mt-3 space-y-2">
                                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-4">
                                    {preview}
                                    {group.passage.length > 220 ? "…" : ""}
                                  </p>
                                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    {paragraphs.length} paragraph · chapda
                                    to'liq matn, o'ngda savollar
                                  </p>
                                </div>
                              )}
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {Array.from(
                                  new Set(group.questions.map((q) => q.type)),
                                ).map((t) => (
                                  <span
                                    key={t}
                                    className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col p-5">
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Savollar
                              </p>
                              <div className="mt-2 space-y-1.5">
                                {group.questions.slice(0, 5).map((q, i) => (
                                  <p
                                    key={q.id}
                                    className="line-clamp-1 text-sm text-slate-700 dark:text-slate-300"
                                  >
                                    <span
                                      className={`mr-1.5 font-bold ${skill === "listening" ? "text-violet-600" : "text-cyan-600"}`}
                                    >
                                      {i + 1}.
                                    </span>
                                    {q.prompt}
                                  </p>
                                ))}
                                {group.questions.length > 5 && (
                                  <p className="text-xs font-semibold text-slate-400">
                                    + yana {group.questions.length - 5} ta
                                    savol…
                                  </p>
                                )}
                              </div>
                              <div className="mt-auto flex gap-2 pt-4">
                                <Button
                                  className="flex-1"
                                  onClick={() => {
                                    const params = new URLSearchParams();
                                    params.set("skill", skill);
                                    params.set(
                                      "examMode",
                                      skill === "listening"
                                        ? examMode === "full"
                                          ? "full"
                                          : "passage"
                                        : examMode === "full"
                                          ? "full"
                                          : "passage",
                                    );
                                    if (group.topic)
                                      params.set("topic", group.topic);
                                    if (group.passageLabel)
                                      params.set(
                                        "passageLabel",
                                        group.passageLabel,
                                      );
                                    params.set(
                                      "limit",
                                      String(group.questions.length),
                                    );
                                    navigate(
                                      `/app/cdi-practice`,
                                    );
                                  }}
                                >
                                  <Play className="h-4 w-4 fill-current" />{" "}
                                  {skill === "listening"
                                    ? "Start — tinglash"
                                    : "Start passage — 20 min"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {readingGroups.length === 0 && (
                      <p className="py-8 text-center text-sm text-slate-400">
                        Mos passage topilmadi
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredQuestions.map((q, index) => (
                      <div
                        key={q.id}
                        className="group relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {index + 1}
                            </span>
                            <Badge tone={TONES[skill]} className="text-[10px]">
                              {SKILL_LABELS[skill]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge
                              tone={
                                q.difficulty === "easy"
                                  ? "emerald"
                                  : q.difficulty === "hard"
                                    ? "rose"
                                    : "amber"
                              }
                              className="text-[10px]"
                            >
                              {q.difficulty}
                            </Badge>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Timer className="h-3 w-3" />
                              {Math.round(q.timeLimitSec / 60)}m
                            </span>
                          </div>
                        </div>

                        {q.passageLabel && (
                          <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
                            {q.passageLabel}
                          </p>
                        )}

                        {q.passage && (
                          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                              {q.passage.startsWith("data:image") ? (
                                <img
                                  src={q.passage}
                                  alt="Passage"
                                  className="max-h-24 rounded"
                                />
                              ) : q.passage.length > 120 ? (
                                q.passage.substring(0, 120) + "..."
                              ) : (
                                q.passage
                              )}
                            </p>
                          </div>
                        )}

                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                          {q.prompt}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-2">
                          <span className="text-[10px] text-slate-400 capitalize">
                            {q.type}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => {
                              const params = new URLSearchParams();
                              params.set("skill", skill);
                              params.set("difficulty", q.difficulty);
                              if (q.topic) params.set("topic", q.topic);
                              params.set("limit", "1");
                              params.set("questionId", q.id);
                              navigate(
                                `/app/cdi-practice`,
                              );
                            }}
                          >
                            <Play className="h-3 w-3 fill-current" /> Practice
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {filteredQuestions.length > 0 && !useGroupedView && (
            <div className="flex justify-center">
              <Button size="lg" variant="primary" onClick={startPractice}>
                {skill === "reading" && examMode === "full"
                  ? "Full Reading 60 min"
                  : skill === "reading" && examMode === "passage"
                    ? "1 Passage — 20 min"
                    : skill === "listening" && examMode === "full"
                      ? `Full Listening ${IELTS_TIMING.listening.fullMin} min`
                      : `Start All Practice (${filteredQuestions.length} questions)`}{" "}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
