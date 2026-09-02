export type Skill = "listening" | "reading" | "writing" | "speaking";

export type Difficulty = "easy" | "medium" | "hard";

export type UserRole = "student" | "admin" | "superadmin";
export type UserStatus = "active" | "banned" | "pending";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  targetBand: number;
  examDate: string;
  dailyGoalMin: number;
  notifications: {
    practice: boolean;
    reminders: boolean;
    results: boolean;
  };
  planType: "free" | "premium" | "pro";
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastActiveAt: string;
  bannedReason?: string;
}

export interface SkillMeta {
  key: Skill;
  label: string;
  short: string;
  description: string;
  lessons: number;
  progress: number;
}

export interface Question {
  id: string;
  skill: "listening" | "reading";
  type: "multiple-choice" | "true-false" | "fill-blank";
  topic: string;
  difficulty: Difficulty;
  timeLimitSec: number;
  passage?: string;
  passageLabel?: string;
  prompt: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string;
  transcript?: string;
  audioDurationSec?: number;
  explanation: string;
  recommendLesson: string;
}

export interface WritingPrompt {
  id: string;
  task: string;
  type: "academic-task1" | "academic-task2" | "gt-task1" | "gt-task2";
  difficulty: Difficulty;
  timeLimitMin: number;
  minWords: number;
  prompt: string;
  instructions: string[];
}

export interface SpeakingPrompt {
  id: string;
  part: 1 | 2 | 3;
  difficulty: Difficulty;
  prepTimeSec: number;
  speakingTimeSec: number;
  cueCardTitle: string;
  prompt: string;
  followUps: string[];
}

export interface QuestionResult {
  question: Question;
  selectedIndex?: number;
  selectedAnswer?: string;
  isCorrect: boolean;
}

export interface QuizResult {
  id: string;
  skill: "listening" | "reading";
  date: string;
  score: number;
  total: number;
  correct: number;
  band: number;
  difficulty: Difficulty;
}

export interface MockTestSection {
  key: "listening" | "reading" | "writing" | "speaking";
  title: string;
  durationMin: number;
  instructions: string;
  audio?: boolean;
  questions?: Question[];
  writingPrompts?: WritingPrompt[];
  speakingPrompts?: SpeakingPrompt[];
}

export interface MockTestMeta {
  id: string;
  title: string;
  type: "Academic" | "General Training";
  durationMin: number;
  questions: number;
  description: string;
  sections: MockTestSection[];
  difficulty?: "easy" | "medium" | "hard";
  attempts?: number;
  avgBand?: number;
}

export interface MockResultSection {
  key: "listening" | "reading" | "writing" | "speaking";
  title: string;
  band: number;
  correct?: number;
  total?: number;
}

export interface MockResult {
  id: string;
  testId: string;
  date: string;
  overall: number;
  sections: MockResultSection[];
  strengths: string[];
  weaknesses: string[];
  nextSteps: string[];
}

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
  synonyms: string[];
  difficulty: Difficulty;
  learned?: boolean;
  favorite?: boolean;
  band?: number;
  topic?: string;
}

export interface ReviewState {
  ease: number;
  stability: number;
  due: number;
  lapses: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  max: number;
  condition?: string;
  reward?: string;
  tier?: "bronze" | "silver" | "gold" | "platinum";
}

export interface PlanTask {
  id: string;
  day: number;
  label: string;
  detail: string;
  skill: Skill; // faqat reading/writing/listening/speaking - eski vocabulary/grammar/mock o'chirildi
  minutes: number;
  done: boolean;
}

export interface StudyPlan {
  id: string;
  currentBand: number;
  targetBand: number;
  examDate: string;
  dailyMinutes: number;
  createdAt: string;
  weeks: PlanTask[];
}

export interface WeeklyDay {
  day: string;
  minutes: number;
  label: string;
}

export interface BandPoint {
  month: string;
  band: number;
}

