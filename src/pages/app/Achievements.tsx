import { useEffect, useState } from "react";
import { Lock, Unlock, Trophy, Target, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProgress } from "@/context/ProgressContext";
import { getAchievements } from "@/api/achievements";
import type { AchievementDef } from "@/types";
import { cn } from "@/lib/cn";

function getAchievementValue(id: string, p: ReturnType<typeof useProgress>): number {
  switch (id) {
    case "first_login": return 1;
    case "day_7_streak": case "day_30_streak": return p.streak;
    case "10_words": case "50_words": case "100_words": return p.vocabLearnedIds.length;
    case "20_questions": case "100_questions": return p.quizHistory.length;
    case "listening_20": return p.quizHistory.filter((q) => q.skill === "listening").length;
    case "reading_20": return p.quizHistory.filter((q) => q.skill === "reading").length;
    case "first_mock": case "mock_master": return p.mockHistory.length;
    case "hour_today": return p.minutesToday >= 60 ? 1 : 0;
    case "study_plan": return p.plan ? 1 : 0;
    case "plan_week": return p.planTaskDoneIds.length;
    default: return 0;
  }
}

export function Achievements() {
  const progress = useProgress();
  const [achievements, setAchievements] = useState<AchievementDef[] | null>(null);

  useEffect(() => {
    getAchievements().then(setAchievements);
  }, []);

  if (!achievements) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-[20px]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-[20px]" />)}
        </div>
      </div>
    );
  }

  const unlockedCount = progress.unlockedAchievements.length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Achievements"
        title="Milestones & badges"
        description={`You've unlocked ${unlockedCount} of ${totalCount} — keep streaking, DB dagi barcha yutuqlar jonli.`}
        actions={
          <div className="flex items-center gap-2">
            <Badge tone="amber"><Trophy className="h-3 w-3" /> {unlockedCount}/{totalCount}</Badge>
            <Badge tone="slate">{Math.round((unlockedCount / totalCount) * 100)}%</Badge>
          </div>
        }
      />

      <Card glass className="overflow-hidden">
        <CardContent className="flex items-center gap-5 py-7">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl gradient-brand text-3xl shadow-glow-brand">🏆</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold dark:text-white">Overall completion</p>
            <p className="text-xs text-slate-500">{unlockedCount} unlocked · {totalCount - unlockedCount} remaining · DB dan jonli</p>
            <ProgressBar value={(unlockedCount / totalCount) * 100} tone="amber" className="mt-3" />
          </div>
          <div className="hidden text-right sm:block">
            <p className="font-display text-3xl font-black tracking-tight dark:text-white">{Math.round((unlockedCount / totalCount) * 100)}%</p>
            <p className="text-xs font-bold text-slate-400 flex items-center gap-1 justify-end"><Sparkles className="h-3 w-3" /> completed</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((ach) => {
          const unlocked = progress.unlockedAchievements.includes(ach.id);
          const current = unlocked ? ach.max : getAchievementValue(ach.id, progress);
          const displayCurrent = Math.min(current, ach.max);
          const pct = ach.max > 0 ? Math.min(100, (displayCurrent / ach.max) * 100) : 0;
          return (
            <Card key={ach.id} hover glass={unlocked} className={cn("relative overflow-hidden", unlocked ? "border-amber-200/50 dark:border-amber-500/20 shadow-lg" : "opacity-95")}>
              <span className={cn("absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow", unlocked ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400 dark:bg-white/10")}>
                {unlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </span>
              <CardHeader>
                <div className="flex items-start gap-3 pr-10">
                  <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl", unlocked ? "bg-white shadow-sm ring-1 ring-amber-200 dark:bg-slate-900" : "bg-slate-100 dark:bg-white/5")}>{ach.icon}</span>
                  <div><CardTitle className="text-sm leading-tight">{ach.title}</CardTitle><CardDescription className="line-clamp-2 text-xs">{ach.description}</CardDescription></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs"><span className="font-bold dark:text-white/80">{displayCurrent} / {ach.max}</span><Badge tone={unlocked ? "amber" : "slate"}>{unlocked ? <><Trophy className="h-3 w-3" /> Unlocked</> : <><Target className="h-3 w-3" /> {pct >= 50 ? "In progress" : "Locked"}</>}</Badge></div>
                <ProgressBar value={unlocked ? 100 : pct} tone={unlocked ? "amber" : "brand"} size="sm" />
                {!unlocked && ach.max > 1 && <p className="text-xs font-medium text-slate-400">{ach.max - displayCurrent} more to unlock</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
