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
  Sparkles,
  Database,
  Clock,
} from "lucide-react";
import { fetchQuestions, getAdminQuestionsForSkill } from "@/api/practice";
import { isRealApi } from "@/api/http";
import type { Question } from "@/types";
import type { Skill } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
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
    <div className="space-y-6 animate-fade-in">
      {/* Premium header */}
      <div className="relative overflow-hidden rounded-[24px] bg-slate-900 p-7 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-brand-600 to-indigo-600 opacity-90" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Practice — DB live
            </p>
            <h1 className="mt-3 font-display text-2xl font-black tracking-tight">Practice</h1>
            <p className="mt-1.5 max-w-xl text-sm text-white/80">
              Choose a skill and start practicing — barchasi PostgreSQL dan jonli via <code className="rounded bg-white/20 px-1">GET /api/questions</code>.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="white" className="shadow">
                <Database className="h-3 w-3" /> {isRealApi() ? "DB live" : "Mock"} · {questions.length || "—"} total
              </Badge>
              {selectedSkill && <Badge tone="white">{selectedSkill}</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
            <Clock className="h-4 w-4" /> {IELTS_TIMING.reading.fullMin} min full • Instant start
          </div>
        </div>
      </div>

      {!selectedSkill ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map((s) => (
            <Card
              key={s.key}
              hover
              glass
              className="cursor-pointer rounded-[20px] p-0 text-left transition-all hover:-translate-y-1"
              onClick={() => setSelectedSkill(s.key)}
            >
              <div className="p-5">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${SKILL_COLORS[s.key]}`}
                >
                  <s.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-display text-base font-bold text-slate-900 dark:text-white">
                  {s.label}
                </p>
                <p className="mt-1 text-xs text-slate-400">{s.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-600">
                  Start <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl"
              onClick={() => {
                setSelectedSkill(null);
                setQuestions([]);
              }}
            >
              ← Back
            </Button>
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
              <Badge tone="slate">{adminCount} imported</Badge>
            )}
            <Badge tone={SKILL_BADGES[selectedSkill]}>{isRealApi() ? "DB" : "Mock"} · {filteredQuestions.length}</Badge>
          </div>

          {selectedSkill === "writing" || selectedSkill === "speaking" ? (
            <Card glass className="overflow-hidden">
              <CardContent className="p-8 text-center">
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
                <Button size="lg" className="mt-6 rounded-2xl" onClick={() => startSession()}>
                  Start Practice <Play className="h-4 w-4 fill-current" />
                </Button>
              </CardContent>
            </Card>
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
                <Badge tone="slate">{filteredQuestions.length} questions</Badge>
              </div>

              {selectedSkill === "reading" && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={examMode === "passage" ? "primary" : "outline"}
                    className="rounded-full"
                    onClick={() => setExamMode("passage")}
                  >
                    1 Passage — 20 min
                  </Button>
                  <Button
                    size="sm"
                    variant={examMode === "full" ? "primary" : "outline"}
                    className="rounded-full"
                    onClick={() => setExamMode("full")}
                  >
                    Full Reading — 60 min / 40 savol
                  </Button>
                  <Button
                    size="sm"
                    variant={examMode === "single" ? "secondary" : "outline"}
                    className="rounded-full"
                    onClick={() => setExamMode("single")}
                  >
                    Single Q — mashq
                  </Button>
                </div>
              )}
              {selectedSkill === "listening" && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={examMode === "single" ? "primary" : "outline"}
                    className="rounded-full"
                    onClick={() => setExamMode("single")}
                  >
                    Mashq — har bir savol alohida
                  </Button>
                  <Button
                    size="sm"
                    variant={examMode === "full" ? "primary" : "outline"}
                    className="rounded-full"
                    onClick={() => setExamMode("full")}
                  >
                    Full Listening — {IELTS_TIMING.listening.fullMin} min / 40 savol
                  </Button>
                </div>
              )}

              {loading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} glass className="p-4">
                      <Skeleton className="h-6 w-32 rounded-full" />
                      <Skeleton className="mt-3 h-4 w-full" />
                      <Skeleton className="mt-2 h-4 w-3/4" />
                      <Skeleton className="mt-4 h-9 w-28 rounded-2xl" />
                    </Card>
                  ))}
                </div>
              ) : filteredQuestions.length === 0 ? (
                <Card glass>
                  <CardContent className="py-16 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-3 text-sm text-slate-500">
                      No practice tasks found.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 rounded-2xl"
                      onClick={() => {
                        setDifficulty("all");
                        setTopic("all");
                      }}
                    >
                      Reset filters
                    </Button>
                  </CardContent>
                </Card>
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
                      <Card
                        key={group.key}
                        hover
                        glass
                        className="overflow-hidden"
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
                            <h4 className="mt-3 line-clamp-2 font-display text-base font-bold text-slate-900 dark:text-white">
                              {group.topic}
                            </h4>
                            {group.passage && (
                              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                {preview}
                                {group.passage.length > 200 ? "…" : ""}
                              </p>
                            )}
                            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              {paragraphs.length} paragraph · chapda matn, o'ngda savollar
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
                              className="mt-4 rounded-2xl"
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
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredQuestions.map((q, index) => (
                    <Card
                      key={q.id}
                      hover
                      glass
                      className="flex flex-col p-4"
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

                      {q.passageLabel && (
                        <p className="mt-3 text-xs font-medium text-brand-600 dark:text-brand-400">
                          {q.passageLabel}
                        </p>
                      )}

                      {q.passage && (
                        <div className="mt-2 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
                          <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
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

                      <p className="mt-3 line-clamp-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                        {q.prompt}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-3">
                        <span className="text-[10px] capitalize text-slate-400">
                          {q.type}
                        </span>
                        <Button size="sm" className="rounded-2xl" onClick={() => startSession(q)}>
                          <Play className="h-3 w-3 fill-current" /> Practice
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {filteredQuestions.length > 1 && !useGroupedView && (
                <div className="flex justify-center pt-2">
                  <Button size="lg" className="rounded-2xl" onClick={() => startSession()}>
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
