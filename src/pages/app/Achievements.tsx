import { Lock, Unlock, Trophy, Target } from "lucide-react";
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
import { useProgress } from "@/context/ProgressContext";
import { ACHIEVEMENTS } from "@/data/achievements";
import { cn } from "@/lib/cn";

function getAchievementValue(
  id: string,
  p: ReturnType<typeof useProgress>,
): number {
  switch (id) {
    case "first_login":
      return 1;
    case "day_7_streak":
    case "day_30_streak":
      return p.streak;
    case "10_words":
    case "50_words":
    case "100_words":
      return p.vocabLearnedIds.length;
    case "20_questions":
    case "100_questions":
      return p.quizHistory.length;
    case "listening_20":
      return p.quizHistory.filter((q) => q.skill === "listening").length;
    case "reading_20":
      return p.quizHistory.filter((q) => q.skill === "reading").length;
    case "first_mock":
    case "mock_master":
      return p.mockHistory.length;
    case "hour_today":
      return p.minutesToday >= 60 ? 1 : 0;
    case "study_plan":
      return p.plan ? 1 : 0;
    case "plan_week":
      return p.planTaskDoneIds.length;
    default:
      return 0;
  }
}

export function Achievements() {
  const progress = useProgress();
  const unlockedCount = progress.unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Achievements"
        title="Milestones and badges"
        description={`You've unlocked ${unlockedCount} of ${totalCount} achievements — keep streaking and finishing mocks to collect them all.`}
        actions={
          <div className="flex items-center gap-2">
            <Badge tone="amber">
              <Trophy className="h-3 w-3" /> {unlockedCount}/{totalCount}
            </Badge>
            <Badge tone="slate">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </Badge>
          </div>
        }
      />

      <Card>
        <CardContent className="flex items-center gap-4 py-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl shadow">
            🏆
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Overall completion
            </p>
            <p className="text-xs text-slate-400">
              {unlockedCount} unlocked · {totalCount - unlockedCount} remaining
            </p>
            <ProgressBar
              value={(unlockedCount / totalCount) * 100}
              tone="amber"
              className="mt-2"
            />
          </div>
          <div className="hidden text-right sm:block">
            <p className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </p>
            <p className="text-xs font-semibold text-slate-400">completed</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = progress.unlockedAchievements.includes(ach.id);
          const current = unlocked
            ? ach.max
            : getAchievementValue(ach.id, progress);
          const displayCurrent = Math.min(current, ach.max);
          const pct =
            ach.max > 0 ? Math.min(100, (displayCurrent / ach.max) * 100) : 0;

          return (
            <Card
              key={ach.id}
              className={cn(
                "relative overflow-hidden transition",
                unlocked
                  ? "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/60 shadow-sm dark:border-amber-900 dark:from-amber-950/30 dark:to-orange-950/20"
                  : "opacity-90 grayscale-[0.15] hover:opacity-100",
              )}
            >
              {unlocked && (
                <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-white shadow">
                  <Unlock className="h-3.5 w-3.5" />
                </span>
              )}
              {!unlocked && (
                <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <Lock className="h-3.5 w-3.5" />
                </span>
              )}
              <CardHeader>
                <div className="flex items-start gap-3 pr-8">
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl",
                      unlocked
                        ? "bg-white shadow-sm ring-1 ring-amber-200 dark:bg-slate-900 dark:ring-amber-900"
                        : "bg-slate-100 dark:bg-slate-800",
                    )}
                  >
                    {ach.icon}
                  </span>
                  <div>
                    <CardTitle className="text-sm leading-tight">
                      {ach.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                      {ach.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300">
                    {displayCurrent} / {ach.max}
                  </span>
                  <Badge tone={unlocked ? "amber" : "slate"} className="gap-1">
                    {unlocked ? (
                      <>
                        <Trophy className="h-3 w-3" /> Unlocked
                      </>
                    ) : (
                      <>
                        <Target className="h-3 w-3" />{" "}
                        {pct >= 50 ? "In progress" : "Locked"}
                      </>
                    )}
                  </Badge>
                </div>
                <ProgressBar
                  value={unlocked ? 100 : pct}
                  tone={unlocked ? "amber" : "brand"}
                  size="sm"
                />
                {!unlocked && ach.max > 1 && (
                  <p className="text-xs font-medium text-slate-400">
                    {ach.max - displayCurrent} more to unlock
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-dashed">
        <CardContent className="py-6 text-center">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Tip: maintain a 7-day streak and complete mocks — they unlock the
            fastest.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Achievements update automatically as you practice; check back after
            each session.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
