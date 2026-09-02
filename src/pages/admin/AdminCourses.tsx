import { useEffect, useState } from "react";
import {
  adminListCourses,
  adminCreateCourse,
  adminUpdateCourse,
  adminDeleteCourse,
  adminCreateLesson,
  adminUpdateLesson,
  adminDeleteLesson,
} from "@/api/admin";
import type { Course, Lesson } from "@/data/content";
import { Search, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Course | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Partial<Course>>({});
  const [lessonForm, setLessonForm] = useState<Partial<Lesson>>({});
  const [activeCourse, setActiveCourse] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await adminListCourses();
    setCourses(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!form.title || !form.key) return;
    await adminCreateCourse(
      form as Partial<Course> & { title: string; key: string },
    );
    setForm({});
    setCreating(false);
    load();
  };

  const handleUpdate = async () => {
    if (!editing) return;
    await adminUpdateCourse(editing.key, editing);
    setEditing(null);
    load();
  };

  const handleDelete = async (key: string) => {
    if (confirm("Delete this course?")) {
      await adminDeleteCourse(key);
      load();
    }
  };

  const handleAddLesson = async (courseKey: string) => {
    if (!lessonForm.title) return;
    await adminCreateLesson(
      courseKey,
      lessonForm as Partial<Lesson> & { title: string },
    );
    setLessonForm({});
    load();
  };

  const handleUpdateLesson = async (courseKey: string, lessonId: string) => {
    if (!lessonForm.title) return;
    await adminUpdateLesson(courseKey, lessonId, lessonForm);
    setLessonForm({});
    load();
  };

  const handleDeleteLesson = async (courseKey: string, lessonId: string) => {
    if (confirm("Delete this lesson?")) {
      await adminDeleteLesson(courseKey, lessonId);
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
            Courses
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage courses and lessons
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses..."
              className="h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <Button onClick={() => setCreating(true)}>Add Course</Button>
        </div>
      </div>

      {(creating || editing) && (
        <Card className="p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            {creating ? "New Course" : "Edit Course"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Title
              </label>
              <input
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Key
              </label>
              <input
                value={form.key || ""}
                onChange={(e) =>
                  setForm({ ...form, key: e.target.value as any })
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
              </label>
              <input
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
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
                setForm({});
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => (
          <Card key={course.key} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {course.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {course.description}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {course.lessons?.length || 0} lessons
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setActiveCourse(
                      activeCourse === course.key ? null : course.key,
                    )
                  }
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setEditing(course);
                    setForm(course);
                    setCreating(false);
                  }}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-brand hover:bg-brand/10"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(course.key)}
                  className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {activeCourse === course.key && (
              <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Add Lesson
                </p>
                <input
                  value={lessonForm.title || ""}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, title: e.target.value })
                  }
                  placeholder="Lesson title"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                <Button size="sm" onClick={() => handleAddLesson(course.key)}>
                  Add Lesson
                </Button>
                <div className="space-y-2">
                  {course.lessons?.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 p-2 dark:bg-slate-800"
                    >
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {lesson.title}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setLessonForm(lesson);
                          }}
                          className="rounded px-2 py-1 text-xs text-brand hover:bg-brand/10"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteLesson(course.key, lesson.id)
                          }
                          className="rounded p-1 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
