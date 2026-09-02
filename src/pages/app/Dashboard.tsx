import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  Clock,
  Target,
  ArrowRight,
  Play,
  ChevronRight,
  BookOpen,
  Flame,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProgress, type DailyGoalKey } from "@/context/ProgressContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CircularProgress, ProgressBar } from "@/components/ui/ProgressBar";
import { BarChart } from "@/components/charts/BarChart";
import { RECOMMENDATIONS } from "@/data/dashboard";
import { ACHIEVEMENTS } from "@/data/achievements";
import { greeting } from "@/lib/format";
import { cn } from "@/lib/cn";

const SKILL_CONFIG: Record<
  string,
  { label: string; tone: "violet" | "cyan" | "brand" | "emerald" }
> = {
  listening: { label: "Listening", tone: "violet" },
  reading: { label: "Reading", tone: "cyan" },
  writing: { label: "Writing", tone: "brand" },
  speaking: { label: "Speaking", tone: "emerald" },
};

import { getEquipped } from "@/lib/wallet";
import { MARKET_ITEMS } from "@/data/market";
import { storage } from "@/lib/storage";

function getCurrentUserId(): string | null {
  try {
    const s = storage.get<any>("session", null);
    return s?.id ?? null;
  } catch {
    return null;
  }
}
function getEquippedBanner(): { url: string | null; isVideo: boolean } {
  try {
    const raw: any = getEquipped(getCurrentUserId()) as any;
    if (!raw?.banner) return { url: null, isVideo: false };
    const item =
      MARKET_ITEMS.find(
        (i) => i.id === raw.banner && i.category === "banner",
      ) || MARKET_ITEMS.find((i) => i.id === raw.banner);
    if (!item || item.imageUrl === "🦊" || item.imageUrl.startsWith("/bg/"))
      return { url: null, isVideo: false };
    return { url: item.imageUrl, isVideo: item.mediaType === "video" };
  } catch {
    return { url: null, isVideo: false };
  }
}
function getEquippedBadge() {
  try {
    const raw: any = getEquipped(getCurrentUserId()) as any;
    if (!raw?.badge) return null;
    const item =
      MARKET_ITEMS.find((i) => i.id === raw.badge && i.category === "badge") ||
      MARKET_ITEMS.find((i) => i.id === raw.badge);
    return item ?? null;
  } catch {
    return null;
  }
}

