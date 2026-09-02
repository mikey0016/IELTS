import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  QuizResult,
  MockResult,
  Skill,
  StudyPlan,
  ReviewState,
  RecentLesson,
} from "@/types";
import { storage } from "@/lib/storage";
import { overallBand, bandFromScore } from "@/lib/bands";
import { BASELINE, MOCK_HISTORY_ITEMS } from "@/data/dashboard";
import { addCoins } from "@/lib/wallet";

const PROGRESS_KEY = "progress";

export interface SkillProgress {
  band: number;
  accuracy: number;
  questionsDone: number;
  minutes: number;
}

export type DailyGoalKey = "practiceMin" | "vocabWords" | "readingExercises";

export interface ProgressState {
  skills: Record<Skill, SkillProgress>;
  weeklyActivity: { day: string; label: string; minutes: number }[];
  bandHistory: { month: string; band: number }[];
  weeklyHours: { week: string; hours: number }[];
  vocabGrowth: { month: string; words: number }[];
  accuracyHistory: { month: string; accuracy: number }[];
  quizHistory: QuizResult[];
  mockHistory: MockResult[];
  recentLessons: RecentLesson[];
  unlockedAchievements: string[];
  streak: number;
  minutesToday: number;
  vocabLearnedIds: string[];
  favoriteWordIds: string[];
  reviews: Record<string, ReviewState>;
  dailyGoals: {
    practiceMin: number;
    vocabWords: number;
    readingExercises: number;
  };
  dailyGoalsDone: DailyGoalKey[];
  plan: StudyPlan | null;
  planTaskDoneIds: string[];
}

interface ProgressContextValue extends ProgressState {
  recordQuiz: (result: QuizResult) => void;
  recordMock: (result: MockResult) => void;
  recordMinutes: (minutes: number) => void;
  addRecentLesson: (lesson: RecentLesson) => void;
  markWordLearned: (id: string) => void;
  markWordFavorite: (id: string) => void;
  rateWord: (id: string, rating: "again" | "hard" | "good" | "easy") => void;
  toggleDailyGoal: (key: DailyGoalKey) => void;
  savePlan: (plan: StudyPlan) => void;
  toggleTask: (taskId: string) => void;
  resetProgress: () => void;
  overallBandValue: number;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function createInitialProgress(): ProgressState {
  return {
    skills: BASELINE.skills(),
    weeklyActivity: BASELINE.weeklyActivity(),
    bandHistory: BASELINE.bandHistory(),
    weeklyHours: BASELINE.weeklyHours(),
    vocabGrowth: BASELINE.vocabGrowth(),
    accuracyHistory: BASELINE.accuracyHistory(),
    quizHistory: [
      {
        id: "q_hist_1",
        skill: "listening",
        date: "2026-06-20",
        score: 7,
        total: 10,
        correct: 7,
        band: bandFromScore(0.7),
        difficulty: "medium",
      },
      {
        id: "q_hist_2",
        skill: "reading",
        date: "2026-06-19",
        score: 6,
        total: 10,
        correct: 6,
        band: bandFromScore(0.6),
        difficulty: "medium",
      },
    ],
    mockHistory: MOCK_HISTORY_ITEMS,
    recentLessons: [
      {
        id: "lesson_listening_map",
        title: "Listening — Maps & Directions",
        skill: "listening",
        meta: "Section 2 · 24 min",
        progress: 60,
      },
      {
        id: "lesson_reading_tfng",
        title: "Reading — True / False / Not Given",
        skill: "reading",
        meta: "Strategy lesson · 30 min",
        progress: 82,
      },
      {
        id: "lesson_vocab_collocations",
        title: "Academic Collocations Pack #3",
        skill: "vocabulary",
        meta: "12 words · 10 min",
        progress: 45,
      },
    ],
    unlockedAchievements: ["first_login", "10_words", "20_questions"],
    streak: 7,
    minutesToday: 24,
    vocabLearnedIds: ["w_significant", "w_mitigate", "w_comprehensive"],
    favoriteWordIds: ["w_significant"],
    reviews: {},
    dailyGoals: { practiceMin: 30, vocabWords: 20, readingExercises: 1 },
    dailyGoalsDone: [],
    plan: null,
    planTaskDoneIds: [],
  };
}

function computeAchievements(s: ProgressState): string[] {
  const unlocked = new Set(s.unlockedAchievements);
  const add = (id: string, cond: boolean) => {
    if (cond && !unlocked.has(id)) unlocked.add(id);
  };

  const listeningCount = s.quizHistory.filter(
    (q) => q.skill === "listening",
  ).length;
  const readingCount = s.quizHistory.filter(
    (q) => q.skill === "reading",
  ).length;

  add("first_login", true);
  add("day_7_streak", s.streak >= 7);
  add("day_30_streak", s.streak >= 30);
  add("first_mock", s.mockHistory.length >= 1);
  add("mock_master", s.mockHistory.length >= 5);
  add("10_words", s.vocabLearnedIds.length >= 10);
  add("50_words", s.vocabLearnedIds.length >= 50);
  add("100_words", s.vocabLearnedIds.length >= 100);
  add("20_questions", s.quizHistory.length >= 20);
  add("100_questions", s.quizHistory.length >= 100);
  add("listening_20", listeningCount >= 20);
  add("reading_20", readingCount >= 20);
  add("hour_today", s.minutesToday >= 60);
  add("study_plan", s.plan !== null);
  add("plan_week", s.planTaskDoneIds.length >= 7);
  return Array.from(unlocked);
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => {
    const saved = storage.get<ProgressState | null>(PROGRESS_KEY, null);
    if (saved) return { ...createInitialProgress(), ...saved };
    return createInitialProgress();
  });

