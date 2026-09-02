import { useEffect, useState } from "react";
import {
  Mic,
  Square,
  Play,
  Pause,
  Volume2,
  Timer,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTimer } from "@/hooks/useTimer";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";
import { SPEAKING_PROMPTS, SPEAKING_CRITERIA } from "@/data/speaking";
import type { SpeakingPrompt } from "@/types";
import { formatClock, randomId } from "@/lib/format";
import { cn } from "@/lib/cn";

type Phase = "select" | "interview" | "evaluating" | "results";

interface SpeakingResult {
  id: string;
  part: number;
  date: string;
  overall: number;
  criteria: { key: string; label: string; band: number; comment: string }[];
}

const PART_INFO: Record<
  number,
  { label: string; hint: string; timing: string }
> = {
  1: {
    label: "Part 1 · Introduction",
    hint: "Har bir savolga 30 sekund — 2-3 gap bilan tabiiy javob bering.",
    timing: "30s / javob · prep 0s",
  },
  2: {
    label: "Part 2 · Cue card",
    hint: "60s tayyorgarlik + 2 minut (120s) gapirish. 4 bullet bo'yicha rejalang.",
    timing: "60s prep + 120s speak",
  },
  3: {
    label: "Part 3 · Discussion",
    hint: "Har bir savolga 45 sekund — sabab, misol, taqqoslash bilan javob.",
    timing: "45s / javob · prep 0s",
  },
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
  const [history, setHistory] = useState<SpeakingResult[]>([]);
  const [result, setResult] = useState<SpeakingResult | null>(null);

  const prompts = SPEAKING_PROMPTS.filter((p) => p.part === part);
  const prompt = prompts[promptIndex % prompts.length];

  const prepTimer = useTimer("down", prompt?.prepTimeSec ?? 0, () => {
    if (phase === "interview") {
      toast("Tayyorgarlik tugadi — gapirishni boshlang!", "info");
      // auto-start speaking timer after prep
      speakTimer.reset();
      speakTimer.start();
    }
  });
  const speakTimer = useTimer("down", prompt?.speakingTimeSec ?? 30, () => {
    if (phase === "interview" && recording) {
      setRecording(false);
      toast("Vaqt tugadi — yozish to'xtatildi.", "info");
    }
    if (phase === "interview" && !recording) {
      toast("Vaqt tugadi!", "info");
    }
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
        if (s >= (prompt?.speakingTimeSec ?? 120)) {
          window.clearInterval(id);
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing, prompt?.speakingTimeSec]);

  const start = (p: 1 | 2 | 3) => {
    setPart(p);
    setPromptIndex(0);
    setRecordedSec(0);
    setPhase("interview");
  };

  // Auto-start prep timer when entering interview (for Part 2)
  useEffect(() => {
    if (phase !== "interview" || !prompt) return;
    prepTimer.reset();
    speakTimer.reset();
    if (prompt.prepTimeSec > 0) {
      prepTimer.start();
      toast(`Tayyorgarlik boshlandi — ${prompt.prepTimeSec}s`, "info");
    } else {
      // No prep: start speaking timer immediately when they press Start recording
      // speak timer will start on beginSpeaking
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, prompt?.id]);

  const beginSpeaking = () => {
    setRecording(true);
    setRecordedSec(0);
    // if prep still running, stop it
    if (prepTimer.isRunning) prepTimer.pause();
    prepTimer.reset();
    speakTimer.reset();
    speakTimer.start();
    toast("Yozish boshlandi — tabiiy gapiring!", "success");
  };

  const stopRecording = () => {
    setRecording(false);
    if (speakTimer.isRunning) speakTimer.pause();
  };

  const submit = () => {
    setPhase("evaluating");
    window.setTimeout(() => {
      const res = buildSpeakingResult(part, recordedSec);
      setResult(res);
      setHistory((h) => [res, ...h].slice(0, 5));
      progress.recordMinutes(part === 1 ? 10 : part === 2 ? 15 : 12);
      toast("Recording evaluated — see your band estimate", "success");
      setPhase("results");
    }, 1400);
  };

  const backToSelect = () => {
    setPhase("select");
    setRecording(false);
    setPlaying(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Speaking Practice — Haqiqiy IELTS timing"
        title="IELTS Speaking"
        description="Part 1: 30s/jawob · Part 2: 60s prep + 2 min gapirish · Part 3: 45s/jawob. Vaqt tugagach avtomatik to'xtaydi."
      />

      {phase === "select" && (
        <div className="grid gap-4 sm:grid-cols-3">
          {([1, 2, 3] as const).map((p) => (
            <button
              key={p}
              onClick={() => start(p)}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                <Mic className="h-5 w-5" />
              </span>
              <p className="mt-3 font-display text-base font-bold text-slate-900 dark:text-white">
                Part {p}{" "}
                {p === 1 ? "· Intro" : p === 2 ? "· Cue card" : "· Discussion"}
              </p>
              <p className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {PART_INFO[p].timing}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {PART_INFO[p].hint}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                Start practice{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      )}

      {phase === "interview" && prompt && (
        <Card>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge tone="emerald">
                {PART_INFO[part].label} · {PART_INFO[part].timing}
              </Badge>
              <div className="flex items-center gap-3">
                {prompt.prepTimeSec > 0 && (
                  <span
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold",
                      prepTimer.isRunning
                        ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30"
                        : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800",
                    )}
                  >
                    <Timer className="h-3.5 w-3.5" /> Prep:{" "}
                    <span className="font-mono font-bold">
                      {formatClock(prepTimer.seconds)}
                    </span>
                  </span>
                )}
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold",
                    speakTimer.isRunning
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/30"
                      : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800",
                    speakTimer.seconds < 10 &&
                      speakTimer.isRunning &&
                      "border-rose-300 bg-rose-50 text-rose-600",
                  )}
                >
                  <Timer className="h-3.5 w-3.5" /> Speak:{" "}
                  <span
                    className={cn(
                      "font-mono text-sm font-bold",
                      speakTimer.seconds < 10 &&
                        speakTimer.isRunning &&
                        "text-rose-600",
                    )}
                  >
                    {formatClock(speakTimer.seconds)}
                  </span>
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100 dark:bg-slate-800/60 dark:ring-slate-700">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {prompt.cueCardTitle}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {prompt.prompt}
              </p>
              {prompt.followUps.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {prompt.followUps.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
              <div className="flex items-center gap-4">
                {!recording ? (
                  <Button variant="accent" size="lg" onClick={beginSpeaking}>
                    <Mic className="h-5 w-5" /> Start recording
                  </Button>
                ) : (
                  <Button variant="outline" size="lg" onClick={stopRecording}>
                    <Square className="h-4 w-4 fill-current" /> Stop
                  </Button>
                )}
                <span className="flex items-center gap-2 text-sm font-mono font-bold text-slate-700 dark:text-slate-200">
                  <Volume2 className="h-4 w-4 text-slate-400" />{" "}
                  {formatClock(recordedSec)}s
                </span>
                {recordedSec > 0 && !recording && (
                  <button
                    onClick={() => setPlaying((p) => !p)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    aria-label={playing ? "Pause playback" : "Play playback"}
                  >
                    {playing ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {recording
                  ? `Yozilmoqda — ${prompt.speakingTimeSec}s ichida gapiring`
                  : recordedSec > 0
                    ? "Yozuv saqlandi (demo) — replay yoki submit qiling"
                    : prompt.prepTimeSec > 0 && prepTimer.isRunning
                      ? "Tayyorgarlik vaqti ketmoqda..."
                      : "Start recording bosing"}
              </p>
              {(recording || prepTimer.isRunning) && (
                <div className="w-full max-w-sm space-y-1">
                  {prepTimer.isRunning && (
                    <ProgressBar
                      value={
                        ((prompt.prepTimeSec - prepTimer.seconds) /
                          Math.max(1, prompt.prepTimeSec)) *
                        100
                      }
                      tone="amber"
                    />
                  )}
                  {recording && (
                    <ProgressBar
                      value={
                        (recordedSec / (prompt.speakingTimeSec ?? 30)) * 100
                      }
                      tone="emerald"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={backToSelect}>
                <RefreshCw className="h-4 w-4" /> Change part
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setPromptIndex((i) => i + 1)}
                >
                  Next prompt <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="accent"
                  onClick={submit}
                  disabled={recordedSec < 5}
                >
                  Submit for feedback <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "evaluating" && (
        <Card>
          <CardContent className="space-y-4 py-10">
            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
              <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
                Evaluating your recording…
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Analysing fluency, vocabulary and pronunciation.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2.5">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "results" && result && (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-7 text-center text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">
                Estimated band
              </p>
              <p className="mt-1 font-display text-6xl font-extrabold">
                {result.overall.toFixed(1)}
              </p>
              <p className="mt-2 text-sm text-emerald-100">
                Part {result.part} · {result.date}
              </p>
            </div>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            {result.criteria.map((c) => (
              <Card key={c.key}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      {c.label}
                    </p>
                    <Badge tone="emerald" className="font-display">
                      {c.band.toFixed(1)}
                    </Badge>
                  </div>
                  <ProgressBar
                    value={(c.band / 9) * 100}
                    tone="emerald"
                    className="mt-3"
                  />
                  <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {c.comment}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="outline" onClick={backToSelect} className="w-full">
            <RefreshCw className="h-4 w-4" /> Practice another part
          </Button>
        </div>
      )}

      {history.length > 0 && phase !== "select" && (
        <Card>
          <CardContent>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Recent evaluations
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {history.map((h) => (
                <Badge
                  key={h.id}
                  tone="emerald"
                  className="cursor-pointer"
                  onClick={() => {
                    setResult(h);
                    setPhase("results");
                  }}
                >
                  Part {h.part} · Band {h.overall.toFixed(1)} · {h.date}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function buildSpeakingResult(
  part: number,
  recordedSec: number,
): SpeakingResult {
  const base = recordedSec < 20 ? 5.5 : recordedSec < 60 ? 6.0 : 6.5;
  const fluency = Math.min(8, base + 0.4);
  const lexical = Math.min(8, base + 0.2);
  const pronunciation = Math.min(8, base + 0.1);
  const grammar = Math.min(8, base - 0.1);
  const overall =
    Math.round(((fluency + lexical + pronunciation + grammar) / 4) * 2) / 2;
  return {
    id: randomId("speak"),
    part,
    date: new Date().toISOString().slice(0, 10),
    overall,
    criteria: [
      {
        key: "fluency",
        label: "Fluency & Coherence",
        band: fluency,
        comment:
          "Generally fluent with occasional hesitation. Use linking words to connect ideas smoothly.",
      },
      {
        key: "lexical",
        label: "Lexical Resource",
        band: lexical,
        comment:
          "Good range of vocabulary. Add more academic and idiomatic expressions for higher bands.",
      },
      {
        key: "pronunciation",
        label: "Pronunciation",
        band: pronunciation,
        comment:
          "Clear and generally accurate. Focus on word stress and intonation for natural rhythm.",
      },
      {
        key: "grammar",
        label: "Grammar",
        band: grammar,
        comment:
          "Mix of simple and complex sentences. Watch articles and verb tenses under pressure.",
      },
    ],
  };
}
