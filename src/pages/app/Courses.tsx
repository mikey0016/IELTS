import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Clock, ArrowRight, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";
import { getCourses } from "@/api/content";
import { VOCAB_PACKS, GRAMMAR_TOPICS } from "@/data/content";
import type { Course } from "@/data/content";
import { cn } from "@/lib/cn";

const COLORS: Record<string, string> = {
  listening:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  reading: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
  writing:
    "bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300",
  speaking:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
};

export function Courses() {
  const progress = useProgress();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    getCourses().then(setCourses);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My Courses"
        title="Your learning path"
        description="Structured courses for every skill. Track lessons and jump back in."
      />

      {!courses ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
              <Skeleton className="mt-4 h-2 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {courses.map((course) => {
            const stats = progress.skills[course.key];
            const coursePct = Math.round((stats.band / 9) * 100);
            return (
              <Card key={course.key} hover>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl",
                        COLORS[course.key],
                      )}
                    >
                      <course.icon className="h-6 w-6" />
                    </span>
                    <div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>
                        {course.lessons.length} lessons ·{" "}
                        {course.lessons.reduce((s, l) => s + l.minutes, 0)} min
                      </CardDescription>
                    </div>
                  </div>
                  <Badge tone="violet">Band {stats.band.toFixed(1)}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {course.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Course progress</span>
                    <span className="text-brand-600 dark:text-brand-400">
                      {coursePct}%
                    </span>
                  </div>
                  <ProgressBar
                    value={coursePct}
                    tone={
                      course.key === "listening"
                        ? "violet"
                        : course.key === "reading"
                          ? "cyan"
                          : course.key === "writing"
                            ? "brand"
                            : "emerald"
                    }
                    className="mt-1.5"
                  />

                  <ul className="mt-5 space-y-2">
                    {course.lessons.slice(0, 4).map((lesson) => (
                      <li
                        key={lesson.id}
                        onClick={() => {
                          progress.addRecentLesson({
                            id: lesson.id,
                            title: lesson.title,
                            skill: lesson.skill,
                            meta: `${lesson.minutes} min lesson`,
                            progress: 15,
                          });
                          toast(`Opened «${lesson.title}»`, "info");
                        }}
                        className="cursor-pointer rounded-xl border border-slate-100 px-3 py-2.5 text-sm transition hover:border-brand-200 hover:bg-brand-50/40 dark:border-slate-800 dark:hover:border-brand-800 dark:hover:bg-brand-950/30"
                      >
                        <span className="flex items-center gap-2.5">
                          <Play className="h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-400" />
                          <span className="flex-1 truncate font-medium text-slate-700 dark:text-slate-200">
                            {lesson.title}
                          </span>
                          <span className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
                            <Clock className="h-3 w-3" /> {lesson.minutes}m
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  {course.lessons.length > 4 && (
                    <p className="mt-2 px-1 text-xs font-medium text-slate-400">
                      + {course.lessons.length - 4} more lessons
                    </p>
                  )}
                  <Link
                    to={`/app/cdi-practice`}
                    className="mt-4 block"
                  >
                    <Button variant="outline" className="w-full">
                      Practice {course.title} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Vocabulary packs</CardTitle>
              <CardDescription>Build your academic word bank</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {VOCAB_PACKS.slice(0, 3).map((pack) => (
              <Link
                key={pack.id}
                to="/app/vocabulary"
                className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-violet-200 hover:bg-violet-50/40 dark:border-slate-800 dark:hover:border-violet-800"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                  <BookOpen className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                    {pack.title}
                  </p>
                  <p className="text-xs text-slate-400">{pack.meta}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-500" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Grammar lessons</CardTitle>
              <CardDescription>
                Level-based topics that fix band-limiting errors
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {GRAMMAR_TOPICS.slice(0, 6).map((g) => (
                <Link
                  key={g.id}
                  to="/app/grammar"
                  className="group rounded-xl border border-slate-100 p-3.5 transition hover:border-brand-200 hover:bg-brand-50/40 dark:border-slate-800 dark:hover:border-brand-800"
                >
                  <p className="text-sm font-bold text-slate-800 group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-brand-300">
                    {g.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {g.level} · {g.minutes} min
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {courses && (
        <Card>
          <CardContent className="px-5 py-8">
            <EmptyState
              icon={
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/60">
                  <BookOpen className="h-7 w-7" />
                </span>
              }
              title="Not sure where to start?"
              description="Take the 5-minute level test and we'll build your personalized course order automatically."
              action={
                <Link to="/app/study-plan">
                  <Button variant="accent">Take the level test</Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
