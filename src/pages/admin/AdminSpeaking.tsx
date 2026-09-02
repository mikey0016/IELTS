import { useEffect, useState } from "react";
import {
  adminListSpeakingPrompts,
  adminCreateSpeakingPrompt,
  adminUpdateSpeakingPrompt,
  adminDeleteSpeakingPrompt,
} from "@/api/admin";
import type { SpeakingPrompt } from "@/types";
import { Search, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const EMPTY: Omit<SpeakingPrompt, "id"> = {
  part: 1,
  difficulty: "medium",
  prepTimeSec: 60,
  speakingTimeSec: 120,
  cueCardTitle: "",
  prompt: "",
  followUps: [],
};

export function AdminSpeaking() {
  const [prompts, setPrompts] = useState<SpeakingPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<SpeakingPrompt | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<SpeakingPrompt, "id">>(EMPTY);

  const load = async () => {
    setLoading(true);
    const data = await adminListSpeakingPrompts();
    setPrompts(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = prompts.filter(
    (p) =>
      p.cueCardTitle.toLowerCase().includes(query.toLowerCase()) ||
      p.prompt.toLowerCase().includes(query.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!form.cueCardTitle || !form.prompt) return;
    await adminCreateSpeakingPrompt(form);
    setForm(EMPTY);
    setCreating(false);
    load();
  };

  const handleUpdate = async () => {
    if (!editing) return;
    await adminUpdateSpeakingPrompt(editing.id, editing);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this prompt?")) {
      await adminDeleteSpeakingPrompt(id);
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
            Speaking Prompts
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage speaking prompts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search prompts..."
              className="h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <Button onClick={() => setCreating(true)}>Add Prompt</Button>
        </div>
      </div>

      {(creating || editing) && (
        <Card className="p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            {creating ? "New Prompt" : "Edit Prompt"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Cue Card Title
              </label>
              <input
                value={form.cueCardTitle}
                onChange={(e) =>
                  setForm({ ...form, cueCardTitle: e.target.value })
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Prompt
              </label>
              <textarea
                value={form.prompt}
                onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                rows={3}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Part
              </label>
              <select
                value={form.part}
                onChange={(e) =>
                  setForm({
                    ...form,
                    part: Number(e.target.value) as SpeakingPrompt["part"],
                  })
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="1">Part 1</option>
                <option value="2">Part 2</option>
                <option value="3">Part 3</option>
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
                    difficulty: e.target.value as SpeakingPrompt["difficulty"],
                  })
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Prep Time (sec)
              </label>
              <input
                type="number"
                value={form.prepTimeSec}
                onChange={(e) =>
                  setForm({ ...form, prepTimeSec: Number(e.target.value) })
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Speaking Time (sec)
              </label>
              <input
                type="number"
                value={form.speakingTimeSec}
                onChange={(e) =>
                  setForm({ ...form, speakingTimeSec: Number(e.target.value) })
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
                  Title
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Part
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Difficulty
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Prep
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {p.cueCardTitle}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="brand">Part {p.part}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        p.difficulty === "easy"
                          ? "emerald"
                          : p.difficulty === "medium"
                            ? "amber"
                            : "rose"
                      }
                    >
                      {p.difficulty}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {p.prepTimeSec}s
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditing(p);
                          setForm(p);
                          setCreating(false);
                        }}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-brand hover:bg-brand/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
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
