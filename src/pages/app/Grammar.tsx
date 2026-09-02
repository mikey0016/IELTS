import { useEffect, useState } from "react";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";
import { getGrammarTopics } from "@/api/content";
import type { GrammarTopic } from "@/data/content";
import { cn } from "@/lib/cn";

const LEVEL_TONE: Record<GrammarTopic["level"], "slate" | "brand" | "violet"> =
  {
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

  useEffect(() => {
    getGrammarTopics().then(setTopics);
  }, []);

  const complete = (topic: GrammarTopic) => {
    setCompleted((prev) =>
      prev.includes(topic.id) ? prev : [...prev, topic.id],
    );
    progress.addRecentLesson({
      id: `grammar_${topic.id}`,
      title: `Grammar — ${topic.title}`,
      skill: "grammar",
      meta: `${topic.minutes} min · level lesson`,
      progress: 100,
    });
    progress.recordMinutes(topic.minutes);
    toast("Grammar lesson completed — great work!", "success");
    setActive(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Grammar"
        title="Grammar lessons"
        description="Level-based lessons that fix the errors most likely to hold your band back."
        actions={<Badge tone="violet">8 topics · ~3h total</Badge>}
      />

      {!topics ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => {
            const done = completed.includes(topic.id);
            return (
              <Card
                key={topic.id}
                hover
                className={cn(
                  done && "border-emerald-200 dark:border-emerald-900",
                )}
              >
                <CardContent className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Badge tone={LEVEL_TONE[topic.level]}>{topic.level}</Badge>
                    {done && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-base font-bold text-slate-900 dark:text-white">
                    {topic.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {topic.summary}
                  </p>
                  <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs italic text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    {topic.example}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">
                      {topic.minutes} minutes
                    </span>
                    <Button
                      size="sm"
                      variant={done ? "outline" : "primary"}
                      onClick={() => setActive(topic)}
                    >
                      {done ? "Review" : "Start lesson"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.title}
        description={
          active ? `${active.level} · ${active.minutes} minutes` : undefined
        }
        size="lg"
      >
        {active && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-brand-50 p-5 ring-1 ring-brand-100 dark:bg-brand-950/50 dark:ring-brand-900">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Theory
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {active.summary}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Example
              </p>
              <p className="mt-2 text-sm italic text-slate-600 dark:text-slate-300">
                {active.example}
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center dark:border-slate-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Practice quiz
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                A 5-question quiz is included in the full lesson. Complete it to
                earn grammar XP.
              </p>
            </div>
            <Button className="w-full" onClick={() => complete(active)}>
              Complete lesson · mark as done{" "}
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
