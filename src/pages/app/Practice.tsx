import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Headphones,
  FileText,
  PenLine,
  Mic,
  BookOpen,
  Filter,
  ArrowRight,
  Play,
} from "lucide-react";
import { fetchQuestions, getAdminQuestionsForSkill } from "@/api/practice";
import type { Question } from "@/types";
import type { Skill } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IELTS_TIMING } from "@/lib/ieltsConfig";

const SKILLS: {
  key: Skill;
  label: string;
  desc: string;
  icon: typeof Headphones;
}[] = [
  {
    key: "listening",
    label: "Listening",
    desc: "Audio-based questions with transcripts",
    icon: Headphones,
  },
  {
    key: "reading",
    label: "Reading",
    desc: "Passages with MC, TFNG & fill-blank",
    icon: FileText,
  },
  {
    key: "writing",
    label: "Writing",
    desc: "Templates, word counter & AI feedback",
    icon: PenLine,
  },
  {
    key: "speaking",
    label: "Speaking",
    desc: "Part 1-3 cue cards with recording",
    icon: Mic,
  },
];

const SKILL_COLORS: Record<Skill, string> = {
  listening:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  reading: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
  writing:
    "bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300",
  speaking:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
};

const SKILL_BADGES: Record<Skill, "violet" | "cyan" | "brand" | "emerald"> = {
  listening: "violet",
  reading: "cyan",
  writing: "brand",
  speaking: "emerald",
};

