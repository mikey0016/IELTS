import { useEffect, useState, useRef, useCallback } from "react";
import {
  adminListQuestions,
  adminCreateQuestion,
  adminUpdateQuestion,
  adminDeleteQuestion,
} from "@/api/admin";
import type { Question } from "@/types";
import {
  Search,
  Plus,
  Trash2,
  Upload,
  Image,
  FileText,
  Edit3,
  Timer,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import { parseHtmlTask, type ParsedHtmlTask } from "@/lib/htmlTaskParser";

const EMPTY: Omit<Question, "id"> = {
  skill: "reading",
  type: "multiple-choice",
  topic: "",
  difficulty: "medium",
  timeLimitSec: 120,
  passage: "",
  passageLabel: "",
  prompt: "",
  explanation: "",
  recommendLesson: "",
};

export function AdminQuestions() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Question, "id">>(EMPTY);
  const [htmlPreview, setHtmlPreview] = useState<ParsedHtmlTask | null>(null);
  const [htmlError, setHtmlError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({
    current: 0,
    total: 0,
  });
  const [expandedPassage, setExpandedPassage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showSplitPreview, setShowSplitPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const load = async () => {
    setLoading(true);
    const data = await adminListQuestions();
    setQuestions(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = questions.filter(
    (q) =>
      q.topic.toLowerCase().includes(query.toLowerCase()) ||
      q.prompt.toLowerCase().includes(query.toLowerCase()) ||
      (q.passageLabel &&
        q.passageLabel.toLowerCase().includes(query.toLowerCase())),
  );

  // Group by passage — bitta passage/section = bitta task (savollarga bo'linmaydi)
  const grouped = (() => {
    const map = new Map<
      string,
      {
        key: string;
        topic: string;
        passageLabel?: string;
        passage?: string;
        skill: Question["skill"];
        questions: Question[];
      }
    >();
    for (const q of filtered) {
      const passageKey = (q.passage || "").slice(0, 2000);
      const key = `${passageKey}__${q.topic}__${q.passageLabel || ""}__${q.skill}`;
      if (!map.has(key))
        map.set(key, {
          key,
          topic: q.topic,
          passageLabel: q.passageLabel,
          passage: q.passage,
          skill: q.skill,
          questions: [],
        });
      map.get(key)!.questions.push(q);
    }
    return Array.from(map.values()).sort(
      (a, b) => b.questions.length - a.questions.length,
    );
  })();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
    setCreating(false);
    setHtmlPreview(null);
    setHtmlError(null);
    setShowSplitPreview(false);
  };

  const startCreate = () => {
    resetForm();
    setCreating(true);
  };

  const startEdit = (q: Question) => {
    setForm(q);
    setEditingId(q.id);
    setCreating(false);
    setHtmlPreview(null);
    setHtmlError(null);
  };

  const processHtmlContent = useCallback(
    (html: string) => {
      setHtmlError(null);
      if (!html.trim()) {
        setHtmlError("Fayl bo'sh yoki o'qib bo'lmadi");
        return;
      }
      try {
        const parsed = parseHtmlTask(html);
        if (!parsed) {
          setHtmlError(
            "HTML dan savollar ajratib bo'lmadi — formatni tekshiring (Dolls kabi passageContent kerak)",
          );
          return;
        }
        if (parsed.questions.length === 0) {
          setHtmlError("Savollar topilmadi");
          return;
        }
        setHtmlPreview(parsed);
        setForm((prev) => ({
          ...prev,
          skill: parsed.defaultSkill,
          topic: parsed.defaultTopic,
          passage: parsed.passageText,
          passageLabel: parsed.passageLabel || prev.passageLabel,
        }));
        setShowSplitPreview(true);
        toast(
          `Topildi: ${parsed.questions.length} ta savol · "${parsed.defaultTopic}" · ${parsed.passageLabel}`,
          "success",
        );
      } catch (err) {
        setHtmlError(err instanceof Error ? err.message : "Parse xatosi");
        setHtmlPreview(null);
      }
    },
    [toast],
  );

  const handleFile = useCallback(
    (file: File) => {
      if (file.size === 0) {
        setHtmlError("Fayl bo'sh");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        processHtmlContent(text);
      };
      reader.onerror = () => setHtmlError("Faylni o'qib bo'lmadi");
      reader.readAsText(file);
    },
    [processHtmlContent],
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      setForm((prev) => ({
        ...prev,
        passage: dataUrl,
        passageLabel: prev.passageLabel || "Image passage",
      }));
      toast("Rasm yuklandi");
    };
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleTextPaste = () => {
    const text = textInputRef.current?.value || "";
    if (!text.trim()) {
      setHtmlError("HTML ni paste qiling");
      return;
    }
    processHtmlContent(text);
  };

  const handleImportAll = async () => {
    if (!htmlPreview) return;
    // Deduplicate: bitta savol bir necha bor tushmasligi uchun
    const seen = new Set<string>();
    const uniqueQuestions = htmlPreview.questions.filter((q) => {
      const key = `${q.prompt}::${q.type}::${q.correctAnswer || ""}::${q.correctIndex ?? ""}::${(q.options || []).join("|")}`;
      if (seen.has(key)) return false;
      seen.add(key);
      const exists = questions.some(
        (eq) =>
          eq.topic === htmlPreview.defaultTopic &&
          eq.prompt === q.prompt &&
          eq.type === q.type,
      );
      if (exists) return false;
      return true;
    });
    if (uniqueQuestions.length === 0) {
      toast(
        "Barcha savollar allaqachon mavjud — takror import qilinmadi",
        "info",
      );
      return;
    }
    if (uniqueQuestions.length !== htmlPreview.questions.length) {
      toast(
        `${htmlPreview.questions.length - uniqueQuestions.length} ta takroriy savol tashlab yuborildi`,
        "info",
      );
    }
    setImporting(true);
    setImportProgress({ current: 0, total: uniqueQuestions.length });
    let ok = 0;
    for (let i = 0; i < uniqueQuestions.length; i++) {
      const q = uniqueQuestions[i];
      try {
        await adminCreateQuestion({
          skill: htmlPreview.defaultSkill,
          type: q.type,
          topic: htmlPreview.defaultTopic,
          difficulty: q.difficulty,
          timeLimitSec: q.timeLimitSec,
          passage: htmlPreview.passageText,
          passageLabel: htmlPreview.passageLabel,
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          correctAnswer: q.correctAnswer,
          explanation:
            q.explanation ||
            `Correct: ${q.correctAnswer ?? q.options?.[q.correctIndex ?? -1] ?? "-"}`,
          recommendLesson: htmlPreview.defaultTopic,
        });
        ok++;
      } catch (e) {
        // skip duplicates etc.
      }
      setImportProgress({
        current: i + 1,
        total: htmlPreview.questions.length,
      });
    }
    setImporting(false);
    toast(`${ok} ta savol qo'shildi!`, "success");
    setHtmlPreview(null);
    setShowSplitPreview(false);
    resetForm();
    load();
  };

  const handleCreate = async () => {
    if (!form.topic || !form.prompt) {
      toast("Topic va prompt majburiy", "error");
      return;
    }
    await adminCreateQuestion(form);
    toast("Savol yaratildi", "success");
    resetForm();
    load();
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    await adminUpdateQuestion(editingId, form);
    toast("Yangilandi", "success");
    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Savolni o'chirish?")) {
      await adminDeleteQuestion(id);
      toast("O'chirildi", "success");
      load();
    }
  };
  const handleDeleteGroup = async (group: {
    key: string;
    questions: Question[];
  }) => {
    if (
      !confirm(
        `Bitta passage/task o'chirilsinmi? ${group.questions.length} ta savol o'chadi.`,
      )
    )
      return;
    for (const q of group.questions) {
      await adminDeleteQuestion(q.id);
    }
    toast(`${group.questions.length} ta savol o'chirildi`, "success");
    load();
  };

  if (loading)
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Tasks
          </h1>
          <p className="text-sm text-slate-500">
            Faqat Passage / Section / Part / Task — bitta HTML = bitta butun
            task
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search task..."
              className="h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4" /> Task qo'shish
          </Button>
        </div>
      </div>

      {(creating || editingId) && (
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-white">
                  <Upload className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingId
                      ? "Task ni tahrirlash"
                      : "Yangi Passage / Section / Part / Task qo'shish"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Faqat HTML fayl orqali — bitta passage/section/part/task bir
                    butun
                  </p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {editingId && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Topic
                  </label>
                  <input
                    value={form.topic}
                    onChange={(e) =>
                      setForm({ ...form, topic: e.target.value })
                    }
                    placeholder="Dolls through the ages"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Passage / Section Label
                  </label>
                  <input
                    value={form.passageLabel || ""}
                    onChange={(e) =>
                      setForm({ ...form, passageLabel: e.target.value })
                    }
                    placeholder="Reading Passage 1 / Listening Section 1"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Skill
                  </label>
                  <select
                    value={form.skill}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        skill: e.target.value as Question["skill"],
                      })
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="reading">Reading</option>
                    <option value="listening">Listening</option>
                  </select>
                </div>
              </div>
            )}

            {false && !htmlPreview && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Topic
                    </label>
                    <input
                      value={form.topic}
                      onChange={(e) =>
                        setForm({ ...form, topic: e.target.value })
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Skill
                    </label>
                    <select
                      value={form.skill}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          skill: e.target.value as Question["skill"],
                        })
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="listening">Listening</option>
                      <option value="reading">Reading</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Type
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          type: e.target.value as Question["type"],
                        })
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="true-false">True/False</option>
                      <option value="fill-blank">Fill Blank</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Difficulty
                    </label>
                    <select
                      value={form.difficulty}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          difficulty: e.target.value as Question["difficulty"],
                        })
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Duration (min)
                    </label>
                    <div className="relative">
                      <Timer className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        value={Math.round(form.timeLimitSec / 60)}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            timeLimitSec: Math.max(
                              1,
                              Number(e.target.value) * 60,
                            ),
                          })
                        }
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Passage Label
                    </label>
                    <input
                      value={form.passageLabel || ""}
                      onChange={(e) =>
                        setForm({ ...form, passageLabel: e.target.value })
                      }
                      placeholder="e.g. Passage 1 — Climate Change"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Passage Text
                  </label>
                  <textarea
                    value={form.passage || ""}
                    onChange={(e) =>
                      setForm({ ...form, passage: e.target.value })
                    }
                    rows={6}
                    placeholder="Paste passage text here..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Question
                  </label>
                  <textarea
                    value={form.prompt}
                    onChange={(e) =>
                      setForm({ ...form, prompt: e.target.value })
                    }
                    rows={3}
                    placeholder="Enter question..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Explanation
                  </label>
                  <textarea
                    value={form.explanation}
                    onChange={(e) =>
                      setForm({ ...form, explanation: e.target.value })
                    }
                    rows={2}
                    placeholder="Explanation..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={creating ? handleCreate : handleUpdate}>
                    {creating ? "Create" : "Save"}
                  </Button>
                  <Button variant="ghost" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {creating && (
              <div className="space-y-4">
                {/* Drag & drop zone — faqat passage/section/part/task */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={() => setDragOver(false)}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${dragOver ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30" : "border-slate-300 bg-slate-50 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800/50"}`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/50">
                    <Upload className="h-7 w-7" />
                  </div>
                  <p className="mt-3 font-display text-base font-bold text-slate-900 dark:text-white">
                    HTML faylni tashlang
                  </p>
                  <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                    Masalan{" "}
                    <span className="font-mono font-bold text-brand-600">
                      Dolls (2).html
                    </span>{" "}
                    kabi IELTS Reading HTML — passage avtomatik chapda, savollar
                    o'ngda ajratiladi
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <label className="cursor-pointer rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-brand-700">
                      Fayl tanlash
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".html,.htm"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-slate-400">
                      yoki sudrab olib keling
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">.html / .htm</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    yoki
                  </span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    HTML ni paste qiling (ixtiyoriy)
                  </label>
                  <textarea
                    ref={textInputRef}
                    rows={4}
                    placeholder="<!DOCTYPE html> ... passageContent ..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                  <Button size="sm" className="mt-2" onClick={handleTextPaste}>
                    <FileText className="h-4 w-4" /> Parse qilish
                  </Button>
                </div>

                {htmlError && (
                  <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {htmlError}
                  </div>
                )}

                {htmlPreview && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                            {htmlPreview.questions.length} ta savol aniqlandi
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-300">
                            {htmlPreview.defaultTopic} ·{" "}
                            {htmlPreview.passageLabel} ·{" "}
                            {htmlPreview.passageText.length} belgi
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSplitPreview((v) => !v)}
                        >
                          <Eye className="h-4 w-4" />{" "}
                          {showSplitPreview ? "Ro'yxat" : "Split ko'rish"}
                        </Button>
                        <Button
                          onClick={handleImportAll}
                          loading={importing}
                          disabled={importing}
                          size="sm"
                        >
                          {importing
                            ? `${importProgress.current}/${importProgress.total}`
                            : `Import ${htmlPreview.questions.length} ta savol`}
                        </Button>
                      </div>
                    </div>
                    {importing && (
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-brand-600 transition-all"
                          style={{
                            width: `${(importProgress.current / Math.max(1, importProgress.total)) * 100}%`,
                          }}
                        />
                      </div>
                    )}

                    {/* Split preview: left passage paragraphs, right questions — mirrors student view */}
                    {showSplitPreview ? (
                      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-800/60">
                          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Student ko'rinishi preview (chapda passage, o'ngda
                            savollar)
                          </span>
                          <Badge tone="cyan">20 min / passage</Badge>
                        </div>
                        <div className="grid max-h-[520px] grid-cols-1 gap-0 overflow-hidden lg:grid-cols-2">
                          <div className="max-h-[520px] overflow-y-auto border-r border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                              {htmlPreview.passageLabel}
                            </p>
                            <h3 className="mt-2 font-display text-base font-bold text-slate-900 dark:text-white">
                              {htmlPreview.defaultTopic}
                            </h3>
                            <div className="mt-3 space-y-3">
                              {(
                                htmlPreview.passageParagraphs ||
                                htmlPreview.passageText.split("\n\n")
                              ).map((para, i) => (
                                <p
                                  key={i}
                                  className="text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                                >
                                  {para}
                                </p>
                              ))}
                            </div>
                          </div>
                          <div className="max-h-[520px] overflow-y-auto space-y-3 bg-white p-4 dark:bg-slate-900">
                            {htmlPreview.questions.map((q, i) => (
                              <div
                                key={i}
                                className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/40">
                                    {i + 1}
                                  </span>
                                  <Badge
                                    tone={
                                      q.type === "true-false"
                                        ? "amber"
                                        : q.type === "fill-blank"
                                          ? "violet"
                                          : "brand"
                                    }
                                    className="text-[10px]"
                                  >
                                    {q.type}
                                  </Badge>
                                  <span className="ml-auto text-[10px] font-semibold text-emerald-600">
                                    {(q.correctAnswer ??
                                    (q.correctIndex !== undefined
                                      ? q.options?.[q.correctIndex]
                                      : ""))
                                      ? `✓ ${q.correctAnswer ?? q.options?.[q.correctIndex ?? -1]}`
                                      : ""}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                                  {q.prompt}
                                </p>
                                {q.options && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {q.options.map((opt, oi) => (
                                      <span
                                        key={opt}
                                        className={`rounded-full border px-2.5 py-1 text-xs ${oi === q.correctIndex ? "border-emerald-300 bg-emerald-50 font-bold text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40" : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800"}`}
                                      >
                                        {opt}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {htmlPreview.questions.map((q, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                              {i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {q.prompt}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <Badge
                                  tone={
                                    q.type === "true-false"
                                      ? "amber"
                                      : q.type === "fill-blank"
                                        ? "violet"
                                        : "brand"
                                  }
                                  className="text-[10px]"
                                >
                                  {q.type}
                                </Badge>
                                {q.correctAnswer && (
                                  <span className="text-xs font-semibold text-emerald-600">
                                    → {q.correctAnswer}
                                  </span>
                                )}
                                {q.correctIndex !== undefined && q.options && (
                                  <span className="text-xs font-semibold text-emerald-600">
                                    → {q.options[q.correctIndex]}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {false && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Upload Passage Image
                  </label>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-300"
                  />
                  {form.passage?.startsWith("data:image") && (
                    <img
                      src={form.passage}
                      alt="Passage"
                      className="mt-3 max-h-48 rounded-xl border border-slate-200 dark:border-slate-800"
                    />
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Question
                  </label>
                  <textarea
                    value={form.prompt}
                    onChange={(e) =>
                      setForm({ ...form, prompt: e.target.value })
                    }
                    rows={3}
                    placeholder="Enter question..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Options (one per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="A) Option 1&#10;B) Option 2"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    onChange={(e) => {
                      const opts = e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      setForm({
                        ...form,
                        options: opts.length > 0 ? opts : undefined,
                      });
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreate}>Create</Button>
                  <Button variant="ghost" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {false && (
              <div className="flex gap-2">
                <Button onClick={creating ? handleCreate : handleUpdate}>
                  {creating ? "Create" : "Save"}
                </Button>
                <Button variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            )}
            {creating && !htmlPreview && !importing && (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={resetForm}>
                  Yopish
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {grouped.length === 0 && !creating && !editingId && (
          <Card className="p-8 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">
              Task yo'q — HTML fayl tashlang, bitta passage = bitta task
            </p>
          </Card>
        )}
        {grouped.map((g) => (
          <div
            key={g.key}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {g.topic || "Untitled"}
                  </span>
                  <Badge
                    tone={g.skill === "listening" ? "violet" : "cyan"}
                    className="text-[10px]"
                  >
                    {g.skill}
                  </Badge>
                  <Badge tone="brand" className="text-[10px]">
                    {g.questions.length} savol
                  </Badge>
                  {g.passageLabel && (
                    <span className="text-xs text-slate-500">
                      · {g.passageLabel}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Array.from(new Set(g.questions.map((q) => q.type))).map(
                    (t) => (
                      <span
                        key={t}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {t}
                      </span>
                    ),
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setExpandedGroup(expandedGroup === g.key ? null : g.key)
                  }
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Savollarni ko'rish"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => startEdit(g.questions[0])}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Task ni tahrirlash"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteGroup(g)}
                  className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                  title="Butun passage/task ni o'chirish"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {g.passage && (
              <button
                onClick={() =>
                  setExpandedPassage(expandedPassage === g.key ? null : g.key)
                }
                className="mt-2 flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                <BookOpen className="h-3 w-3" />{" "}
                {expandedPassage === g.key
                  ? "Passage ni yopish"
                  : `Passage ko'rish (${g.passage.split("\n\n").length} paragraph)`}
              </button>
            )}
            {expandedPassage === g.key && g.passage && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                {g.passage.startsWith("data:image") ? (
                  <img
                    src={g.passage}
                    alt="Passage"
                    className="max-h-40 rounded-lg"
                  />
                ) : (
                  <div className="space-y-2">
                    {g.passage.split("\n\n").map((para, i) => (
                      <p key={i}>
                        {para.slice(0, 300)}
                        {para.length > 300 ? "…" : ""}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
            {expandedGroup === g.key && (
              <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                {g.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/40"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/40">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2">
                        {q.prompt}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          tone={
                            q.type === "true-false"
                              ? "amber"
                              : q.type === "fill-blank"
                                ? "violet"
                                : "brand"
                          }
                          className="text-[10px]"
                        >
                          {q.type}
                        </Badge>
                        {q.correctAnswer && (
                          <span className="text-xs text-emerald-600">
                            → {q.correctAnswer}
                          </span>
                        )}
                        {q.correctIndex !== undefined && q.options && (
                          <span className="text-xs text-emerald-600">
                            → {q.options[q.correctIndex]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs font-semibold text-slate-400">
              Bitta {g.skill} task — {g.questions.length} savol birga, passage
              bo'linmaydi
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
