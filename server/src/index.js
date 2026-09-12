require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "secret";

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Helpers
function toProfile(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatarColor: u.avatarColor,
    targetBand: u.targetBand,
    examDate: u.examDate,
    dailyGoalMin: u.dailyGoalMin,
    notifications: typeof u.notifications === "string" ? JSON.parse(u.notifications) : u.notifications,
    planType: u.planType,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
    lastActiveAt: u.lastActiveAt.toISOString(),
    bannedReason: u.bannedReason || undefined,
  };
}

function parseJson(v){ try{ return typeof v==="string" ? JSON.parse(v) : v; }catch{ return v; } }
function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
}

// Health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Auth
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || name.trim().length < 2) return res.status(400).json({ message: "Please enter your full name." });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Please enter a valid email address." });
    if (!password || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });

    const normalized = email.trim().toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email: normalized } });
    if (exists) return res.status(409).json({ message: "An account with this email already exists. Please log in." });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalized,
        passwordHash: hash,
        avatarColor: "#7c3aed",
        targetBand: 7,
        examDate: "",
        dailyGoalMin: 30,
        notifications: JSON.stringify({ practice: true, reminders: true, results: true }),
        planType: "free",
        role: "student",
        status: "active",
      },
    });
    const token = signToken(user);
    res.json({ user: toProfile(user), token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Signup failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalized = (email || "").trim().toLowerCase();
    if (!normalized || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user) return res.status(401).json({ message: "Invalid email or password. Try demo@ieltsmaster.com / demo1234 or admin@ieltsmaster.com / admin123." });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password." });

    if (user.status === "banned") {
      return res.status(403).json({ message: `Account banned: ${user.bannedReason || "contact support"}` });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const token = signToken(updated);
    res.json({ user: toProfile(updated), token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Login failed" });
  }
});

// Google mock login
app.post("/api/auth/google", async (req, res) => {
  // For demo: return alex carter google user, create if not exists
  let user = await prisma.user.findUnique({ where: { email: "alex.carter@gmail.com" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Alex Carter",
        email: "alex.carter@gmail.com",
        passwordHash: await bcrypt.hash("google-oauth", 10),
        avatarColor: "#0ea5e9",
        targetBand: 7,
        planType: "free",
        role: "student",
        status: "active",
      },
    });
  }
  if (user.status === "banned") return res.status(403).json({ message: `Account banned: ${user.bannedReason}` });
  const token = signToken(user);
  res.json({ user: toProfile(user), token });
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: toProfile(user) });
});

app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Please enter a valid email address." });
  // mock always success
  res.json({ message: "Reset link sent (mock)" });
});

// Admin
app.get("/api/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  res.json(users.map(toProfile));
});

app.get("/api/admin/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(toProfile(user));
});

app.delete("/api/admin/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.id === req.user.id) return res.status(400).json({ message: "O'zingizni o'chira olmaysiz" });
    const isPrivileged = target.role === "admin" || target.role === "superadmin";
    if (isPrivileged && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Faqat Super Admin (owner) Admin/Super Admin'larni o'chira oladi" });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch {
    res.status(404).json({ message: "User not found" });
  }
});

app.post("/api/admin/users/:id/ban", authMiddleware, adminMiddleware, async (req, res) => {
  const { reason } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: "banned", bannedReason: reason || "Banned by admin" },
    });
    res.json(toProfile(user));
  } catch {
    res.status(404).json({ message: "User not found" });
  }
});

app.post("/api/admin/users/:id/unban", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: "active", bannedReason: null },
    });
    res.json(toProfile(user));
  } catch {
    res.status(404).json({ message: "User not found" });
  }
});

app.put("/api/admin/users/:id/role", authMiddleware, adminMiddleware, async (req, res) => {
  const { role } = req.body;
  if (!["student", "admin", "superadmin"].includes(role)) return res.status(400).json({ message: "Invalid role" });
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { role } });
    res.json(toProfile(user));
  } catch {
    res.status(404).json({ message: "User not found" });
  }
});

app.put("/api/admin/users/:id/plan", authMiddleware, adminMiddleware, async (req, res) => {
  const { planType } = req.body;
  const plan = planType || req.body.plan;
  if (!["free", "premium", "pro"].includes(plan)) return res.status(400).json({ message: "Invalid plan" });
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { planType: plan } });
    res.json(toProfile(user));
  } catch {
    res.status(404).json({ message: "User not found" });
  }
});

