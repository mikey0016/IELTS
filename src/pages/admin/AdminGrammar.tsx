import { useEffect, useState } from "react";
import {
  adminListGrammarTopics,
  adminCreateGrammarTopic,
  adminUpdateGrammarTopic,
  adminDeleteGrammarTopic,
} from "@/api/admin";
import type { GrammarTopic } from "@/data/content";
import { Search, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const EMPTY: Omit<GrammarTopic, "id"> = {
  title: "",
  level: "Intermediate (Band 5–6)",
  summary: "",
  example: "",
  minutes: 20,
  description: "",
  rules: [],
  examples: [],
};

export function AdminGrammar() {
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<GrammarTopic | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<GrammarTopic, "id">>(EMPTY);

  const load = async () => {
    setLoading(true);
    const data = await adminListGrammarTopics();
    setTopics(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = topics.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!form.title) return;
    await adminCreateGrammarTopic(form);
    setForm(EMPTY);
    setCreating(false);
    load();
  };

  const handleUpdate = async () => {
    if (!editing) return;
    await adminUpdateGrammarTopic(editing.id, editing);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this topic?")) {
      await adminDeleteGrammarTopic(id);
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
            Grammar
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage grammar topics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics..."
              className="h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <Button onClick={() => setCreating(true)}>Add Topic</Button>
        </div>
      </div>

      {(creating || editing) && (
        <Card className="p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            {creating ? "New Topic" : "Edit Topic"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Level
              </label>
              <select
                value={form.level}
                onChange={(e) =>
                  setForm({
                    ...form,
                    level: e.target.value as GrammarTopic["level"],
                  })
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
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
                  Level
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Rules
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {t.title}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        t.level === "Intermediate (Band 5–6)"
                          ? "emerald"
                          : t.level === "Upper-Intermediate (Band 6.5-7)"
                            ? "amber"
                            : "violet"
                      }
                    >
                      {t.level}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {(t.rules || []).length}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditing(t);
                          setForm(t);
                          setCreating(false);
                        }}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-brand hover:bg-brand/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
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
