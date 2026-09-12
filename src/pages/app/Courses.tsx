import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Clock, ArrowRight, BookOpen, Sparkles, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";
import { getCourses, getGrammarTopics, getVocabPacks } from "@/api/content";
import type { Course, GrammarTopic } from "@/data/content";
import { cn } from "@/lib/cn";

const GRADIENTS: Record<string, string> = {
  listening: "from-violet-600 to-indigo-600",
  reading: "from-cyan-500 to-blue-600",
  writing: "from-brand-600 to-violet-600",
  speaking: "from-emerald-500 to-cyan-600",
};

const SOLID: Record<string, string> = {
  listening: "bg-violet-500 text-white shadow-violet-500/20",
  reading: "bg-cyan-500 text-white shadow-cyan-500/20",
  writing: "bg-brand-600 text-white shadow-brand-500/20",
  speaking: "bg-emerald-500 text-white shadow-emerald-500/20",
};

export function Courses() {
  const progress = useProgress();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [grammar, setGrammar] = useState<GrammarTopic[] | null>(null);
  const [packs, setPacks] = useState<any[] | null>(null);

  useEffect(() => {
    getCourses().then(setCourses);
    getGrammarTopics().then(setGrammar);
    getVocabPacks().then(setPacks);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[24px] bg-slate-900 p-7 text-white dark:bg-white dark:text-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-violet-600 to-indigo-600 opacity-90 dark:opacity-100" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur"><GraduationCap className="h-3.5 w-3.5" /> My Courses</p>
            <h1 className="mt-3 font-display text-2xl font-black tracking-tight">Your learning path</h1>
            <p className="mt-1.5 max-w-xl text-sm text-white/80 dark:text-slate-600">Structured courses for every skill — DB dan jonli. Track lessons and jump back in.</p>
          </div>
          <Badge tone="white" className="self-start sm:self-center">{courses ? `${courses.length} courses` : "loading"} · DB live</Badge>
        </div>
      </div>

      {!courses ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {[0,1,2,3].map((i) => (
            <Card key={i} className="p-6"><div className="flex gap-4"><Skeleton className="h-12 w-12 rounded-2xl" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-3/4" /></div></div><Skeleton className="mt-4 h-2 w-full" /></Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {courses.map((course) => {
            const stats = progress.skills[course.key];
            const pct = Math.round((stats.band / 9) * 100);
            return (
              <Card key={course.key} hover glass className="overflow-hidden">
                <div className={cn("h-1.5 w-full bg-gradient-to-r", GRADIENTS[course.key])} />
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow", SOLID[course.key])}><course.icon className="h-6 w-6" /></span>
                    <div className="min-w-0"><CardTitle className="truncate">{course.title}</CardTitle><CardDescription>{course.lessons.length} lessons · {course.lessons.reduce((s,l)=>s+l.minutes,0)} min</CardDescription></div>
                  </div>
                  <Badge tone={course.key==="listening"?"violet":course.key==="reading"?"cyan":course.key==="writing"?"brand":"emerald"}>Band {stats.band.toFixed(1)}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-white/60">{course.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs font-bold"><span className="text-slate-400">Course progress</span><span className="text-slate-900 dark:text-white">{pct}%</span></div>
                  <ProgressBar value={pct} tone={course.key==="listening"?"violet":course.key==="reading"?"cyan":course.key==="writing"?"brand":"emerald"} className="mt-1.5" />
                  <ul className="mt-5 space-y-2">
                    {course.lessons.slice(0,4).map((lesson)=>(
                      <li key={lesson.id} onClick={()=>{progress.addRecentLesson({id:lesson.id,title:lesson.title,skill:lesson.skill,meta:`${lesson.minutes} min`,progress:15}); toast(`Opened «${lesson.title}»`,"info");}} className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-3 text-sm transition hover:border-brand-200 hover:bg-brand-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm group-hover:scale-105 transition dark:bg-white/10 dark:text-white"><Play className="h-3.5 w-3.5" /></span>
                        <span className="flex-1 truncate font-semibold dark:text-white">{lesson.title}</span>
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-400"><Clock className="h-3 w-3" /> {lesson.minutes}m</span>
                      </li>
                    ))}
                  </ul>
                  {course.lessons.length>4 && <p className="mt-2 text-xs font-medium text-slate-400">+ {course.lessons.length-4} more lessons</p>}
                  <Link to="/app/cdi-practice" className="mt-4 block"><Button variant="outline" className="w-full rounded-2xl">Practice {course.title} <ArrowRight className="h-4 w-4" /></Button></Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card glass>
          <CardHeader><div><CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-500" /> Vocabulary packs</CardTitle><CardDescription>DB dan jonli word bank</CardDescription></div></CardHeader>
          <CardContent className="space-y-2.5">
            {!packs ? Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-16 rounded-2xl" />) : packs.slice(0,3).map((pack:any)=>(
              <Link key={pack.id} to="/app/vocabulary" className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 transition hover:border-violet-200 hover:bg-violet-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-white shadow"><BookOpen className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold dark:text-white">{pack.title}</p><p className="text-xs text-slate-400">{pack.meta}</p></div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition" />
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><div><CardTitle>Grammar lessons</CardTitle><CardDescription>DB dan — band-limiting errors fix</CardDescription></div></CardHeader>
          <CardContent>
            {!grammar ? <div className="grid gap-2.5 sm:grid-cols-2">{Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-20 rounded-2xl" />)}</div> : (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {grammar.slice(0,6).map((g)=>(
                  <Link key={g.id} to="/app/grammar" className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-brand-200 hover:bg-brand-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]">
                    <p className="text-sm font-bold group-hover:text-brand-600 dark:text-white">{g.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{g.level} · {g.minutes} min</p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {courses && <Card className="border-dashed"><CardContent className="py-8 text-center"><EmptyState icon={<span className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand text-white shadow-glow-brand"><BookOpen className="h-7 w-7" /></span>} title="Not sure where to start?" description="Take the 5-minute level test and we'll build your personalized order from DB." action={<Link to="/app/study-plan"><Button variant="accent" className="rounded-2xl">Take the level test</Button></Link>} /></CardContent></Card>}
    </div>
  );
}