app.post("/api/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
  const { name, email, password, avatarColor, targetBand, planType, role, status } = req.body;
  if (!name || name.trim().length < 2) return res.status(400).json({ message: "Name must be at least 2 characters." });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Please enter a valid email address." });
  const normalized = email.trim().toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email: normalized } });
  if (exists) return res.status(409).json({ message: "An account with this email already exists." });
  const hash = await bcrypt.hash(password || "123456", 10);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalized,
      passwordHash: hash,
      avatarColor: avatarColor || "#7c3aed",
      targetBand: targetBand || 7,
      planType: planType || "free",
      role: role || "student",
      status: status || "active",
    },
  });
  res.json(toProfile(user));
});

app.put("/api/admin/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const patch = req.body;
  if (patch.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patch.email)) return res.status(400).json({ message: "Please enter a valid email address." });
  try {
    if (patch.email) patch.email = patch.email.trim().toLowerCase();
    if (patch.password) {
      patch.passwordHash = await bcrypt.hash(patch.password, 10);
      delete patch.password;
    }
    // remove token fields not in schema
    delete patch.id;
    const user = await prisma.user.update({ where: { id: req.params.id }, data: patch });
    res.json(toProfile(user));
  } catch {
    res.status(404).json({ message: "User not found" });
  }
});

// Wallet
app.get("/api/admin/users/:id/wallet", authMiddleware, adminMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ message: "User not found" });
  const txs = await prisma.walletTransaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 });
  res.json({
    userId: user.id,
    coins: user.coins,
    xp: user.xp,
    level: user.level,
    transactions: txs.map(t => ({ amount: t.amount, reason: t.reason, date: t.createdAt.toISOString(), balance: t.balance })),
  });
});

app.post("/api/admin/users/:id/wallet/add", authMiddleware, adminMiddleware, async (req, res) => {
  const { amount, reason } = req.body;
  const amt = parseInt(amount);
  if (!Number.isFinite(amt) || amt === 0) return res.status(400).json({ message: "Amount must be non-zero" });
  if (Math.abs(amt) > 10000) return res.status(400).json({ message: "Amount too large" });
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    const nextCoins = Math.max(0, user.coins + amt);
    const nextXp = user.xp + (amt > 0 ? amt : 0);
    const nextLevel = Math.floor(nextXp / 200) + 1;
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { coins: nextCoins, xp: nextXp, level: nextLevel },
    });
    const tx = await prisma.walletTransaction.create({
      data: { userId: user.id, amount: amt, reason: reason || "Admin gift", balance: nextCoins },
    });
    const txs = await prisma.walletTransaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 });
    res.json({
      userId: updated.id,
      coins: updated.coins,
      xp: updated.xp,
      level: updated.level,
      transactions: txs.map(t => ({ amount: t.amount, reason: t.reason, date: t.createdAt.toISOString(), balance: t.balance })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Wallet error" });
  }
});

app.post("/api/admin/users/:id/wallet/set", authMiddleware, adminMiddleware, async (req, res) => {
  const { coins } = req.body;
  const c = parseInt(coins);
  if (!Number.isFinite(c) || c < 0 || c > 100000) return res.status(400).json({ message: "Coins must be 0-100000" });
  try {
    const updated = await prisma.user.update({ where: { id: req.params.id }, data: { coins: Math.floor(c) } });
    const txs = await prisma.walletTransaction.findMany({ where: { userId: updated.id }, orderBy: { createdAt: "desc" }, take: 20 });
    res.json({
      userId: updated.id,
      coins: updated.coins,
      xp: updated.xp,
      level: updated.level,
      transactions: txs.map(t => ({ amount: t.amount, reason: t.reason, date: t.createdAt.toISOString(), balance: t.balance })),
    });
  } catch {
    res.status(404).json({ message: "User not found" });
  }
});

