import { useEffect, useState } from "react";
import { CheckCircle2, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";
import { getGrammarTopics } from "@/api/content";
import type { GrammarTopic } from "@/data/content";
import { cn } from "@/lib/cn";

const LEVEL_TONE: Record<GrammarTopic["level"], "slate" | "brand" | "violet"> = {
  "Intermediate (Band 5–6)": "slate",
  "Upper-Intermediate (Band 6.5-7)": "brand",
  "Advanced (Band 7.5+)": "violet",
};

export function Grammar() {
  const [topics, setTopics] = useState<GrammarTopic[] | null>(null);
  const [active, setActive] = useState<GrammarTopic | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const { toast } = useToast();
  const progress = useProgress();

  useEffect(() => { getGrammarTopics().then(setTopics); }, []);

  const complete = (topic: GrammarTopic) => {
    setCompleted((prev) => prev.includes(topic.id) ? prev : [...prev, topic.id]);
    progress.addRecentLesson({ id: `grammar_${topic.id}`, title: `Grammar — ${topic.title}`, skill: "grammar", meta: `${topic.minutes} min`, progress: 100 });
    progress.recordMinutes(topic.minutes);
    toast("Grammar lesson completed!", "success");
    setActive(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-[24px] bg-slate-900 p-7 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-brand-600 to-indigo-600 opacity-90" />
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur"><BookOpen className="h-3.5 w-3.5" /> Grammar — DB live</p>
          <h1 className="mt-3 font-display text-2xl font-black">Grammar lessons</h1>
          <p className="mt-1.5 max-w-xl text-sm text-white/80">Level-based lessons that fix band-limiting errors — barchasi PostgreSQL dan jonli.</p>
        </div>
      </div>

      {!topics ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0,1,2,3,4,5].map((i)=><Skeleton key={i} className="h-48 rounded-[20px]" />)}</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => {
            const done = completed.includes(topic.id);
            return (
              <Card key={topic.id} hover glass className={cn("overflow-hidden", done && "ring-1 ring-emerald-500/20")}>
                <CardContent className="flex h-full flex-col p-6">
                  <div className="flex items-start justify-between gap-2">
                    <Badge tone={LEVEL_TONE[topic.level]}>{topic.level}</Badge>
                    {done ? <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow"><CheckCircle2 className="h-4 w-4" /></span> : <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10"><Sparkles className="h-3.5 w-3.5 text-slate-400" /></span>}
                  </div>
                  <h3 className="mt-4 font-display text-[17px] font-bold tracking-tight dark:text-white">{topic.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-white/60">{topic.summary}</p>
                  <div className="mt-4 rounded-2xl bg-slate-50 px-3.5 py-3 text-xs italic leading-relaxed dark:bg-white/[0.06] dark:text-white/70">“{topic.example}”</div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">{topic.minutes} min · DB</span>
                    <Button size="sm" variant={done ? "outline" : "primary"} className="rounded-xl" onClick={() => setActive(topic)}>{done ? "Review" : "Start"} <ArrowRight className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={Boolean(active)} onClose={() => setActive(null)} title={active?.title} description={active ? `${active.level} · ${active.minutes} min · DB` : undefined} size="lg">
        {active && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-brand-600 p-6 text-white shadow-lg">
              <p className="text-sm font-bold">Theory — DB dan</p>
              <p className="mt-2 text-sm leading-relaxed text-white/90">{active.summary}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-sm font-bold dark:text-white">Example</p>
              <p className="mt-2 text-sm italic dark:text-white/70">{active.example}</p>
            </div>
            <Button className="w-full rounded-2xl" onClick={() => complete(active)}>Complete lesson <CheckCircle2 className="h-4 w-4" /></Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
