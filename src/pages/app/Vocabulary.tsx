import { useEffect, useMemo, useState } from "react";
import {
  Volume2,
  Heart,
  Check,
  CalendarClock,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tabs } from "@/components/ui/Tabs";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";
import { getDeck, getWordOfDay } from "@/api/vocabulary";
import type { VocabularyWord } from "@/types";
import { cn } from "@/lib/cn";

const DIFF_TONE: Record<
  "easy" | "medium" | "hard",
  "emerald" | "brand" | "rose"
> = {
  easy: "emerald",
  medium: "brand",
  hard: "rose",
};

export function Vocabulary() {
  const progress = useProgress();
  const { toast } = useToast();
  const [deck, setDeck] = useState<VocabularyWord[] | null>(null);
  const [wordOfDay, setWordOfDay] = useState<VocabularyWord | null>(null);
  const [mode, setMode] = useState<"daily" | "review" | "favorites">("daily");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    getDeck().then(setDeck);
    getWordOfDay().then(setWordOfDay);
  }, []);

  const reviewWords = useMemo(() => {
    if (!deck) return [];
    const now = Date.now();
    const due = Object.entries(progress.reviews)
      .filter(([, r]) => r.due <= now)
      .map(([id]) => id);
    const pool = new Set<string>([...due, ...progress.vocabLearnedIds]);
    return deck.filter((w) => pool.has(w.id));
  }, [deck, progress.reviews, progress.vocabLearnedIds]);

  const favoriteWords = useMemo(
    () => (deck ?? []).filter((w) => progress.favoriteWordIds.includes(w.id)),
    [deck, progress.favoriteWordIds],
  );

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [mode, deck]);

  const [browseQuery, setBrowseQuery] = useState("");
  const [browseTopic, setBrowseTopic] = useState<string>("all");
  const [browseDiff, setBrowseDiff] = useState<string>("all");
  const [browsePage, setBrowsePage] = useState(0);
  const pageSize = 20;

  const dailyPack = useMemo(() => {
    if (!deck) return [];
    const start = new Date().getDate() % deck.length;
    return Array.from(
      { length: 10 },
      (_, i) => deck[(start + i) % deck.length],
    );
  }, [deck]);

  const activeWords =
    mode === "daily"
      ? dailyPack
      : mode === "review"
        ? reviewWords
        : favoriteWords;
  const current = activeWords[index];
  const learnedCount = progress.vocabLearnedIds.length;

  const browseFiltered = useMemo(() => {
    if (!deck) return [];
    let list = deck;
    if (browseTopic !== "all")
      list = list.filter((w) => w.topic === browseTopic);
    if (browseDiff !== "all")
      list = list.filter((w) => w.difficulty === browseDiff);
    if (browseQuery.trim()) {
      const q = browseQuery.toLowerCase();
      list = list.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.meaning.toLowerCase().includes(q) ||
          w.topic?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [deck, browseTopic, browseDiff, browseQuery]);
  const browseTotalPages = Math.max(
    1,
    Math.ceil(browseFiltered.length / pageSize),
  );
  const browsePageItems = useMemo(
    () =>
      browseFiltered.slice(browsePage * pageSize, (browsePage + 1) * pageSize),
    [browseFiltered, browsePage],
  );

  const speak = (word: string) => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = "en-GB";
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    } catch {
      toast("Speech synthesis is not available in this browser", "error");
    }
  };

  const rate = (r: "again" | "hard" | "good" | "easy") => {
    if (!current) return;
    progress.rateWord(current.id, r);
    toast(
      r === "again"
        ? "Moved back to review — no problem!"
        : `Marked "${r}" — next review scheduled`,
      r === "again" ? "info" : "success",
    );
    setFlipped(false);
    setIndex((i) => (i + 1) % Math.max(1, activeWords.length));
  };

  const nextCard = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % Math.max(1, activeWords.length));
  };
  const prevCard = () => {
    setFlipped(false);
    setIndex(
      (i) => (i - 1 + activeWords.length) % Math.max(1, activeWords.length),
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-[24px] bg-slate-900 p-7 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-brand-600 opacity-90" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur">📚 Vocabulary — DB live</p>
            <h1 className="mt-3 font-display text-2xl font-black">Vocabulary builder</h1>
            <p className="mt-1.5 text-sm text-white/80">640+ IELTS academic words (Band 6-8) — Daily flashcards + spaced repetition, barchasi PostgreSQL dan jonli.</p>
          </div>
          <Badge tone="white" className="shadow"><Check className="h-3 w-3" /> {learnedCount} / {deck?.length ?? 640} learned</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent>
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
              Word of the day
            </h3>
            {wordOfDay ? (
              <div className="mt-3 rounded-2xl bg-gradient-to-br from-violet-600 to-brand-700 p-5 text-white">
                <p className="font-display text-2xl font-extrabold">
                  {wordOfDay.word}
                </p>
                <p className="text-sm text-violet-200">
                  {wordOfDay.phonetic} · {wordOfDay.partOfSpeech}
                </p>
                <p className="mt-3 text-sm text-violet-50">
                  "{wordOfDay.meaning}"
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => speak(wordOfDay.word)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 transition hover:bg-white/25"
                    aria-label="Pronounce word of the day"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-violet-200">
                    Tap to hear pronunciation
                  </span>
                </div>
              </div>
            ) : (
              <Skeleton className="mt-3 h-40" />
            )}
            <p className="mt-3 text-xs text-slate-400">
              A new word every day from the examiners' most frequent list.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Tabs
                tabs={[
                  { id: "daily", label: "Daily" },
                  { id: "review", label: `Review (${reviewWords.length})` },
                  {
                    id: "favorites",
                    label: `Favorites (${favoriteWords.length})`,
                  },
                ]}
                active={mode}
                onChange={(id) => setMode(id as typeof mode)}
              />
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400">
                  {index + 1} / {activeWords.length}
                </span>
                <ProgressBar
                  value={((index + 1) / Math.max(1, activeWords.length)) * 100}
                  className="w-28"
                />
              </div>
            </div>

            {activeWords.length === 0 ? (
              <EmptyState
                icon={<CalendarClock className="h-7 w-7" />}
                title={
                  mode === "review"
                    ? "Nothing to review right now"
                    : "No favorites yet"
                }
                description={
                  mode === "review"
                    ? "Complete a few flashcards and they will appear here when due."
                    : "Tap the heart on any flashcard to save it here."
                }
              />
            ) : current ? (
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <button
                  onClick={() => setFlipped((f) => !f)}
                  className={cn(
                    "relative min-h-[280px] w-full rounded-3xl border p-6 text-left transition-all duration-300",
                    flipped
                      ? "border-brand-300 bg-brand-50 shadow-card-hover dark:border-brand-700 dark:bg-brand-950/40"
                      : "border-slate-200 bg-white shadow-card hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900",
                  )}
                  aria-label="Flip flashcard"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-full">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                          {flipped ? "Definition" : "Word"}
                        </span>
                      </div>
                      {flipped ? (
                        <div className="mt-6">
                          <p className="text-lg font-bold leading-snug text-slate-800 dark:text-slate-100">
                            {current.meaning}
                          </p>
                          <p className="mt-4 rounded-2xl bg-white p-4 text-sm italic leading-relaxed text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                            "{current.example}"
                          </p>
                          <div className="mt-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              Synonyms
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {current.synonyms.map((s) => (
                                <Badge key={s} tone="slate">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-6">
                          <p className="font-display text-4xl font-extrabold text-slate-900 dark:text-white">
                            {current.word}
                          </p>
                          <p className="mt-2 text-sm text-slate-400">
                            {current.phonetic} · {current.partOfSpeech}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">
                            Tap to reveal meaning, example & synonyms
                          </p>
                          <div className="mt-8 flex items-center gap-2">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                              <Volume2 className="h-5 w-5" />
                            </span>
                            <span className="text-xs font-medium text-slate-400">
                              Pronunciation
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Badge tone={DIFF_TONE[current.difficulty]}>
                      {current.difficulty}
                    </Badge>
                  </div>
                </button>

                <div className="flex flex-col justify-between gap-4">
                  <div className="space-y-2.5">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => speak(current.word)}
                    >
                      <Volume2 className="h-4 w-4" /> Pronounce "{current.word}"
                    </Button>
                    <div className="grid grid-cols-2 gap-2.5">
                      <Button
                        variant="outline"
                        className={cn(
                          progress.favoriteWordIds.includes(current.id) &&
                            "border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950/40",
                        )}
                        onClick={() => {
                          progress.markWordFavorite(current.id);
                          toast("Added to favorites ❤️");
                        }}
                      >
                        <Heart className="h-4 w-4" /> Favorite
                      </Button>
                      <Button
                        variant="outline"
                        className={cn(
                          progress.vocabLearnedIds.includes(current.id) &&
                            "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40",
                        )}
                        onClick={() => {
                          progress.markWordLearned(current.id);
                          toast("Marked as learned 📚", "success");
                        }}
                      >
                        <Check className="h-4 w-4" /> Learned
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                    <p className="text-center text-xs font-bold uppercase tracking-wide text-slate-400">
                      How well did you know it?
                    </p>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {(["again", "hard", "good", "easy"] as const).map((r) => (
                        <Button
                          key={r}
                          size="sm"
                          variant="secondary"
                          className="capitalize"
                          onClick={() => rate(r)}
                        >
                          {r}
                        </Button>
                      ))}
                    </div>
                    <p className="mt-2.5 text-center text-[11px] text-slate-400">
                      Spaced repetition schedules your next review
                      automatically.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevCard}
                      disabled={activeWords.length <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <Button variant="ghost" size="sm" onClick={nextCard}>
                      Skip <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50">
              <Star className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                Mastered words
              </p>
              <p className="text-xs text-slate-400">
                {learnedCount} of {deck?.length ?? 640} in your active deck —
                640+ IELTS words
              </p>
            </div>
          </div>
          <div className="w-full max-w-xs">
            <ProgressBar
              value={(learnedCount / (deck?.length ?? 640)) * 100}
              tone="amber"
            />
          </div>
        </CardContent>
      </Card>

      {/* Browse all 640+ words */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold">
                Browse all vocabulary — {deck?.length ?? 640} words
              </h3>
              <p className="text-xs text-slate-500">
                Qidiruv, topic va difficulty bo'yicha filtr — sahifalash bilan
              </p>
            </div>
            <Badge tone="slate">{browseFiltered.length} natija</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              value={browseQuery}
              onChange={(e) => {
                setBrowseQuery(e.target.value);
                setBrowsePage(0);
              }}
              placeholder="Qidirish: word yoki meaning"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <select
              value={browseTopic}
              onChange={(e) => {
                setBrowseTopic(e.target.value);
                setBrowsePage(0);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="all">All topics</option>
              {Array.from(
                new Set((deck ?? []).map((w) => w.topic).filter(Boolean)),
              )
                .sort()
                .map((t) => (
                  <option key={t} value={t as string}>
                    {t}
                  </option>
                ))}
            </select>
            <select
              value={browseDiff}
              onChange={(e) => {
                setBrowseDiff(e.target.value);
                setBrowsePage(0);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="all">All difficulty</option>
              <option value="easy">Easy (Band 6)</option>
              <option value="medium">Medium (Band 7)</option>
              <option value="hard">Hard (Band 8)</option>
            </select>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {browsePageItems.map((w) => (
              <div
                key={w.id}
                className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-extrabold">{w.word}</p>
                    <p className="text-xs text-slate-400">
                      {w.phonetic} · {w.partOfSpeech} · {w.topic}
                    </p>
                  </div>
                  <Badge tone={DIFF_TONE[w.difficulty]}>{w.difficulty}</Badge>
                </div>
                <p className="mt-2 text-xs leading-snug text-slate-600 dark:text-slate-300">
                  {w.meaning}
                </p>
                <p className="mt-2 text-xs italic text-slate-500">
                  "{w.example}"
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {w.synonyms.slice(0, 2).map((s) => (
                    <Badge key={s} tone="slate">
                      {s}
                    </Badge>
                  ))}
                </div>
                <div className="mt-2 flex gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      progress.markWordFavorite(w.id);
                      toast("Favorite ❤️");
                    }}
                  >
                    <Heart className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      progress.markWordLearned(w.id);
                      toast("Learned 📚", "success");
                    }}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      try {
                        const u = new SpeechSynthesisUtterance(w.word);
                        u.lang = "en-GB";
                        speechSynthesis.speak(u);
                      } catch {}
                    }}
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={browsePage === 0}
              onClick={() => setBrowsePage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Oldingi
            </Button>
            <span className="text-xs font-bold text-slate-500">
              {browsePage + 1} / {browseTotalPages} · {browseFiltered.length}{" "}
              so'z
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={browsePage + 1 >= browseTotalPages}
              onClick={() =>
                setBrowsePage((p) => Math.min(browseTotalPages - 1, p + 1))
              }
            >
              Keyingi <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Tip: exams reward range — aim for 3 new synonyms in Writing Task 2 every
        session. 640 so'z — har kuni 10 ta yangi so'z o'rganing, 2 oyda
        tugatasiz!
      </p>
    </div>
  );
}
