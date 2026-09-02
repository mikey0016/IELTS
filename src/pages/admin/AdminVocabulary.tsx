import { useEffect, useState } from "react";
import {
  adminListWords,
  adminCreateWord,
  adminUpdateWord,
  adminDeleteWord,
} from "@/api/admin";
import type { VocabularyWord } from "@/types";
import { Search, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const EMPTY: Omit<VocabularyWord, "id"> = {
  word: "",
  meaning: "",
  example: "",
  band: 6,
  topic: "general",
  difficulty: "medium",
  partOfSpeech: "noun",
  phonetic: "",
  synonyms: [],
};

export function AdminVocabulary() {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<VocabularyWord | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<VocabularyWord, "id">>(EMPTY);

  const load = async () => {
    setLoading(true);
    const data = await adminListWords();
    setWords(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = words.filter(
    (w) =>
      w.word.toLowerCase().includes(query.toLowerCase()) ||
      w.meaning.toLowerCase().includes(query.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!form.word || !form.meaning) return;
    await adminCreateWord(form);
    setForm(EMPTY);
    setCreating(false);
    load();
  };

  const handleUpdate = async () => {
    if (!editing) return;
    await adminUpdateWord(editing.id, editing);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this word?")) {
      await adminDeleteWord(id);
      load();
    }
  };

  if (loading)
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Vocabulary
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage vocabulary deck
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search words..."
              className="h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <Button onClick={() => setCreating(true)}>Add Word</Button>
        </div>
      </div>

      {(creating || editing) && (
        <Card className="p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            {creating ? "New Word" : "Edit Word"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Word
              </label>
              <input
                value={form.word}
                onChange={(e) => setForm({ ...form, word: e.target.value })}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Meaning
              </label>
              <input
                value={form.meaning}
                onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Example
              </label>
              <input
                value={form.example}
                onChange={(e) => setForm({ ...form, example: e.target.value })}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Topic
              </label>
              <input
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Band
              </label>
              <input
                type="number"
                value={form.band}
                onChange={(e) =>
                  setForm({ ...form, band: Number(e.target.value) })
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={creating ? handleCreate : handleUpdate}>
              {creating ? "Create" : "Save"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setCreating(false);
                setEditing(null);
                setForm(EMPTY);
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Word
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Meaning
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Topic
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Band
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr
                  key={w.id}
                  className="border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {w.word}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {w.meaning}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="brand">{w.topic}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {w.band}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditing(w);
                          setForm(w);
                          setCreating(false);
                        }}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-brand hover:bg-brand/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
