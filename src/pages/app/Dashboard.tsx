import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, Clock, Target, ArrowRight, Play, ChevronRight, BookOpen, Flame, Sparkles, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProgress, type DailyGoalKey } from "@/context/ProgressContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CircularProgress, ProgressBar } from "@/components/ui/ProgressBar";
import { BarChart } from "@/components/charts/BarChart";
import { RECOMMENDATIONS } from "@/data/dashboard";
import { getAchievements } from "@/api/achievements";
import type { AchievementDef } from "@/types";
import { greeting } from "@/lib/format";
import { cn } from "@/lib/cn";
import { getEquipped } from "@/lib/wallet";
import { MARKET_ITEMS } from "@/data/market";
import { storage } from "@/lib/storage";

const SKILL_CONFIG: Record<string, { label: string; tone: "violet" | "cyan" | "brand" | "emerald" }> = {
  listening: { label: "Listening", tone: "violet" },
  reading: { label: "Reading", tone: "cyan" },
  writing: { label: "Writing", tone: "brand" },
  speaking: { label: "Speaking", tone: "emerald" },
};

function getCurrentUserId(): string | null { try { const s = storage.get<any>("session", null); return s?.id ?? null; } catch { return null; } }
function getEquippedBanner(): { url: string | null; isVideo: boolean } {
  try {
    const raw: any = getEquipped(getCurrentUserId()) as any;
    if (!raw?.banner) return { url: null, isVideo: false };
    const item = MARKET_ITEMS.find((i) => i.id === raw.banner && i.category === "banner") || MARKET_ITEMS.find((i) => i.id === raw.banner);
    if (!item || item.imageUrl === "🦊" || item.imageUrl.startsWith("/bg/")) return { url: null, isVideo: false };
    return { url: item.imageUrl, isVideo: item.mediaType === "video" };
  } catch { return { url: null, isVideo: false }; }
}
function getEquippedBadge() {
  try {
    const raw: any = getEquipped(getCurrentUserId()) as any;
    if (!raw?.badge) return null;
    const item = MARKET_ITEMS.find((i) => i.id === raw.badge && i.category === "badge") || MARKET_ITEMS.find((i) => i.id === raw.badge);
    return item ?? null;
  } catch { return null; }
}