// ============ QUESTIONS (public + admin) ============
app.get("/api/questions", async (req, res) => {
  const { skill, difficulty, type, topic, search, limit } = req.query;
  const where = {};
  if (skill && skill !== "all") where.skill = skill;
  if (difficulty && difficulty !== "all") where.difficulty = difficulty;
  if (type && type !== "all") where.type = type;
  if (topic && topic !== "all") where.topic = topic;
  let list = (await prisma.question.findMany({ where, orderBy: { createdAt: "desc" } })).map(q=>({ ...q, options: parseJson(q.options)}));
  if (search) {
    const s = String(search).toLowerCase();
    list = list.filter(q => q.prompt.toLowerCase().includes(s) || q.topic.toLowerCase().includes(s) || (q.passage && q.passage.toLowerCase().includes(s)));
  }
  if (limit) list = list.slice(0, parseInt(limit));
  res.json(list);
});
app.get("/api/admin/questions", authMiddleware, adminMiddleware, async (req, res) => {
  const { skill, difficulty, type, topic, search } = req.query;
  const where = {};
  if (skill && skill !== "all") where.skill = skill;
  if (difficulty && difficulty !== "all") where.difficulty = difficulty;
  if (type && type !== "all") where.type = type;
  if (topic && topic !== "all") where.topic = topic;
  let list = (await prisma.question.findMany({ where })).map(q=>({ ...q, options: parseJson(q.options)}));
  if (search) { const s=String(search).toLowerCase(); list=list.filter(q=>q.prompt.toLowerCase().includes(s)||q.topic.toLowerCase().includes(s)); }
  res.json(list);
});
app.post("/api/admin/questions", authMiddleware, adminMiddleware, async (req, res) => {
  const d=req.body;
  if(!d.skill || !["listening","reading"].includes(d.skill)) return res.status(400).json({message:"skill must be listening or reading"});
  if(!d.prompt || d.prompt.trim().length<3) return res.status(400).json({message:"Prompt required"});
  if(!d.type) return res.status(400).json({message:"type required"});
  if(!d.difficulty) return res.status(400).json({message:"difficulty required"});
  try{
    const q=await prisma.question.create({data:{
      id: d.id || undefined, skill:d.skill, type:d.type, topic:d.topic||"General", difficulty:d.difficulty, timeLimitSec:d.timeLimitSec||120,
      passage:d.passage||null, passageLabel:d.passageLabel||null, prompt:d.prompt, options:d.options ? JSON.stringify(d.options) : null, correctIndex:d.correctIndex??null,
      correctAnswer:d.correctAnswer||null, transcript:d.transcript||null, audioDurationSec:d.audioDurationSec||null, explanation:d.explanation||"", recommendLesson:d.recommendLesson||"General lesson"
    }});
    res.json(q);
  }catch(e){ res.status(400).json({message:e.message});}
});
app.put("/api/admin/questions/:id", authMiddleware, adminMiddleware, async (req,res)=>{
  try{ const d=req.body; if(d.options) d.options=JSON.stringify(d.options); const q=await prisma.question.update({where:{id:req.params.id}, data:d}); res.json({...q, options: parseJson(q.options)});}catch{res.status(404).json({message:"Question not found"})}
});
app.delete("/api/admin/questions/:id", authMiddleware, adminMiddleware, async (req,res)=>{
  try{ await prisma.question.delete({where:{id:req.params.id}}); res.json({message:"Deleted"});}catch{res.status(404).json({message:"Question not found"})}
});

