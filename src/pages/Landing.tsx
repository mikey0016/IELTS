import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
  Check,
  ChevronDown,
  Sparkles,
  Star,
  Flame,
  TrendingUp,
  Zap,
  Clock,
  ShieldCheck,
  GraduationCap,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar, CircularProgress } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { useAuth } from "@/context/AuthContext";
import {
  TRUST_STATS,
  PLATFORM_STATS,
  FEATURES,
  SKILL_HIGHLIGHTS,
  STEPS,
  TESTIMONIALS,
  PRICING_PLANS,
  FAQS,
} from "@/data/landing";

export function Landing() {
  return (
    <div id="top">
      <Hero />
      <TrustBar />
      <SkillsSection />
      <HowItWorks />
      <FeaturesSection />
      <StatsSection />
      <Testimonials />
      <Pricing />
      <FaqSection />
      <FinalCta />
    </div>
  );
}

function Hero() {
  const { user } = useAuth();
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-violet-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-40 h-[420px] w-[420px] rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/10" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-24">
        <div className="animate-slide-up">
          <Badge tone="violet" className="mb-5">
            <Sparkles className="h-3.5 w-3.5" /> The modern way to prepare for
            IELTS
          </Badge>
          <h1 className="font-display text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
            Prepare Smarter.{" "}
            <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
              Achieve Your IELTS Goal.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
            Improve your Listening, Reading, Writing and Speaking skills with
            personalized IELTS preparation — structured lessons, mock exams and
            AI feedback in one premium platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={user ? "/app/practice" : "/signup"}>
              <Button size="lg">
                Start Free Practice <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={user ? "/app/mock-test" : "/login"}>
              <Button variant="outline" size="lg">
                <Play className="h-4 w-4 text-brand-600" /> Take a Free Test
              </Button>
            </Link>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
            {TRUST_STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white">
                  {s.value}
                </dd>
                <dd className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="border-y border-slate-200 bg-white/70 py-4 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-4 text-xs font-semibold uppercase tracking-widest text-slate-400 sm:px-6 lg:px-8">
        <span>Recognised by tutors</span>
        <span>Official-style rubrics</span>
        <span>100% online</span>
        <span>Band-tested content</span>
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden>
      <div className="animate-float rounded-3xl border border-white/40 bg-white/90 p-5 shadow-card-hover backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                IELTS Master
              </p>
              <p className="text-[11px] text-slate-400">Student dashboard</p>
            </div>
          </div>
          <Badge tone="emerald">
            <Flame className="h-3 w-3" /> 7-day streak
          </Badge>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Estimated band
            </p>
            <p className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">
              6.5
            </p>
            <ProgressBar value={72} tone="brand" className="mt-3" />
            <p className="mt-2 text-xs font-medium text-slate-400">
              to target 7.5
            </p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <CircularProgress
              value={68}
              size={88}
              stroke={9}
              label="68%"
              sublabel="Overall"
              tone="#7c3aed"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {[
            { label: "Listening", band: "7.2", color: "bg-violet-500" },
            { label: "Reading", band: "6.5", color: "bg-cyan-500" },
            { label: "Writing", band: "5.8", color: "bg-brand-500" },
            { label: "Speaking", band: "7.1", color: "bg-emerald-500" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className={cn("h-2.5 w-2.5 rounded-full", s.color)} />
              <span className="flex-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                {s.label}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {s.band}
              </span>
              <span className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <span
                  className={cn("block h-full rounded-full", s.color)}
                  style={{ width: `${parseFloat(s.band) * 10}%` }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-float absolute -left-4 -top-6 flex items-center gap-2 rounded-2xl border border-white/50 bg-white px-4 py-3 shadow-card-hover [animation-delay:1.2s] dark:border-slate-700 dark:bg-slate-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50">
          <TrendingUp className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">
            Band +1.5
          </p>
          <p className="text-[10px] text-slate-400">in 3 months</p>
        </div>
      </div>

      <div className="animate-float absolute -bottom-5 -right-2 flex items-center gap-2 rounded-2xl border border-white/50 bg-white px-4 py-3 shadow-card-hover [animation-delay:2s] dark:border-slate-700 dark:bg-slate-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/50">
          <Zap className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">
            AI feedback ready
          </p>
          <p className="text-[10px] text-slate-400">Writing evaluated</p>
        </div>
      </div>
    </div>
  );
}

function SkillsSection() {
  return (
    <section id="skills" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="IELTS Skills"
          title="Master all four sections"
          description="Structured lessons for every part of the IELTS exam, with your progress tracked automatically."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SKILL_HIGHLIGHTS.map((s) => (
            <Link key={s.id} to={`/app/${s.id}`} className="group block">
              <Card hover className="h-full">
                <CardContent className="flex h-full flex-col">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm transition-transform group-hover:scale-110",
                      s.color,
                    )}
                  >
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-white">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {s.description}
                  </p>
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">
                        {s.lessons} lessons
                      </span>
                      <span className="text-brand-600 dark:text-brand-400">
                        {s.progress}% complete
                      </span>
                    </div>
                    <ProgressBar
                      value={s.progress}
                      className="mt-2"
                      tone={
                        s.id === "reading"
                          ? "cyan"
                          : s.id === "writing"
                            ? "brand"
                            : s.id === "speaking"
                              ? "emerald"
                              : "violet"
                      }
                    />
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 transition-all group-hover:gap-2.5 dark:text-brand-400">
                    Practice Now <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 bg-gradient-to-b from-white to-slate-50 py-20 dark:from-slate-900 dark:to-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps to your target band"
          description="A guided path from your first test to exam day — no guesswork."
        />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              {i < STEPS.length - 1 && (
                <div className="absolute left-1/2 top-8 hidden h-px w-full border-t-2 border-dashed border-slate-200 md:block dark:border-slate-700" />
              )}
              <div className="relative flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-card ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                  <step.icon className="h-7 w-7 text-brand-600 dark:text-brand-400" />
                </div>
                <Badge tone="slate" className="mt-5">
                  {step.tag}
                </Badge>
                <h3 className="mt-3 font-display text-lg font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Everything included"
          title="Features that move your band"
          description="Eight powerful tools working together — the way a serious prep platform should."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.id}
              id={f.id}
              className="card-target group rounded-2xl scroll-mt-24 border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-700"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-transform group-hover:scale-110 dark:bg-violet-900/50 dark:text-violet-300">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-sm font-bold text-slate-900 dark:text-white">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section id="statistics" className="scroll-mt-24 bg-brand-950 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur sm:grid-cols-2 lg:grid-cols-4 lg:p-14">
          {PLATFORM_STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-4xl font-extrabold text-white">
                {s.value}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-slate-300">
                {s.label}
              </p>
              <p className="text-xs text-slate-400">{s.suffix}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Student results"
          title="Real students. Real band gains."
          description="Thousands of learners reached their target score with IELTS Master."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.id} hover>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Quote className="h-6 w-6 text-violet-200 dark:text-violet-900" />
                  <Badge tone="emerald" className="font-display text-sm">
                    Band {t.score}
                  </Badge>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  "{t.body}"
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Avatar name={t.name} color={t.avatarColor} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {t.name}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {t.program}
                    </p>
                  </div>
                  <span className="ml-auto flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const { user } = useAuth();
  return (
    <section
      id="pricing"
      className="scroll-mt-24 bg-gradient-to-b from-slate-50 to-white py-20 dark:from-slate-900 dark:to-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Start free. Upgrade when you're ready."
          description="Simple, transparent pricing with no hidden fees. Cancel anytime."
        />
        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-3xl border p-7 transition-all duration-300",
                plan.highlighted
                  ? "border-violet-500 bg-gradient-to-b from-violet-600 to-brand-800 text-white shadow-card-hover lg:-translate-y-3 lg:scale-[1.02]"
                  : "border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900",
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-4 py-1 text-xs font-bold text-white shadow-sm">
                  <Sparkles className="mr-1 inline h-3 w-3" /> {plan.badge}
                </span>
              )}
              <h3
                className={cn(
                  "font-display text-lg font-bold",
                  plan.highlighted
                    ? "text-white"
                    : "text-slate-900 dark:text-white",
                )}
              >
                {plan.name}
              </h3>
              <p
                className={cn(
                  "mt-1 text-sm",
                  plan.highlighted ? "text-violet-100" : "text-slate-400",
                )}
              >
                {plan.tagline}
              </p>
              <div className="mt-5 flex items-baseline gap-1">
                <span
                  className={cn(
                    "font-display text-4xl font-extrabold",
                    plan.highlighted
                      ? "text-white"
                      : "text-slate-900 dark:text-white",
                  )}
                >
                  {plan.price}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    plan.highlighted ? "text-violet-100" : "text-slate-400",
                  )}
                >
                  {plan.period}
                </span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        plan.highlighted ? "text-cyan-300" : "text-emerald-500",
                      )}
                    />
                    <span
                      className={
                        plan.highlighted
                          ? "font-medium text-violet-50"
                          : "font-medium text-slate-600 dark:text-slate-300"
                      }
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to={user ? "/app/settings" : "/signup"} className="mt-7">
                <Button
                  variant={plan.highlighted ? "white" : "primary"}
                  className={cn("w-full")}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Everything you need to know before you start."
        />
        <div className="mt-10 space-y-3">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-sm font-bold text-slate-900 dark:text-white">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

function FinalCta() {
  return (
    <section className="pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-900 to-slate-950 px-8 py-16 text-center lg:px-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white">
            <ShieldCheck className="h-3.5 w-3.5" /> No credit card required
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Your target band is one practice session away.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Join 50,000+ students. Start free today and see your estimated band
            rise within the first month.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup">
              <Button variant="white" size="lg">
                Start Learning for Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10"
              >
                I already have an account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}