export interface RecentLesson {
  id: string;
  title: string;
  skill:
    "listening" | "reading" | "writing" | "speaking" | "vocabulary" | "grammar";
  meta: string;
  progress: number;
}

// ---------------------------------------------------------------------------
// IELTS Builder — professional CMS types (admin panel)
// ---------------------------------------------------------------------------

export type IELTSQuestionType =
  | "multiple-choice"
  | "multiple-answer"
  | "true-false-not-given"
  | "yes-no-not-given"
  | "matching-headings"
  | "matching-information"
  | "matching-features"
  | "sentence-completion"
  | "summary-completion"
  | "note-completion"
  | "table-completion"
  | "flowchart-completion"
  | "diagram-label"
  | "short-answer"
  // legacy aliases kept for backward compat
  | "true-false"
  | "fill-blank";

export type IELTSModule = "reading" | "listening" | "writing" | "speaking";

export interface IELTSQuestion {
  id: string;
  number?: number; // auto-computed, not stored
  type: IELTSQuestionType;
  prompt: string;
  options?: string[]; // for MC, matching
  correctAnswer?: string;
  alternativeAnswers?: string[]; // accepted variants
  correctIndex?: number; // for MC single
  correctIndices?: number[]; // for multiple-answer
  headingList?: string[]; // for matching-headings group override
  heading?: string; // per-question mapping
  wordLimit?: string; // e.g. "NO MORE THAN TWO WORDS"
  explanation?: string;
  points?: number;
}

export interface IELTSQuestionGroup {
  id: string;
  type: IELTSQuestionType;
  title?: string; // e.g. "Questions 1-6"
  instructions: string;
  wordLimit?: string;
  // type-specific bulk data
  headingList?: string[]; // matching headings — list of headings
  featuresList?: string[]; // matching features — list of features/names
  tableRows?: string[][]; // for table completion
  diagramUrl?: string;
  questions: IELTSQuestion[];
}

export interface ReadingPassage {
  id: string;
  title: string;
  passageLabel: string; // e.g. "Passage 1"
  text: string; // rich text / html
  groups: IELTSQuestionGroup[];
  collapsed?: boolean;
}

export interface ReadingTest {
  id: string;
  title: string;
  passages: ReadingPassage[];
}

export interface ListeningPart {
  id: string;
  title: string; // e.g. "Section 1"
  audioUrl?: string;
  audioName?: string;
  audioDurationSec?: number;
  transcript?: string;
  instructions: string;
  groups: IELTSQuestionGroup[];
  collapsed?: boolean;
}

export interface ListeningTest {
  id: string;
  title: string;
  parts: ListeningPart[];
}

export interface WritingTask {
  id: string;
  taskNumber: 1 | 2;
  title: string;
  instruction: string;
  prompt: string;
  imageUrl?: string; // chart/graph/table
  imageName?: string;
  minWords: number;
  sampleAnswer?: string;
  bandCriteria?: string;
  type: WritingPrompt["type"];
  difficulty: Difficulty;
}

export interface WritingTest {
  id: string;
  title: string;
  tasks: WritingTask[];
}

export interface SpeakingPart {
  id: string;
  part: 1 | 2 | 3;
  topic: string;
  questions: string[];
  cueCard?: string;
  prepTimeSec?: number;
  speakingTimeSec?: number;
  followUps?: string[];
  collapsed?: boolean;
}

export interface SpeakingTest {
  id: string;
  title: string;
  parts: SpeakingPart[];
}

export interface IELTSTestBuilder {
  reading: ReadingTest;
  listening: ListeningTest;
  writing: WritingTest;
  speaking: SpeakingTest;
}

export interface IELTSTemplate {
  id: string;
  label: string;
  type: IELTSQuestionType;
  description: string;
  defaultInstructions: string;
  defaultWordLimit?: string;
  defaultHeadingList?: string[];
  defaultQuestions: number;
  icon: string;
}