// ============ VOCABULARY ============
app.get("/api/vocabulary", async (req,res)=>{
  const { search, difficulty, partOfSpeech } = req.query;
  const where={};
  if(difficulty && difficulty!=="all") where.difficulty=difficulty;
  if(partOfSpeech && partOfSpeech!=="all") where.partOfSpeech=String(partOfSpeech);
  let list=(await prisma.vocabularyWord.findMany({where})).map(w=>({ ...w, synonyms: parseJson(w.synonyms)}));
  if(search){const s=String(search).toLowerCase(); list=list.filter(w=>w.word.toLowerCase().includes(s)||w.meaning.toLowerCase().includes(s));}
  res.json(list);
});
app.get("/api/admin/vocabulary", authMiddleware, adminMiddleware, async (req,res)=>{
  const { search, difficulty, partOfSpeech }=req.query;
  const where={}; if(difficulty&&difficulty!=="all") where.difficulty=difficulty; if(partOfSpeech&&partOfSpeech!=="all") where.partOfSpeech=String(partOfSpeech);
  let list=await prisma.vocabularyWord.findMany({where}); if(search){const s=String(search).toLowerCase(); list=list.filter(w=>w.word.toLowerCase().includes(s)||w.meaning.toLowerCase().includes(s));} res.json(list);
});
app.post("/api/admin/vocabulary", authMiddleware, adminMiddleware, async (req,res)=>{
  const d=req.body; if(!d.word) return res.status(400).json({message:"Word required"}); if(!d.meaning) return res.status(400).json({message:"Meaning required"});
  try{ const w=await prisma.vocabularyWord.create({data:{id:d.id||undefined, word:d.word.trim(), phonetic:d.phonetic||`/${d.word}/`, partOfSpeech:d.partOfSpeech||"noun", meaning:d.meaning, example:d.example||"", synonyms:JSON.stringify(d.synonyms||[]), difficulty:d.difficulty||"medium", band:d.band||null, topic:d.topic||null}}); res.json(w);}catch(e){res.status(400).json({message:e.message})}
});
app.put("/api/admin/vocabulary/:id", authMiddleware, adminMiddleware, async (req,res)=>{ try{ const d=req.body; if(d.synonyms) d.synonyms=JSON.stringify(d.synonyms); const w=await prisma.vocabularyWord.update({where:{id:req.params.id}, data:d}); res.json({...w, synonyms: parseJson(w.synonyms)});}catch{res.status(404).json({message:"Word not found"})}});
app.delete("/api/admin/vocabulary/:id", authMiddleware, adminMiddleware, async (req,res)=>{ try{await prisma.vocabularyWord.delete({where:{id:req.params.id}}); res.json({message:"Deleted"});}catch{res.status(404).json({message:"Word not found"})}});

// ============ COURSES & LESSONS ============
app.get("/api/courses", async (req,res)=>{
  const courses=await prisma.course.findMany({include:{lessons:true}});
  res.json(courses);
});
app.get("/api/admin/courses", authMiddleware, adminMiddleware, async (req,res)=>{
  const courses=await prisma.course.findMany({include:{lessons:true}});
  res.json(courses);
});
app.post("/api/admin/courses", authMiddleware, adminMiddleware, async (req,res)=>{
  const d=req.body; if(!d.key || !["listening","reading","writing","speaking"].includes(d.key)) return res.status(400).json({message:"Invalid key"}); if(!d.title) return res.status(400).json({message:"Title required"});
  try{ const c=await prisma.course.create({data:{key:d.key, title:d.title, description:d.description||"", color:d.color||"brand"}}); res.json(c);}catch(e){res.status(400).json({message:e.message})}
});
app.put("/api/admin/courses/:key", authMiddleware, adminMiddleware, async (req,res)=>{
  try{ const c=await prisma.course.update({where:{key:req.params.key}, data:req.body}); res.json(c);}catch{res.status(404).json({message:"Course not found"})}
});
app.delete("/api/admin/courses/:key", authMiddleware, adminMiddleware, async (req,res)=>{
  try{ await prisma.course.delete({where:{key:req.params.key}}); res.json({message:"Deleted"});}catch{res.status(404).json({message:"Course not found"})}
});
app.post("/api/admin/courses/:key/lessons", authMiddleware, adminMiddleware, async (req,res)=>{
  const d=req.body; if(!d.title) return res.status(400).json({message:"Lesson title required"});
  try{ const l=await prisma.lesson.create({data:{id:d.id||undefined, title:d.title, meta:d.meta||"", minutes:d.minutes||20, skill:d.skill||req.params.key, courseKey:req.params.key}}); res.json(l);}catch(e){res.status(400).json({message:e.message})}
});
app.put("/api/admin/courses/:key/lessons/:id", authMiddleware, adminMiddleware, async (req,res)=>{
  try{const l=await prisma.lesson.update({where:{id:req.params.id}, data:req.body}); res.json(l);}catch{res.status(404).json({message:"Lesson not found"})}
});
app.delete("/api/admin/courses/:key/lessons/:id", authMiddleware, adminMiddleware, async (req,res)=>{
  try{await prisma.lesson.delete({where:{id:req.params.id}}); res.json({message:"Deleted"});}catch{res.status(404).json({message:"Lesson not found"})}
});

