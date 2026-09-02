import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import type {
  IELTSQuestion,
  IELTSQuestionGroup,
  IELTSQuestionType,
  IELTSModule,
  ReadingPassage,
  ListeningPart,
  WritingTask,
  SpeakingPart,
  IELTSTestBuilder,
} from "@/types";
import {
  IELTS_QUESTION_TYPES,
  IELTS_TEMPLATES,
  getQuestionTypeLabel,
} from "@/lib/ieltsTemplates";
import {
  loadBuilder,
  saveBuilder,
  defaultPassage,
  defaultListeningPart,
  defaultWritingTask,
  defaultSpeakingPart,
  loadCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
} from "@/lib/ieltsBuilderStorage";
import { validateBuilder } from "@/lib/ieltsValidation";
import { randomId } from "@/lib/format";
import {
  Layers,
  Headphones,
  PenLine,
  Mic,
  Plus,
  Trash2,
  Copy,
  Eye,
  Edit3,
  GripVertical,
  Bold,
  Italic,
  List,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  Save,
  Sparkles,
  BookmarkPlus,
  AudioLines,
  Image as ImageIcon,
  BookOpen,
  Hash,
  Zap,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function autoLetters(n: number): string {
  return String.fromCharCode(65 + n);
} // A,B,C

function makeEmptyQuestion(
  type: IELTSQuestionType,
  idx: number,
): IELTSQuestion {
  const base: IELTSQuestion = {
    id: randomId("qg"),
    type,
    prompt: "",
    correctAnswer: "",
    alternativeAnswers: [],
    explanation: "",
  };
  if (type === "multiple-choice")
    return {
      ...base,
      prompt: `Question ${idx + 1}`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
    };
  if (type === "multiple-answer")
    return {
      ...base,
      prompt: `Question ${idx + 1}`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndices: [0],
    };
  if (type === "true-false-not-given")
    return {
      ...base,
      prompt: `Statement ${idx + 1}`,
      options: ["TRUE", "FALSE", "NOT GIVEN"],
      correctIndex: 0,
    };
  if (type === "yes-no-not-given")
    return {
      ...base,
      prompt: `Statement ${idx + 1}`,
      options: ["YES", "NO", "NOT GIVEN"],
      correctIndex: 0,
    };
  if (type === "matching-headings")
    return {
      ...base,
      prompt: `Paragraph ${String.fromCharCode(65 + idx)}`,
      correctAnswer: "i",
    };
  if (type === "matching-information")
    return { ...base, prompt: `Information ${idx + 1}`, correctAnswer: "A" };
  if (type === "matching-features")
    return { ...base, prompt: `Feature ${idx + 1}`, correctAnswer: "" };
  return {
    ...base,
    prompt: `Question ${idx + 1}`,
    correctAnswer: "",
    wordLimit: "NO MORE THAN TWO WORDS",
  };
}

function makeGroupFromTemplate(
  type: IELTSQuestionType,
  instr: string,
  wordLimit?: string,
  headingList?: string[],
  count = 4,
): IELTSQuestionGroup {
  const qs: IELTSQuestion[] = Array.from({ length: count }, (_, i) =>
    makeEmptyQuestion(type, i),
  );
  // For matching headings, also set headingList at group level
  return {
    id: randomId("grp"),
    type,
    instructions: instr || getQuestionTypeLabel(type),
    wordLimit: wordLimit,
    headingList: headingList,
    questions: qs,
  };
}

// ---------------------------------------------------------------------------
// Rich text mini editor
// ---------------------------------------------------------------------------
function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const exec = (cmd: string) => {
    document.execCommand(cmd, false);
    ref.current?.focus();
    onChange(ref.current?.innerHTML || "");
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-800/50">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("bold")}
          className="rounded-lg p-1.5 hover:bg-white dark:hover:bg-slate-700"
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("italic")}
          className="rounded-lg p-1.5 hover:bg-white dark:hover:bg-slate-700"
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertUnorderedList")}
          className="rounded-lg p-1.5 hover:bg-white dark:hover:bg-slate-700"
          title="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Rich text — passage
        </span>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML || "")}
        dangerouslySetInnerHTML={{
          __html:
            value ||
            `<p class="text-slate-400">${placeholder || "Passage matnini kiriting..."}</p>`,
        }}
        className="min-h-[180px] max-h-[420px] overflow-y-auto p-3 text-sm leading-relaxed text-slate-800 outline-none dark:text-slate-200"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------