  useEffect(() => {
    storage.set(PROGRESS_KEY, state);
  }, [state]);

  const update = useCallback((fn: (prev: ProgressState) => ProgressState) => {
    setState((prev) => {
      const next = fn(prev);
      return { ...next, unlockedAchievements: computeAchievements(next) };
    });
  }, []);

  const recordQuiz = useCallback(
    (result: QuizResult) => {
      // reward economy: coins + XP
      const coins =
        result.correct * 5 +
        (result.correct === result.total ? 12 : 0) +
        (result.band >= 7 ? 10 : 0);
      const pct = result.correct / Math.max(1, result.total);
      try {
        addCoins(
          null,
          coins,
          `Quiz ${result.skill} ${result.correct}/${result.total}`,
        );
      } catch {}
      // toast-like via custom event (Dashboard catches)
      try {
        window.dispatchEvent(
          new CustomEvent("xp:gain", {
            detail: {
              coins,
              xp: coins,
              msg: `+${coins} coins · ${result.correct}/${result.total}`,
            },
          }),
        );
      } catch {}
      update((prev) => {
        const skill = result.skill;
        const skillProgress = prev.skills[skill];
        const totalDone = skillProgress.questionsDone + result.total;
        const accuracy =
          (skillProgress.accuracy * skillProgress.questionsDone +
            result.correct) /
          totalDone;
        // ELO-like band: harder difficulty gives +0.15 else +0.07 only if >=70%
        const isGood = pct >= 0.7;
        const inc = isGood
          ? result.difficulty === "hard"
            ? 0.15
            : result.difficulty === "easy"
              ? 0.05
              : 0.1
          : 0;
        const band = Math.min(9, skillProgress.band + inc);
        // update histories: bandHistory append if day changed & band improved, weeklyHours, accuracyHistory
        const now = new Date();
        const monthLabel = now.toLocaleDateString("en-US", { month: "short" });
        const bandHistory = [...prev.bandHistory];
        if (bandHistory[bandHistory.length - 1]?.month !== monthLabel)
          bandHistory.push({
            month: monthLabel,
            band:
              Math.round(
                overallBand(Object.values(prev.skills).map((s) => s.band)) * 10,
              ) / 10,
          });
        if (bandHistory.length > 6) bandHistory.shift();
        // auto complete daily goals
        let dailyGoalsDone = [...prev.dailyGoalsDone];
        if (
          prev.minutesToday + Math.round(result.total * 1.5) >=
            prev.dailyGoals.practiceMin &&
          !dailyGoalsDone.includes("practiceMin")
        )
          dailyGoalsDone.push("practiceMin");
        // streak: if last activity was yesterday, increment else keep; store date
        const lastKey = "lastActivityDate";
        const last = storage.get<string | null>(lastKey, null);
        const todayStr = now.toDateString();
        let streak = prev.streak;
        if (last !== todayStr) {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          if (last === yesterday.toDateString()) streak = prev.streak + 1;
          // if more than 1 day gap, streak resets to 1 (but keep freeze logic elsewhere)
          else if (last && last !== todayStr) {
            const diff = Math.floor(
              (now.getTime() - new Date(last).getTime()) / 86400000,
            );
            if (diff > 1) streak = 1;
            else if (!last) streak = prev.streak;
          }
          storage.set(lastKey, todayStr);
        }
        return {
          ...prev,
          streak,
          dailyGoalsDone,
          bandHistory,
          skills: {
            ...prev.skills,
            [skill]: {
              ...skillProgress,
              questionsDone: totalDone,
              accuracy: Math.round(accuracy * 100) / 100,
              band: Math.round(band * 10) / 10,
            },
          },
          quizHistory: [result, ...prev.quizHistory].slice(0, 40),
          minutesToday: prev.minutesToday + Math.round(result.total * 1.5),
        };
      });
    },
    [update],
  );

  const recordMock = useCallback(
    (result: MockResult) => {
      const coins = Math.round(result.overall * 12) + 25;
      try {
        addCoins(null, coins, `Mock ${result.overall.toFixed(1)} band`);
        window.dispatchEvent(
          new CustomEvent("xp:gain", {
            detail: { coins, xp: coins, msg: `Mock +${coins} coins` },
          }),
        );
      } catch {}
      update((prev) => ({
        ...prev,
        mockHistory: [result, ...prev.mockHistory].slice(0, 20),
        minutesToday: prev.minutesToday + 5,
      }));
    },
    [update],
  );

