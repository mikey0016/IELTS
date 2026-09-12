import { useEffect, useState, useRef } from "react";
import { Mic, Square, Play, Volume2, Timer, Sparkles, ArrowRight, RefreshCw, Award, TrendingUp, BookOpen, MessageCircle, Mic2, BarChart3, CheckCircle, AlertCircle, FileText, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTimer } from "@/hooks/useTimer";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";
import { getSpeakingPrompts } from "@/api/speaking";
import { apiFetch, isRealApi } from "@/api/http";
import type { SpeakingPrompt } from "@/types";
import { formatClock } from "@/lib/format";
import { cn } from "@/lib/cn";
import { evaluateSpeakingFull, type SpeakingEvaluation } from "@/lib/speakingEvaluation";

type Phase = "select" | "interview" | "transcribing" | "evaluating" | "results";

const PART_INFO = {
  1: { label: "Part 1 · Introduction", hint: "Har bir savolga 30 sekund — 2-3 gap bilan tabiiy javob bering.", timing: "30s / javob", color: "from-emerald-500 to-teal-600" },
  2: { label: "Part 2 · Cue Card", hint: "60s tayyorgarlik + 120s gapirish. 4 ta nuqta bo'yicha rejalang.", timing: "60s prep + 120s speak", color: "from-violet-500 to-purple-600" },
  3: { label: "Part 3 · Discussion", hint: "Har bir savolga 45 sekund — sabab, misol, taqqoslash bilan javob.", timing: "45s / javob", color: "from-orange-500 to-amber-600" },
};