// ============ WRITING ============
app.get("/api/writing", async (req,res)=>{
  const {search,difficulty,type}=req.query; const where={}; if(difficulty&&difficulty!=="all") where.difficulty=difficulty; if(type&&type!=="all") where.type=type;
  let list=(await prisma.writingPrompt.findMany({where})).map(w=>({ ...w, instructions: parseJson(w.instructions)})); if(search){const s=String(search).toLowerCase(); list=list.filter(p=>p.prompt.toLowerCase().includes(s));} res.json(list);
});
app.get("/api/admin/writing", authMiddleware, adminMiddleware, async (req,res)=>{
  const {search,difficulty,type}=req.query; const where={}; if(difficulty&&difficulty!=="all") where.difficulty=difficulty; if(type&&type!=="all") where.type=type;
  let list=(await prisma.writingPrompt.findMany({where})).map(w=>({ ...w, instructions: parseJson(w.instructions)})); if(search){const s=String(search).toLowerCase(); list=list.filter(p=>p.prompt.toLowerCase().includes(s));} res.json(list);
});
app.post("/api/admin/writing", authMiddleware, adminMiddleware, async (req,res)=>{
  const d=req.body; if(!d.prompt || d.prompt.length<10) return res.status(400).json({message:"Prompt must be at least 10 chars"});
  try{ const w=await prisma.writingPrompt.create({data:{id:d.id||undefined, task:d.task||"Academic Task 2", type:d.type||"academic-task2", difficulty:d.difficulty||"medium", timeLimitMin:d.timeLimitMin||40, minWords:d.minWords||250, prompt:d.prompt, instructions:JSON.stringify(d.instructions||[])}}); res.json(w);}catch(e){res.status(400).json({message:e.message})}
});
app.put("/api/admin/writing/:id", authMiddleware, adminMiddleware, async (req,res)=>{ try{ const d=req.body; if(d.instructions) d.instructions=JSON.stringify(d.instructions); const w=await prisma.writingPrompt.update({where:{id:req.params.id}, data:d}); res.json({...w, instructions: parseJson(w.instructions)});}catch{res.status(404).json({message:"Not found"})}});
app.delete("/api/admin/writing/:id", authMiddleware, adminMiddleware, async (req,res)=>{ try{await prisma.writingPrompt.delete({where:{id:req.params.id}}); res.json({message:"Deleted"});}catch{res.status(404).json({message:"Not found"})}});

// ============ SPEAKING ============
app.get("/api/speaking", async (req,res)=>{
  const {search,difficulty,part}=req.query; const where={}; if(difficulty&&difficulty!=="all") where.difficulty=difficulty; if(part&&part!=="all") where.part=parseInt(part);
  let list=(await prisma.speakingPrompt.findMany({where})).map(s=>({ ...s, followUps: parseJson(s.followUps)})); if(search){const s=String(search).toLowerCase(); list=list.filter(p=>p.prompt.toLowerCase().includes(s)||p.cueCardTitle.toLowerCase().includes(s));} res.json(list);
});
app.get("/api/admin/speaking", authMiddleware, adminMiddleware, async (req,res)=>{
  const {search,difficulty,part}=req.query; const where={}; if(difficulty&&difficulty!=="all") where.difficulty=difficulty; if(part&&part!=="all") where.part=parseInt(part);
  let list=(await prisma.speakingPrompt.findMany({where})).map(s=>({ ...s, followUps: parseJson(s.followUps)})); if(search){const s=String(search).toLowerCase(); list=list.filter(p=>p.prompt.toLowerCase().includes(s));} res.json(list);
});
app.post("/api/admin/speaking", authMiddleware, adminMiddleware, async (req,res)=>{
  const d=req.body; if(!d.prompt||d.prompt.length<10) return res.status(400).json({message:"Prompt required"}); if(!d.cueCardTitle) return res.status(400).json({message:"cueCardTitle required"});
  try{const s=await prisma.speakingPrompt.create({data:{id:d.id||undefined, part:d.part||1, difficulty:d.difficulty||"medium", prepTimeSec:d.prepTimeSec||60, speakingTimeSec:d.speakingTimeSec||120, cueCardTitle:d.cueCardTitle, prompt:d.prompt, followUps:JSON.stringify(d.followUps||[])}}); res.json(s);}catch(e){res.status(400).json({message:e.message})}
});
app.put("/api/admin/speaking/:id", authMiddleware, adminMiddleware, async (req,res)=>{ try{ const d=req.body; if(d.followUps) d.followUps=JSON.stringify(d.followUps); const s=await prisma.speakingPrompt.update({where:{id:req.params.id}, data:d}); res.json({...s, followUps: parseJson(s.followUps)});}catch{res.status(404).json({message:"Not found"})}});
app.delete("/api/admin/speaking/:id", authMiddleware, adminMiddleware, async (req,res)=>{ try{await prisma.speakingPrompt.delete({where:{id:req.params.id}}); res.json({message:"Deleted"});}catch{res.status(404).json({message:"Not found"})}});