  const recordMinutes = useCallback(
    (minutes: number) => {
      update((prev) => {
        const now = new Date();
        const todayIndex = (now.getDay() + 6) % 7; // Mon = 0
        return {
          ...prev,
          minutesToday: prev.minutesToday + minutes,
          weeklyActivity: prev.weeklyActivity.map((d, i) =>
            i === todayIndex ? { ...d, minutes: d.minutes + minutes } : d,
          ),
        };
      });
    },
    [update],
  );

  const addRecentLesson = useCallback(
    (lesson: RecentLesson) => {
      update((prev) => ({
        ...prev,
        recentLessons: [
          lesson,
          ...prev.recentLessons.filter((l) => l.id !== lesson.id),
        ].slice(0, 5),
      }));
    },
    [update],
  );

  const markWordLearned = useCallback(
    (id: string) => {
      try {
        addCoins(null, 3, `Word ${id}`);
        window.dispatchEvent(
          new CustomEvent("xp:gain", {
            detail: { coins: 3, xp: 3, msg: "+3 coins — word learned" },
          }),
        );
      } catch {}
      update((prev) => {
        if (prev.vocabLearnedIds.includes(id)) return prev;
        let dailyGoalsDone = [...prev.dailyGoalsDone];
        if (
          prev.vocabLearnedIds.length + 1 >= prev.dailyGoals.vocabWords &&
          !dailyGoalsDone.includes("vocabWords")
        )
          dailyGoalsDone.push("vocabWords");
        const vocabGrowth = [...prev.vocabGrowth];
        const m = new Date().toLocaleDateString("en-US", { month: "short" });
        if (vocabGrowth[vocabGrowth.length - 1]?.month !== m)
          vocabGrowth.push({
            month: m,
            words: vocabGrowth[vocabGrowth.length - 1].words + 1,
          });
        else vocabGrowth[vocabGrowth.length - 1].words += 1;
        return {
          ...prev,
          dailyGoalsDone,
          vocabGrowth: vocabGrowth.slice(-6),
          vocabLearnedIds: [...prev.vocabLearnedIds, id],
        };
      });
    },
    [update],
  );

  const markWordFavorite = useCallback(
    (id: string) => {
      update((prev) => {
        const favorites = prev.favoriteWordIds.includes(id)
          ? prev.favoriteWordIds.filter((f) => f !== id)
          : [...prev.favoriteWordIds, id];
        return { ...prev, favoriteWordIds: favorites };
      });
    },
    [update],
  );

  const rateWord = useCallback(
    (id: string, rating: "again" | "hard" | "good" | "easy") => {
      update((prev) => {
        const current = prev.reviews[id] ?? {
          ease: 2.5,
          stability: 3,
          due: 0,
          lapses: 0,
        };
        const boxed = { ...current };
        let interval = boxed.stability;
        const ease = boxed.ease;
        if (rating === "again") {
          interval = 1;
        } else if (rating === "hard") {
          interval = interval * 1.2;
        } else if (rating === "good") {
          interval = interval * ease;
        } else {
          interval = interval * ease * 1.3;
        }
        const due =
          rating === "again"
            ? Date.now() + 60_000
            : Date.now() + interval * 86_400_000;
        return {
          ...prev,
          reviews: {
            ...prev.reviews,
            [id]: {
              ease: boxed.ease,
              stability: interval,
              due,
              lapses: rating === "again" ? boxed.lapses + 1 : boxed.lapses,
            },
          },
        };
      });
    },
    [update],
  );

  const toggleDailyGoal = useCallback(
    (key: DailyGoalKey) => {
      update((prev) => ({
        ...prev,
        dailyGoalsDone: prev.dailyGoalsDone.includes(key)
          ? prev.dailyGoalsDone.filter((k) => k !== key)
          : [...prev.dailyGoalsDone, key],
      }));
    },
    [update],
  );

  const savePlan = useCallback(
    (plan: StudyPlan) => {
      update((prev) => ({ ...prev, plan }));
    },
    [update],
  );

  const toggleTask = useCallback(
    (taskId: string) => {
      update((prev) => ({
        ...prev,
        planTaskDoneIds: prev.planTaskDoneIds.includes(taskId)
          ? prev.planTaskDoneIds.filter((id) => id !== taskId)
          : [...prev.planTaskDoneIds, taskId],
      }));
    },
    [update],
  );

  const resetProgress = useCallback(() => {
    setState(createInitialProgress());
  }, []);

  const overallBandValue = useMemo(() => {
    const bands = Object.values(state.skills).map((s) => s.band);
    return overallBand(bands);
  }, [state.skills]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      ...state,
      recordQuiz,
      recordMock,
      recordMinutes,
      addRecentLesson,
      markWordLearned,
      markWordFavorite,
      rateWord,
      toggleDailyGoal,
      savePlan,
      toggleTask,
      resetProgress,
      overallBandValue,
    }),
    [
      state,
      recordQuiz,
      recordMock,
      recordMinutes,
      addRecentLesson,
      markWordLearned,
      markWordFavorite,
      rateWord,
      toggleDailyGoal,
      savePlan,
      toggleTask,
      resetProgress,
      overallBandValue,
    ],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
