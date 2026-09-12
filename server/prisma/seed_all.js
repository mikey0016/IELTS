const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seedUsers() {
  const hash = (p) => bcrypt.hashSync(p, 10);
  const users = [
    { id: "u_demo", name: "Alex Carter", email: "alex@ieltsmaster.com", passwordHash: hash("demo1234"), avatarColor: "#4c56ec", targetBand: 7.5, examDate: "2026-12-15", dailyGoalMin: 30, planType: "premium", role: "student", status: "active" },
    { id: "u_admin", name: "Admin Master", email: "admin@ieltsmaster.com", passwordHash: hash("admin123"), avatarColor: "#7c3aed", targetBand: 9, examDate: "", dailyGoalMin: 60, planType: "pro", role: "admin", status: "active" },
    { id: "u_superadmin", name: "Super Admin", email: "superadmin@ieltsmaster.com", passwordHash: hash("superadmin123"), avatarColor: "#0f172a", targetBand: 9, examDate: "", dailyGoalMin: 60, planType: "pro", role: "superadmin", status: "active" },
    { id: "u_s1", name: "Sarvar Rahimov", email: "sarvar.r@ielts.uz", passwordHash: hash("sarvar123"), avatarColor: "#305c8d", targetBand: 8, examDate: "2026-09-20", dailyGoalMin: 45, planType: "premium", role: "student", status: "active" },
    { id: "u_s2", name: "Madina Yusupova", email: "madina.y@ielts.uz", passwordHash: hash("madina123"), avatarColor: "#7c3aed", targetBand: 7.5, examDate: "2026-10-05", dailyGoalMin: 30, planType: "premium", role: "student", status: "active" },
    { id: "u_s3", name: "Jasur Toshpulatov", email: "jasur.t@ielts.uz", passwordHash: hash("jasur123"), avatarColor: "#0e7490", targetBand: 7, examDate: "2026-11-12", dailyGoalMin: 30, planType: "free", role: "student", status: "banned", bannedReason: "Spam activity" },
    { id: "u_s4", name: "Nilufar Azimova", email: "nilufar.a@ielts.uz", passwordHash: hash("nilufar123"), avatarColor: "#059669", targetBand: 8.5, examDate: "2026-08-30", dailyGoalMin: 60, planType: "pro", role: "student", status: "active" },
    { id: "u_s5", name: "Otabek Karimov", email: "otabek.k@ielts.uz", passwordHash: hash("otabek123"), avatarColor: "#d97706", targetBand: 6.5, examDate: "2026-12-01", dailyGoalMin: 30, planType: "free", role: "student", status: "pending" },
  ];
  for (const u of users) {
    await prisma.user.upsert({ where: { email: u.email }, update: {}, create: u });
  }
  console.log(`✅ Users seeded: ${users.length}`);
}

async function seedQuestions() {
  const qPath = path.join(__dirname, "../data/questions.json");
  const realPath = path.join(__dirname, "../data/realIelts.json");
  const base = JSON.parse(fs.readFileSync(qPath, "utf-8"));
  const real = JSON.parse(fs.readFileSync(realPath, "utf-8"));
  const combined = [...base, ...real];
  const map = new Map();
  for (const q of combined) if (!map.has(q.id)) map.set(q.id, q);
  const unique = Array.from(map.values());
  let count = 0;
  for (const q of unique) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        skill: q.skill,
        type: q.type,
        topic: q.topic || "General",
        difficulty: q.difficulty,
        timeLimitSec: q.timeLimitSec || 120,
        passage: q.passage || null,
        passageLabel: q.passageLabel || null,
        prompt: q.prompt,
        options: q.options ? JSON.stringify(q.options) : null,
        correctIndex: q.correctIndex ?? null,
        correctAnswer: q.correctAnswer || null,
        transcript: q.transcript || null,
        audioDurationSec: q.audioDurationSec || null,
        explanation: q.explanation || "",
        recommendLesson: q.recommendLesson || "General lesson",
      },
    });
    count++;
  }
  console.log(`✅ Questions seeded: ${count}`);
}

async function seedVocab() {
  const p = path.join(__dirname, "../data/vocab.json");
  const vocab = JSON.parse(fs.readFileSync(p, "utf-8"));
  let count = 0;
  for (const w of vocab) {
    await prisma.vocabularyWord.upsert({
      where: { id: w.id },
      update: {},
      create: {
        id: w.id,
        word: w.word,
        phonetic: w.phonetic || `/${w.word}/`,
        partOfSpeech: w.partOfSpeech || "noun",
        meaning: w.meaning,
        example: w.example || "",
        synonyms: JSON.stringify(w.synonyms || []),
        difficulty: w.difficulty || "medium",
        band: w.band || null,
        topic: w.topic || null,
      },
    });
    count++;
  }
  console.log(`✅ Vocab seeded: ${count}`);
}

