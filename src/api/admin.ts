/**
 * Admin mock API layer.
 *
 * CRUD-like helpers backed by localStorage via src/lib/storage.ts.
 * All operations go through mockRequest (300-600ms) for realism.
 * When a real backend is ready, replace these with real fetch calls.
 */
import type {
  UserProfile,
  UserRole,
  Question,
  VocabularyWord,
  WritingPrompt,
  SpeakingPrompt,
  MockTestMeta,
  AchievementDef,
  Difficulty,
  Skill,
} from "@/types";
import type { Course, Lesson, GrammarTopic } from "@/data/content";
import { COURSES, GRAMMAR_TOPICS } from "@/data/content";
import { LISTENING_QUESTIONS, READING_QUESTIONS } from "@/data/questions";
import { VOCAB_DECK } from "@/data/vocabulary";
import { WRITING_PROMPTS } from "@/data/writing";
import { SPEAKING_PROMPTS } from "@/data/speaking";
import { MOCK_TESTS } from "@/data/mockTests";
import { ACHIEVEMENTS } from "@/data/achievements";
import { storage } from "@/lib/storage";
import { randomId } from "@/lib/format";
import { mockRequest, MockApiError } from "./mockClient";
import { apiFetch, isRealApi } from "./http";
import { Headphones, FileText, PenLine, Mic } from "lucide-react";
import REAL_IELTS_SEED from "@/data/realIeltsImport.json";

