import { useState } from "react";
import { Calendar, Clock, Target, CheckCircle2, Circle, Sparkles, RefreshCw, BookOpen, Headphones, FileText, PenLine, Mic, Flame, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Field, Input, Select } from "@/components/ui/Input";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";
import { requestStudyPlan } from "@/api/studyPlan";
import { DAY_NAMES } from "@/data/studyPlan";
import { cn } from "@/lib/cn";
import { isRealApi } from "@/api/http";

const skillIcon: Record<string, typeof Headphones> = { listening: Headphones, reading: FileText, writing: PenLine, speaking: Mic };
const skillTone: Record<string, "violet" | "cyan" | "brand" | "emerald"> = { listening: "violet", reading: "cyan", writing: "brand", speaking: "emerald" };

export function StudyPlan() {
  const progress = useProgress();
  const { toast } = useToast();
  const plan = progress.plan;
  const [currentBand, setCurrentBand] = useState(6.0);
  const [targetBand, setTargetBand] = useState(7.5);
  const [examDate, setExamDate] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (targetBand <= currentBand) { toast("Target band must be higher than current band.", "error"); return; }
    if (dailyMinutes < 20) { toast("Daily study time must be at least 20 minutes.", "error"); return; }
    setGenerating(true);
    try {
      const newPlan = await requestStudyPlan({ currentBand, targetBand, examDate: examDate || new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10), dailyMinutes });
      progress.savePlan(newPlan);
      toast("Study plan generated — your week is ready!", "success");
    } catch (err) { toast(err instanceof Error ? err.message : "Failed to generate plan", "error"); } finally { setGenerating(false); }
  };

  const groupedByDay = (() => {
    if (!plan) return [];
    const groups: Array<{ day: number; tasks: typeof plan.weeks }> = [];
    for (let d = 0; d < 7; d++) groups.push({ day: d, tasks: plan.weeks.filter((t) => t.day === d) });
    return groups;
  })();
  const overallDone = plan ? plan.weeks.filter((t) => progress.planTaskDoneIds.includes(t.id)).length : 0;
  const overallTotal = plan?.weeks.length ?? 0;
  const overallPct = overallTotal ? Math.round((overallDone / overallTotal) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-[24px] bg-slate-900 p-7 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-brand-600 to-indigo-600 opacity-90" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur"><Sparkles className="h-3.5 w-3.5" /> Study Plan — IELTS 4 Skills {isRealApi() && <span className="inline-flex items-center gap-1"><Database className="h-3 w-3" /> DB</span>}</p>
            <h1 className="mt-3 font-display text-2xl font-black">Personalized weekly roadmap</h1>
            <p className="mt-1.5 max-w-xl text-sm text-white/80">Choose your current band, target and daily time — we build a 7-day plan faqat IELTS 4 skill: Listening, Reading, Writing, Speaking.</p>
          </div>
          {plan && <Button variant="outline" size="sm" className="rounded-2xl bg-white text-slate-900 border-white" onClick={() => { progress.savePlan(null as unknown as typeof plan); toast("Plan cleared — generate a new one below.", "info"); }}><RefreshCw className="h-4 w-4" /> New plan</Button>}
        </div>
      </div>

      {!plan ? (
        <Card glass>
          <CardHeader><div><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet-500" /> Generate your study plan</CardTitle><CardDescription>Fill in your details and we craft a tailored week.</CardDescription></div></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Current band" required><Select value={String(currentBand)} onChange={(e) => setCurrentBand(Number(e.target.value))} className="rounded-2xl">{[4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8].map((b) => <option key={b} value={b}>Band {b.toFixed(1)}</option>)}</Select></Field>
              <Field label="Target band" required><Select value={String(targetBand)} onChange={(e) => setTargetBand(Number(e.target.value))} className="rounded-2xl">{[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((b) => <option key={b} value={String(b)}>Band {b.toFixed(1)}</option>)}</Select></Field>
              <Field label="Exam date" hint="When are you sitting the exam?"><Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="rounded-2xl" /></Field>
              <Field label="Daily available time" required><Select value={String(dailyMinutes)} onChange={(e) => setDailyMinutes(Number(e.target.value))} className="rounded-2xl"><option value={30}>30 min / day</option><option value={45}>45 min / day</option><option value={60}>60 min / day</option><option value={90}>90 min / day</option><option value={120}>120 min / day</option></Select></Field>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-brand-700 p-5 text-white"><p className="flex items-center gap-2 text-sm font-bold"><Flame className="h-4 w-4" /> How we build your week</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-violet-100"><li>Har kuni 3 ta IELTS skill (Listening, Reading, Writing, Speaking) rotatsiyasi.</li><li>Timed practice blocks — daily minutes / 3 (minimum 15 min per block).</li><li>Shanba/Yakshanba — Full Test (40 Q) bilan haftalik review.</li></ul></div>
            <Button onClick={handleGenerate} loading={generating} size="lg" className="w-full sm:w-auto rounded-2xl"><Sparkles className="h-4 w-4" /> Generate plan</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card glass className="overflow-hidden p-0">
            <div className="bg-gradient-to-br from-brand-700 via-brand-800 to-slate-950 p-6 text-white sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-200"><Target className="h-3 w-3" /> Band {plan.currentBand.toFixed(1)} → {plan.targetBand.toFixed(1)}</p>
                  <h2 className="mt-3 font-display text-2xl font-extrabold">Your 7-day plan</h2>
                  <p className="mt-1 text-sm text-slate-300"><Calendar className="mr-1 inline h-3.5 w-3.5" /> Exam: {plan.examDate} · <Clock className="mr-1 inline h-3.5 w-3.5" /> {plan.dailyMinutes} min/day · {overallDone}/{overallTotal} tasks done</p>
                </div>
                <div className="text-right"><p className="text-xs font-bold uppercase tracking-widest text-brand-200">Weekly progress</p><p className="font-display text-4xl font-extrabold">{overallPct}%</p><ProgressBar value={overallPct} tone="white" className="mt-2 w-32 bg-white/20" /></div>
              </div>
            </div>
          </Card>
          <div className="grid gap-5 lg:grid-cols-2">
            {groupedByDay.map(({ day, tasks }) => {
              const doneCount = tasks.filter((t) => progress.planTaskDoneIds.includes(t.id)).length;
              const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
              const dayMinutes = tasks.reduce((a, t) => a + t.minutes, 0);
              return (
                <Card key={day} glass className={cn(pct === 100 && "ring-1 ring-emerald-200 dark:ring-emerald-900")}>
                  <CardHeader className="pb-3"><div><CardTitle className="flex items-center gap-2 text-base">{DAY_NAMES[day]}{pct === 100 && <Badge tone="emerald" className="rounded-full"><CheckCircle2 className="h-3 w-3" /> Done</Badge>}{day === 6 && <Badge tone="rose" className="rounded-full">Mock day</Badge>}</CardTitle><CardDescription>{doneCount}/{tasks.length} completed · {dayMinutes} minutes</CardDescription></div><span className="text-xs font-bold text-slate-400">{pct}%</span></CardHeader>
                  <CardContent className="space-y-3">
                    <ProgressBar value={pct} size="sm" tone={pct === 100 ? "emerald" : "brand"} />
                    {tasks.map((task) => {
                      const done = progress.planTaskDoneIds.includes(task.id);
                      const Icon = skillIcon[task.skill] ?? BookOpen;
                      return (
                        <button key={task.id} onClick={() => progress.toggleTask(task.id)} className={cn("flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition", done ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30" : "border-slate-200 bg-white hover:border-brand-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-brand-700")}>
                          {done ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-300 dark:text-white/20" />}
                          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", skillTone[task.skill] === "violet" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300" : skillTone[task.skill] === "cyan" ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300" : skillTone[task.skill] === "brand" ? "bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300")}><Icon className="h-4 w-4" /></span>
                          <span className="min-w-0 flex-1"><span className={cn("block text-sm font-bold leading-tight", done ? "text-emerald-800 line-through dark:text-emerald-300" : "text-slate-800 dark:text-slate-100")}>{task.detail}</span><span className="mt-0.5 block text-xs font-semibold capitalize text-slate-400">{task.label} · {task.minutes} min · {task.skill}</span></span>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Card glass className="border-dashed"><CardContent className="flex flex-wrap items-center justify-between gap-3 py-5"><p className="text-sm font-medium text-slate-600 dark:text-slate-300">Completed {overallDone} of {overallTotal} tasks this week — {overallPct === 100 ? "perfect week 🎉" : overallPct >= 50 ? "halfway there" : "let's keep momentum"}</p><Button variant="outline" size="sm" className="rounded-2xl" onClick={() => toast("Check tasks as you complete them — progress unlocks achievements!", "info")}>Tip: tap tasks to mark done</Button></CardContent></Card>
        </>
      )}
    </div>
  );
}