async function seedCourses() {
  const p = path.join(__dirname, "../data/courses.json");
  const courses = JSON.parse(fs.readFileSync(p, "utf-8"));
  for (const c of courses) {
    await prisma.course.upsert({
      where: { key: c.key },
      update: { title: c.title, description: c.description, color: c.color || "brand" },
      create: { key: c.key, title: c.title, description: c.description, color: c.color || "brand" },
    });
    for (const l of c.lessons || []) {
      await prisma.lesson.upsert({
        where: { id: l.id },
        update: { title: l.title, meta: l.meta || "", minutes: l.minutes || 20, skill: l.skill || c.key },
        create: { id: l.id, title: l.title, meta: l.meta || "", minutes: l.minutes || 20, skill: l.skill || c.key, courseKey: c.key },
      });
    }
  }
  console.log(`✅ Courses seeded: ${courses.length}`);
}

async function seedGrammar() {
  const p = path.join(__dirname, "../data/grammar.json");
  const arr = JSON.parse(fs.readFileSync(p, "utf-8"));
  for (const g of arr) {
    await prisma.grammarTopic.upsert({
      where: { id: g.id },
      update: {},
      create: { id: g.id, title: g.title, level: g.level, summary: g.summary || "", example: g.example || "", minutes: g.minutes || 20 },
    });
  }
  console.log(`✅ Grammar seeded: ${arr.length}`);
}

async function seedWriting() {
  const p = path.join(__dirname, "../data/writing.json");
  const arr = JSON.parse(fs.readFileSync(p, "utf-8"));
  for (const w of arr) {
    await prisma.writingPrompt.upsert({
      where: { id: w.id },
      update: {},
      create: {
        id: w.id, task: w.task || "Academic Task 2", type: w.type || "academic-task2", difficulty: w.difficulty || "medium",
        timeLimitMin: w.timeLimitMin || 40, minWords: w.minWords || 250, prompt: w.prompt, instructions: JSON.stringify(w.instructions || []),
      },
    });
  }
  console.log(`✅ Writing seeded: ${arr.length}`);
}

async function seedSpeaking() {
  const p = path.join(__dirname, "../data/speaking.json");
  const arr = JSON.parse(fs.readFileSync(p, "utf-8"));
  for (const s of arr) {
    await prisma.speakingPrompt.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id, part: s.part || 1, difficulty: s.difficulty || "medium", prepTimeSec: s.prepTimeSec || 60,
        speakingTimeSec: s.speakingTimeSec || 120, cueCardTitle: s.cueCardTitle, prompt: s.prompt, followUps: JSON.stringify(s.followUps || []),
      },
    });
  }
  console.log(`✅ Speaking seeded: ${arr.length}`);
}

async function seedMocks() {
  const p = path.join(__dirname, "../data/mocks.json");
  const arr = JSON.parse(fs.readFileSync(p, "utf-8"));
  for (const m of arr) {
    await prisma.mockTest.upsert({
      where: { id: m.id },
      update: {},
      create: {
        id: m.id, title: m.title, type: m.type || "Academic", durationMin: m.durationMin || 60, questions: m.questions || 0,
        description: m.description || "", sections: JSON.stringify(m.sections || []), difficulty: m.difficulty || null,
      },
    });
  }
  console.log(`✅ Mocks seeded: ${arr.length}`);
}

async function seedAchievements() {
  const p = path.join(__dirname, "../data/achievements.json");
  const arr = JSON.parse(fs.readFileSync(p, "utf-8"));
  for (const a of arr) {
    await prisma.achievement.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id, title: a.title, description: a.description || "", icon: a.icon || "🏆",
        progress: a.progress || 0, max: a.max || 1, condition: a.condition || null, reward: a.reward || null, tier: a.tier || null,
      },
    });
  }
  console.log(`✅ Achievements seeded: ${arr.length}`);
}

async function main() {
  await seedUsers();
  await seedQuestions();
  await seedVocab();
  await seedCourses();
  await seedGrammar();
  await seedWriting();
  await seedSpeaking();
  await seedMocks();
  await seedAchievements();
  console.log("🎉 All seeding done");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