// ---------------------------------------------------------------------------
// Keys — note 'users' is shared with src/api/auth.ts
// ---------------------------------------------------------------------------
const USERS_KEY = "users";
const QUESTIONS_KEY = "admin_questions";
const VOCAB_KEY = "admin_vocab";
const COURSES_KEY = "admin_courses";
const WRITING_KEY = "admin_writing";
const SPEAKING_KEY = "admin_speaking";
const GRAMMAR_KEY = "admin_grammar";
const MOCKS_KEY = "admin_mocks";
const ACHIEVEMENTS_KEY = "admin_achievements";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function randDelay(): number {
  return 300 + Math.floor(Math.random() * 300);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// ---------------------------------------------------------------------------
// Users — seed logic preserved from src/api/auth.ts
// ---------------------------------------------------------------------------
const DEMO_USER: UserProfile = {
  id: "u_demo",
  name: "Alex Carter",
  email: "alex@ieltsmaster.com",
  avatarColor: "#4c56ec",
  targetBand: 7.5,
  examDate: "2026-12-15",
  dailyGoalMin: 30,
  notifications: { practice: true, reminders: true, results: true },
  planType: "premium",
  role: "student",
  status: "active",
  createdAt: "2025-11-10T10:00:00.000Z",
  lastActiveAt: new Date().toISOString(),
};

const ADMIN_USER: UserProfile = {
  id: "u_admin",
  name: "Admin Master",
  email: "admin@ieltsmaster.com",
  avatarColor: "#7c3aed",
  targetBand: 9,
  examDate: "",
  dailyGoalMin: 60,
  notifications: { practice: true, reminders: true, results: true },
  planType: "pro",
  role: "admin",
  status: "active",
  createdAt: "2025-01-01T08:00:00.000Z",
  lastActiveAt: new Date().toISOString(),
};

const SUPERADMIN_USER: UserProfile = {
  id: "u_superadmin",
  name: "Super Admin",
  email: "superadmin@ieltsmaster.com",
  avatarColor: "#0f172a",
  targetBand: 9,
  examDate: "",
  dailyGoalMin: 60,
  notifications: { practice: true, reminders: true, results: true },
  planType: "pro",
  role: "superadmin",
  status: "active",
  createdAt: "2024-12-01T08:00:00.000Z",
  lastActiveAt: new Date().toISOString(),
};

const OWNER_USER: UserProfile = {
  id: "u_owner_vmd",
  name: "vmd_xz",
  email: "vmd_xz@gmail.com",
  avatarColor: "#0f172a",
  targetBand: 9,
  examDate: "",
  dailyGoalMin: 60,
  notifications: { practice: true, reminders: true, results: true },
  planType: "pro",
  role: "superadmin",
  status: "active",
  createdAt: "2024-12-01T08:00:00.000Z",
  lastActiveAt: new Date().toISOString(),
};

const DEMO_STUDENTS: UserProfile[] = [
  {
    id: "u_s1",
    name: "Sarvar Rahimov",
    email: "sarvar.r@ielts.uz",
    avatarColor: "#305c8d",
    targetBand: 8,
    examDate: "2026-09-20",
    dailyGoalMin: 45,
    notifications: { practice: true, reminders: true, results: true },
    planType: "premium",
    role: "student",
    status: "active",
    createdAt: "2026-02-14T09:00:00Z",
    lastActiveAt: "2026-08-26T10:30:00Z",
  },
  {
    id: "u_s2",
    name: "Madina Yusupova",
    email: "madina.y@ielts.uz",
    avatarColor: "#7c3aed",
    targetBand: 7.5,
    examDate: "2026-10-05",
    dailyGoalMin: 30,
    notifications: { practice: true, reminders: false, results: true },
    planType: "premium",
    role: "student",
    status: "active",
    createdAt: "2026-03-01T09:00:00Z",
    lastActiveAt: "2026-08-27T08:00:00Z",
  },
  {
    id: "u_s3",
    name: "Jasur Toshpulatov",
    email: "jasur.t@ielts.uz",
    avatarColor: "#0e7490",
    targetBand: 7,
    examDate: "2026-11-12",
    dailyGoalMin: 30,
    notifications: { practice: true, reminders: true, results: false },
    planType: "free",
    role: "student",
    status: "banned",
    createdAt: "2026-01-20T09:00:00Z",
    lastActiveAt: "2026-07-15T09:00:00Z",
    bannedReason: "Spam activity",
  },
  {
    id: "u_s4",
    name: "Nilufar Azimova",
    email: "nilufar.a@ielts.uz",
    avatarColor: "#059669",
    targetBand: 8.5,
    examDate: "2026-08-30",
    dailyGoalMin: 60,
    notifications: { practice: true, reminders: true, results: true },
    planType: "pro",
    role: "student",
    status: "active",
    createdAt: "2025-12-05T09:00:00Z",
    lastActiveAt: "2026-08-28T07:00:00Z",
  },
  {
    id: "u_s5",
    name: "Otabek Karimov",
    email: "otabek.k@ielts.uz",
    avatarColor: "#d97706",
    targetBand: 6.5,
    examDate: "2026-12-01",
    dailyGoalMin: 30,
    notifications: { practice: false, reminders: true, results: true },
    planType: "free",
    role: "student",
    status: "pending",
    createdAt: "2026-08-20T09:00:00Z",
    lastActiveAt: "2026-08-20T09:00:00Z",
  },
];

const USERS_SEEDED_KEY = "users_seeded_v2";

function seedUsers(existing: UserProfile[]): UserProfile[] {
  const alreadySeeded = storage.get<boolean>(USERS_SEEDED_KEY, false);
  // Faqat birinchi marta seed qilamiz — o'chirilgan userlar qayta paydo bo'lmasin
  if (!alreadySeeded) {
    let changed = false;
    if (existing.length === 0) {
      for (const seed of [DEMO_USER, ADMIN_USER, SUPERADMIN_USER, OWNER_USER]) {
        if (!existing.some((u) => u.id === seed.id)) {
          existing.unshift(seed);
          changed = true;
        }
      }
      for (const s of DEMO_STUDENTS) {
        if (!existing.some((u) => u.id === s.id)) {
          existing.push(s);
          changed = true;
        }
      }
    }
    storage.set(USERS_SEEDED_KEY, true);
    if (changed) storage.set(USERS_KEY, existing);
  }
  return existing;
}

function getUsersStore(): UserProfile[] {
  const raw = storage.get<UserProfile[] | null>(USERS_KEY, null);
  if (raw === null) return seedUsers([]);
  const flag = storage.get<boolean>(USERS_SEEDED_KEY, false);
  if (!flag && raw.length > 0) storage.set(USERS_SEEDED_KEY, true);
  const users = seedUsers(raw);
  if (!users.some((u) => u.id === OWNER_USER.id)) {
    users.unshift(OWNER_USER);
    storage.set(USERS_KEY, users);
  }
  return users;
}

function saveUsers(users: UserProfile[]): void {
  storage.set(USERS_KEY, users);
}

// ---------------------------------------------------------------------------
// Generic collection helpers
// ---------------------------------------------------------------------------
function getOrSeed<T>(key: string, seed: T[]): T[] {
  const stored = storage.get<T[]>(key, []);
  if (stored.length === 0) {
    const copy = clone(seed);
    storage.set(key, copy);
    return copy;
  }
  return stored;
}

function saveCollection<T>(key: string, items: T[]): void {
  storage.set(key, items);
}

// ---------------------------------------------------------------------------
// Questions helpers
// ---------------------------------------------------------------------------
const ALL_QUESTIONS_SEED: Question[] = [
  ...LISTENING_QUESTIONS,
  ...READING_QUESTIONS,
];

function sanitizeStoredPassage(text: string | undefined): string | undefined {
  if (!text) return text;
  if (
    !text.includes("Go to submission page") &&
    !text.includes("Contrast") &&
    !text.includes("Options") &&
    text.length < 8000
  )
    return text;
  const markers = [
    "Dolls through the ages",
    "Dolls have been a part",
    "What is today a simple",
  ];
  for (const m of markers) {
    const idx = text.indexOf(m);
    if (idx > 0) {
      const cleaned = text
        .slice(idx)
        .replace(/^Options.*?Text size\s*/i, "")
        .trim();
      if (cleaned.length > 200) return cleaned;
    }
  }
  let t = text.replace(/^[\s\S]*?Reading Passage \d+\s*/i, "").trim();
  t = t
    .replace(
      /^You should spend about 20 minutes[\s\S]*?Reading Passage \d+\s*/i,
      "",
    )
    .trim();
  t = t.replace(/^Options[\s\S]*?Text size\s*/i, "").trim();
  return t.length > 100 ? t : text;
}

// Hard-coded correct Dolls questions — used to auto-fix corrupted imports
const DOLLS_PASSAGE_LABEL = "Reading Passage 1";
const DOLLS_TOPIC = "Dolls through the ages";
const DOLLS_PASSAGE = `What is today a simple children’s toy has a surprisingly rich history

Dolls have been a part of humankind for thousands of years. Often depicting religious figures, or used as playthings, early dolls were probably made from primitive materials such as clay, fur, or wood.

Dolls constructed of flat pieces of wood, painted with various designs, and with 'hair' made of clay, have often been found in Egyptian graves dating back to 2000 BC. Egyptian tombs of wealthy families have included pottery dolls. Dolls being placed in these graves leads some to believe that they were cherished possessions.

Girls from ancient Greece and Rome offered their wooden dolls to goddesses after they were too 'grown-up' to play with dolls. Most ancient dolls that were found in tombs were very simple creations, often made from such materials as clay, rags, wood, or bone. Some of the more unique dolls were made with ivory or wax. The main goal was to make the doll as 'lifelike' as possible. That ideal led to the creation of dolls with movable limbs and removable garments, dating back to 600 BC.

Following the era of the ancient dolls, Europe became a major hub for doll production. These dolls were primarily made of wood. Fewer than 30 examples of primitive wooden stump dolls from England survive today. The Grodnertal area of Germany produced many peg wooden dolls, a type of doll that has very simple peg joints and resembles a clothespin (a device for hanging washing on a clothesline). An alternative to wood was developed in the 1800s. 'Composition' is a collective term for mixtures of pulped wood or paper that were used to make doll heads and bodies. These mixtures were moulded under pressure, creating a durable doll that could be mass produced. Manufacturers closely guarded the recipes for their mixtures, sometimes using strange ingredients like ash or eggshells. Papier-mâché, a type of composition, was one of the most popular mixtures.

In addition to wooden dolls, wax dolls grew in popularity in the 17th and 18th centuries. Munich in Germany was a major manufacturing centre for wax dolls. Wax modellers would model a doll's head in wax or clay, and then cover it with plaster to create a mould. Then they would pour melted wax into the cast. The wax for the head would be very thin, no more than 3 mm. Some of the most distinctive wax dolls were created in England between 1850 and 1930. One of the first dolls that portrayed a baby was made in England from wax at the beginning of the 19th century.

Around the same time porcelain became popular. It is made by firing special clays in a kiln at more than 2372 degrees Fahrenheit (1300°C), and only a few clays can withstand firing at such high temperatures. Porcelain is used generically to refer to both china and bisque dolls; china is glazed, whereas bisque is unglazed. Germany, France, and Denmark started creating china heads for dolls in the 1840s. These china heads were replaced in the 1860s by ones made of bisque. Bisque, which is porcelain fired twice with colour added to it after the first firing, looked more like skin than china did.

In France, the bébé was popular in the 1880s, and it has become a highly sought after doll today. The bébé, first made in the 1850s, was different from its predecessors because it depicted a younger girl. Until then, most French dolls were representations of adults. Although the French dolls were unrivalled in their artistry, German bisque dolls became quite popular because they were not as expensive. Kammer & Reinhardt introduced a bisque character doll in the 1900s, starting a trend of creating realistic dolls.

For many centuries, rag dolls were made by mothers for their children. The term 'rag doll' refers generically to dolls made of any fabric. 'Cloth doll' refers to a subset of rag dolls made of linen or cotton. Commercially produced rag dolls were first introduced in the 1850s by English and American manufacturers. Although not as sophisticated as dolls made from other materials, rag dolls were well loved, often as a child's first toy.

Dollmaking did not become an industry in the United States until after the Civil War in the 1860s. Doll production was concentrated in the New England region of the United States, with dolls made from a variety of materials such as leather, rubber, papier-mâché, and cloth. Celluloid was developed in the state of New Jersey in the late 1860s and was used to manufacture dolls until the mid-1950s. German, French, American, and Japanese factories churned out cheaply produced celluloid dolls in mass quantities. However, celluloid fell out of favour because of its extreme flammability and propensity to fade in bright light.

After World War I, doll makers experimented with plastics. Hard plastic dolls were manufactured in the 1940s. They resembled composition dolls, but they were much more durable. Other materials used in doll manufacturing included rubber, foam rubber, and vinyl in the 1950s and 1960s. Vinyl changed doll making, allowing doll makers to root hair into the head, rather than using wigs or painting the hair. Although most dolls are now mass-manufactured using these modern materials, many modern doll makers are still using the traditional materials of the past to make collectible dolls.`;

const DOLLS_QUESTIONS_CORRECT: Omit<Question, "id">[] = [
  {
    skill: "reading",
    type: "fill-blank",
    topic: DOLLS_TOPIC,
    difficulty: "medium",
    timeLimitSec: 90,
    passage: DOLLS_PASSAGE,
    passageLabel: DOLLS_PASSAGE_LABEL,
    prompt: "___ was used for the hair",
    correctAnswer: "clay",
    explanation:
      "Dolls constructed of flat pieces of wood ... with 'hair' made of clay",
    recommendLesson: DOLLS_TOPIC,
  },
  {
    skill: "reading",
    type: "fill-blank",
    topic: DOLLS_TOPIC,
    difficulty: "medium",
    timeLimitSec: 90,
    passage: DOLLS_PASSAGE,
    passageLabel: DOLLS_PASSAGE_LABEL,
    prompt: "dolls were given to ___ by older girls",
    correctAnswer: "goddesses",
    explanation:
      "Girls from ancient Greece and Rome offered their wooden dolls to goddesses",
    recommendLesson: DOLLS_TOPIC,
  },
  {
    skill: "reading",
    type: "fill-blank",
    topic: DOLLS_TOPIC,
    difficulty: "medium",
    timeLimitSec: 90,
    passage: DOLLS_PASSAGE,
    passageLabel: DOLLS_PASSAGE_LABEL,
    prompt:
      "realistic dolls had separate clothes and ___ that could be put in different positions",
    correctAnswer: "limbs",
    explanation:
      "That ideal led to the creation of dolls with movable limbs and removable garments",
    recommendLesson: DOLLS_TOPIC,
  },
  {
    skill: "reading",
    type: "fill-blank",
    topic: DOLLS_TOPIC,
    difficulty: "medium",
    timeLimitSec: 90,
    passage: DOLLS_PASSAGE,
    passageLabel: DOLLS_PASSAGE_LABEL,
    prompt: "dolls made of ___ became more common",
    correctAnswer: "wax",
    explanation: "wax dolls grew in popularity in the 17th and 18th centuries",
    recommendLesson: DOLLS_TOPIC,
  },
  {
    skill: "reading",
    type: "fill-blank",
    topic: DOLLS_TOPIC,
    difficulty: "medium",
    timeLimitSec: 90,
    passage: DOLLS_PASSAGE,
    passageLabel: DOLLS_PASSAGE_LABEL,
    prompt: "moulds made of ___",
    correctAnswer: "plaster",
    explanation: "cover it with plaster to create a mould",
    recommendLesson: DOLLS_TOPIC,
  },
  {
    skill: "reading",
    type: "fill-blank",
    topic: DOLLS_TOPIC,
    difficulty: "medium",
    timeLimitSec: 90,
    passage: DOLLS_PASSAGE,
    passageLabel: DOLLS_PASSAGE_LABEL,
    prompt: "new group of mixtures known as ___",
    correctAnswer: "composition",
    explanation:
      "'Composition' is a collective term for mixtures of pulped wood or paper",
    recommendLesson: DOLLS_TOPIC,
  },
  {
    skill: "reading",
    type: "true-false",
    topic: DOLLS_TOPIC,
    difficulty: "medium",
    timeLimitSec: 90,
    passage: DOLLS_PASSAGE,
    passageLabel: DOLLS_PASSAGE_LABEL,
    prompt: "Bisque dolls appear less realistic than dolls made of China.",
    options: ["TRUE", "FALSE", "NOT GIVEN"],
    correctIndex: 1,
    explanation: "Bisque ... looked more like skin than china did — so FALSE",
    recommendLesson: DOLLS_TOPIC,
  },
  {
    skill: "reading",
    type: "true-false",
    topic: DOLLS_TOPIC,
    difficulty: "medium",
    timeLimitSec: 90,
    passage: DOLLS_PASSAGE,
    passageLabel: DOLLS_PASSAGE_LABEL,
    prompt: "French dolls tended to cost more than German bisque dolls.",
    options: ["TRUE", "FALSE", "NOT GIVEN"],
    correctIndex: 0,
    explanation:
      "German bisque dolls became quite popular because they were not as expensive — TRUE",
    recommendLesson: DOLLS_TOPIC,
  },
  {
    skill: "reading",
    type: "true-false",
    topic: DOLLS_TOPIC,
    difficulty: "medium",
    timeLimitSec: 90,
    passage: DOLLS_PASSAGE,
    passageLabel: DOLLS_PASSAGE_LABEL,
    prompt: "The first rag dolls were made in the 1850s.",
    options: ["TRUE", "FALSE", "NOT GIVEN"],
    correctIndex: 1,
    explanation:
      "For many centuries, rag dolls were made by mothers ... Commercially produced in the 1850s — so FALSE",
    recommendLesson: DOLLS_TOPIC,
  },
  {
    skill: "reading",
    type: "true-false",
    topic: DOLLS_TOPIC,
    difficulty: "medium",
    timeLimitSec: 90,
    passage: DOLLS_PASSAGE,
    passageLabel: DOLLS_PASSAGE_LABEL,
    prompt: "Only dolls made of cotton or linen are classified as cloth dolls.",
    options: ["TRUE", "FALSE", "NOT GIVEN"],
    correctIndex: 0,
    explanation:
      "'Cloth doll' refers to a subset of rag dolls made of linen or cotton — TRUE",
    recommendLesson: DOLLS_TOPIC,
  },
  {
    skill: "reading",
    type: "true-false",
    topic: DOLLS_TOPIC,
    difficulty: "medium",
    timeLimitSec: 90,
    passage: DOLLS_PASSAGE,
    passageLabel: DOLLS_PASSAGE_LABEL,
    prompt: "Dolls made of celluloid tended to lose their colour.",
    options: ["TRUE", "FALSE", "NOT GIVEN"],
    correctIndex: 0,
    explanation: "its ... propensity to fade in bright light — TRUE",
    recommendLesson: DOLLS_TOPIC,
  },
  {
    skill: "reading",
    type: "true-false",
    topic: DOLLS_TOPIC,
    difficulty: "medium",
    timeLimitSec: 90,
    passage: DOLLS_PASSAGE,
    passageLabel: DOLLS_PASSAGE_LABEL,
    prompt:
      "Composition dolls lasted longer than the plastic dolls that were made in the 1940s.",
    options: ["TRUE", "FALSE", "NOT GIVEN"],
    correctIndex: 1,
    explanation:
      "Hard plastic dolls ... were much more durable (than composition) — so FALSE",
    recommendLesson: DOLLS_TOPIC,
  },
  {
    skill: "reading",
    type: "true-false",
    topic: DOLLS_TOPIC,
    difficulty: "medium",
    timeLimitSec: 90,
    passage: DOLLS_PASSAGE,
    passageLabel: DOLLS_PASSAGE_LABEL,
    prompt:
      "Doll collectors prefer a doll to be dressed in its original clothing.",
    options: ["TRUE", "FALSE", "NOT GIVEN"],
    correctIndex: 2,
    explanation: "No information on this — NOT GIVEN",
    recommendLesson: DOLLS_TOPIC,
  },
];

function getQuestionsStore(): Question[] {
  const stored = getOrSeed<Question>(QUESTIONS_KEY, ALL_QUESTIONS_SEED);
  let mutated = false;
  let cleaned = stored.map((q) => {
    const sanitized = sanitizeStoredPassage(q.passage);
    if (sanitized !== q.passage) {
      mutated = true;
      return { ...q, passage: sanitized };
    }
    return q;
  });
  // Auto-fix corrupted Dolls import — compare prompts exactly with expected short bullets
  const dollsInStore = cleaned.filter(
    (q) =>
      (q.topic === DOLLS_TOPIC || q.topic.includes("Dolls Through")) &&
      q.skill === "reading",
  );
  const expectedSet = new Set(DOLLS_QUESTIONS_CORRECT.map((q) => q.prompt));
  const isCorrupted =
    dollsInStore.length > 0 &&
    (dollsInStore.length !== 13 ||
      dollsInStore.some(
        (q) =>
          !expectedSet.has(q.prompt) ||
          q.prompt === "Questions 1-6" ||
          q.passage?.includes("Go to submission"),
      ) ||
      dollsInStore.some(
        (q) => q.type === "fill-blank" && q.prompt.includes("Bisque dolls"),
      )); // Q7 should not be fill-blank
  if (isCorrupted) {
    const keep = cleaned.filter(
      (q) =>
        !(q.topic === DOLLS_TOPIC || q.topic.includes("Dolls Through")) ||
        q.skill !== "reading",
    );
    const fresh: Question[] = DOLLS_QUESTIONS_CORRECT.map(
      (q, i) => ({ ...q, id: `dolls_q${i + 1}_${randomId("d")}` }) as Question,
    );
    cleaned = [...keep, ...fresh];
    mutated = true;
  }
  // --- 1-to-1 real IELTS migration: user requested "barchaaa hamma tasklarni ochir" then re-import from ieltsmaterials.uz + local ---
  const MIGRATED_KEY = "real_ielts_migrated_v4";
  const alreadyMigrated = storage.get<boolean>(MIGRATED_KEY, false);
  if (!alreadyMigrated) {
    // Clear ALL old tasks (reading, listening, writing, speaking) and replace with 1-to-1 real files (184 questions)
    const imported = (REAL_IELTS_SEED as unknown as Question[]).map(
      (q) => ({ ...q }) as Question,
    );
    cleaned = [...imported];
    // Also clear other collections (writing, speaking, vocab, mocks) if you want full wipe — keep for now, but questions are fully replaced
    mutated = true;
    storage.set(MIGRATED_KEY, true);
  }
  // Full clear flag for "barcha hamma tasklarni ochir" — if user wants to clear everything, they can trigger via admin UI
  const FULL_CLEAR_KEY = "full_clear_all_tasks_v1";
  if (
    storage.get<boolean>("request_full_clear", false) &&
    !storage.get<boolean>(FULL_CLEAR_KEY, false)
  ) {
    cleaned = [];
    saveCollection(QUESTIONS_KEY, cleaned);
    storage.set(FULL_CLEAR_KEY, true);
    storage.remove("request_full_clear");
    mutated = false;
    return cleaned;
  }
  if (mutated) saveCollection(QUESTIONS_KEY, cleaned);
  return cleaned;
}

// ---------------------------------------------------------------------------
// Vocabulary helpers
// ---------------------------------------------------------------------------
function getVocabStore(): VocabularyWord[] {
  return getOrSeed<VocabularyWord>(VOCAB_KEY, VOCAB_DECK);
}

// ---------------------------------------------------------------------------
// Courses helpers — icons are not JSON-serialisable; hydrate on read
// ---------------------------------------------------------------------------
const COURSE_ICON_MAP: Record<Skill, typeof Headphones> = {
  listening: Headphones,
  reading: FileText,
  writing: PenLine,
  speaking: Mic,
};

function hydrateCourses(stored: Course[]): Course[] {
  return stored.map((c) => ({
    ...c,
    icon: COURSE_ICON_MAP[c.key as Skill] ?? Headphones,
  }));
}

function stripCourseIcons(courses: Course[]): unknown {
  return courses.map(({ icon: _icon, ...rest }) => rest);
}

function getCoursesStore(): Course[] {
  const raw = storage.get<Course[]>(COURSES_KEY, []);
  if (raw.length === 0) {
    // seed: clone without icons to avoid serialisation issues, but store rest
    const seed = clone(COURSES) as Course[];
    // Remove icon function before saving (JSON will drop it anyway)
    saveCollection(COURSES_KEY, JSON.parse(JSON.stringify(seed)) as Course[]);
    return clone(COURSES) as Course[];
  }
  // stored courses have no icon; hydrate
  return hydrateCourses(raw);
}

function saveCourses(courses: Course[]): void {
  saveCollection(
    COURSES_KEY,
    JSON.parse(JSON.stringify(stripCourseIcons(courses))) as Course[],
  );
}

// ---------------------------------------------------------------------------
// Writing / Speaking / Grammar / Mocks / Achievements stores
// ---------------------------------------------------------------------------
function getWritingStore(): WritingPrompt[] {
  return getOrSeed<WritingPrompt>(WRITING_KEY, WRITING_PROMPTS);
}
function getSpeakingStore(): SpeakingPrompt[] {
  return getOrSeed<SpeakingPrompt>(SPEAKING_KEY, SPEAKING_PROMPTS);
}
function getGrammarStore(): GrammarTopic[] {
  return getOrSeed<GrammarTopic>(GRAMMAR_KEY, GRAMMAR_TOPICS);
}
function getMocksStore(): MockTestMeta[] {
  return getOrSeed<MockTestMeta>(MOCKS_KEY, MOCK_TESTS);
}
function getAchievementsStore(): AchievementDef[] {
  return getOrSeed<AchievementDef>(ACHIEVEMENTS_KEY, ACHIEVEMENTS);
}

// ===========================================================================
// USERS
// ===========================================================================

export function adminListUsers(): Promise<UserProfile[]> {
  if (isRealApi()) return apiFetch("/api/admin/users").then((d: any) => d as UserProfile[]);
  return mockRequest(() => clone(getUsersStore()), randDelay());
}

export function adminGetUser(id: string): Promise<UserProfile | undefined> {
  if (isRealApi()) return apiFetch(`/api/admin/users/${id}`).then((d: any) => d as UserProfile).catch(() => undefined);
  return mockRequest(
    () =>
      clone(getUsersStore().find((u) => u.id === id)) as
        UserProfile | undefined,
    randDelay(),
  );
}

export function adminCreateUser(
  data: Partial<UserProfile> & { name: string; email: string },
): Promise<UserProfile> {
  if (isRealApi()) return apiFetch("/api/admin/users", { method: "POST", body: JSON.stringify(data) });
  return mockRequest(() => {
    if (!data.name || data.name.trim().length < 2)
      throw new MockApiError("Name must be at least 2 characters.");
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      throw new MockApiError("Please enter a valid email address.");
    const users = getUsersStore();
    const normalized = data.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === normalized)) {
      throw new MockApiError("An account with this email already exists.");
    }
    const now = new Date().toISOString();
    const profile: UserProfile = {
      id: randomId("u"),
      name: data.name.trim(),
      email: normalized,
      avatarColor: data.avatarColor ?? "#7c3aed",
      targetBand: data.targetBand ?? 7,
      examDate: data.examDate ?? "",
      dailyGoalMin: data.dailyGoalMin ?? 30,
      notifications: data.notifications ?? {
        practice: true,
        reminders: true,
        results: true,
      },
      planType: data.planType ?? "free",
      role: data.role ?? "student",
      status: data.status ?? "active",
      createdAt: (data.createdAt as string) ?? now,
      lastActiveAt: (data.lastActiveAt as string) ?? now,
      bannedReason: data.bannedReason,
    };
    saveUsers([...users, profile]);
    return clone(profile);
  }, randDelay());
}