export function Dashboard() {
  const { user } = useAuth();
  const progress = useProgress();
  const banner = getEquippedBanner();
  const badge = getEquippedBadge();

  const firstName = user?.name.split(" ")[0] ?? "Student";
  const overallPct = Math.round(
    (Object.values(progress.skills).reduce((sum, s) => sum + s.band, 0) /
      4 /
      9) *
      100,
  );
  const goals: {
    key: DailyGoalKey;
    label: string;
    meta: string;
    target: string;
  }[] = [
    {
      key: "practiceMin",
      label: "30 minutes practice",
      meta: `${Math.min(progress.minutesToday, progress.dailyGoals.practiceMin)} / ${progress.dailyGoals.practiceMin} min`,
      target: "Listening + Reading sets",
    },
    {
      key: "vocabWords",
      label: "20 vocabulary words",
      meta: `${progress.vocabLearnedIds.length} new words today`,
      target: "Spaced repetition deck",
    },
    {
      key: "readingExercises",
      label: "1 Reading exercise",
      meta: "0 / 1 done",
      target: "TFNG practice set",
    },
  ];

  const todayMinutes =
    progress.weeklyActivity[
      new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
    ]?.minutes ?? progress.minutesToday;
  const weekTotal = progress.weeklyActivity.reduce((a, d) => a + d.minutes, 0);

  return (
    <div className="space-y-6">
      <section
        className="relative flex flex-col gap-4 rounded-3xl p-6 text-white shadow-card sm:p-8 overflow-hidden"
        style={
          banner.url
            ? banner.isVideo
              ? { backgroundColor: "#0f172a" }
              : {
                  backgroundImage: `url(${banner.url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
            : ({
                background:
                  "linear-gradient(to bottom right, #1e1b4b, #0f172a)",
              } as any)
        }
      >
        {banner.url && !banner.isVideo && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/70 via-slate-900/60 to-slate-950/70" />
        )}
        {banner.url && banner.isVideo && (
          <video
            src={banner.url}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {banner.url && banner.isVideo && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/60 via-slate-900/50 to-slate-950/60" />
        )}
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-200">
                <Flame className="h-3 w-3" /> {progress.streak}-day streak
                {badge && (
                  <img
                    src={badge.imageUrl}
                    alt={badge.name}
                    className="ml-1 h-5 w-5 rounded-full object-cover ring-1 ring-white/30"
                  />
                )}
                {badge && <span className="text-white/80">· {badge.name}</span>}
              </span>
              <h1 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
                {greeting()}, {firstName} 👋
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Ready to improve your IELTS score today? You're at{" "}
                <b className="text-white">
                  {progress.overallBandValue.toFixed(1)}
                </b>{" "}
                —{" "}
                {(user?.targetBand ?? 7.5) - progress.overallBandValue > 0
                  ? `${((user?.targetBand ?? 7.5) - progress.overallBandValue).toFixed(1)} band(s) from your target.`
                  : "right on target. Keep it up!"}
              </p>
            </div>
            <div className="flex items-center gap-5">
              <div className="hidden text-right sm:block">
                <p className="text-xs text-slate-300">Today's practice</p>
                <p className="font-display text-2xl font-extrabold">
                  {Math.round(todayMinutes)}{" "}
                  <span className="text-sm font-semibold text-slate-300">
                    min
                  </span>
                </p>
              </div>
              <div className="h-12 w-px bg-white/15" />
              <div className="text-right">
                <p className="text-xs text-slate-300">This week</p>
                <p className="font-display text-2xl font-extrabold">
                  {Math.round(weekTotal / 60)}h{" "}
                  <span className="text-sm font-semibold text-slate-300">
                    total
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Today's Goal</CardTitle>
              <CardDescription>
                Finish these to keep your streak alive 🔥
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {goals.map((g) => {
              const done = progress.dailyGoalsDone.includes(g.key);
              return (
                <button
                  key={g.key}
                  onClick={() => progress.toggleDailyGoal(g.key)}
                  className={cn(
                    "flex w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all",
                    done
                      ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30"
                      : "border-slate-200 bg-slate-50/60 hover:border-brand-300 dark:border-slate-800 dark:bg-slate-800/40",
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="h-6 w-6 shrink-0 text-slate-300 dark:text-slate-600" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-bold",
                        done
                          ? "text-emerald-700 line-through dark:text-emerald-400"
                          : "text-slate-800 dark:text-slate-100",
                      )}
                    >
                      {g.label}
                    </p>
                    <p className="text-xs text-slate-400">
                      {g.meta} · {g.target}
                    </p>
                  </div>
                  {done && <Badge tone="emerald">Done</Badge>}
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Overall Progress</CardTitle>
              <CardDescription>Skill proficiency this month</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <CircularProgress
                value={overallPct}
                size={150}
                stroke={13}
                tone="#7c3aed"
                label={`${overallPct}%`}
                sublabel="Overall"
              />
              <div className="mt-5 w-full space-y-2.5">
                {Object.entries(SKILL_CONFIG).map(([key, cfg]) => {
                  const stats =
                    progress.skills[key as keyof typeof progress.skills];
                  const pct = Math.round((stats.band / 9) * 100);
                  return (
                    <div key={key} className="flex items-center gap-2.5">
                      <span className="w-16 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {cfg.label}
                      </span>
                      <ProgressBar
                        value={pct}
                        tone={cfg.tone}
                        className="flex-1"
                      />
                      <span className="w-8 text-right text-xs font-bold text-slate-800 dark:text-slate-200">
                        {stats.band.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </div>
            <Link to="/app/courses">
              <Button variant="ghost" size="sm">
                All courses <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {progress.recentLessons.slice(0, 3).map((lesson) => (
              <Link
                key={lesson.id}
                to={
                  lesson.skill === "vocabulary"
                    ? "/app/vocabulary"
                    : `/app/${lesson.skill}`
                }
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-3.5 transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-slate-800 dark:hover:border-brand-700 dark:hover:bg-brand-950/30"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                    {lesson.title}
                  </p>
                  <p className="text-xs text-slate-400">{lesson.meta}</p>
                  <ProgressBar
                    value={lesson.progress}
                    className="mt-2"
                    size="sm"
                  />
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-white transition-transform group-hover:scale-110 dark:bg-brand-600">
                  <Play className="h-4 w-4 fill-current" />
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Current Band Estimate</CardTitle>
              <CardDescription>
                Based on your latest performance
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-brand-700 p-5 text-center text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200">
                Estimated band
              </p>
              <p className="font-display text-5xl font-extrabold">
                {progress.overallBandValue.toFixed(1)}
              </p>
              <p className="mt-1 text-sm font-bold">
                Target {user?.targetBand.toFixed(1) ?? "7.5"}
              </p>
              <ProgressBar
                value={
                  (progress.overallBandValue / (user?.targetBand ?? 7.5)) * 100
                }
                tone="white"
                className="mt-4 bg-white/20"
                stripes
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                Gap to target
              </span>
              <span className="font-display font-extrabold text-slate-900 dark:text-white">
                {(
                  (user?.targetBand ?? 7.5) - progress.overallBandValue
                ).toFixed(1)}{" "}
                bands
              </span>
            </div>
            <Link to="/app/progress" className="mt-4 block">
              <Button variant="outline" className="w-full">
                View analytics <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recommended Practice</CardTitle>
              <CardDescription>
                Personalized based on your weak areas
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {RECOMMENDATIONS.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3.5 dark:border-slate-800"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-300">
                  <Target className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {rec.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                    {rec.reason}
                  </p>
                </div>
                <Badge
                  tone={
                    rec.intensity === "High impact"
                      ? "rose"
                      : rec.intensity === "Due today"
                        ? "amber"
                        : "cyan"
                  }
                  className="shrink-0"
                >
                  {rec.intensity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Minutes studied per day</CardDescription>
            </div>
            <Badge tone="violet">
              <Clock className="h-3 w-3" /> {Math.round(weekTotal)} min
            </Badge>
          </CardHeader>
          <CardContent>
            <BarChart
              data={progress.weeklyActivity.map((d) => ({
                label: d.label,
                value: d.minutes,
              }))}
              height={190}
              formatValue={(v) => `${v}m`}
            />
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs dark:bg-slate-800/60">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                <Flame className="mr-1 inline h-3.5 w-3.5 text-orange-500" />
                Best day:{" "}
                {Math.max(
                  ...progress.weeklyActivity.map((d) => d.minutes),
                )}{" "}
                minutes
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>
              {progress.unlockedAchievements.length} of {ACHIEVEMENTS.length}{" "}
              unlocked
            </CardDescription>
          </div>
          <Link to="/app/achievements">
            <Button variant="ghost" size="sm">
              View all <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {ACHIEVEMENTS.slice(0, 6).map((a) => {
              const unlocked = progress.unlockedAchievements.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition",
                    unlocked
                      ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
                      : "border-slate-200 opacity-50 grayscale dark:border-slate-800",
                  )}
                >
                  <span className="text-2xl">{a.icon}</span>
                  <span className="text-[11px] font-bold leading-tight text-slate-600 dark:text-slate-300">
                    {a.title}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400">
        Tip: completing your daily goals in the morning leads to 2.3× more
        consistent studying.
      </p>
    </div>
  );
}
