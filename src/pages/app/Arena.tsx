import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProgress } from "@/context/ProgressContext";
import { useAuth } from "@/context/AuthContext";
import { fetchQuestions } from "@/api/practice";
import type { Question } from "@/types";
import { useToast } from "@/context/ToastContext";
import { addCoins } from "@/lib/wallet";
import { Swords, Zap, Trophy, Clock, Flame, Crown, Timer, Database } from "lucide-react";
import { isRealApi } from "@/api/http";

type ArenaState = "lobby" | "countdown" | "battle" | "result";

export function Arena() {
  const { toast } = useToast();
  const { user } = useAuth();
  const progress = useProgress();
  const [state, setState] = useState<ArenaState>("lobby");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [wager, setWager] = useState(20);
  const [skill, setSkill] = useState<"reading" | "listening">("reading");
  const [loadingQs, setLoadingQs] = useState(false);
  const timerRef = useRef<number | null>(null);
  const oppRef = useRef<number | null>(null);
  const current = questions[idx];
  const progressPct = useMemo(() => (questions.length ? (idx / questions.length) * 100 : 0), [idx, questions]);

  const startCountdown = async () => {
    setLoadingQs(true);
    try {
      const qs = await fetchQuestions(skill, { limit: 10 });
      const picked = qs.slice(0, 8);
      if (picked.length < 3) { toast("Savollar yetarli emas", "error"); return; }
      setQuestions(picked); setIdx(0); setScore(0); setOppScore(0); setTimeLeft(90); setState("countdown");
      setTimeout(() => setState("battle"), 2200);
    } finally { setLoadingQs(false); }
  };

  useEffect(() => {
    if (state !== "battle") return;
    timerRef.current = window.setInterval(() => setTimeLeft((t) => { if (t <= 1) { window.clearInterval(timerRef.current!); setState("result"); return 0; } return t - 1; }), 1000);
    oppRef.current = window.setInterval(() => { setIdx((cur) => { if (Math.random() < 0.65) setOppScore((s) => s + 1); return cur; }); }, 6200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); if (oppRef.current) clearInterval(oppRef.current); };
  }, [state]);
  useEffect(() => { if (state === "battle" && idx >= questions.length) { setState("result"); if (timerRef.current) clearInterval(timerRef.current); if (oppRef.current) clearInterval(oppRef.current); } }, [idx, questions.length, state]);

  const handleAnswer = (optIdx: number) => {
    if (!current) return;
    const correct = current.correctIndex ?? (current.correctAnswer ? 0 : undefined);
    const isCorrect = typeof correct === "number" ? optIdx === correct : false;
    if (isCorrect) { setScore((s) => s + 1); try { window.dispatchEvent(new CustomEvent("xp:gain", { detail: { coins: 2, xp: 2, msg: "Duel +2" } })); } catch {} }
    setIdx((i) => i + 1);
  };
  const handleFill = (val: string) => {
    if (!current) return;
    const ok = val.trim().toLowerCase() === (current.correctAnswer || "").toLowerCase();
    if (ok) setScore((s) => s + 1);
    setIdx((i) => i + 1);
  };
  const result = useMemo(() => {
    if (state !== "result") return null;
    const won = score > oppScore; const draw = score === oppScore; const coins = won ? wager * 2 : draw ? wager : 0;
    return { won, draw, coins };
  }, [state, score, oppScore, wager]);
  useEffect(() => { if (result && state === "result") { if (result.won) { try { addCoins(null, result.coins, "Arena win"); } catch {} } progress.recordMinutes(3); } }, [result, state]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-[24px] bg-slate-900 p-7 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-amber-600 to-violet-600 opacity-90" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur"><Swords className="h-5 w-5" /></span>
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur">Arena — 1v1 Duel {isRealApi() ? <span className="inline-flex items-center gap-1"><Database className="h-3 w-3" /> DB Qs</span> : "· Local"}</p>
              <h1 className="mt-1 font-display text-xl font-black">IELTS Arena — 1v1 Duel</h1>
              <p className="text-xs text-white/80">Real-time duel • 90s • 8 savol • garov tikib 2x yutib ol</p>
            </div>
          </div>
          <div className="flex items-center gap-2"><Badge tone="white" className="gap-1 rounded-full"><Flame className="h-3 w-3" /> {progress.streak} streak</Badge><Badge tone="white" className="rounded-full">{progress.overallBandValue.toFixed(1)} band</Badge></div>
        </div>
      </div>

      {state === "lobby" && (
        <Card glass>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <button onClick={() => setSkill("reading")} className={`rounded-2xl border p-4 text-left transition ${skill === "reading" ? "border-violet-600 bg-violet-50 dark:bg-violet-950/30" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]"}`}><p className="font-bold dark:text-white">Reading Duel</p><p className="text-xs text-slate-500">8 passage Q • 90s</p></button>
              <button onClick={() => setSkill("listening")} className={`rounded-2xl border p-4 text-left transition ${skill === "listening" ? "border-violet-600 bg-violet-50 dark:bg-violet-950/30" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]"}`}><p className="font-bold dark:text-white">Listening Duel</p><p className="text-xs text-slate-500">8 audio Q • 90s</p></button>
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20"><p className="flex items-center gap-1 text-sm font-bold"><Crown className="h-4 w-4 text-amber-600" /> Garov</p><div className="mt-2 flex items-center gap-2">{[10, 20, 50].map((v) => <button key={v} onClick={() => setWager(v)} className={`rounded-full px-3 py-1 text-xs font-bold ${wager === v ? "bg-amber-600 text-white" : "bg-white border dark:bg-white/10"}`}>{v}🪙</button>)}</div><p className="mt-1 text-xs text-amber-700">Yutsang 2x — {wager * 2}🪙</p></div>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-900 p-4 text-white">
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "You"}`} alt="you" className="h-10 w-10 rounded-full bg-white" />
              <div><p className="font-bold">{user?.name || "Sen"}</p><p className="text-xs text-slate-400">{progress.overallBandValue.toFixed(1)} band • Lv {Math.floor(progress.minutesToday / 200) + 1}</p></div>
              <span className="mx-2 text-slate-600">VS</span>
              <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Bot" alt="bot" className="h-10 w-10 rounded-full bg-white" />
              <div><p className="font-bold">Bot — Band 7.0</p><p className="text-xs text-slate-400">65% accuracy • 6s / savol</p></div>
              <Button className="ml-auto rounded-2xl" size="lg" onClick={startCountdown} loading={loadingQs}><Zap className="h-4 w-4" /> Duel boshlash</Button>
            </div>
            <p className="text-xs text-slate-500">Do'st bilan ham o'ynasa bo'ladi — Friends dagi odamni taklif qil (hozir bot bilan). DB live bo'lsa savollar PostgreSQL dan keladi.</p>
          </CardContent>
        </Card>
      )}

      {state === "countdown" && <Card glass><CardContent className="py-20 text-center"><p className="animate-pulse text-6xl font-black text-violet-600">3 → 2 → 1</p><p className="mt-2 font-bold">Duel boshlanmoqda...</p></CardContent></Card>}

      {state === "battle" && current && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-white"><Timer className="h-4 w-4" /><span className="font-mono font-bold">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}</span><div className="mx-3 h-2 flex-1 overflow-hidden rounded-full bg-white/20"><div className="h-full bg-emerald-400 transition-all" style={{ width: `${progressPct}%` }} /></div><span className="text-xs">{idx + 1}/{questions.length}</span></div>
            <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow dark:bg-slate-900"><span className="font-bold text-violet-600">{score}</span><span className="text-slate-400">:</span><span className="font-bold text-rose-600">{oppScore}</span><Trophy className="h-4 w-4 text-amber-500" /></div>
          </div>
          <Card glass>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center gap-2"><Badge tone={skill === "reading" ? "brand" : "violet"} className="rounded-full">{skill}</Badge><Badge tone="slate" className="rounded-full">Q {idx + 1}</Badge><span className="ml-auto flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3 w-3" />{current.timeLimitSec || 60}s</span></div>
              {current.passage && <div className="rounded-xl bg-slate-50 p-3 text-sm leading-relaxed dark:bg-white/[0.04]">{current.passage.slice(0, 380)}{current.passage.length > 380 ? "…" : ""}</div>}
              <p className="font-semibold dark:text-white">{current.prompt}</p>
              {current.type === "fill-blank" ? (
                <div className="flex gap-2"><input autoFocus placeholder="ONE WORD ONLY" className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.06]" onKeyDown={(e) => { if (e.key === "Enter") handleFill((e.target as HTMLInputElement).value); }} /><Button className="rounded-2xl" onClick={() => handleFill((document.querySelector("input") as HTMLInputElement)?.value || "")}>Yuborish</Button></div>
              ) : (
                <div className="grid gap-2">{(current.options || ["True", "False", "Not Given"]).map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium hover:border-violet-400 hover:bg-violet-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-violet-700"><span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{String.fromCharCode(65 + i)}</span>{opt}</button>
                ))}</div>
              )}
              <div className="flex gap-2 pt-2"><div className="flex-1 rounded-2xl bg-violet-600 p-2 text-center text-white"><p className="text-xs opacity-80">Sen</p><p className="text-lg font-black">{score}</p></div><div className="flex-1 rounded-2xl bg-slate-800 p-2 text-center text-white"><p className="text-xs opacity-80">Raqib (bot)</p><p className="text-lg font-black">{oppScore}</p></div></div>
            </CardContent>
          </Card>
        </div>
      )}

      {state === "result" && result && (
        <Card glass>
          <CardContent className="space-y-4 pt-6 text-center">
            <p className={`text-3xl font-black ${result.won ? "text-emerald-600" : result.draw ? "text-amber-600" : "text-rose-600"}`}>{result.won ? "G‘ALABA!" : result.draw ? "DURRANG" : "MAG‘LUBIYAT"}</p>
            <div className="mx-auto grid max-w-md grid-cols-2 gap-3"><div className="rounded-2xl bg-violet-600 p-4 text-white"><p className="text-xs opacity-80">Sen</p><p className="text-2xl font-black">{score}/{questions.length}</p></div><div className="rounded-2xl bg-slate-800 p-4 text-white"><p className="text-xs opacity-80">Raqib</p><p className="text-2xl font-black">{oppScore}/{questions.length}</p></div></div>
            <p className="font-bold">{result.won ? `+${result.coins}🪙 yutding (garov x2)` : result.draw ? `Garov qaytdi ${wager}🪙` : `-${wager}🪙 garov kuydi`}</p>
            <div className="flex justify-center gap-2"><Button variant="outline" className="rounded-2xl" onClick={() => setState("lobby")}>Lobbi</Button><Button className="rounded-2xl" onClick={startCountdown}><Swords className="h-4 w-4" /> Yana duel</Button></div>
          </CardContent>
        </Card>
      )}

      {loadingQs && <Skeleton className="h-40 rounded-[20px]" />}
    </div>
  );
}