export function Practice() {
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("all");
  const [topic, setTopic] = useState("all");
  const [examMode, setExamMode] = useState<"passage" | "full" | "single">(
    "passage",
  );

  useEffect(() => {
    if (!selectedSkill) return;
    if (selectedSkill === "writing" || selectedSkill === "speaking") return;

    setLoading(true);
    const filters: any = { difficulty, type: "all", topic, limit: 50 };
    fetchQuestions(selectedSkill, filters)
      .then(setQuestions)
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [selectedSkill, difficulty, topic]);

  const adminCount =
    selectedSkill && selectedSkill !== "writing" && selectedSkill !== "speaking"
      ? getAdminQuestionsForSkill(selectedSkill).length
      : 0;

  const filteredQuestions = questions.filter((q) => {
    if (difficulty !== "all" && q.difficulty !== difficulty) return false;
    if (topic !== "all" && q.topic !== topic) return false;
    return true;
  });

  const groupedByPassage = (() => {
    if (
      !selectedSkill ||
      selectedSkill === "writing" ||
      selectedSkill === "speaking"
    )
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
    return Array.from(map.values()).sort(
      (a, b) =>
        b.questions.length - a.questions.length ||
        a.topic.localeCompare(b.topic),
    );
  })();
  const useGroupedView =
    examMode !== "single" &&
    (selectedSkill === "reading" || selectedSkill === "listening");

  const startSession = (q?: Question) => {
    if (!selectedSkill) return;
    if (selectedSkill === "writing") {
      navigate("/app/writing");
      return;
    }
    if (selectedSkill === "speaking") {
      navigate("/app/speaking");
      return;
    }

    const params = new URLSearchParams();
    params.set("skill", selectedSkill);
    if (difficulty !== "all") params.set("difficulty", difficulty);
    if (topic !== "all") params.set("topic", topic);
    // Real IELTS exam modes
    if (!q) {
      if (selectedSkill === "reading" && examMode !== "single")
        params.set("examMode", examMode);
      if (selectedSkill === "listening" && examMode === "full")
        params.set("examMode", "full");
    }
    params.set("limit", q ? "1" : String(filteredQuestions.length || 6));
    if (q) params.set("questionId", q.id);
    navigate(`/app/practice/session?${params.toString()}`);
  };

  const topics = Array.from(
    new Set(questions.map((q) => q.topic).filter(Boolean)),
  );
  const difficulties = Array.from(
    new Set(questions.map((q) => q.difficulty).filter(Boolean)),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Practice
        </h1>
        <p className="text-sm text-slate-500">
          Choose a skill and start practicing
        </p>
      </div>

      {!selectedSkill ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectedSkill(s.key)}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-brand-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${SKILL_COLORS[s.key]}`}
              >
                <s.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-display text-base font-bold text-slate-900 dark:text-white">
                {s.label}
              </p>
              <p className="mt-1 text-xs text-slate-400">{s.desc}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedSkill(null);
                setQuestions([]);
              }}
              className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              ← Back
            </button>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${SKILL_COLORS[selectedSkill]}`}
            >
              {SKILLS.find((s) => s.key === selectedSkill)?.icon &&
                (() => {
                  const Icon = SKILLS.find(
                    (s) => s.key === selectedSkill,
                  )!.icon;
                  return <Icon className="h-4 w-4" />;
                })()}
            </span>
            <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {SKILLS.find((s) => s.key === selectedSkill)?.label}
            </span>
            {adminCount > 0 && (
              <span className="text-xs text-brand-600 dark:text-brand-400">
                {adminCount} imported
              </span>
            )}
          </div>

          {selectedSkill === "writing" || selectedSkill === "speaking" ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                {selectedSkill === "writing" ? (
                  <PenLine className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Mic className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                )}
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
                {selectedSkill === "writing"
                  ? "Writing Practice"
                  : "Speaking Practice"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {selectedSkill === "writing"
                  ? "Write essays under exam conditions and get AI evaluation."
                  : "Practice speaking with cue cards and recording."}
              </p>
              <Button size="lg" className="mt-6" onClick={() => startSession()}>
                Start Practice <Play className="h-4 w-4 fill-current" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="bg-transparent text-sm text-slate-700 outline-none dark:text-slate-300"
                  >
                    <option value="all">All levels</option>
                    {difficulties.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-transparent text-sm text-slate-700 outline-none dark:text-slate-300"
                  >
                    <option value="all">All topics</option>
                    {topics.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-xs text-slate-400">
                  {filteredQuestions.length} questions
                </span>
              </div>

              {/* Real IELTS mode selector */}
              {selectedSkill === "reading" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setExamMode("passage")}
                    className={`rounded-full border px-4 py-2 text-sm font-bold transition ${examMode === "passage" ? "border-cyan-600 bg-cyan-600 text-white shadow" : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}
                  >
                    1 Passage — 20 min
                  </button>
                  <button
                    onClick={() => setExamMode("full")}
                    className={`rounded-full border px-4 py-2 text-sm font-bold transition ${examMode === "full" ? "border-cyan-600 bg-cyan-600 text-white shadow" : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}
                  >
                    Full Reading — 60 min / 40 savol
                  </button>
                  <button
                    onClick={() => setExamMode("single")}
                    className={`rounded-full border px-4 py-2 text-sm font-bold transition ${examMode === "single" ? "border-slate-600 bg-slate-600 text-white shadow" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}
                  >
                    Single Q — mashq
                  </button>
                </div>
              )}
              {selectedSkill === "listening" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setExamMode("single")}
                    className={`rounded-full border px-4 py-2 text-sm font-bold transition ${examMode === "single" ? "border-violet-600 bg-violet-600 text-white shadow" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}
                  >
                    Mashq — har bir savol alohida
                  </button>
                  <button
                    onClick={() => setExamMode("full")}
                    className={`rounded-full border px-4 py-2 text-sm font-bold transition ${examMode === "full" ? "border-violet-600 bg-violet-600 text-white shadow" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}
                  >
                    Full Listening — {IELTS_TIMING.listening.fullMin} min / 40
                    savol
                  </button>
                </div>
              )}

              {loading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                    />
                  ))}
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="py-16 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-3 text-sm text-slate-500">
                    No practice tasks found.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setDifficulty("all");
                      setTopic("all");
                    }}
                  >
                    Reset filters
                  </Button>
                </div>
              ) : useGroupedView ? (
                <div className="grid gap-4 sm:grid-cols-1">
                  {groupedByPassage.map((group) => {
                    const paragraphs = (group.passage || "")
                      .split("\n\n")
                      .filter(Boolean);
                    const preview = paragraphs
                      .slice(0, 2)
                      .join(" ")
                      .slice(0, 200);
                    return (
                      <div
                        key={group.key}
                        className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-brand-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="grid gap-0 lg:grid-cols-[1.15fr_1fr]">
                          <div className="bg-slate-50 p-5 dark:bg-slate-800/40">
                            <div className="flex items-center gap-2">
                              <Badge
                                tone={
                                  selectedSkill === "listening"
                                    ? "violet"
                                    : "cyan"
                                }
                              >
                                {group.passageLabel ||
                                  (selectedSkill === "listening"
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
                            </div>
                            <h4 className="mt-3 font-display text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                              {group.topic}
                            </h4>
                            {group.passage && (
                              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                {preview}
                                {group.passage.length > 200 ? "…" : ""}
                              </p>
                            )}
                            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              {paragraphs.length} paragraph · chapda matn,
                              o'ngda savollar
                            </p>
                          </div>
                          <div className="flex flex-col p-5">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              Savollar
                            </p>
                            <div className="mt-2 space-y-1.5">
                              {group.questions.slice(0, 4).map((q, i) => (
                                <p
                                  key={q.id}
                                  className="line-clamp-1 text-sm text-slate-700 dark:text-slate-300"
                                >
                                  <span
                                    className={`mr-1.5 font-bold ${selectedSkill === "listening" ? "text-violet-600" : "text-cyan-600"}`}
                                  >
                                    {i + 1}.
                                  </span>
                                  {q.prompt}
                                </p>
                              ))}
                              {group.questions.length > 4 && (
                                <p className="text-xs font-semibold text-slate-400">
                                  + yana {group.questions.length - 4} ta…
                                </p>
                              )}
                            </div>
                            <Button
                              className="mt-4"
                              onClick={() => {
                                const params = new URLSearchParams();
                                params.set("skill", selectedSkill!);
                                params.set("examMode", examMode as string);
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
                                  `/app/practice/session?${params.toString()}`,
                                );
                              }}
                            >
                              <Play className="h-4 w-4 fill-current" />{" "}
                              {selectedSkill === "listening"
                                ? "Start tinglash"
                                : "Start passage — 20 min"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredQuestions.map((q, index) => (
                    <div
                      key={q.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {index + 1}
                          </span>
                          <Badge
                            tone={SKILL_BADGES[selectedSkill!]}
                            className="text-[10px]"
                          >
                            {SKILLS.find((s) => s.key === selectedSkill)?.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5">
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
                                className="max-h-20 rounded"
                              />
                            ) : q.passage.length > 100 ? (
                              q.passage.substring(0, 100) + "..."
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
                        <Button size="sm" onClick={() => startSession(q)}>
                          <Play className="h-3 w-3 fill-current" /> Practice
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredQuestions.length > 1 && !useGroupedView && (
                <div className="flex justify-center pt-2">
                  <Button size="lg" onClick={() => startSession()}>
                    {selectedSkill === "reading" && examMode === "full"
                      ? `Full Reading ${IELTS_TIMING.reading.fullMin} min`
                      : selectedSkill === "reading" && examMode === "passage"
                        ? `Passage — 20 min`
                        : selectedSkill === "listening" && examMode === "full"
                          ? `Full Listening 40 min`
                          : `Start All (${filteredQuestions.length})`}{" "}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