export function Speaking() {
  const progress = useProgress();
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("select");
  const [part, setPart] = useState<1 | 2 | 3>(1);
  const [promptIndex, setPromptIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [recordedSec, setRecordedSec] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [history, setHistory] = useState<SpeakingEvaluation[]>([]);
  const [result, setResult] = useState<SpeakingEvaluation | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [prompts, setPrompts] = useState<SpeakingPrompt[] | null>(null);
  const [loading, setLoading] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    getSpeakingPrompts()
      .then((data) => setPrompts(data))
      .catch(() => setPrompts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = prompts ? prompts.filter((p) => p.part === part) : [];
  const prompt = filtered[promptIndex % (filtered.length || 1)];

  const prepTimer = useTimer("down", prompt?.prepTimeSec ?? 0, () => {
    if (phase === "interview") {
      toast("Tayyorgarlik tugadi — gapirishni boshlang!", "info");
      speakTimer.reset(); speakTimer.start();
    }
  });
  const speakTimer = useTimer("down", prompt?.speakingTimeSec ?? 30, () => {
    if (phase === "interview" && recording) { setRecording(false); toast("Vaqt tugadi — yozish to'xtatildi.", "info"); }
  });

  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setRecordedSec((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setRecordedSec((s) => {
        if (s >= (prompt?.speakingTimeSec ?? 120)) { window.clearInterval(id); setPlaying(false); return s; }
        return s + 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing, prompt?.speakingTimeSec]);

  const start = (p: 1 | 2 | 3) => {
    setPart(p); setPromptIndex(0); setRecordedSec(0); setTranscript(""); setPhase("interview");
  };

  useEffect(() => {
    if (phase !== "interview" || !prompt) return;
    prepTimer.reset(); speakTimer.reset();
    if (prompt.prepTimeSec > 0) { prepTimer.start(); toast(`Tayyorgarlik boshlandi — ${prompt.prepTimeSec}s`, "info"); }
  }, [phase, prompt?.id]);

  const beginSpeaking = async () => {
    setTranscript("");
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        if (audioRef.current) audioRef.current.src = url;
        tryTranscribe();
      };
      recorder.start();
      setRecording(true); setRecordedSec(0);
      if (prepTimer.isRunning) prepTimer.pause();
      prepTimer.reset(); speakTimer.reset(); speakTimer.start();
      toast("Yozish boshlandi — tabiiy gapiring!", "success");
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
        let finalTranscript = "";
        rec.onresult = (e: any) => {
          let interim = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const t = e.results[i][0].transcript;
            if (e.results[i].isFinal) finalTranscript += t + " ";
            else interim += t;
          }
          setTranscript(finalTranscript + interim);
        };
        rec.start();
        (window as any)._speechRec = rec;
      }
    } catch {
      toast("Mikrofon ruxsati kerak", "error");
      setRecording(true); setRecordedSec(0);
      if (prepTimer.isRunning) prepTimer.pause();
      prepTimer.reset(); speakTimer.reset(); speakTimer.start();
    }
  };

  const tryTranscribe = () => {
    const rec = (window as any)._speechRec;
    if (rec) try { rec.stop(); } catch {}
  };

  const stopRecording = () => {
    setRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    tryTranscribe();
    if (speakTimer.isRunning) speakTimer.pause();
  };

  const submit = async () => {
    if (!prompt) return;
    const finalTranscript = transcript.trim() || prompt.prompt + " I think this is an important topic. In my opinion, there are several reasons. First, it helps people. Second, it is good for society. For example, my own experience shows it is useful. On the other hand, there are some challenges. In conclusion, I believe it is very significant and comprehensive.";
    if (!transcript.trim()) setTranscript(finalTranscript);
    setPhase("transcribing");
    setIsTranscribing(true);
    // Try online (backend) first if isRealApi
    if (isRealApi()) {
      try {
        const evalResult = await apiFetch("/api/speaking/evaluate", { method: "POST", body: JSON.stringify({ transcript: finalTranscript, durationSec: recordedSec || 45, part }) }) as any;
        setIsTranscribing(false);
        setPhase("evaluating");
        // small delay for UX
        setTimeout(() => {
          setResult(evalResult);
          setHistory(h => [evalResult, ...h].slice(0, 5));
          progress.recordMinutes(part === 1 ? 10 : part === 2 ? 15 : 12);
          toast(`Online baholandi — Band ${evalResult.overall} • ${evalResult.estimatedCEFR} (backend)`, "success");
          setPhase("results");
        }, 600);
        return;
      } catch {
        // fallback to offline
      }
    }
    setTimeout(() => {
      setIsTranscribing(false);
      setPhase("evaluating");
      setTimeout(() => {
        const evalResult = evaluateSpeakingFull(finalTranscript, recordedSec || 45, part);
        setResult(evalResult);
        setHistory(h => [evalResult, ...h].slice(0, 5));
        progress.recordMinutes(part === 1 ? 10 : part === 2 ? 15 : 12);
        toast(`Baholandi — Band ${evalResult.overall} • ${evalResult.estimatedCEFR} (offline)`, "success");
        setPhase("results");
      }, 1200);
    }, 800);
  };

  const backToSelect = () => { setPhase("select"); setRecording(false); setPlaying(false); setTranscript(""); };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Premium header - spec rounded-[24px] */}
      <div className="relative overflow-hidden rounded-[24px] bg-slate-900 p-7 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-brand-600 opacity-90" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur">
            <Mic2 className="h-3.5 w-3.5" /> Speaking — DB live
          </p>
          <h1 className="mt-3 font-display text-2xl font-black tracking-tight">IELTS Speaking <span className="text-white/80">Lab</span></h1>
          <p className="mt-1.5 max-w-2xl text-sm text-white/80">
            Haqiqiy imtihon vaqti bilan yozib, 4 ta mezon bo'yicha to'liq baho oling — <b className="text-white">Fluency, Lexical, Grammar, Pronunciation</b> har biri alohida. DB dan jonli via <code className="rounded bg-white/20 px-1">GET /api/speaking</code>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="white" className="shadow"><Database className="h-3 w-3" /> {isRealApi() ? "DB live" : "Mock"} · {prompts ? `${prompts.length} prompts` : "loading"}</Badge>
            <Badge tone="white">Band 0-9 · CEFR A2→C2</Badge>
            <Badge tone="white">WPM · TTR · AWL</Badge>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} glass className="p-6">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <Skeleton className="mt-4 h-5 w-32" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-4 h-8 w-24 rounded-full" />
            </Card>
          ))}
        </div>
      ) : phase === "select" && (
        <div className="grid gap-4 sm:grid-cols-3">
          {([1, 2, 3] as const).map((p) => (
            <Card key={p} hover glass className="cursor-pointer p-0 text-left transition-all hover:-translate-y-1" onClick={() => start(p)}>
              <CardContent className="p-6">
                <div className={`absolute inset-0 bg-gradient-to-br ${PART_INFO[p].color} opacity-0 group-hover:opacity-[0.04] transition`} />
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${PART_INFO[p].color} text-white shadow-lg`}>
                  <Mic className="h-6 w-6" />
                </div>
                <p className="mt-4 font-black text-lg text-slate-900 dark:text-white">Part {p} {p===1?"· Intro":p===2?"· Cue Card":"· Discussion"}</p>
                <p className="mt-1 text-xs font-black tracking-widest text-slate-400 uppercase">{PART_INFO[p].timing}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{PART_INFO[p].hint}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1.5 text-xs font-black">Boshlash <ArrowRight className="h-3 w-3"/></span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {phase === "interview" && prompt && (
        <Card glass className="overflow-hidden">
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge tone="violet" className="px-3 py-1.5">{PART_INFO[part].label} • {PART_INFO[part].timing}</Badge>
              <div className="flex items-center gap-2">
                {prompt.prepTimeSec > 0 && (
                  <span className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black", prepTimer.isRunning ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-500")}>
                    <Timer className="h-3.5 w-3.5"/> Prep: {formatClock(prepTimer.seconds)}
                  </span>
                )}
                <span className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black", speakTimer.isRunning ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 bg-slate-50 text-slate-500", speakTimer.seconds<10 && speakTimer.isRunning && "border-rose-300 bg-rose-50 text-rose-600")}>
                  <Timer className="h-3.5 w-3.5"/> {formatClock(speakTimer.seconds)}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-violet-50/30 p-5 ring-1 ring-slate-200 dark:from-slate-800/60 dark:to-violet-900/10 dark:ring-slate-700">
              <p className="text-xs font-black tracking-widest text-violet-600 uppercase flex items-center gap-1.5"><BookOpen className="h-3 w-3"/>{prompt.cueCardTitle}</p>
              <p className="mt-2 text-base font-bold leading-relaxed text-slate-900 dark:text-white">{prompt.prompt}</p>
              {prompt.followUps.length > 0 && (
                <ul className="mt-3 grid gap-1.5">
                  {prompt.followUps.map((f) => (
                    <li key={f} className="flex gap-2 text-xs font-medium text-slate-600 dark:text-slate-400"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500"/> {f}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 dark:border-slate-700 dark:bg-slate-800/30">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {!recording ? (
                    <Button variant="primary" size="lg" onClick={beginSpeaking} className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 shadow-lg hover:shadow-xl">
                      <Mic className="h-5 w-5"/> Yozishni boshlash
                    </Button>
                  ) : (
                    <Button variant="outline" size="lg" onClick={stopRecording} className="rounded-2xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100">
                      <Square className="h-4 w-4 fill-current"/> To'xtatish
                    </Button>
                  )}
                  <span className="flex items-center gap-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1.5 font-mono text-sm font-black">
                    <Volume2 className="h-4 w-4"/> {formatClock(recordedSec)}
                  </span>
                  {recordedSec>0 && !recording && (
                    <audio ref={audioRef} controls className="h-9 w-32"/>
                  )}
                </div>
                <p className="text-center text-xs font-medium text-slate-500">
                  {recording ? `🔴 Yozilmoqda — ${prompt.speakingTimeSec}s ichida gapiring` : recordedSec>0 ? "✅ Yozuv saqlandi — transcriptni tahrirlab, baholashga yuboring" : "Mikrofon ruxsatini bering, so'ng tabiiy gapiring"}
                </p>
                {(recording || prepTimer.isRunning) && (
                  <div className="w-full max-w-md space-y-2">
                    {prepTimer.isRunning && <ProgressBar value={((prompt.prepTimeSec - prepTimer.seconds)/Math.max(1,prompt.prepTimeSec))*100} tone="amber"/>}
                    {recording && <ProgressBar value={(recordedSec/(prompt.speakingTimeSec||30))*100} tone="violet"/>}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="text-xs font-black tracking-widest text-slate-500 uppercase flex items-center gap-1.5"><FileText className="h-3 w-3"/> Transcript (avtomatik + tahrirlash mumkin)</label>
                <textarea value={transcript} onChange={e=> setTranscript(e.target.value)} placeholder="Gapirgan matningiz bu yerda paydo bo'ladi... yoki qo'lda yozing" className="mt-2 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed shadow-sm outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-900" />
                <p className="mt-1 text-xs text-slate-400">{transcript.trim().split(/\s+/).filter(Boolean).length} so'z • {transcript ? "Tahrirlash mumkin" : "Bo'sh qoldirsangiz ham baholanadi"}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <Button variant="outline" className="rounded-2xl" onClick={backToSelect}><RefreshCw className="h-4 w-4"/> Boshqa Part</Button>
              <div className="flex gap-2">
                <Button variant="ghost" className="rounded-2xl" onClick={()=> setPromptIndex(i=>i+1)}>Keyingi prompt <ArrowRight className="h-4 w-4"/></Button>
                <Button onClick={submit} disabled={recordedSec<3 && !transcript.trim()} className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg">
                  Baholash <Sparkles className="h-4 w-4"/>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "transcribing" && (
        <Card glass><CardContent className="py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30 animate-pulse"><MessageCircle className="h-8 w-8 text-violet-600"/></div>
          <h3 className="mt-4 font-black text-lg">Transcript tayyorlanmoqda...</h3>
          <p className="text-sm text-slate-500">Audio matnga o'tkazilmoqda</p>
          {isTranscribing && <Skeleton className="mx-auto mt-4 h-2 w-48" />}
        </CardContent></Card>
      )}

      {phase === "evaluating" && (
        <Card glass><CardContent className="py-16 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white animate-pulse"><BarChart3 className="h-8 w-8"/></div>
          <h3 className="font-black text-lg">Full IELTS baholash...</h3>
          <p className="text-sm text-slate-500">4 ta mezon bo'yicha 0 dan tahlil qilinmoqda</p>
          <div className="mx-auto max-w-sm grid grid-cols-2 gap-2">
            {["Fluency","Lexical","Grammar","Pronunciation"].map(k=>(
              <Skeleton key={k} className="h-12 rounded-2xl" />
            ))}
          </div>
        </CardContent></Card>
      )}

      {phase === "results" && result && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-[24px] bg-slate-900 p-[1.5px]">
            <div className="rounded-[22px] bg-gradient-to-br from-slate-900 via-violet-900 to-indigo-900 p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"/>
              <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"/>
              <div className="relative grid sm:grid-cols-[1.2fr_1fr] gap-6 items-center">
                <div className="text-center sm:text-left">
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/20 px-3 py-1 text-xs font-black tracking-widest uppercase"><Award className="h-3 w-3"/> Overall Band</p>
                  <p className="mt-3 font-black text-7xl tracking-tight">{result.overall.toFixed(1)}</p>
                  <p className="mt-1 text-sm font-bold tracking-widest uppercase text-white/60">CEFR {result.estimatedCEFR} • Part {result.part} • {result.date}</p>
                  <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                    <Badge tone="white">{result.wordCount} so'z</Badge>
                    <Badge tone="white">{result.wpm} WPM</Badge>
                    <Badge tone="white">{result.durationSec}s</Badge>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-4">
                  <p className="text-xs font-black tracking-widest uppercase text-white/60">Transcript</p>
                  <p className="mt-2 line-clamp-6 text-sm leading-relaxed text-white/90 italic">“{result.transcript.slice(0,320)}{result.transcript.length>320?"…":""}”</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {result.criteria.map(c=>(
              <Card key={c.key} glass className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      {c.key==="fluency" && <TrendingUp className="h-4 w-4 text-violet-600"/>}
                      {c.key==="lexical" && <BookOpen className="h-4 w-4 text-emerald-600"/>}
                      {c.key==="grammar" && <FileText className="h-4 w-4 text-blue-600"/>}
                      {c.key==="pronunciation" && <Mic2 className="h-4 w-4 text-orange-600"/>}
                      {c.label}
                    </h3>
                    <Badge tone="slate">{c.band.toFixed(1)}</Badge>
                  </div>
                  <ProgressBar value={(c.band/9)*100} tone={c.band>=7?"emerald":c.band>=6?"violet":"amber"} className="mt-3"/>
                  <p className="mt-3 text-xs leading-relaxed font-medium text-slate-600 dark:text-slate-400">{c.comment}</p>
                  <ul className="mt-3 space-y-1">
                    {c.details.map((d,i)=>(
                      <li key={i} className="flex gap-2 text-xs text-slate-500"><span className="mt-1 h-1 w-1 rounded-full bg-slate-300"/> {d}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card glass><CardContent className="p-5">
              <h4 className="flex items-center gap-1.5 text-xs font-black tracking-widest uppercase text-emerald-600"><CheckCircle className="h-4 w-4"/> Kuchli tomonlar</h4>
              <ul className="mt-3 space-y-1.5">{result.strengths.map((s,i)=><li key={i} className="text-xs font-medium text-slate-700 dark:text-slate-300 flex gap-1.5"><span className="text-emerald-500">•</span>{s}</li>)}</ul>
            </CardContent></Card>
            <Card glass><CardContent className="p-5">
              <h4 className="flex items-center gap-1.5 text-xs font-black tracking-widest uppercase text-amber-600"><AlertCircle className="h-4 w-4"/> Kamchiliklar</h4>
              <ul className="mt-3 space-y-1.5">{result.weaknesses.map((s,i)=><li key={i} className="text-xs font-medium text-slate-700 dark:text-slate-300 flex gap-1.5"><span className="text-amber-500">•</span>{s}</li>)}</ul>
            </CardContent></Card>
            <Card glass><CardContent className="p-5">
              <h4 className="flex items-center gap-1.5 text-xs font-black tracking-widest uppercase text-violet-600"><TrendingUp className="h-4 w-4"/> Keyingi qadamlar</h4>
              <ul className="mt-3 space-y-1.5">{result.nextSteps.map((s,i)=><li key={i} className="text-xs font-medium text-slate-700 dark:text-slate-300 flex gap-1.5"><span className="text-violet-500">→</span>{s}</li>)}</ul>
            </CardContent></Card>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={backToSelect} className="flex-1 rounded-2xl"><RefreshCw className="h-4 w-4"/> Yangi baholash</Button>
            <Button onClick={()=> { navigator.clipboard.writeText(`Band ${result.overall} - ${result.criteria.map(c=>c.label+':'+c.band).join(', ')}`) ; toast("Natija nusxalandi","success")}} className="flex-1 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">Nusxalash</Button>
          </div>
        </div>
      )}

      {history.length>0 && (
        <Card glass><CardContent className="p-5">
          <p className="text-xs font-black tracking-widest uppercase text-slate-400">Tarix</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {history.map(h=>(
              <button key={h.id} onClick={()=> {setResult(h); setPhase("results")}} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black hover:border-violet-300 dark:border-slate-700 dark:bg-slate-800">
                Part {h.part} • {h.overall.toFixed(1)} • {h.estimatedCEFR} • {h.date}
              </button>
            ))}
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}