export function Dashboard() {
  const { user } = useAuth();
  const progress = useProgress();
  const banner = getEquippedBanner();
  const badge = getEquippedBadge();
  const [achievements, setAchievements] = useState<AchievementDef[] | null>(null);
  useEffect(() => { getAchievements().then(setAchievements); }, []);

  const firstName = user?.name.split(" ")[0] ?? "Student";
  const overallPct = Math.round((Object.values(progress.skills).reduce((sum, s) => sum + s.band, 0) / 4 / 9) * 100);
  const goals: { key: DailyGoalKey; label: string; meta: string; target: string }[] = [
    { key: "practiceMin", label: "30 minutes practice", meta: `${Math.min(progress.minutesToday, progress.dailyGoals.practiceMin)} / ${progress.dailyGoals.practiceMin} min`, target: "Listening + Reading sets" },
    { key: "vocabWords", label: "20 vocabulary words", meta: `${progress.vocabLearnedIds.length} new words today`, target: "Spaced repetition deck" },
    { key: "readingExercises", label: "1 Reading exercise", meta: "0 / 1 done", target: "TFNG practice set" },
  ];
  const todayMinutes = progress.weeklyActivity[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.minutes ?? progress.minutesToday;
  const weekTotal = progress.weeklyActivity.reduce((a, d) => a + d.minutes, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="relative overflow-hidden rounded-[28px] p-7 text-white shadow-[0_16px_48px_rgb(10_10_15/0.2)] sm:p-8 border border-white/10" style={banner.url ? banner.isVideo ? { backgroundColor: "#070711" } : { backgroundImage: `url(${banner.url})`, backgroundSize: "cover", backgroundPosition: "center" } : ({ background: "linear-gradient(135deg, #070711 0%, #1e1b4b 35%, #4f46e5 100%)" } as any)}>
        {(banner.url && !banner.isVideo) && <div className="absolute inset-0 bg-gradient-to-br from-[#070711]/70 via-[#1e1b4b]/60 to-[#070711]/50" />}
        {banner.url && banner.isVideo && <><video src={banner.url} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-br from-[#070711]/60 via-violet-900/40 to-[#070711]/50" /></>}
        {!banner.url && <><div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" /><div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" /><div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" /></>}
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur border border-white/15"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500"><Flame className="h-3 w-3 text-white" /></span> {progress.streak}-day streak {badge && <><img src={badge.imageUrl} alt={badge.name} className="ml-1 h-5 w-5 rounded-full object-cover ring-1 ring-white/30" /><span className="text-white/80">· {badge.name}</span></>}</span>
              <h1 className="mt-3 font-display text-2xl font-black tracking-[-0.02em] sm:text-[30px]">{greeting()}, {firstName} 👋</h1>
              <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-white/70">Ready to improve? You're at <b className="text-white">{progress.overallBandValue.toFixed(1)}</b> — {(user?.targetBand ?? 7.5) - progress.overallBandValue > 0 ? `${((user?.targetBand ?? 7.5) - progress.overallBandValue).toFixed(1)} band(s) from target.` : "right on target!"}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden rounded-2xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur text-center sm:block"><p className="text-[10px] font-black uppercase tracking-widest text-white/60">Today's practice</p><p className="font-display text-2xl font-black">{Math.round(todayMinutes)} <span className="text-sm font-semibold text-white/60">min</span></p></div>
              <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-lg"><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">This week</p><p className="font-display text-2xl font-black text-[#0a0a0f]">{Math.round(weekTotal / 60)}h <span className="text-sm font-semibold text-slate-500">total</span></p></div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card glass className="lg:col-span-2">
          <CardHeader><div><CardTitle>Today's Goal</CardTitle><CardDescription>Finish these to keep streak alive 🔥 — DB bilan sinxron</CardDescription></div></CardHeader>
          <CardContent className="space-y-2.5">
            {goals.map((g) => {
              const done = progress.dailyGoalsDone.includes(g.key);
              return (
                <button key={g.key} onClick={() => progress.toggleDailyGoal(g.key)} className={cn("flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all", done ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10" : "border-slate-200 bg-slate-50 hover:border-brand-200 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]")}>
                  {done ? <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" /> : <Circle className="h-6 w-6 shrink-0 text-slate-300 dark:text-white/20" />}
                  <div className="min-w-0 flex-1"><p className={cn("text-sm font-bold", done ? "text-emerald-700 line-through dark:text-emerald-300" : "dark:text-white")}>{g.label}</p><p className="text-xs text-slate-400">{g.meta} · {g.target}</p></div>
                  {done && <Badge tone="emerald">Done</Badge>}
                </button>
              );
            })}
          </CardContent>
        </Card>
        <Card glass>
          <CardHeader><div><CardTitle>Overall Progress</CardTitle><CardDescription>Skill proficiency</CardDescription></div></CardHeader>
          <CardContent><div className="flex flex-col items-center"><CircularProgress value={overallPct} size={150} stroke={13} tone="#7c3aed" label={`${overallPct}%`} sublabel="Overall" />
            <div className="mt-6 w-full space-y-2.5">{Object.entries(SKILL_CONFIG).map(([key, cfg]) => { const stats = progress.skills[key as keyof typeof progress.skills]; const pct = Math.round((stats.band / 9) * 100); return (<div key={key} className="flex items-center gap-2.5"><span className="w-16 text-xs font-bold text-slate-500">{cfg.label}</span><ProgressBar value={pct} tone={cfg.tone} className="flex-1" /><span className="w-8 text-right text-xs font-black dark:text-white">{stats.band.toFixed(1)}</span></div>); })}</div>
          </div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card glass className="lg:col-span-2">
          <CardHeader><div><CardTitle>Continue Learning</CardTitle><CardDescription>DB dan davom et</CardDescription></div><Link to="/app/courses"><Button variant="ghost" size="sm" className="rounded-xl">All courses <ChevronRight className="h-4 w-4" /></Button></Link></CardHeader>
          <CardContent className="space-y-3">
            {progress.recentLessons.slice(0,3).map((lesson) => (
              <Link key={lesson.id} to={lesson.skill==="vocabulary" ? "/app/vocabulary" : `/app/${lesson.skill}`} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-200 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow"><BookOpen className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold dark:text-white">{lesson.title}</p><p className="text-xs text-slate-400">{lesson.meta}</p><ProgressBar value={lesson.progress} className="mt-2" size="sm" /></div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white group-hover:scale-110 transition dark:bg-white dark:text-slate-900"><Play className="h-4 w-4 fill-current" /></span>
              </Link>
            ))}
            {progress.recentLessons.length===0 && <p className="py-8 text-center text-sm text-slate-400">No recent lessons — start a course!</p>}
          </CardContent>
        </Card>
        <Card glass className="overflow-hidden">
          <CardHeader><div><CardTitle>Current Band Estimate</CardTitle><CardDescription>Latest performance</CardDescription></div></CardHeader>
          <CardContent>
            <div className="rounded-[20px] bg-gradient-to-br from-violet-600 to-brand-700 p-6 text-center text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">Estimated band</p>
              <p className="font-display text-5xl font-black">{progress.overallBandValue.toFixed(1)}</p>
              <p className="text-sm font-bold">Target {(user?.targetBand ?? 7.5).toFixed(1)}</p>
              <ProgressBar value={(progress.overallBandValue / (user?.targetBand ?? 7.5)) * 100} tone="white" className="mt-4 bg-white/20" stripes />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm"><span className="text-slate-500">Gap to target</span><span className="font-black dark:text-white">{((user?.targetBand ?? 7.5) - progress.overallBandValue).toFixed(1)} bands</span></div>
            <Link to="/app/progress" className="mt-4 block"><Button variant="outline" className="w-full rounded-2xl">View analytics <ArrowRight className="h-4 w-4" /></Button></Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card glass><CardHeader><div><CardTitle>Recommended Practice</CardTitle><CardDescription>Weak areas</CardDescription></div></CardHeader>
          <CardContent className="space-y-3">{RECOMMENDATIONS.slice(0,3).map((rec) => (<div key={rec.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-white"><Target className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="text-sm font-bold dark:text-white">{rec.title}</p><p className="text-xs text-slate-400 line-clamp-2">{rec.reason}</p></div><Badge tone={rec.intensity==="High impact"?"rose":rec.intensity==="Due today"?"amber":"cyan"}>{rec.intensity}</Badge></div>))}</CardContent>
        </Card>
        <Card glass><CardHeader><div><CardTitle>Weekly Activity</CardTitle><CardDescription>Minutes per day</CardDescription></div><Badge tone="violet"><Clock className="h-3 w-3" /> {Math.round(weekTotal)} min</Badge></CardHeader>
          <CardContent><BarChart data={progress.weeklyActivity.map((d)=>({label:d.label,value:d.minutes}))} height={190} formatValue={(v)=>`${v}m`} /><div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs dark:bg-white/[0.06]"><span className="font-medium text-slate-500"><Flame className="mr-1 inline h-3.5 w-3.5 text-orange-500" /> Best: {Math.max(...progress.weeklyActivity.map((d)=>d.minutes))} min</span></div></CardContent>
        </Card>
      </div>

      <Card glass>
        <CardHeader><div><CardTitle className="flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" /> Achievements — DB live</CardTitle><CardDescription>{progress.unlockedAchievements.length} of {achievements?.length ?? 15} unlocked</CardDescription></div><Link to="/app/achievements"><Button variant="ghost" size="sm" className="rounded-xl">View all <ChevronRight className="h-4 w-4" /></Button></Link></CardHeader>
        <CardContent>
          {!achievements ? <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">{Array.from({length:6}).map((_,i)=><div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse dark:bg-white/5" />)}</div> : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {achievements.slice(0,6).map((a) => {
                const unlocked = progress.unlockedAchievements.includes(a.id);
                return (
                  <div key={a.id} className={cn("flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition", unlocked ? "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10" : "border-slate-200 opacity-50 grayscale dark:border-white/10")}>
                    <span className="text-2xl">{a.icon}</span>
                    <span className="text-[11px] font-bold leading-tight dark:text-white/80">{a.title}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