export function adminUpdateUser(
  id: string,
  patch: Partial<UserProfile>,
): Promise<UserProfile> {
  if (isRealApi()) return apiFetch(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  return mockRequest(() => {
    const users = getUsersStore();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new MockApiError(`User not found: ${id}`);
    // prevent id overwrite
    const {
      id: _omitId,
      email: patchEmail,
      ...rest
    } = patch as UserProfile & { id: string };
    if (patchEmail !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patchEmail))
        throw new MockApiError("Please enter a valid email address.");
      const normalized = patchEmail.trim().toLowerCase();
      if (
        users.some((u) => u.id !== id && u.email.toLowerCase() === normalized)
      ) {
        throw new MockApiError(
          "Another account with this email already exists.",
        );
      }
      (rest as Partial<UserProfile>).email = normalized;
    }
    const updated: UserProfile = { ...users[idx], ...rest } as UserProfile;
    if (patchEmail !== undefined)
      updated.email = patchEmail.trim().toLowerCase();
    updated.id = id;
    users[idx] = updated;
    saveUsers(users);
    return clone(updated);
  }, randDelay());
}

export function adminDeleteUser(id: string): Promise<void> {
  if (isRealApi()) return apiFetch(`/api/admin/users/${id}`, { method: "DELETE" }).then(() => undefined);
  return mockRequest(() => {
    const users = getUsersStore();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new MockApiError(`User not found: ${id}`);
    const target = users[idx];
    const current = storage.get<import("@/types").UserProfile | null>("session", null);
    if (current && current.id === id) throw new MockApiError("O'zingizni o'chira olmaysiz");
    const isPrivileged = target.role === "admin" || target.role === "superadmin";
    if (isPrivileged && current?.role !== "superadmin") {
      throw new MockApiError("Faqat Super Admin (owner) Admin/Super Admin'larni o'chira oladi");
    }
    users.splice(idx, 1);
    saveUsers(users);
    return undefined;
  }, randDelay());
}