// ============ GRAMMAR ============
app.get("/api/grammar", async (req,res)=>{
  const {search,level}=req.query; const where={}; if(level&&level!=="all") where.level=level;
  let list=await prisma.grammarTopic.findMany({where}); if(search){const s=String(search).toLowerCase(); list=list.filter(g=>g.title.toLowerCase().includes(s))} res.json(list);
});
app.get("/api/admin/grammar", authMiddleware, adminMiddleware, async (req,res)=>{
  const {search,level}=req.query; const where={}; if(level&&level!=="all") where.level=level;
  let list=await prisma.grammarTopic.findMany({where}); if(search){const s=String(search).toLowerCase(); list=list.filter(g=>g.title.toLowerCase().includes(s))} res.json(list);
});
app.post("/api/admin/grammar", authMiddleware, adminMiddleware, async (req,res)=>{
  const d=req.body; if(!d.title) return res.status(400).json({message:"Title required"});
  try{const g=await prisma.grammarTopic.create({data:{id:d.id||undefined, title:d.title, level:d.level||"Intermediate (Band 5–6)", summary:d.summary||"", example:d.example||"", minutes:d.minutes||20}}); res.json(g);}catch(e){res.status(400).json({message:e.message})}
});
app.put("/api/admin/grammar/:id", authMiddleware, adminMiddleware, async (req,res)=>{ try{const g=await prisma.grammarTopic.update({where:{id:req.params.id}, data:req.body}); res.json(g);}catch{res.status(404).json({message:"Not found"})}});
app.delete("/api/admin/grammar/:id", authMiddleware, adminMiddleware, async (req,res)=>{ try{await prisma.grammarTopic.delete({where:{id:req.params.id}}); res.json({message:"Deleted"});}catch{res.status(404).json({message:"Not found"})}});

// ============ MOCKS ============
app.get("/api/mocks", async (req,res)=>{
  const {search,type}=req.query; const where={}; if(type&&type!=="all") where.type=type;
  let list=(await prisma.mockTest.findMany({where})).map(m=>({ ...m, sections: parseJson(m.sections)})); if(search){const s=String(search).toLowerCase(); list=list.filter(m=>m.title.toLowerCase().includes(s))} res.json(list);
});
app.get("/api/admin/mocks", authMiddleware, adminMiddleware, async (req,res)=>{
  const {search,type}=req.query; const where={}; if(type&&type!=="all") where.type=type;
  let list=(await prisma.mockTest.findMany({where})).map(m=>({ ...m, sections: parseJson(m.sections)})); if(search){const s=String(search).toLowerCase(); list=list.filter(m=>m.title.toLowerCase().includes(s))} res.json(list);
});
app.post("/api/admin/mocks", authMiddleware, adminMiddleware, async (req,res)=>{
  const d=req.body; if(!d.title) return res.status(400).json({message:"Title required"});
  try{const m=await prisma.mockTest.create({data:{id:d.id||undefined, title:d.title, type:d.type||"Academic", durationMin:d.durationMin||60, questions:d.questions||0, description:d.description||"", sections:JSON.stringify(d.sections||[])}}); res.json(m);}catch(e){res.status(400).json({message:e.message})}
});
app.put("/api/admin/mocks/:id", authMiddleware, adminMiddleware, async (req,res)=>{ try{ const d=req.body; if(d.sections) d.sections=JSON.stringify(d.sections); const m=await prisma.mockTest.update({where:{id:req.params.id}, data:d}); res.json({...m, sections: parseJson(m.sections)});}catch{res.status(404).json({message:"Not found"})}});
app.delete("/api/admin/mocks/:id", authMiddleware, adminMiddleware, async (req,res)=>{ try{await prisma.mockTest.delete({where:{id:req.params.id}}); res.json({message:"Deleted"});}catch{res.status(404).json({message:"Not found"})}});