export function AdminIeltsBuilder() {
  const { toast } = useToast();
  const [builder, setBuilder] = useState<IELTSTestBuilder>(() => loadBuilder());
  const [module, setModule] = useState<IELTSModule>("reading");
  const [activePassageId, setActivePassageId] = useState<string>(
    () => loadBuilder().reading.passages[0]?.id || "",
  );
  const [activeListeningId, setActiveListeningId] = useState<string>(
    () => loadBuilder().listening.parts[0]?.id || "",
  );
  const [activeWritingId, setActiveWritingId] = useState<string>(
    () => loadBuilder().writing.tasks[0]?.id || "",
  );
  const [activeSpeakingId, setActiveSpeakingId] = useState<string>(
    () => loadBuilder().speaking.parts[0]?.id || "",
  );
  const [showTemplatesFor, setShowTemplatesFor] = useState<string | null>(null); // passageId
  const [customName, setCustomName] = useState("");
  const [previewMode, setPreviewMode] = useState<"edit" | "preview" | "answer">(
    "edit",
  );
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [bulkCount, setBulkCount] = useState<Record<string, number>>({});
  const [customTemplates, setCustomTemplates] = useState(() =>
    loadCustomTemplates(),
  );
  const [validationOpen, setValidationOpen] = useState(false);

  // persist
  useEffect(() => {
    saveBuilder(builder);
  }, [builder]);
  // keep active ids valid
  useEffect(() => {
    if (
      module === "reading" &&
      !builder.reading.passages.find((p) => p.id === activePassageId)
    )
      setActivePassageId(builder.reading.passages[0]?.id || "");
    if (
      module === "listening" &&
      !builder.listening.parts.find((p) => p.id === activeListeningId)
    )
      setActiveListeningId(builder.listening.parts[0]?.id || "");
  }, [builder, module, activePassageId, activeListeningId]);

  const validation = useMemo(() => validateBuilder(builder), [builder]);
  const errors = validation.filter((v) => v.level === "error").length;
  const warnings = validation.filter((v) => v.level === "warning").length;

  // numbering helpers
  const readingNumberMap = useMemo(() => {
    let n = 1;
    const map = new Map<string, number>(); // questionId -> global number
    const groupRange = new Map<string, { start: number; end: number }>();
    for (const p of builder.reading.passages) {
      for (const g of p.groups) {
        const start = n;
        for (const q of g.questions) {
          map.set(q.id, n++);
        }
        groupRange.set(g.id, { start, end: n - 1 });
      }
    }
    return { map, groupRange };
  }, [builder.reading.passages]);

  const listeningNumberMap = useMemo(() => {
    let n = 1;
    const map = new Map<string, number>();
    for (const s of builder.listening.parts)
      for (const g of s.groups) for (const q of g.questions) map.set(q.id, n++);
    return map;
  }, [builder.listening.parts]);

  // Mutators
  const updateReading = (updater: (b: IELTSTestBuilder) => void) => {
    setBuilder((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as IELTSTestBuilder;
      updater(next);
      return next;
    });
  };

  // Reading actions
  const addPassage = () => {
    const idx = builder.reading.passages.length + 1;
    updateReading((b) => b.reading.passages.push(defaultPassage(idx)));
    toast("Passage qo‘shildi");
  };
  const duplicatePassage = (id: string) => {
    const src = builder.reading.passages.find((p) => p.id === id);
    if (!src) return;
    const clone: ReadingPassage = JSON.parse(JSON.stringify(src));
    clone.id = randomId("passage");
    clone.title = src.title + " (copy)";
    clone.groups = clone.groups.map((g) => ({
      ...g,
      id: randomId("grp"),
      questions: g.questions.map((q) => ({ ...q, id: randomId("qg") })),
    }));
    updateReading((b) => {
      const idx = b.reading.passages.findIndex((p) => p.id === id);
      b.reading.passages.splice(idx + 1, 0, clone);
    });
    toast("Passage nusxalandi");
  };
  const removePassage = (id: string) => {
    if (builder.reading.passages.length <= 1) {
      toast("Kamida 1 ta passage qolishi kerak", "error");
      return;
    }
    if (!confirm("Passage o‘chirilsinmi?")) return;
    updateReading(
      (b) =>
        (b.reading.passages = b.reading.passages.filter((p) => p.id !== id)),
    );
  };
  const addGroupToPassage = (
    passageId: string,
    type: IELTSQuestionType,
    tpl?: (typeof IELTS_TEMPLATES)[0],
  ) => {
    const instr =
      tpl?.defaultInstructions ||
      `Instructions — ${getQuestionTypeLabel(type)}`;
    const wl = tpl?.defaultWordLimit;
    const headings = tpl?.defaultHeadingList;
    const count = tpl?.defaultQuestions ?? 4;
    const grp = makeGroupFromTemplate(type, instr, wl, headings, count);
    updateReading((b) =>
      b.reading.passages.find((p) => p.id === passageId)?.groups.push(grp),
    );
    setShowTemplatesFor(null);
    toast(`${getQuestionTypeLabel(type)} group qo‘shildi — ${count} savol`);
  };
  const addGroupCustom = (
    passageId: string,
    ct: (typeof customTemplates)[0],
  ) => {
    const grp: IELTSQuestionGroup = {
      id: randomId("grp"),
      type: ct.type as IELTSQuestionType,
      instructions: ct.instructions,
      wordLimit: ct.wordLimit,
      headingList: ct.headingList,
      questions: ct.questions.map(
        (q) =>
          ({
            id: randomId("qg"),
            type: ct.type as IELTSQuestionType,
            prompt: q.prompt,
            options: q.options,
            correctAnswer: q.correctAnswer,
            alternativeAnswers: q.alternativeAnswers || [],
          }) as IELTSQuestion,
      ),
    };
    updateReading((b) =>
      b.reading.passages.find((p) => p.id === passageId)?.groups.push(grp),
    );
    toast("Custom template qo‘shildi");
  };
  const duplicateGroup = (passageId: string, groupId: string) => {
    updateReading((b) => {
      const p = b.reading.passages.find((x) => x.id === passageId);
      if (!p) return;
      const idx = p.groups.findIndex((g) => g.id === groupId);
      const src = p.groups[idx];
      const clone: IELTSQuestionGroup = JSON.parse(JSON.stringify(src));
      clone.id = randomId("grp");
      clone.questions = clone.questions.map((q) => ({
        ...q,
        id: randomId("qg"),
      }));
      p.groups.splice(idx + 1, 0, clone);
    });
  };
  const removeGroup = (passageId: string, groupId: string) => {
    if (!confirm("Group o‘chirilsinmi?")) return;
    updateReading((b) => {
      const p = b.reading.passages.find((x) => x.id === passageId);
      if (p) p.groups = p.groups.filter((g) => g.id !== groupId);
    });
  };
  const bulkAddQuestions = (passageId: string, groupId: string) => {
    const cnt = bulkCount[groupId] || 1;
    if (cnt < 1 || cnt > 20) return;
    updateReading((b) => {
      const p = b.reading.passages.find((x) => x.id === passageId);
      const g = p?.groups.find((x) => x.id === groupId);
      if (!g) return;
      for (let i = 0; i < cnt; i++)
        g.questions.push(makeEmptyQuestion(g.type, g.questions.length));
    });
    setBulkCount((s) => ({ ...s, [groupId]: 1 }));
    toast(`${cnt} ta savol qo‘shildi`);
  };
  const saveAsReusable = (passageId: string, groupId: string) => {
    if (!customName.trim()) {
      toast("Template nomi kiriting", "error");
      return;
    }
    const p = builder.reading.passages.find((x) => x.id === passageId);
    const g = p?.groups.find((x) => x.id === groupId);
    if (!g) return;
    const ct = {
      id: randomId("ctpl"),
      label: customName.trim(),
      type: g.type,
      instructions: g.instructions,
      wordLimit: g.wordLimit,
      headingList: g.headingList,
      questions: g.questions.map((q) => ({
        prompt: q.prompt,
        options: q.options,
        correctAnswer: q.correctAnswer,
        alternativeAnswers: q.alternativeAnswers,
      })),
    };
    saveCustomTemplate(ct as never);
    setCustomTemplates(loadCustomTemplates());
    setCustomName("");
    toast("Template saqlandi");
  };

  // Listening mutators
  const listeningAddPart = () => {
    updateReading((b) =>
      b.listening.parts.push(
        defaultListeningPart(b.listening.parts.length + 1),
      ),
    );
  };
  const listeningDup = (id: string) => {
    const src = builder.listening.parts.find((p) => p.id === id);
    if (!src) return;
    const clone: ListeningPart = JSON.parse(JSON.stringify(src));
    clone.id = randomId("lpart");
    clone.title = src.title + " (copy)";
    clone.groups = clone.groups.map((g) => ({
      ...g,
      id: randomId("grp"),
      questions: g.questions.map((q) => ({ ...q, id: randomId("qg") })),
    }));
    updateReading((b) => {
      const i = b.listening.parts.findIndex((p) => p.id === id);
      b.listening.parts.splice(i + 1, 0, clone);
    });
  };
  const listeningAddGroup = (partId: string, type: IELTSQuestionType) => {
    const g = makeGroupFromTemplate(
      type,
      `${getQuestionTypeLabel(type)}`,
      undefined,
      undefined,
      4,
    );
    updateReading((b) =>
      b.listening.parts.find((p) => p.id === partId)?.groups.push(g),
    );
  };

  // Writing mutators
  const writingUpdate = (id: string, patch: Partial<WritingTask>) => {
    updateReading((b) => {
      const t = b.writing.tasks.find((x) => x.id === id);
      if (t) Object.assign(t, patch);
    });
  };
  const writingAdd = (num: 1 | 2) => {
    updateReading((b) => b.writing.tasks.push(defaultWritingTask(num)));
  };

  // Speaking mutators
  const speakingUpdate = (id: string, patch: Partial<SpeakingPart>) => {
    updateReading((b) => {
      const p = b.speaking.parts.find((x) => x.id === id);
      if (p) Object.assign(p, patch);
    });
  };

  // active entities
  const activePassage =
    builder.reading.passages.find((p) => p.id === activePassageId) ||
    builder.reading.passages[0];
  const activeListening =
    builder.listening.parts.find((p) => p.id === activeListeningId) ||
    builder.listening.parts[0];
  const activeWriting =
    builder.writing.tasks.find((t) => t.id === activeWritingId) ||
    builder.writing.tasks[0];
  const activeSpeaking =
    builder.speaking.parts.find((p) => p.id === activeSpeakingId) ||
    builder.speaking.parts[0];

  // publish simulation
  const handlePublish = () => {
    const v = validateBuilder(builder);
    if (v.some((x) => x.level === "error")) {
      setValidationOpen(true);
      toast(
        "Validation xatolari bor — chap pastdagi ro‘yxatni tekshiring",
        "error",
      );
      return;
    }
    saveBuilder(builder);
    toast("Published — barcha modullar saqlandi ✓", "success");
  };

  return (
    <div className="space-y-4">
      {/* Header + module switcher — single page, no navigation */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white">
                <Layers className="h-4 w-4" />
              </span>
              IELTS Builder — Passage / Section / Part / Task
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
              Test → Section → Passage → Part → Task → Questions. Barcha
              modullar bitta sahifada — question type tanlaganda form avtomatik
              generatsiya qilinadi. Numbering avtomatik.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full bg-slate-100 p-1 dark:bg-slate-800">
              {(["edit", "preview", "answer"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() =>
                    m === "preview"
                      ? setShowPreviewModal(true)
                      : setPreviewMode(m)
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${previewMode === m && m !== "preview" ? "bg-white shadow dark:bg-slate-700 dark:text-white" : "text-slate-500"}`}
                >
                  {m === "edit" ? (
                    <>
                      <Edit3 className="mr-1 inline h-3 w-3" />
                      Edit
                    </>
                  ) : m === "preview" ? (
                    <>
                      <Eye className="mr-1 inline h-3 w-3" />
                      Preview
                    </>
                  ) : (
                    <>
                      <Hash className="mr-1 inline h-3 w-3" />
                      Answer Key
                    </>
                  )}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setValidationOpen((v) => !v)}
              className={errors ? "border-rose-300 text-rose-700" : ""}
            >
              {errors ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {errors ? `${errors} error` : "Valid"}{" "}
              {warnings ? `· ${warnings} warn` : ""}
            </Button>
            <Button size="sm" onClick={handlePublish}>
              <Save className="h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>

        {/* Module pills — Select IELTS Module */}
        <div className="flex flex-wrap gap-2">
          {[
            {
              k: "reading" as IELTSModule,
              label: "Reading",
              desc: `${builder.reading.passages.length} passages · ${builder.reading.passages.reduce((a, p) => a + p.groups.reduce((b, g) => b + g.questions.length, 0), 0)} q`,
              icon: BookOpen,
              color: "emerald",
            },
            {
              k: "listening" as IELTSModule,
              label: "Listening",
              desc: `${builder.listening.parts.length} sections · ${builder.listening.parts.reduce((a, p) => a + p.groups.reduce((b, g) => b + g.questions.length, 0), 0)} q`,
              icon: Headphones,
              color: "violet",
            },
            {
              k: "writing" as IELTSModule,
              label: "Writing",
              desc: `${builder.writing.tasks.length} tasks`,
              icon: PenLine,
              color: "brand",
            },
            {
              k: "speaking" as IELTSModule,
              label: "Speaking",
              desc: `${builder.speaking.parts.length} parts`,
              icon: Mic,
              color: "amber",
            },
          ].map((m) => {
            const active = module === m.k;
            const Icon = m.icon;
            return (
              <button
                key={m.k}
                onClick={() => setModule(m.k)}
                className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-left transition ${active ? "border-violet-600 bg-violet-600 text-white shadow" : "border-slate-200 bg-white hover:border-violet-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"}`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800"}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p
                    className={`text-sm font-bold ${active ? "text-white" : "text-slate-900 dark:text-white"}`}
                  >
                    {m.label}
                  </p>
                  <p
                    className={`text-xs ${active ? "text-violet-100" : "text-slate-500"}`}
                  >
                    {m.desc}
                  </p>
                </div>
                {active && (
                  <span className="ml-2 hidden text-xs font-bold opacity-80 sm:inline">
                    ● active
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Workflow steps bar */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-slate-800">
          <span className="rounded-full bg-white/15 px-2 py-1">
            1. Select Module
          </span>
          <span className="opacity-40">→</span>
          <span className="rounded-full bg-white/15 px-2 py-1">
            2. Section/Passage
          </span>
          <span className="opacity-40">→</span>
          <span className="rounded-full bg-white/15 px-2 py-1">
            3. Question Type
          </span>
          <span className="opacity-40">→</span>
          <span className="rounded-full bg-white/15 px-2 py-1">
            4. Template
          </span>
          <span className="opacity-40">→</span>
          <span className="rounded-full bg-emerald-500 px-2 py-1 text-white">
            5. Content → Answers → Preview → Publish
          </span>
          <span className="ml-auto hidden items-center gap-1 text-[11px] font-medium text-violet-200 sm:flex">
            <Zap className="h-3 w-3" /> Kam click, ko‘p content
          </span>
        </div>
      </div>

      {/* Validation bar */}
      {validationOpen && (
        <Card className="border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                Validation — IELTS qoidalari
              </p>
              <button
                onClick={() => setValidationOpen(false)}
                className="rounded-lg p-1 hover:bg-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
              {validation.length === 0 ? (
                <p className="text-sm text-emerald-700">✓ Hammasi joyida</p>
              ) : (
                validation.map((v, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 rounded-lg px-2 py-1 text-xs ${v.level === "error" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40" : "bg-amber-50 text-amber-700 dark:bg-amber-950/30"}`}
                  >
                    <span className="font-bold">
                      {v.level === "error" ? "●" : "○"}
                    </span>
                    <span className="font-semibold">{v.path}:</span>
                    <span>{v.message}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== READING ========== */}
      {module === "reading" && activePassage && (
        <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
          {/* Left outline: Passages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Passages — Test → Passage
              </h3>
              <Button size="sm" variant="outline" onClick={addPassage}>
                <Plus className="h-3.5 w-3.5" />
                Passage
              </Button>
            </div>
            {builder.reading.passages.map((p, idx) => {
              const qCount = p.groups.reduce(
                (a, g) => a + g.questions.length,
                0,
              );
              const isActive = p.id === activePassageId;
              return (
                <div
                  key={p.id}
                  onClick={() => setActivePassageId(p.id)}
                  className={`cursor-pointer rounded-2xl border p-3 transition ${isActive ? "border-violet-600 bg-violet-50 dark:bg-violet-950/30" : "border-slate-200 bg-white hover:border-violet-200 dark:border-slate-800 dark:bg-slate-900"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-bold ${isActive ? "text-violet-900 dark:text-violet-100" : "text-slate-900 dark:text-white"}`}
                      >
                        Passage {idx + 1} — {p.title || "Untitled"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {p.passageLabel} · {qCount} q · {p.groups.length} groups
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicatePassage(p.id);
                        }}
                        className="rounded-lg p-1 hover:bg-white dark:hover:bg-slate-800"
                        title="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePassage(p.id);
                        }}
                        className="rounded-lg p-1 text-rose-500 hover:bg-white"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {isActive && p.groups.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.groups.map((g) => {
                        const r = readingNumberMap.groupRange.get(g.id);
                        return (
                          <Badge
                            key={g.id}
                            tone="slate"
                            className="text-[10px]"
                          >
                            {r ? `Q${r.start}–${r.end}` : ""}{" "}
                            {
                              IELTS_QUESTION_TYPES.find(
                                (t) => t.value === g.type,
                              )?.short
                            }
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Main editor: passage + groups — single page, no navigation */}
          <div className="space-y-4">
            {/* Passage editor */}
            <Card>
              <CardContent className="space-y-3 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 font-display font-bold text-slate-900 dark:text-white">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    {activePassage.passageLabel}
                    <Badge tone="emerald">{activePassage.title}</Badge>
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    20 min / passage
                    <button
                      onClick={() => setShowPreviewModal(true)}
                      className="ml-2 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white dark:bg-white dark:text-slate-900"
                    >
                      <Eye className="mr-1 inline h-3 w-3" />
                      Preview as Student
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Passage title
                    </label>
                    <input
                      value={activePassage.title}
                      onChange={(e) =>
                        updateReading((b) => {
                          const p = b.reading.passages.find(
                            (x) => x.id === activePassageId,
                          );
                          if (p) p.title = e.target.value;
                        })
                      }
                      placeholder="Dolls through the ages"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Passage label
                    </label>
                    <input
                      value={activePassage.passageLabel}
                      onChange={(e) =>
                        updateReading((b) => {
                          const p = b.reading.passages.find(
                            (x) => x.id === activePassageId,
                          );
                          if (p) p.passageLabel = e.target.value;
                        })
                      }
                      placeholder="Reading Passage 1"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                {previewMode !== "answer" ? (
                  <RichTextEditor
                    value={activePassage.text}
                    onChange={(v) =>
                      updateReading((b) => {
                        const p = b.reading.passages.find(
                          (x) => x.id === activePassageId,
                        );
                        if (p) p.text = v;
                      })
                    }
                    placeholder="Passage matnini kiriting... rich-text editor (bold/italic/list). Student chap panelda ko‘radi."
                  />
                ) : (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                      Answer Key — quick fill (student ko‘rmaydi)
                    </p>
                    <p className="text-xs text-emerald-600">
                      Har bir question uchun javobni tez to‘ldiring — type ga
                      mos input chiqadi.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Groups — Part / Question Group */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Question Groups — Part / Question Group (bitta sahifada)
                </h3>
                <div className="flex items-center gap-2">
                  <span className="hidden text-xs text-slate-500 sm:inline">
                    Type tanlang → template avtomatik
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setShowTemplatesFor(activePassageId)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Question Group
                  </Button>
                </div>
              </div>

              {/* Template picker — opens inline, no new page */}
              {showTemplatesFor === activePassageId && (
                <Card className="border-violet-200 dark:border-violet-900/50">
                  <CardContent className="space-y-3 pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        <Sparkles className="mr-1 inline h-4 w-4 text-violet-600" />
                        Question Group Templates
                      </p>
                      <button
                        onClick={() => setShowTemplatesFor(null)}
                        className="rounded-lg p-1 hover:bg-slate-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Admin type tanlaydi — form avtomatik shu IELTS question
                      type uchun kerakli fieldlarni ko‘rsatadi.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {IELTS_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          onClick={() =>
                            addGroupToPassage(activePassageId, tpl.type, tpl)
                          }
                          className="rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-violet-300 hover:bg-violet-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-800"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-700">
                              {tpl.icon}
                            </span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {tpl.label}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {tpl.description}
                          </p>
                          <p className="mt-1 text-[11px] font-medium text-violet-600">
                            {tpl.defaultInstructions.slice(0, 70)}…
                          </p>
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-xs font-semibold text-slate-500">
                        Yoki to‘g‘ridan:
                      </span>
                      {IELTS_QUESTION_TYPES.map((t) => (
                        <button
                          key={t.value}
                          onClick={() =>
                            addGroupToPassage(activePassageId, t.value)
                          }
                          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900"
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    {customTemplates.length > 0 && (
                      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Reusable templates (saqlangan)
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {customTemplates.map((ct) => (
                            <span
                              key={ct.id}
                              className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-white px-2.5 py-1 text-xs dark:border-violet-800 dark:bg-slate-900"
                            >
                              <button
                                onClick={() =>
                                  addGroupCustom(activePassageId, ct)
                                }
                                className="font-semibold text-violet-700"
                              >
                                {ct.label}
                              </button>
                              <button
                                onClick={() => {
                                  deleteCustomTemplate(ct.id);
                                  setCustomTemplates(loadCustomTemplates());
                                }}
                                className="text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Render groups */}
              {activePassage.groups.length === 0 && !showTemplatesFor && (
                <Card className="border-dashed p-8 text-center">
                  <p className="text-sm font-semibold text-slate-600">
                    Hali group yo‘q — Add Question Group bosing, type tanlang,
                    template avtomatik ochiladi.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Masalan Matching Headings: List of headings · Paragraphs ·
                    Correct heading
                  </p>
                </Card>
              )}

              {activePassage.groups.map((g) => {
                const range = readingNumberMap.groupRange.get(g.id);
                return (
                  <Card key={g.id} className="overflow-hidden">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="brand" className="text-[11px]">
                            {getQuestionTypeLabel(g.type)}
                          </Badge>
                          {range && (
                            <Badge tone="cyan" className="text-[11px]">
                              Questions {range.start}–{range.end}
                            </Badge>
                          )}
                          {g.wordLimit && (
                            <Badge tone="amber" className="text-[10px]">
                              {g.wordLimit}
                            </Badge>
                          )}
                          <span className="text-xs text-slate-500">
                            · Numbering avtomatik
                          </span>
                        </div>
                        <input
                          value={g.instructions}
                          onChange={(e) =>
                            updateReading((b) => {
                              const p = b.reading.passages.find(
                                (x) => x.id === activePassageId,
                              );
                              const gg = p?.groups.find((x) => x.id === g.id);
                              if (gg) gg.instructions = e.target.value;
                            })
                          }
                          placeholder="Instructions..."
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-900"
                        />
                        {/* Word limit UI for completion types */}
                        {[
                          "sentence-completion",
                          "summary-completion",
                          "note-completion",
                          "table-completion",
                          "flowchart-completion",
                          "short-answer",
                        ].includes(g.type) && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500">
                              Word limit:
                            </span>
                            <select
                              value={g.wordLimit || ""}
                              onChange={(e) =>
                                updateReading((b) => {
                                  const p = b.reading.passages.find(
                                    (x) => x.id === activePassageId,
                                  );
                                  const gg = p?.groups.find(
                                    (x) => x.id === g.id,
                                  );
                                  if (gg)
                                    gg.wordLimit = e.target.value || undefined;
                                })
                              }
                              className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                            >
                              <option value="">— tanlang —</option>
                              <option>ONE WORD ONLY</option>
                              <option>NO MORE THAN ONE WORD</option>
                              <option>NO MORE THAN TWO WORDS</option>
                              <option>NO MORE THAN THREE WORDS</option>
                              <option>
                                NO MORE THAN TWO WORDS AND/OR A NUMBER
                              </option>
                            </select>
                            <span className="text-[11px] text-slate-400">
                              UI tomonidan avtomatik ko‘rsatiladi
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => duplicateGroup(activePassageId, g.id)}
                          className="rounded-lg p-1.5 hover:bg-white dark:hover:bg-slate-700"
                          title="Duplicate group"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeGroup(activePassageId, g.id)}
                          className="rounded-lg p-1.5 text-rose-600 hover:bg-white"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Type-specific heading editor */}
                    {g.type === "matching-headings" && (
                      <div className="border-b border-slate-100 bg-amber-50/40 px-4 py-3 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          List of headings (drag & drop tartibi)
                        </p>
                        <div className="mt-2 grid gap-1.5">
                          {(g.headingList || []).map((h, hi) => (
                            <div
                              key={hi}
                              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900"
                            >
                              <GripVertical className="h-3.5 w-3.5 cursor-grab text-slate-400" />
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                                {[
                                  "i",
                                  "ii",
                                  "iii",
                                  "iv",
                                  "v",
                                  "vi",
                                  "vii",
                                  "viii",
                                  "ix",
                                  "x",
                                ][hi] || hi + 1}
                              </span>
                              <input
                                value={h}
                                onChange={(e) =>
                                  updateReading((b) => {
                                    const p = b.reading.passages.find(
                                      (x) => x.id === activePassageId,
                                    );
                                    const gg = p?.groups.find(
                                      (x) => x.id === g.id,
                                    );
                                    if (gg && gg.headingList)
                                      gg.headingList[hi] = e.target.value;
                                  })
                                }
                                className="flex-1 bg-transparent text-sm outline-none"
                              />
                              <button
                                onClick={() =>
                                  updateReading((b) => {
                                    const p = b.reading.passages.find(
                                      (x) => x.id === activePassageId,
                                    );
                                    const gg = p?.groups.find(
                                      (x) => x.id === g.id,
                                    );
                                    if (gg?.headingList)
                                      gg.headingList.splice(hi, 1);
                                  })
                                }
                                className="rounded p-1 text-rose-500 hover:bg-rose-50"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() =>
                            updateReading((b) => {
                              const p = b.reading.passages.find(
                                (x) => x.id === activePassageId,
                              );
                              const gg = p?.groups.find((x) => x.id === g.id);
                              if (gg) {
                                gg.headingList = gg.headingList || [];
                                gg.headingList.push("New heading");
                              }
                            })
                          }
                        >
                          <Plus className="h-3 w-3" />
                          Heading qo‘shish
                        </Button>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Studentga drag & drop / select orqali ko‘rsatiladi —
                          roman raqamlari avtomatik.
                        </p>
                      </div>
                    )}

                    {/* Questions list — bulk + duplicate */}
                    <div className="space-y-2 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Questions — Tab/Enter bilan tez o‘tish
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={bulkCount[g.id] || 1}
                            onChange={(e) =>
                              setBulkCount((s) => ({
                                ...s,
                                [g.id]: Math.max(
                                  1,
                                  Math.min(20, Number(e.target.value)),
                                ),
                              }))
                            }
                            className="h-7 w-14 rounded-lg border border-slate-200 px-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              bulkAddQuestions(activePassageId, g.id)
                            }
                          >
                            <Zap className="h-3 w-3" />
                            Create {bulkCount[g.id] || 1} Questions
                          </Button>
                          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                          <input
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="Template nomi..."
                            className="hidden h-7 w-28 rounded-lg border border-slate-200 px-2 text-xs dark:border-slate-700 dark:bg-slate-900 sm:block"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              saveAsReusable(activePassageId, g.id)
                            }
                          >
                            <BookmarkPlus className="h-3 w-3" />
                            Save template
                          </Button>
                        </div>
                      </div>

                      {/* Answer Key quick bar */}
                      {previewMode === "answer" && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                          <p className="text-xs font-bold text-emerald-700">
                            Answer Key — juda tez to‘ldirish (type ga mos)
                          </p>
                          <div className="mt-1 grid gap-1 sm:grid-cols-2">
                            {g.questions.map((q) => {
                              const num = readingNumberMap.map.get(q.id);
                              return (
                                <div
                                  key={q.id}
                                  className="flex items-center gap-1.5 rounded-lg bg-white px-2 py-1 dark:bg-slate-900"
                                >
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                                    {num}
                                  </span>
                                  {q.type === "multiple-choice" ? (
                                    <select
                                      value={q.correctIndex ?? ""}
                                      onChange={(e) =>
                                        updateReading((b) => {
                                          const p = b.reading.passages.find(
                                            (x) => x.id === activePassageId,
                                          );
                                          const qq = p?.groups
                                            .find((x) => x.id === g.id)
                                            ?.questions.find(
                                              (x) => x.id === q.id,
                                            );
                                          if (qq)
                                            qq.correctIndex =
                                              e.target.value === ""
                                                ? undefined
                                                : Number(e.target.value);
                                        })
                                      }
                                      className="flex-1 rounded border border-slate-200 px-1 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                                    >
                                      <option value="">—</option>
                                      {(q.options || []).map((_, oi) => (
                                        <option key={oi} value={oi}>
                                          {autoLetters(oi)} —{" "}
                                          {(q.options || [])[oi]}
                                        </option>
                                      ))}
                                    </select>
                                  ) : q.type === "matching-headings" ? (
                                    <select
                                      value={q.correctAnswer || ""}
                                      onChange={(e) =>
                                        updateReading((b) => {
                                          const p = b.reading.passages.find(
                                            (x) => x.id === activePassageId,
                                          );
                                          const qq = p?.groups
                                            .find((x) => x.id === g.id)
                                            ?.questions.find(
                                              (x) => x.id === q.id,
                                            );
                                          if (qq)
                                            qq.correctAnswer = e.target.value;
                                        })
                                      }
                                      className="flex-1 rounded border border-slate-200 px-1 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                                    >
                                      <option value="">— heading —</option>
                                      {(g.headingList || []).map((h, hi) => (
                                        <option
                                          key={hi}
                                          value={
                                            [
                                              "i",
                                              "ii",
                                              "iii",
                                              "iv",
                                              "v",
                                              "vi",
                                              "vii",
                                              "viii",
                                            ][hi]
                                          }
                                        >
                                          {
                                            [
                                              "i",
                                              "ii",
                                              "iii",
                                              "iv",
                                              "v",
                                              "vi",
                                              "vii",
                                              "viii",
                                            ][hi]
                                          }
                                          . {h.slice(0, 30)}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      value={q.correctAnswer || ""}
                                      onChange={(e) =>
                                        updateReading((b) => {
                                          const p = b.reading.passages.find(
                                            (x) => x.id === activePassageId,
                                          );
                                          const qq = p?.groups
                                            .find((x) => x.id === g.id)
                                            ?.questions.find(
                                              (x) => x.id === q.id,
                                            );
                                          if (qq)
                                            qq.correctAnswer = e.target.value;
                                        })
                                      }
                                      placeholder="Answer"
                                      className="flex-1 rounded border border-slate-200 px-2 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {g.questions.map((q) => {
                        const globalNum = readingNumberMap.map.get(q.id);
                        return (
                          <div
                            key={q.id}
                            className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30"
                          >
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                                {globalNum}
                              </span>
                              <div className="flex-1 space-y-2">
                                {/* Question prompt */}
                                <input
                                  value={q.prompt}
                                  onChange={(e) =>
                                    updateReading((b) => {
                                      const p = b.reading.passages.find(
                                        (x) => x.id === activePassageId,
                                      );
                                      const qq = p?.groups
                                        .find((x) => x.id === g.id)
                                        ?.questions.find((x) => x.id === q.id);
                                      if (qq) qq.prompt = e.target.value;
                                    })
                                  }
                                  placeholder={
                                    g.type === "matching-headings"
                                      ? "Paragraph A"
                                      : "Question prompt..."
                                  }
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                />

                                {/* Type-specific fields */}
                                {q.type === "multiple-choice" && (
                                  <div className="space-y-1.5">
                                    <div className="grid gap-1.5 sm:grid-cols-2">
                                      {(q.options || []).map((opt, oi) => (
                                        <label
                                          key={oi}
                                          className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-sm ${q.correctIndex === oi ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"}`}
                                        >
                                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                                            {autoLetters(oi)}
                                          </span>
                                          <input
                                            value={opt}
                                            onChange={(e) =>
                                              updateReading((b) => {
                                                const p =
                                                  b.reading.passages.find(
                                                    (x) =>
                                                      x.id === activePassageId,
                                                  );
                                                const qq = p?.groups
                                                  .find((x) => x.id === g.id)
                                                  ?.questions.find(
                                                    (x) => x.id === q.id,
                                                  );
                                                if (qq && qq.options)
                                                  qq.options[oi] =
                                                    e.target.value;
                                              })
                                            }
                                            className="flex-1 bg-transparent text-sm outline-none"
                                          />
                                          <input
                                            type="radio"
                                            name={`mc-${g.id}-${q.id}`}
                                            checked={q.correctIndex === oi}
                                            onChange={() =>
                                              updateReading((b) => {
                                                const p =
                                                  b.reading.passages.find(
                                                    (x) =>
                                                      x.id === activePassageId,
                                                  );
                                                const qq = p?.groups
                                                  .find((x) => x.id === g.id)
                                                  ?.questions.find(
                                                    (x) => x.id === q.id,
                                                  );
                                                if (qq) qq.correctIndex = oi;
                                              })
                                            }
                                            className="accent-emerald-600"
                                          />
                                        </label>
                                      ))}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          updateReading((b) => {
                                            const p = b.reading.passages.find(
                                              (x) => x.id === activePassageId,
                                            );
                                            const qq = p?.groups
                                              .find((x) => x.id === g.id)
                                              ?.questions.find(
                                                (x) => x.id === q.id,
                                              );
                                            if (qq) {
                                              qq.options = qq.options || [];
                                              if (qq.options.length < 6)
                                                qq.options.push(
                                                  `Option ${autoLetters(qq.options.length)}`,
                                                );
                                            }
                                          })
                                        }
                                      >
                                        <Plus className="h-3 w-3" />
                                        Option
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          updateReading((b) => {
                                            const p = b.reading.passages.find(
                                              (x) => x.id === activePassageId,
                                            );
                                            const qq = p?.groups
                                              .find((x) => x.id === g.id)
                                              ?.questions.find(
                                                (x) => x.id === q.id,
                                              );
                                            if (
                                              qq?.options &&
                                              qq.options.length > 2
                                            )
                                              qq.options.pop();
                                          })
                                        }
                                      >
                                        — Olib tashlash
                                      </Button>
                                      <span className="ml-auto text-xs text-slate-400">
                                        A/B/C/D avtomatik
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {(q.type === "true-false-not-given" ||
                                  q.type === "yes-no-not-given" ||
                                  q.type === "true-false") && (
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-500">
                                      Correct:
                                    </span>
                                    {(q.type === "yes-no-not-given"
                                      ? ["YES", "NO", "NOT GIVEN"]
                                      : ["TRUE", "FALSE", "NOT GIVEN"]
                                    ).map((opt, oi) => (
                                      <label
                                        key={opt}
                                        className={`flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${q.correctIndex === oi ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white"}`}
                                      >
                                        <input
                                          type="radio"
                                          name={`tf-${q.id}`}
                                          checked={q.correctIndex === oi}
                                          onChange={() =>
                                            updateReading((b) => {
                                              const p = b.reading.passages.find(
                                                (x) => x.id === activePassageId,
                                              );
                                              const qq = p?.groups
                                                .find((x) => x.id === g.id)
                                                ?.questions.find(
                                                  (x) => x.id === q.id,
                                                );
                                              if (qq) qq.correctIndex = oi;
                                            })
                                          }
                                          className="accent-emerald-600"
                                        />
                                        {opt}
                                      </label>
                                    ))}
                                  </div>
                                )}

                                {[
                                  "sentence-completion",
                                  "summary-completion",
                                  "note-completion",
                                  "table-completion",
                                  "flowchart-completion",
                                  "diagram-label",
                                  "short-answer",
                                  "fill-blank",
                                ].includes(q.type) && (
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    <div>
                                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                        Answer
                                      </label>
                                      <input
                                        value={q.correctAnswer || ""}
                                        onChange={(e) =>
                                          updateReading((b) => {
                                            const p = b.reading.passages.find(
                                              (x) => x.id === activePassageId,
                                            );
                                            const qq = p?.groups
                                              .find((x) => x.id === g.id)
                                              ?.questions.find(
                                                (x) => x.id === q.id,
                                              );
                                            if (qq)
                                              qq.correctAnswer = e.target.value;
                                          })
                                        }
                                        placeholder="environment"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                      />
                                      <p className="mt-1 text-[11px] text-slate-400">
                                        Word limit UI:{" "}
                                        <span className="font-bold text-amber-600">
                                          {q.wordLimit || g.wordLimit || "—"}
                                        </span>
                                      </p>
                                    </div>
                                    <div>
                                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                        Alternative accepted answers (comma)
                                      </label>
                                      <input
                                        value={(
                                          q.alternativeAnswers || []
                                        ).join(", ")}
                                        onChange={(e) =>
                                          updateReading((b) => {
                                            const p = b.reading.passages.find(
                                              (x) => x.id === activePassageId,
                                            );
                                            const qq = p?.groups
                                              .find((x) => x.id === g.id)
                                              ?.questions.find(
                                                (x) => x.id === q.id,
                                              );
                                            if (qq)
                                              qq.alternativeAnswers =
                                                e.target.value
                                                  .split(",")
                                                  .map((s) => s.trim())
                                                  .filter(Boolean);
                                          })
                                        }
                                        placeholder="environment, the environment"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                      />
                                    </div>
                                  </div>
                                )}

                                {q.type === "matching-headings" && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-500">
                                      Correct heading:
                                    </span>
                                    <select
                                      value={q.correctAnswer || ""}
                                      onChange={(e) =>
                                        updateReading((b) => {
                                          const p = b.reading.passages.find(
                                            (x) => x.id === activePassageId,
                                          );
                                          const qq = p?.groups
                                            .find((x) => x.id === g.id)
                                            ?.questions.find(
                                              (x) => x.id === q.id,
                                            );
                                          if (qq)
                                            qq.correctAnswer = e.target.value;
                                        })
                                      }
                                      className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                    >
                                      <option value="">— tanlang —</option>
                                      {(g.headingList || []).map((h, hi) => (
                                        <option
                                          key={hi}
                                          value={
                                            [
                                              "i",
                                              "ii",
                                              "iii",
                                              "iv",
                                              "v",
                                              "vi",
                                              "vii",
                                              "viii",
                                            ][hi]
                                          }
                                        >
                                          {
                                            [
                                              "i",
                                              "ii",
                                              "iii",
                                              "iv",
                                              "v",
                                              "vi",
                                              "vii",
                                              "viii",
                                            ][hi]
                                          }{" "}
                                          — {h.slice(0, 40)}
                                        </option>
                                      ))}
                                    </select>
                                    <span className="text-xs text-slate-400">
                                      select orqali (drag & drop preview da)
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <input
                                    value={q.explanation || ""}
                                    onChange={(e) =>
                                      updateReading((b) => {
                                        const p = b.reading.passages.find(
                                          (x) => x.id === activePassageId,
                                        );
                                        const qq = p?.groups
                                          .find((x) => x.id === g.id)
                                          ?.questions.find(
                                            (x) => x.id === q.id,
                                          );
                                        if (qq) qq.explanation = e.target.value;
                                      })
                                    }
                                    placeholder="Explanation (ixtiyoriy)..."
                                    className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                                  />
                                  <button
                                    onClick={() =>
                                      updateReading((b) => {
                                        const p = b.reading.passages.find(
                                          (x) => x.id === activePassageId,
                                        );
                                        const gg = p?.groups.find(
                                          (x) => x.id === g.id,
                                        );
                                        if (gg)
                                          gg.questions = gg.questions.filter(
                                            (x) => x.id !== q.id,
                                          );
                                      })
                                    }
                                    className="rounded-lg p-1 text-rose-500 hover:bg-rose-50"
                                    title="Delete question"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========== LISTENING ========== */}
      {module === "listening" && activeListening && (
        <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Sections — Audio → Part
              </h3>
              <Button size="sm" variant="outline" onClick={listeningAddPart}>
                <Plus className="h-3.5 w-3.5" />
                Section
              </Button>
            </div>
            {builder.listening.parts.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveListeningId(s.id)}
                className={`cursor-pointer rounded-2xl border p-3 ${s.id === activeListeningId ? "border-violet-600 bg-violet-50 dark:bg-violet-950/30" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}
              >
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {s.title}
                </p>
                <p className="text-xs text-slate-500">
                  {s.groups.reduce((a, g) => a + g.questions.length, 0)} q ·{" "}
                  {s.audioName || "audio yo‘q"} ·{" "}
                  {s.audioDurationSec
                    ? Math.round(s.audioDurationSec / 60) + " min"
                    : ""}
                </p>
                <div className="mt-2 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      listeningDup(s.id);
                    }}
                    className="rounded p-1 hover:bg-white"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        builder.listening.parts.length > 1 &&
                        confirm("O‘chirilsinmi?")
                      )
                        updateReading(
                          (b) =>
                            (b.listening.parts = b.listening.parts.filter(
                              (x) => x.id !== s.id,
                            )),
                        );
                    }}
                    className="rounded p-1 text-rose-600 hover:bg-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-3 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <input
                    value={activeListening.title}
                    onChange={(e) =>
                      updateReading((b) => {
                        const s = b.listening.parts.find(
                          (x) => x.id === activeListeningId,
                        );
                        if (s) s.title = e.target.value;
                      })
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold dark:border-slate-800 dark:bg-slate-900"
                  />
                  <Badge tone="violet">
                    {activeListening.groups.reduce(
                      (a, g) => a + g.questions.length,
                      0,
                    )}{" "}
                    questions
                  </Badge>
                </div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Instructions
                </label>
                <input
                  value={activeListening.instructions}
                  onChange={(e) =>
                    updateReading((b) => {
                      const s = b.listening.parts.find(
                        (x) => x.id === activeListeningId,
                      );
                      if (s) s.instructions = e.target.value;
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                />

                {/* Audio upload + player */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <p className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <AudioLines className="h-4 w-4" />
                    Audio upload — admin panelning o‘zida player
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-violet-700">
                      Audio tanlash
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const url = URL.createObjectURL(f);
                          updateReading((b) => {
                            const s = b.listening.parts.find(
                              (x) => x.id === activeListeningId,
                            );
                            if (s) {
                              s.audioUrl = url;
                              s.audioName = f.name;
                            }
                          });
                          // try get duration
                          const audio = new Audio(url);
                          audio.onloadedmetadata = () =>
                            updateReading((b) => {
                              const s = b.listening.parts.find(
                                (x) => x.id === activeListeningId,
                              );
                              if (s)
                                s.audioDurationSec = Math.round(audio.duration);
                            });
                        }}
                      />
                    </label>
                    {activeListening.audioUrl && (
                      <audio
                        controls
                        src={activeListening.audioUrl}
                        className="h-8 flex-1"
                      />
                    )}
                    {activeListening.audioDurationSec && (
                      <Badge tone="slate">
                        {Math.floor(activeListening.audioDurationSec / 60)}:
                        {String(activeListening.audioDurationSec % 60).padStart(
                          2,
                          "0",
                        )}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Transcript (audio bilan birga boshqariladi)
                  </label>
                  <textarea
                    value={activeListening.transcript || ""}
                    onChange={(e) =>
                      updateReading((b) => {
                        const s = b.listening.parts.find(
                          (x) => x.id === activeListeningId,
                        );
                        if (s) s.transcript = e.target.value;
                      })
                    }
                    rows={4}
                    placeholder="Transcript..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Question Groups — audio + questions
                </h4>
                <div className="flex flex-wrap gap-1">
                  {IELTS_QUESTION_TYPES.slice(0, 6).map((t) => (
                    <button
                      key={t.value}
                      onClick={() =>
                        listeningAddGroup(activeListeningId, t.value)
                      }
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900"
                    >
                      {t.short}
                    </button>
                  ))}
                </div>
              </div>
              {activeListening.groups.length === 0 && (
                <Card className="p-6 text-center text-sm text-slate-500">
                  Hali group yo‘q — yuqoridan type tanlang
                </Card>
              )}
              {activeListening.groups.map((g) => (
                <Card key={g.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge tone="violet">
                        {getQuestionTypeLabel(g.type)}
                      </Badge>
                      <Badge tone="slate">
                        Q
                        {g.questions
                          .map((q) => listeningNumberMap.get(q.id))
                          .join(", ")}
                      </Badge>
                    </div>
                    <button
                      onClick={() =>
                        updateReading((b) => {
                          const s = b.listening.parts.find(
                            (x) => x.id === activeListeningId,
                          );
                          if (s)
                            s.groups = s.groups.filter((x) => x.id !== g.id);
                        })
                      }
                      className="rounded p-1 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    value={g.instructions}
                    onChange={(e) =>
                      updateReading((b) => {
                        const s = b.listening.parts.find(
                          (x) => x.id === activeListeningId,
                        );
                        const gg = s?.groups.find((x) => x.id === g.id);
                        if (gg) gg.instructions = e.target.value;
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                  <div className="mt-2 space-y-1.5">
                    {g.questions.map((q) => {
                      const num = listeningNumberMap.get(q.id);
                      return (
                        <div
                          key={q.id}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800/30"
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                            {num}
                          </span>
                          <input
                            value={q.prompt}
                            onChange={(e) =>
                              updateReading((b) => {
                                const s = b.listening.parts.find(
                                  (x) => x.id === activeListeningId,
                                );
                                const qq = s?.groups
                                  .find((x) => x.id === g.id)
                                  ?.questions.find((x) => x.id === q.id);
                                if (qq) qq.prompt = e.target.value;
                              })
                            }
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                            placeholder="Question..."
                          />
                          <input
                            value={q.correctAnswer || ""}
                            onChange={(e) =>
                              updateReading((b) => {
                                const s = b.listening.parts.find(
                                  (x) => x.id === activeListeningId,
                                );
                                const qq = s?.groups
                                  .find((x) => x.id === g.id)
                                  ?.questions.find((x) => x.id === q.id);
                                if (qq) qq.correctAnswer = e.target.value;
                              })
                            }
                            placeholder="Answer"
                            className="w-28 rounded-lg border border-emerald-200 bg-white px-2 py-1 text-xs dark:border-emerald-800 dark:bg-slate-900"
                          />
                          <button
                            onClick={() =>
                              updateReading((b) => {
                                const s = b.listening.parts.find(
                                  (x) => x.id === activeListeningId,
                                );
                                const gg = s?.groups.find((x) => x.id === g.id);
                                if (gg)
                                  gg.questions = gg.questions.filter(
                                    (x) => x.id !== q.id,
                                  );
                              })
                            }
                            className="rounded p-1 text-rose-500 hover:bg-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        updateReading((b) => {
                          const s = b.listening.parts.find(
                            (x) => x.id === activeListeningId,
                          );
                          const gg = s?.groups.find((x) => x.id === g.id);
                          if (gg)
                            gg.questions.push(
                              makeEmptyQuestion(gg.type, gg.questions.length),
                            );
                        })
                      }
                    >
                      <Plus className="h-3 w-3" />
                      Savol qo‘shish
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== WRITING ========== */}
      {module === "writing" && activeWriting && (
        <div className="grid gap-4 xl:grid-cols-[260px_1fr]">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Writing — Task 1 / Task 2
            </h3>
            {builder.writing.tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveWritingId(t.id)}
                className={`cursor-pointer rounded-2xl border p-3 ${t.id === activeWritingId ? "border-brand-600 bg-brand-50 dark:bg-brand-950/30" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}
              >
                <p className="text-sm font-bold">
                  Task {t.taskNumber} — {t.type}
                </p>
                <p className="text-xs text-slate-500">
                  {t.prompt.slice(0, 60) || "prompt yo‘q"} · {t.minWords} words
                </p>
              </div>
            ))}
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => writingAdd(1)}>
                <Plus className="h-3 w-3" />
                Task 1
              </Button>
              <Button size="sm" variant="outline" onClick={() => writingAdd(2)}>
                <Plus className="h-3 w-3" />
                Task 2
              </Button>
            </div>
          </div>
          <Card>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center gap-2">
                <Badge tone="brand">
                  Writing Task {activeWriting.taskNumber}
                </Badge>
                <select
                  value={activeWriting.type}
                  onChange={(e) =>
                    writingUpdate(activeWriting.id, {
                      type: e.target.value as WritingTask["type"],
                    })
                  }
                  className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="academic-task1">Academic Task 1</option>
                  <option value="academic-task2">Academic Task 2</option>
                  <option value="gt-task1">GT Task 1</option>
                  <option value="gt-task2">GT Task 2</option>
                </select>
                <select
                  value={activeWriting.difficulty}
                  onChange={(e) =>
                    writingUpdate(activeWriting.id, {
                      difficulty: e.target.value as WritingTask["difficulty"],
                    })
                  }
                  className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Task instruction
                  </label>
                  <input
                    value={activeWriting.instruction}
                    onChange={(e) =>
                      writingUpdate(activeWriting.id, {
                        instruction: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Minimum words
                  </label>
                  <input
                    type="number"
                    value={activeWriting.minWords}
                    onChange={(e) =>
                      writingUpdate(activeWriting.id, {
                        minWords: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Question / prompt
                </label>
                <textarea
                  value={activeWriting.prompt}
                  onChange={(e) =>
                    writingUpdate(activeWriting.id, { prompt: e.target.value })
                  }
                  rows={3}
                  placeholder="You should spend about 20 minutes on this task..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              {/* Image/chart upload for Task 1 */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <ImageIcon className="h-4 w-4" />
                  Image / chart / graph / table upload — Task 1
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                    Rasm tanlash
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = () =>
                          writingUpdate(activeWriting.id, {
                            imageUrl: reader.result as string,
                            imageName: f.name,
                          });
                        reader.readAsDataURL(f);
                      }}
                    />
                  </label>
                  {activeWriting.imageUrl && (
                    <img
                      src={activeWriting.imageUrl}
                      alt="chart"
                      className="max-h-28 rounded-xl border border-slate-200"
                    />
                  )}
                  {activeWriting.imageName && (
                    <span className="text-xs text-slate-500">
                      {activeWriting.imageName}
                    </span>
                  )}
                  {activeWriting.imageUrl && (
                    <button
                      onClick={() =>
                        writingUpdate(activeWriting.id, {
                          imageUrl: undefined,
                          imageName: undefined,
                        })
                      }
                      className="rounded p-1 text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Sample answer
                  </label>
                  <textarea
                    value={activeWriting.sampleAnswer || ""}
                    onChange={(e) =>
                      writingUpdate(activeWriting.id, {
                        sampleAnswer: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Band 9 sample answer..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Band criteria
                  </label>
                  <textarea
                    value={activeWriting.bandCriteria || ""}
                    onChange={(e) =>
                      writingUpdate(activeWriting.id, {
                        bandCriteria: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Task Achievement 9 | Coherence 9 | Lexical 8 | Grammar 8..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm("Task o‘chirilsinmi?"))
                      updateReading(
                        (b) =>
                          (b.writing.tasks = b.writing.tasks.filter(
                            (x) => x.id !== activeWriting.id,
                          )),
                      );
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const clone = JSON.parse(
                      JSON.stringify(activeWriting),
                    ) as WritingTask;
                    clone.id = randomId("wtask");
                    clone.prompt = clone.prompt + " (copy)";
                    updateReading((b) => b.writing.tasks.push(clone));
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========== SPEAKING ========== */}
      {module === "speaking" && activeSpeaking && (
        <div className="grid gap-4 xl:grid-cols-[260px_1fr]">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Speaking — Part 1 → Part 2 → Part 3
            </h3>
            {builder.speaking.parts
              .sort((a, b) => a.part - b.part)
              .map((p) => (
                <div
                  key={p.id}
                  onClick={() => setActiveSpeakingId(p.id)}
                  className={`cursor-pointer rounded-2xl border p-3 ${p.id === activeSpeakingId ? "border-amber-600 bg-amber-50 dark:bg-amber-950/30" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}
                >
                  <p className="text-sm font-bold">
                    Part {p.part} — {p.topic.slice(0, 28)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.questions.length} q · prep {p.prepTimeSec}s · speak{" "}
                    {p.speakingTimeSec}s
                  </p>
                </div>
              ))}
          </div>
          <Card>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    activeSpeaking.part === 1
                      ? "amber"
                      : activeSpeaking.part === 2
                        ? "brand"
                        : "violet"
                  }
                >
                  Part {activeSpeaking.part}
                </Badge>
                <input
                  value={activeSpeaking.topic}
                  onChange={(e) =>
                    speakingUpdate(activeSpeaking.id, { topic: e.target.value })
                  }
                  placeholder="Topic"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              {activeSpeaking.part === 2 ? (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Cue card
                    </label>
                    <textarea
                      value={activeSpeaking.cueCard || ""}
                      onChange={(e) =>
                        speakingUpdate(activeSpeaking.id, {
                          cueCard: e.target.value,
                        })
                      }
                      rows={4}
                      placeholder="Describe a ... You should say:"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Preparation time (sec)
                      </label>
                      <input
                        type="number"
                        value={activeSpeaking.prepTimeSec}
                        onChange={(e) =>
                          speakingUpdate(activeSpeaking.id, {
                            prepTimeSec: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Speaking time (sec)
                      </label>
                      <input
                        type="number"
                        value={activeSpeaking.speakingTimeSec}
                        onChange={(e) =>
                          speakingUpdate(activeSpeaking.id, {
                            speakingTimeSec: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Speaking time per answer (sec)
                    </label>
                    <input
                      type="number"
                      value={activeSpeaking.speakingTimeSec}
                      onChange={(e) =>
                        speakingUpdate(activeSpeaking.id, {
                          speakingTimeSec: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Preparation time (sec)
                    </label>
                    <input
                      type="number"
                      value={activeSpeaking.prepTimeSec || 0}
                      onChange={(e) =>
                        speakingUpdate(activeSpeaking.id, {
                          prepTimeSec: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {activeSpeaking.part === 2
                    ? "Follow-up questions"
                    : "Questions"}
                </label>
                <div className="space-y-1.5">
                  {activeSpeaking.questions.map((q, qi) => (
                    <div key={qi} className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                        {qi + 1}
                      </span>
                      <input
                        value={q}
                        onChange={(e) => {
                          const next = [...activeSpeaking.questions];
                          next[qi] = e.target.value;
                          speakingUpdate(activeSpeaking.id, {
                            questions: next,
                          });
                        }}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                      />
                      <button
                        onClick={() =>
                          speakingUpdate(activeSpeaking.id, {
                            questions: activeSpeaking.questions.filter(
                              (_, i) => i !== qi,
                            ),
                          })
                        }
                        className="rounded p-1 text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      speakingUpdate(activeSpeaking.id, {
                        questions: [
                          ...activeSpeaking.questions,
                          "New question",
                        ],
                      })
                    }
                  >
                    <Plus className="h-3 w-3" />
                    Question qo‘shish
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview modal — student real IELTS interface */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Eye className="h-4 w-4" />
                Preview as Student — real IELTS interfeysi
              </p>
              <div className="flex items-center gap-2">
                <Badge tone="slate">{module}</Badge>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="max-h-[75vh] overflow-y-auto p-4">
              {module === "reading" && activePassage && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {activePassage.passageLabel}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
                      {activePassage.title}
                    </h3>
                    <div
                      className="prose prose-sm mt-3 max-w-none text-slate-700 dark:text-slate-300"
                      dangerouslySetInnerHTML={{
                        __html:
                          activePassage.text ||
                          '<p class="text-slate-400">Passage bo‘sh</p>',
                      }}
                    />
                  </div>
                  <div className="space-y-3">
                    {activePassage.groups.map((g) => {
                      const range = readingNumberMap.groupRange.get(g.id);
                      return (
                        <div
                          key={g.id}
                          className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                        >
                          <p className="text-xs font-bold text-violet-700">
                            {range
                              ? `Questions ${range.start}–${range.end}`
                              : ""}{" "}
                            — {g.instructions}
                          </p>
                          {g.wordLimit && (
                            <p className="text-xs font-bold text-amber-600">
                              {g.wordLimit}
                            </p>
                          )}
                          {g.headingList && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {g.headingList.map((h, hi) => (
                                <span
                                  key={hi}
                                  className="rounded-full bg-slate-100 px-2 py-0.5 text-xs"
                                >
                                  {
                                    [
                                      "i",
                                      "ii",
                                      "iii",
                                      "iv",
                                      "v",
                                      "vi",
                                      "vii",
                                      "viii",
                                    ][hi]
                                  }
                                  . {h}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-2 space-y-1.5">
                            {g.questions.map((q) => {
                              const num = readingNumberMap.map.get(q.id);
                              return (
                                <div
                                  key={q.id}
                                  className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-800/50"
                                >
                                  <p className="text-sm font-medium">
                                    <span className="mr-1 font-bold">
                                      {num}.
                                    </span>
                                    {q.prompt}
                                  </p>
                                  {q.options && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {q.options.map((o, oi) => (
                                        <span
                                          key={oi}
                                          className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs"
                                        >
                                          {autoLetters(oi)}. {o}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {(q.type.includes("completion") ||
                                    q.type === "short-answer") && (
                                    <div className="mt-1 h-8 rounded-lg border border-dashed border-slate-300 bg-white" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {module === "listening" && activeListening && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-violet-600 p-4 text-white">
                    <p className="font-bold">
                      {activeListening.title} — {activeListening.instructions}
                    </p>
                    {activeListening.audioUrl && (
                      <audio
                        controls
                        src={activeListening.audioUrl}
                        className="mt-2 w-full"
                      />
                    )}
                    {activeListening.transcript && (
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer font-semibold">
                          Transcript
                        </summary>
                        <p className="mt-1 whitespace-pre-wrap">
                          {activeListening.transcript}
                        </p>
                      </details>
                    )}
                  </div>
                  {activeListening.groups.map((g) => (
                    <div
                      key={g.id}
                      className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                    >
                      <p className="text-xs font-bold">{g.instructions}</p>
                      <div className="mt-2 space-y-1">
                        {g.questions.map((q) => (
                          <p key={q.id} className="text-sm">
                            {q.prompt}{" "}
                            <span className="rounded border border-dashed px-2 py-0.5 text-xs">
                              ______
                            </span>
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {module === "writing" && activeWriting && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <Badge tone="brand">
                      Task {activeWriting.taskNumber} — {activeWriting.minWords}{" "}
                      words min
                    </Badge>
                    <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                      {activeWriting.prompt}
                    </p>
                    {activeWriting.imageUrl && (
                      <img
                        src={activeWriting.imageUrl}
                        alt="task"
                        className="mt-3 max-h-64 rounded-xl border"
                      />
                    )}
                    <p className="mt-2 text-xs text-slate-500">
                      {activeWriting.instruction}
                    </p>
                    <div className="mt-3 h-32 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-2 text-xs text-slate-400">
                      Student writing area...
                    </div>
                  </div>
                </div>
              )}
              {module === "speaking" && activeSpeaking && (
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <Badge tone="amber">Part {activeSpeaking.part}</Badge>
                  <h3 className="mt-2 font-bold">{activeSpeaking.topic}</h3>
                  {activeSpeaking.cueCard && (
                    <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
                      {activeSpeaking.cueCard}
                    </pre>
                  )}
                  <div className="mt-3 space-y-1">
                    {activeSpeaking.questions.map((q, i) => (
                      <p key={i} className="text-sm">
                        {i + 1}. {q}
                      </p>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Prep {activeSpeaking.prepTimeSec}s · Speak{" "}
                    {activeSpeaking.speakingTimeSec}s
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
              <Button
                variant="ghost"
                onClick={() => setShowPreviewModal(false)}
              >
                Yopish
              </Button>
              <Button
                onClick={() => {
                  setPreviewMode("edit");
                  setShowPreviewModal(false);
                }}
              >
                <Edit3 className="h-4 w-4" />
                Edit ga qaytish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
