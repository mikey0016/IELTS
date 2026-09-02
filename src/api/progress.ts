import type { ProgressState } from "@/context/ProgressContext";

export interface Insight {
  id: string;
  icon: "up" | "warn" | "info";
  text: string;
}

export function buildInsights(state: ProgressState): Insight[] {
  const insights: Insight[] = [];

  const last = state.bandHistory[state.bandHistory.length - 1];
  const prev = state.bandHistory[state.bandHistory.length - 2];
  if (last && prev) {
    const diff = last.band - prev.band;
    if (diff > 0) {
      insights.push({
        id: "band_up",
        icon: "up",
        text: `Your overall band improved by +${diff.toFixed(1)} this month (now ${last.band.toFixed(1)}).`,
      });
    }
  }

  const weakest = Object.entries(state.skills).sort(
    (a, b) => a[1].band - b[1].band,
  )[0];
  if (weakest) {
    const [skill, stats] = weakest;
    insights.push({
      id: "weak",
      icon: "warn",
      text: `Writing is currently your weakest skill (Band ${stats.band.toFixed(1)}). We recommend 3 ${skill === "writing" ? "Writing Task 2" : "targeted"} practices this week.`,
    });
  }

  const totalQuestions = state.quizHistory.reduce((sum, q) => sum + q.total, 0);
  if (state.streak >= 7) {
    insights.push({
      id: "streak",
      icon: "info",
      text: `You are on a ${state.streak}-day streak. Students with a 7+ streak improve 2× faster on average.`,
    });
  }

  const reading = state.skills.reading;
  if (reading.band > 7) {
    insights.push({
      id: "reading",
      icon: "up",
      text: "Your Reading score improved by 0.5 bands this month — keep using the skimming drill.",
    });
  }

  if (state.vocabLearnedIds.length > 0) {
    insights.push({
      id: "vocab",
      icon: "info",
      text: `You have learned ${state.vocabLearnedIds.length} words. ${Math.min(100, state.vocabLearnedIds.length * 5)}% of your target vocabulary is complete.`,
    });
  }

  if (totalQuestions === 0) {
    insights.push({
      id: "start",
      icon: "info",
      text: "Complete your first practice set to unlock detailed analytics.",
    });
  }

  return insights;
}

export function skillOrderByStrength(
  state: ProgressState,
): Array<{ skill: string; band: number }> {
  return Object.entries(state.skills)
    .map(([skill, s]) => ({ skill, band: s.band }))
    .sort((a, b) => b.band - a.band);
}