// ============ ACHIEVEMENTS ============
app.get("/api/achievements", async (req,res)=>{
  const {search}=req.query; let list=await prisma.achievement.findMany(); if(search){const s=String(search).toLowerCase(); list=list.filter(a=>a.title.toLowerCase().includes(s))} res.json(list);
});
app.get("/api/admin/achievements", authMiddleware, adminMiddleware, async (req,res)=>{
  const {search}=req.query; let list=await prisma.achievement.findMany(); if(search){const s=String(search).toLowerCase(); list=list.filter(a=>a.title.toLowerCase().includes(s))} res.json(list);
});
app.post("/api/admin/achievements", authMiddleware, adminMiddleware, async (req,res)=>{
  const d=req.body; if(!d.title) return res.status(400).json({message:"Title required"});
  try{const a=await prisma.achievement.create({data:{id:d.id||undefined, title:d.title, description:d.description||"", icon:d.icon||"🏆", progress:d.progress||0, max:d.max||1}}); res.json(a);}catch(e){res.status(400).json({message:e.message})}
});
app.put("/api/admin/achievements/:id", authMiddleware, adminMiddleware, async (req,res)=>{ try{const a=await prisma.achievement.update({where:{id:req.params.id}, data:req.body}); res.json(a);}catch{res.status(404).json({message:"Not found"})}});
app.delete("/api/admin/achievements/:id", authMiddleware, adminMiddleware, async (req,res)=>{ try{await prisma.achievement.delete({where:{id:req.params.id}}); res.json({message:"Deleted"});}catch{res.status(404).json({message:"Not found"})}});

// ============ STATS (lightweight - only users, other counts mocked for speed) ============
app.get("/api/admin/stats", authMiddleware, adminMiddleware, async (req,res)=>{
  const users=await prisma.user.findMany();
  const totalUsers=users.length; const activeUsers=users.filter(u=>u.status==="active").length;
  const premium=users.filter(u=>u.planType==="premium").length; const pro=users.filter(u=>u.planType==="pro").length;
  const revenue=premium*12+pro*29;
  const weeklySignups=[]; const today=new Date(); for(let i=6;i>=0;i--){const d=new Date(today); d.setDate(today.getDate()-i); const iso=d.toISOString().slice(0,10); const label=d.toLocaleDateString("en-US",{weekday:"short"}); const count=users.filter(u=>{try{return new Date(u.createdAt).toISOString().slice(0,10)===iso}catch{return false}}).length; weeklySignups.push({label,count,date:iso});}
  // For speed, other counts are static/mock (frontend will use localStorage for those)
  res.json({totalUsers,activeUsers,totalQuestions:200,totalWords:640,totalMocks:7,totalCourses:4,totalLessons:24,totalWritingPrompts:5,totalSpeakingPrompts:6,totalGrammarTopics:8,totalAchievements:15,revenueEstimate:revenue,weeklySignups});
});

// ============ MUSIC ============
app.get("/api/music", async (req,res)=>{
  const {category}=req.query;
  const where={isActive:true};
  if(category && category!=="all") where.category=String(category);
  const list=await prisma.music.findMany({where, orderBy:{order:"asc"}});
  res.json(list);
});
app.get("/api/admin/music", authMiddleware, adminMiddleware, async (req,res)=>{
  const list=await prisma.music.findMany({orderBy:{order:"asc"}});
  res.json(list);
});
app.post("/api/admin/music", authMiddleware, adminMiddleware, async (req,res)=>{
  const d=req.body; if(!d.title) return res.status(400).json({message:"Title required"}); if(!d.url) return res.status(400).json({message:"URL required"});
  try{ const m=await prisma.music.create({data:{title:d.title, artist:d.artist||"IELTS Master", url:d.url, coverUrl:d.coverUrl||null, durationSec:d.durationSec||0, category:d.category||"reading", order:d.order||0}}); res.json(m);}catch(e){res.status(400).json({message:e.message})}
});
app.put("/api/admin/music/:id", authMiddleware, adminMiddleware, async (req,res)=>{
  try{ const m=await prisma.music.update({where:{id:req.params.id}, data:req.body}); res.json(m);}catch{res.status(404).json({message:"Music not found"})}
});
app.delete("/api/admin/music/:id", authMiddleware, adminMiddleware, async (req,res)=>{
  try{ await prisma.music.delete({where:{id:req.params.id}}); res.json({message:"Deleted"});}catch{res.status(404).json({message:"Music not found"})}
});

// Fallback
app.use((req, res) => res.status(404).json({ message: "Not found" }));

app.listen(PORT, () => {
  console.log(`✅ IELTS server running on http://localhost:${PORT}`);
});