export function adminBanUser(id: string, reason: string): Promise<UserProfile> {
  if (isRealApi()) return apiFetch(`/api/admin/users/${id}/ban`, { method: "POST", body: JSON.stringify({ reason }) });
  return mockRequest(() => {
    const users = getUsersStore();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new MockApiError(`User not found: ${id}`);
    users[idx] = {
      ...users[idx],
      status: "banned",
      bannedReason: reason || "Banned by admin",
    };
    saveUsers(users);
    return clone(users[idx]);
  }, randDelay());
}

export function adminUnbanUser(id: string): Promise<UserProfile> {
  if (isRealApi()) return apiFetch(`/api/admin/users/${id}/unban`, { method: "POST" });
  return mockRequest(() => {
    const users = getUsersStore();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new MockApiError(`User not found: ${id}`);
    const { bannedReason: _drop, ...rest } = users[idx] as UserProfile;
    users[idx] = {
      ...rest,
      status: "active",
      bannedReason: undefined,
    } as UserProfile;
    saveUsers(users);
    return clone(users[idx]);
  }, randDelay());
}

export function adminSetRole(id: string, role: UserRole): Promise<UserProfile> {
  if (isRealApi()) return apiFetch(`/api/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) });
  return mockRequest(() => {
    const valid: UserRole[] = ["student", "admin", "superadmin"];
    if (!valid.includes(role)) throw new MockApiError(`Invalid role: ${role}`);
    const users = getUsersStore();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new MockApiError(`User not found: ${id}`);
    users[idx] = { ...users[idx], role };
    saveUsers(users);
    return clone(users[idx]);
  }, randDelay());
}

export function adminSetPlan(
  id: string,
  plan: UserProfile["planType"],
): Promise<UserProfile> {
  if (isRealApi()) return apiFetch(`/api/admin/users/${id}/plan`, { method: "PUT", body: JSON.stringify({ planType: plan, plan }) });
  return mockRequest(() => {
    const valid: Array<UserProfile["planType"]> = ["free", "premium", "pro"];
    if (!valid.includes(plan)) throw new MockApiError(`Invalid plan: ${plan}`);
    const users = getUsersStore();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new MockApiError(`User not found: ${id}`);
    users[idx] = { ...users[idx], planType: plan };
    saveUsers(users);
    return clone(users[idx]);
  }, randDelay());
}

// ---------------------------------------------------------------------------
// Wallet / Coins — per-user, admin can give coins
// ---------------------------------------------------------------------------
export interface WalletInfo {
  userId: string;
  coins: number;
  xp: number;
  level: number;
  transactions: Array<{
    amount: number;
    reason: string;
    date: string;
    balance: number;
  }>;
}

function walletKey(userId: string): string {
  return `wallet:${userId}`;
}

function getWalletStore(userId: string): {
  coins: number;
  xp: number;
  level: number;
} {
  const w = storage.get<{ coins: number; xp: number; level: number }>(
    walletKey(userId),
    { coins: 250, xp: 0, level: 1 },
  );
  return { coins: w.coins ?? 250, xp: w.xp ?? 0, level: w.level ?? 1 };
}
function setWalletStore(
  userId: string,
  w: { coins: number; xp: number; level: number },
): void {
  storage.set(walletKey(userId), w);
  window.dispatchEvent(
    new CustomEvent("wallet:update", { detail: { userId, wallet: w } }),
  );
}

export function adminGetWallet(userId: string): Promise<WalletInfo> {
  if (isRealApi()) return apiFetch(`/api/admin/users/${userId}/wallet`);
  return mockRequest(() => {
    const users = getUsersStore();
    const u = users.find((x) => x.id === userId);
    if (!u) throw new MockApiError(`User not found: ${userId}`);
    const w = getWalletStore(userId);
    const txs = storage.get<any[]>(`wallet:transactions:${userId}`, []);
    return {
      userId,
      coins: w.coins,
      xp: w.xp,
      level: w.level,
      transactions: txs.slice(0, 20),
    };
  }, randDelay());
}

export function adminAddCoins(
  userId: string,
  amount: number,
  reason = "Admin gift",
): Promise<WalletInfo> {
  if (isRealApi()) return apiFetch(`/api/admin/users/${userId}/wallet/add`, { method: "POST", body: JSON.stringify({ amount, reason }) });
  return mockRequest(() => {
    if (!Number.isFinite(amount) || amount === 0)
      throw new MockApiError("Amount must be non-zero number");
    if (Math.abs(amount) > 10000)
      throw new MockApiError("Amount too large (max 10000)");
    const users = getUsersStore();
    const u = users.find((x) => x.id === userId);
    if (!u) throw new MockApiError(`User not found: ${userId}`);
    const w = getWalletStore(userId);
    const next = {
      coins: Math.max(0, w.coins + amount),
      xp: w.xp + (amount > 0 ? amount : 0),
      level: Math.floor((w.xp + (amount > 0 ? amount : 0)) / 200) + 1,
    };
    setWalletStore(userId, next);
    const txKey = `wallet:transactions:${userId}`;
    const txs = storage.get<any[]>(txKey, []);
    txs.unshift({
      amount,
      reason,
      date: new Date().toISOString(),
      balance: next.coins,
    });
    storage.set(txKey, txs.slice(0, 50));
    return {
      userId,
      coins: next.coins,
      xp: next.xp,
      level: next.level,
      transactions: txs.slice(0, 20),
    };
  }, randDelay());
}

export function adminSetCoins(
  userId: string,
  coins: number,
): Promise<WalletInfo> {
  if (isRealApi()) return apiFetch(`/api/admin/users/${userId}/wallet/set`, { method: "POST", body: JSON.stringify({ coins }) });
  return mockRequest(() => {
    if (!Number.isFinite(coins) || coins < 0 || coins > 100000)
      throw new MockApiError("Coins must be 0-100000");
    const users = getUsersStore();
    const u = users.find((x) => x.id === userId);
    if (!u) throw new MockApiError(`User not found: ${userId}`);
    const w = getWalletStore(userId);
    const next = { ...w, coins: Math.floor(coins) };
    setWalletStore(userId, next);
    return {
      userId,
      coins: next.coins,
      xp: next.xp,
      level: next.level,
      transactions: storage
        .get<any[]>(`wallet:transactions:${userId}`, [])
        .slice(0, 20),
    };
  }, randDelay());
}

// ===========================================================================
// QUESTIONS
// ===========================================================================

export interface AdminQuestionFilters {
  skill?: Skill | "listening" | "reading";
  difficulty?: Difficulty | "all";
  type?: Question["type"] | "all";
  topic?: string | "all";
  search?: string;
}

export function adminListQuestions(
  filters?: AdminQuestionFilters,
): Promise<Question[]> {
  return mockRequest(() => {
    let list = [...getQuestionsStore()];
    if (filters?.skill && filters.skill !== ("all" as string)) {
      list = list.filter((q) => q.skill === filters.skill);
    }
    if (filters?.difficulty && filters.difficulty !== "all") {
      list = list.filter((q) => q.difficulty === filters.difficulty);
    }
    if (filters?.type && filters.type !== "all") {
      list = list.filter((q) => q.type === filters.type);
    }
    if (filters?.topic && filters.topic !== "all") {
      list = list.filter((q) => q.topic === filters.topic);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (q) =>
          q.prompt.toLowerCase().includes(s) ||
          q.topic.toLowerCase().includes(s) ||
          (q.passage && q.passage.toLowerCase().includes(s)),
      );
    }
    return clone(list);
  }, randDelay());
}

export function adminCreateQuestion(
  data: Partial<Question> & { skill: "listening" | "reading"; prompt: string },
): Promise<Question> {
  return mockRequest(() => {
    if (!data.skill || !["listening", "reading"].includes(data.skill))
      throw new MockApiError("Question skill must be listening or reading.");
    if (!data.prompt || data.prompt.trim().length < 3)
      throw new MockApiError("Prompt is required.");
    if (!data.type) throw new MockApiError("Question type is required.");
    if (!data.difficulty) throw new MockApiError("Difficulty is required.");
    const store = getQuestionsStore();
    const id = data.id ?? randomId("q");
    if (store.some((q) => q.id === id))
      throw new MockApiError(`Question with id ${id} already exists.`);
    const item: Question = {
      id,
      skill: data.skill,
      type: data.type as Question["type"],
      topic: data.topic ?? "General",
      difficulty: data.difficulty as Difficulty,
      timeLimitSec: data.timeLimitSec ?? 120,
      passage: data.passage,
      prompt: data.prompt,
      options: data.options,
      correctIndex: data.correctIndex,
      correctAnswer: data.correctAnswer,
      transcript: data.transcript,
      audioDurationSec: data.audioDurationSec,
      explanation: data.explanation ?? "",
      recommendLesson: data.recommendLesson ?? "General lesson",
    };
    const next = [...store, item];
    saveCollection(QUESTIONS_KEY, next);
    return clone(item);
  }, randDelay());
}

export function adminUpdateQuestion(
  id: string,
  patch: Partial<Question>,
): Promise<Question> {
  return mockRequest(() => {
    const store = getQuestionsStore();
    const idx = store.findIndex((q) => q.id === id);
    if (idx === -1) throw new MockApiError(`Question not found: ${id}`);
    const updated = { ...store[idx], ...patch, id } as Question;
    store[idx] = updated;
    saveCollection(QUESTIONS_KEY, store);
    return clone(updated);
  }, randDelay());
}

export function adminDeleteQuestion(id: string): Promise<void> {
  return mockRequest(() => {
    const store = getQuestionsStore();
    const idx = store.findIndex((q) => q.id === id);
    if (idx === -1) throw new MockApiError(`Question not found: ${id}`);
    store.splice(idx, 1);
    saveCollection(QUESTIONS_KEY, store);
    return undefined;
  }, randDelay());
}

// ===========================================================================
// VOCABULARY
// ===========================================================================

export interface AdminWordFilters {
  search?: string;
  difficulty?: Difficulty | "all";
  partOfSpeech?: string | "all";
}

export function adminListWords(
  filters?: AdminWordFilters,
): Promise<VocabularyWord[]> {
  return mockRequest(() => {
    let list = [...getVocabStore()];
    if (filters?.difficulty && filters.difficulty !== "all") {
      list = list.filter((w) => w.difficulty === filters.difficulty);
    }
    if (filters?.partOfSpeech && filters.partOfSpeech !== "all") {
      list = list.filter(
        (w) =>
          w.partOfSpeech.toLowerCase() ===
          String(filters.partOfSpeech).toLowerCase(),
      );
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (w) =>
          w.word.toLowerCase().includes(s) ||
          w.meaning.toLowerCase().includes(s) ||
          w.example.toLowerCase().includes(s),
      );
    }
    return clone(list);
  }, randDelay());
}

// alias for alternative naming
export const adminListVocab = adminListWords;
export const adminListVocabulary = adminListWords;

export function adminCreateWord(
  data: Partial<VocabularyWord> & { word: string; meaning: string },
): Promise<VocabularyWord> {
  return mockRequest(() => {
    if (!data.word || data.word.trim().length < 1)
      throw new MockApiError("Word is required.");
    if (!data.meaning || data.meaning.trim().length < 1)
      throw new MockApiError("Meaning is required.");
    const store = getVocabStore();
    const id = data.id ?? randomId("w");
    if (store.some((w) => w.id === id))
      throw new MockApiError(`Word with id ${id} already exists.`);
    if (
      store.some(
        (w) => w.word.toLowerCase() === data.word!.trim().toLowerCase(),
      )
    ) {
      throw new MockApiError(`Word "${data.word}" already exists.`);
    }
    const item: VocabularyWord = {
      id,
      word: data.word.trim(),
      phonetic: data.phonetic ?? `/${data.word.trim().toLowerCase()}/`,
      partOfSpeech: data.partOfSpeech ?? "noun",
      meaning: data.meaning.trim(),
      example: data.example ?? `Example for ${data.word}.`,
      synonyms: data.synonyms ?? [],
      difficulty: (data.difficulty as Difficulty) ?? "medium",
      learned: data.learned,
      favorite: data.favorite,
    };
    const next = [...store, item];
    saveCollection(VOCAB_KEY, next);
    return clone(item);
  }, randDelay());
}

export const adminCreateVocab = adminCreateWord;
export const adminCreateVocabulary = adminCreateWord;

export function adminUpdateWord(
  id: string,
  patch: Partial<VocabularyWord>,
): Promise<VocabularyWord> {
  return mockRequest(() => {
    const store = getVocabStore();
    const idx = store.findIndex((w) => w.id === id);
    if (idx === -1) throw new MockApiError(`Word not found: ${id}`);
    const updated = { ...store[idx], ...patch, id } as VocabularyWord;
    store[idx] = updated;
    saveCollection(VOCAB_KEY, store);
    return clone(updated);
  }, randDelay());
}

export const adminUpdateVocab = adminUpdateWord;
export const adminUpdateVocabulary = adminUpdateWord;

export function adminDeleteWord(id: string): Promise<void> {
  return mockRequest(() => {
    const store = getVocabStore();
    const idx = store.findIndex((w) => w.id === id);
    if (idx === -1) throw new MockApiError(`Word not found: ${id}`);
    store.splice(idx, 1);
    saveCollection(VOCAB_KEY, store);
    return undefined;
  }, randDelay());
}

export const adminDeleteVocab = adminDeleteWord;
export const adminDeleteVocabulary = adminDeleteWord;

// ===========================================================================
// COURSES & LESSONS
// ===========================================================================

export function adminListCourses(): Promise<Course[]> {
  return mockRequest(() => clone(getCoursesStore()), randDelay());
}

export function adminCreateCourse(
  data: Partial<Course> & { title: string; key: Skill },
): Promise<Course> {
  return mockRequest(() => {
    if (
      !data.key ||
      !["listening", "reading", "writing", "speaking"].includes(data.key)
    ) {
      throw new MockApiError(
        "Course key must be one of listening, reading, writing, speaking.",
      );
    }
    if (!data.title || data.title.trim().length < 2)
      throw new MockApiError("Course title is required.");
    const store = getCoursesStore();
    if (store.some((c) => c.key === data.key))
      throw new MockApiError(`Course with key ${data.key} already exists.`);
    const item: Course = {
      key: data.key,
      title: data.title.trim(),
      description: data.description ?? "",
      lessons: (data.lessons as Lesson[]) ?? [],
      icon: COURSE_ICON_MAP[data.key] ?? Headphones,
      color: data.color ?? "brand",
    };
    const next = [...store, item];
    saveCourses(next);
    return clone(item);
  }, randDelay());
}

export function adminUpdateCourse(
  key: string,
  patch: Partial<Course>,
): Promise<Course> {
  return mockRequest(() => {
    const store = getCoursesStore();
    const idx = store.findIndex((c) => c.key === key);
    if (idx === -1) throw new MockApiError(`Course not found: ${key}`);
    const current = store[idx];
    // prevent key overwrite to different existing key
    if (
      patch.key &&
      patch.key !== key &&
      store.some((c) => c.key === patch.key)
    ) {
      throw new MockApiError(`Course with key ${patch.key} already exists.`);
    }
    const updated: Course = {
      ...current,
      ...patch,
      key: (patch.key as Skill) ?? current.key,
    } as Course;
    // ensure icon stays hydrated
    updated.icon = COURSE_ICON_MAP[updated.key] ?? current.icon;
    store[idx] = updated;
    saveCourses(store);
    return clone(updated);
  }, randDelay());
}

export function adminDeleteCourse(key: string): Promise<void> {
  return mockRequest(() => {
    const store = getCoursesStore();
    const idx = store.findIndex((c) => c.key === key);
    if (idx === -1) throw new MockApiError(`Course not found: ${key}`);
    store.splice(idx, 1);
    saveCourses(store);
    return undefined;
  }, randDelay());
}

// Lessons — nested under courses
export function adminCreateLesson(
  courseKey: string,
  data: Partial<Lesson> & { title: string },
): Promise<Lesson> {
  return mockRequest(() => {
    if (!data.title || data.title.trim().length < 2)
      throw new MockApiError("Lesson title is required.");
    const store = getCoursesStore();
    const cIdx = store.findIndex((c) => c.key === courseKey);
    if (cIdx === -1) throw new MockApiError(`Course not found: ${courseKey}`);
    const lesson: Lesson = {
      id: data.id ?? randomId("lesson"),
      title: data.title.trim(),
      meta: data.meta ?? "",
      minutes: data.minutes ?? 20,
      skill: (data.skill as Skill) ?? (store[cIdx].key as Skill),
    };
    if (store[cIdx].lessons.some((l) => l.id === lesson.id))
      throw new MockApiError(
        `Lesson with id ${lesson.id} already exists in course ${courseKey}.`,
      );
    store[cIdx].lessons.push(lesson);
    saveCourses(store);
    return clone(lesson);
  }, randDelay());
}

export function adminUpdateLesson(
  courseKey: string,
  lessonId: string,
  patch: Partial<Lesson>,
): Promise<Lesson> {
  return mockRequest(() => {
    const store = getCoursesStore();
    const cIdx = store.findIndex((c) => c.key === courseKey);
    if (cIdx === -1) throw new MockApiError(`Course not found: ${courseKey}`);
    const lIdx = store[cIdx].lessons.findIndex((l) => l.id === lessonId);
    if (lIdx === -1)
      throw new MockApiError(
        `Lesson not found: ${lessonId} in course ${courseKey}`,
      );
    const updated = {
      ...store[cIdx].lessons[lIdx],
      ...patch,
      id: lessonId,
    } as Lesson;
    store[cIdx].lessons[lIdx] = updated;
    saveCourses(store);
    return clone(updated);
  }, randDelay());
}

export function adminDeleteLesson(
  courseKey: string,
  lessonId: string,
): Promise<void> {
  return mockRequest(() => {
    const store = getCoursesStore();
    const cIdx = store.findIndex((c) => c.key === courseKey);
    if (cIdx === -1) throw new MockApiError(`Course not found: ${courseKey}`);
    const lIdx = store[cIdx].lessons.findIndex((l) => l.id === lessonId);
    if (lIdx === -1)
      throw new MockApiError(
        `Lesson not found: ${lessonId} in course ${courseKey}`,
      );
    store[cIdx].lessons.splice(lIdx, 1);
    saveCourses(store);
    return undefined;
  }, randDelay());
}

// ===========================================================================
// WRITING PROMPTS
// ===========================================================================

export interface AdminWritingFilters {
  search?: string;
  difficulty?: Difficulty | "all";
  type?: WritingPrompt["type"] | "all";
}

export function adminListWritingPrompts(
  filters?: AdminWritingFilters,
): Promise<WritingPrompt[]> {
  return mockRequest(() => {
    let list = [...getWritingStore()];
    if (filters?.difficulty && filters.difficulty !== "all") {
      list = list.filter((p) => p.difficulty === filters.difficulty);
    }
    if (filters?.type && filters.type !== "all") {
      list = list.filter((p) => p.type === filters.type);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.prompt.toLowerCase().includes(s) ||
          p.task.toLowerCase().includes(s),
      );
    }
    return clone(list);
  }, randDelay());
}

export const adminListWriting = adminListWritingPrompts;
export const adminListWritingTasks = adminListWritingPrompts;

export function adminCreateWritingPrompt(
  data: Partial<WritingPrompt> & { prompt: string },
): Promise<WritingPrompt> {
  return mockRequest(() => {
    if (!data.prompt || data.prompt.trim().length < 10)
      throw new MockApiError("Prompt must be at least 10 characters.");
    const store = getWritingStore();
    const id = data.id ?? randomId("w");
    if (store.some((p) => p.id === id))
      throw new MockApiError(`Writing prompt with id ${id} already exists.`);
    const item: WritingPrompt = {
      id,
      task: data.task ?? "Academic Task 2",
      type: (data.type as WritingPrompt["type"]) ?? "academic-task2",
      difficulty: (data.difficulty as Difficulty) ?? "medium",
      timeLimitMin: data.timeLimitMin ?? 40,
      minWords: data.minWords ?? 250,
      prompt: data.prompt.trim(),
      instructions: data.instructions ?? [],
    };
    const next = [...store, item];
    saveCollection(WRITING_KEY, next);
    return clone(item);
  }, randDelay());
}

export const adminCreateWriting = adminCreateWritingPrompt;

export function adminUpdateWritingPrompt(
  id: string,
  patch: Partial<WritingPrompt>,
): Promise<WritingPrompt> {
  return mockRequest(() => {
    const store = getWritingStore();
    const idx = store.findIndex((p) => p.id === id);
    if (idx === -1) throw new MockApiError(`Writing prompt not found: ${id}`);
    const updated = { ...store[idx], ...patch, id } as WritingPrompt;
    store[idx] = updated;
    saveCollection(WRITING_KEY, store);
    return clone(updated);
  }, randDelay());
}

export const adminUpdateWriting = adminUpdateWritingPrompt;

export function adminDeleteWritingPrompt(id: string): Promise<void> {
  return mockRequest(() => {
    const store = getWritingStore();
    const idx = store.findIndex((p) => p.id === id);
    if (idx === -1) throw new MockApiError(`Writing prompt not found: ${id}`);
    store.splice(idx, 1);
    saveCollection(WRITING_KEY, store);
    return undefined;
  }, randDelay());
}

export const adminDeleteWriting = adminDeleteWritingPrompt;

// ===========================================================================
// SPEAKING PROMPTS
// ===========================================================================

export interface AdminSpeakingFilters {
  search?: string;
  difficulty?: Difficulty | "all";
  part?: 1 | 2 | 3 | "all";
}

export function adminListSpeakingPrompts(
  filters?: AdminSpeakingFilters,
): Promise<SpeakingPrompt[]> {
  return mockRequest(() => {
    let list = [...getSpeakingStore()];
    if (filters?.difficulty && filters.difficulty !== "all") {
      list = list.filter((p) => p.difficulty === filters.difficulty);
    }
    if (filters?.part !== undefined && filters.part !== "all") {
      list = list.filter((p) => p.part === filters.part);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.prompt.toLowerCase().includes(s) ||
          p.cueCardTitle.toLowerCase().includes(s),
      );
    }
    return clone(list);
  }, randDelay());
}

export const adminListSpeaking = adminListSpeakingPrompts;

export function adminCreateSpeakingPrompt(
  data: Partial<SpeakingPrompt> & { prompt: string; cueCardTitle: string },
): Promise<SpeakingPrompt> {
  return mockRequest(() => {
    if (!data.prompt || data.prompt.trim().length < 10)
      throw new MockApiError("Prompt must be at least 10 characters.");
    if (!data.cueCardTitle || data.cueCardTitle.trim().length < 2)
      throw new MockApiError("cueCardTitle is required.");
    const store = getSpeakingStore();
    const id = data.id ?? randomId("s");
    if (store.some((p) => p.id === id))
      throw new MockApiError(`Speaking prompt with id ${id} already exists.`);
    const item: SpeakingPrompt = {
      id,
      part: data.part ?? 1,
      difficulty: (data.difficulty as Difficulty) ?? "medium",
      prepTimeSec: data.prepTimeSec ?? 60,
      speakingTimeSec: data.speakingTimeSec ?? 120,
      cueCardTitle: data.cueCardTitle.trim(),
      prompt: data.prompt.trim(),
      followUps: data.followUps ?? [],
    };
    const next = [...store, item];
    saveCollection(SPEAKING_KEY, next);
    return clone(item);
  }, randDelay());
}

export const adminCreateSpeaking = adminCreateSpeakingPrompt;

export function adminUpdateSpeakingPrompt(
  id: string,
  patch: Partial<SpeakingPrompt>,
): Promise<SpeakingPrompt> {
  return mockRequest(() => {
    const store = getSpeakingStore();
    const idx = store.findIndex((p) => p.id === id);
    if (idx === -1) throw new MockApiError(`Speaking prompt not found: ${id}`);
    const updated = { ...store[idx], ...patch, id } as SpeakingPrompt;
    store[idx] = updated;
    saveCollection(SPEAKING_KEY, store);
    return clone(updated);
  }, randDelay());
}

export const adminUpdateSpeaking = adminUpdateSpeakingPrompt;

export function adminDeleteSpeakingPrompt(id: string): Promise<void> {
  return mockRequest(() => {
    const store = getSpeakingStore();
    const idx = store.findIndex((p) => p.id === id);
    if (idx === -1) throw new MockApiError(`Speaking prompt not found: ${id}`);
    store.splice(idx, 1);
    saveCollection(SPEAKING_KEY, store);
    return undefined;
  }, randDelay());
}

export const adminDeleteSpeaking = adminDeleteSpeakingPrompt;

// ===========================================================================
// GRAMMAR
// ===========================================================================

export interface AdminGrammarFilters {
  search?: string;
  level?: GrammarTopic["level"] | "all";
}

export function adminListGrammarTopics(
  filters?: AdminGrammarFilters,
): Promise<GrammarTopic[]> {
  return mockRequest(() => {
    let list = [...getGrammarStore()];
    if (filters?.level && filters.level !== "all") {
      list = list.filter((g) => g.level === filters.level);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(s) ||
          g.summary.toLowerCase().includes(s),
      );
    }
    return clone(list);
  }, randDelay());
}

export const adminListGrammar = adminListGrammarTopics;

export function adminCreateGrammarTopic(
  data: Partial<GrammarTopic> & { title: string },
): Promise<GrammarTopic> {
  return mockRequest(() => {
    if (!data.title || data.title.trim().length < 2)
      throw new MockApiError("Grammar topic title is required.");
    const store = getGrammarStore();
    const id = data.id ?? randomId("g");
    if (store.some((g) => g.id === id))
      throw new MockApiError(`Grammar topic with id ${id} already exists.`);
    const item: GrammarTopic = {
      id,
      title: data.title.trim(),
      level: data.level ?? "Intermediate (Band 5–6)",
      summary: data.summary ?? "",
      example: data.example ?? "",
      minutes: data.minutes ?? 20,
    };
    const next = [...store, item];
    saveCollection(GRAMMAR_KEY, next);
    return clone(item);
  }, randDelay());
}

export const adminCreateGrammar = adminCreateGrammarTopic;

export function adminUpdateGrammarTopic(
  id: string,
  patch: Partial<GrammarTopic>,
): Promise<GrammarTopic> {
  return mockRequest(() => {
    const store = getGrammarStore();
    const idx = store.findIndex((g) => g.id === id);
    if (idx === -1) throw new MockApiError(`Grammar topic not found: ${id}`);
    const updated = { ...store[idx], ...patch, id } as GrammarTopic;
    store[idx] = updated;
    saveCollection(GRAMMAR_KEY, store);
    return clone(updated);
  }, randDelay());
}

export const adminUpdateGrammar = adminUpdateGrammarTopic;

export function adminDeleteGrammarTopic(id: string): Promise<void> {
  return mockRequest(() => {
    const store = getGrammarStore();
    const idx = store.findIndex((g) => g.id === id);
    if (idx === -1) throw new MockApiError(`Grammar topic not found: ${id}`);
    store.splice(idx, 1);
    saveCollection(GRAMMAR_KEY, store);
    return undefined;
  }, randDelay());
}

export const adminDeleteGrammar = adminDeleteGrammarTopic;

// ===========================================================================
// MOCK TESTS (admin_mocks)
// ===========================================================================

export interface AdminMockFilters {
  search?: string;
  type?: MockTestMeta["type"] | "all";
}

export function adminListMocks(
  filters?: AdminMockFilters,
): Promise<MockTestMeta[]> {
  return mockRequest(() => {
    let list = [...getMocksStore()];
    if (filters?.type && filters.type !== "all") {
      list = list.filter((m) => m.type === filters.type);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(s) ||
          m.description.toLowerCase().includes(s),
      );
    }
    return clone(list);
  }, randDelay());
}

export const adminListMockTests = adminListMocks;

export function adminCreateMock(
  data: Partial<MockTestMeta> & { title: string },
): Promise<MockTestMeta> {
  return mockRequest(() => {
    if (!data.title || data.title.trim().length < 3)
      throw new MockApiError("Mock test title is required.");
    const store = getMocksStore();
    const id = data.id ?? randomId("mock");
    if (store.some((m) => m.id === id))
      throw new MockApiError(`Mock test with id ${id} already exists.`);
    const item: MockTestMeta = {
      id,
      title: data.title.trim(),
      type: (data.type as MockTestMeta["type"]) ?? "Academic",
      durationMin: data.durationMin ?? 60,
      questions: data.questions ?? 0,
      description: data.description ?? "",
      sections: (data.sections as MockTestMeta["sections"]) ?? [],
    };
    const next = [...store, item];
    saveCollection(MOCKS_KEY, next);
    return clone(item);
  }, randDelay());
}

export const adminCreateMockTest = adminCreateMock;

export function adminUpdateMock(
  id: string,
  patch: Partial<MockTestMeta>,
): Promise<MockTestMeta> {
  return mockRequest(() => {
    const store = getMocksStore();
    const idx = store.findIndex((m) => m.id === id);
    if (idx === -1) throw new MockApiError(`Mock test not found: ${id}`);
    const updated = { ...store[idx], ...patch, id } as MockTestMeta;
    store[idx] = updated;
    saveCollection(MOCKS_KEY, store);
    return clone(updated);
  }, randDelay());
}

export const adminUpdateMockTest = adminUpdateMock;

export function adminDeleteMock(id: string): Promise<void> {
  return mockRequest(() => {
    const store = getMocksStore();
    const idx = store.findIndex((m) => m.id === id);
    if (idx === -1) throw new MockApiError(`Mock test not found: ${id}`);
    store.splice(idx, 1);
    saveCollection(MOCKS_KEY, store);
    return undefined;
  }, randDelay());
}

export const adminDeleteMockTest = adminDeleteMock;

// ===========================================================================
// ACHIEVEMENTS
// ===========================================================================

export interface AdminAchievementFilters {
  search?: string;
}

export function adminListAchievements(
  filters?: AdminAchievementFilters,
): Promise<AchievementDef[]> {
  return mockRequest(() => {
    let list = [...getAchievementsStore()];
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(s) ||
          a.description.toLowerCase().includes(s),
      );
    }
    return clone(list);
  }, randDelay());
}

export function adminCreateAchievement(
  data: Partial<AchievementDef> & { title: string },
): Promise<AchievementDef> {
  return mockRequest(() => {
    if (!data.title || data.title.trim().length < 2)
      throw new MockApiError("Achievement title is required.");
    const store = getAchievementsStore();
    const id = data.id ?? randomId("ach");
    if (store.some((a) => a.id === id))
      throw new MockApiError(`Achievement with id ${id} already exists.`);
    const item: AchievementDef = {
      id,
      title: data.title.trim(),
      description: data.description ?? "",
      icon: data.icon ?? "🏆",
      progress: data.progress ?? 0,
      max: data.max ?? 1,
    };
    const next = [...store, item];
    saveCollection(ACHIEVEMENTS_KEY, next);
    return clone(item);
  }, randDelay());
}

export function adminUpdateAchievement(
  id: string,
  patch: Partial<AchievementDef>,
): Promise<AchievementDef> {
  return mockRequest(() => {
    const store = getAchievementsStore();
    const idx = store.findIndex((a) => a.id === id);
    if (idx === -1) throw new MockApiError(`Achievement not found: ${id}`);
    const updated = { ...store[idx], ...patch, id } as AchievementDef;
    store[idx] = updated;
    saveCollection(ACHIEVEMENTS_KEY, store);
    return clone(updated);
  }, randDelay());
}

export function adminDeleteAchievement(id: string): Promise<void> {
  return mockRequest(() => {
    const store = getAchievementsStore();
    const idx = store.findIndex((a) => a.id === id);
    if (idx === -1) throw new MockApiError(`Achievement not found: ${id}`);
    store.splice(idx, 1);
    saveCollection(ACHIEVEMENTS_KEY, store);
    return undefined;
  }, randDelay());
}

// ===========================================================================
// ANALYTICS
// ===========================================================================

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalQuestions: number;
  totalWords: number;
  totalMocks: number;
  totalCourses: number;
  totalLessons: number;
  totalWritingPrompts: number;
  totalSpeakingPrompts: number;
  totalGrammarTopics: number;
  totalAchievements: number;
  revenueEstimate: number;
  weeklySignups: Array<{ label: string; count: number; date: string }>;
  bandDistribution: Array<{ band: string; count: number }>;
  planDistribution: Array<{ plan: UserProfile["planType"]; count: number }>;
  statusDistribution: Array<{ status: UserProfile["status"]; count: number }>;
  roleDistribution: Array<{ role: UserRole; count: number }>;
  recentActivity: Array<{
    id: string;
    user: string;
    email: string;
    action: string;
    time: string;
  }>;
}

export function adminGetStats(): Promise<AdminStats> {
  if (isRealApi()) {
    return apiFetch("/api/admin/stats").then((d: any) => d as AdminStats).catch(() => mockRequest(() => {
      const users = getUsersStore(); return { totalUsers: users.length, activeUsers: users.filter((u) => u.status === "active").length, totalQuestions: 200, totalWords: 640, totalMocks: 7, totalCourses: 4, totalLessons: 24, totalWritingPrompts: 5, totalSpeakingPrompts: 6, totalGrammarTopics: 8, totalAchievements: 15, revenueEstimate: 0, weeklySignups: [], bandDistribution: [], planDistribution: [], statusDistribution: [], roleDistribution: [], recentActivity: [] } as AdminStats;
    }, 300) as Promise<AdminStats>);
  }
  return mockRequest(() => {
    const users = getUsersStore();
    const questions = getQuestionsStore();
    const words = getVocabStore();
    const mocks = getMocksStore();
    const courses = getCoursesStore();
    const writing = getWritingStore();
    const speaking = getSpeakingStore();
    const grammar = getGrammarStore();
    const achievements = getAchievementsStore();

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "active").length;
    const totalQuestions = questions.length;
    const totalWords = words.length;
    const totalMocks = mocks.length;
    const totalCourses = courses.length;
    const totalLessons = courses.reduce((sum, c) => sum + c.lessons.length, 0);

    // Revenue: premium $12, pro $29 per month estimate
    const premiumCount = users.filter((u) => u.planType === "premium").length;
    const proCount = users.filter((u) => u.planType === "pro").length;
    const revenueEstimate = premiumCount * 12 + proCount * 29;

    // weeklySignups — last 7 days
    const weeklySignups: AdminStats["weeklySignups"] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      const iso = d.toISOString().slice(0, 10);
      const count = users.filter((u) => {
        try {
          return new Date(u.createdAt).toISOString().slice(0, 10) === iso;
        } catch {
          return false;
        }
      }).length;
      weeklySignups.push({ label, count, date: iso });
    }

    // bandDistribution — bucket by targetBand rounded to 0.5
    const bandBuckets: Record<string, number> = {};
    for (const u of users) {
      const key = u.targetBand.toFixed(1);
      bandBuckets[key] = (bandBuckets[key] ?? 0) + 1;
    }
    const bandDistribution = Object.entries(bandBuckets)
      .map(([band, count]) => ({ band, count }))
      .sort((a, b) => Number(a.band) - Number(b.band));

    // planDistribution
    const planMap: Record<string, number> = {};
    for (const u of users) planMap[u.planType] = (planMap[u.planType] ?? 0) + 1;
    const planDistribution = (
      Object.entries(planMap) as Array<[UserProfile["planType"], number]>
    ).map(([plan, count]) => ({ plan, count }));

    // statusDistribution
    const statusMap: Record<string, number> = {};
    for (const u of users) statusMap[u.status] = (statusMap[u.status] ?? 0) + 1;
    const statusDistribution = (
      Object.entries(statusMap) as Array<[UserProfile["status"], number]>
    ).map(([status, count]) => ({ status, count }));

    // roleDistribution
    const roleMap: Record<string, number> = {};
    for (const u of users) roleMap[u.role] = (roleMap[u.role] ?? 0) + 1;
    const roleDistribution = (
      Object.entries(roleMap) as Array<[UserRole, number]>
    ).map(([role, count]) => ({ role, count }));

    // recentActivity — last 5 by lastActiveAt desc
    const recentActivity = [...users]
      .sort(
        (a, b) =>
          new Date(b.lastActiveAt).getTime() -
          new Date(a.lastActiveAt).getTime(),
      )
      .slice(0, 5)
      .map((u) => ({
        id: u.id,
        user: u.name,
        email: u.email,
        action:
          u.status === "banned"
            ? `Banned: ${u.bannedReason ?? "—"}`
            : `Active · ${u.planType} · Band ${u.targetBand}`,
        time: u.lastActiveAt,
      }));

    return {
      totalUsers,
      activeUsers,
      totalQuestions,
      totalWords,
      totalMocks,
      totalCourses,
      totalLessons,
      totalWritingPrompts: writing.length,
      totalSpeakingPrompts: speaking.length,
      totalGrammarTopics: grammar.length,
      totalAchievements: achievements.length,
      revenueEstimate,
      weeklySignups,
      bandDistribution,
      planDistribution,
      statusDistribution,
      roleDistribution,
      recentActivity,
    };
  }, randDelay());
}

// Re-export for convenience
export { MockApiError };
