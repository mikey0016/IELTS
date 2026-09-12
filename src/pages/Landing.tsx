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
  ShieldCheck,
  GraduationCap,
  Quote,
  ArrowUpRight,
  Layers,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar, CircularProgress } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { useAuth } from "@/context/AuthContext";
import { useBackground } from "@/hooks/useBackground";
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
    <div id="top" className="overflow-hidden">
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
      {/* aurora bg */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-0 h-[560px] w-[560px] rounded-full bg-gradient-to-br from-brand-600/15 via-violet-500/10 to-cyan-400/10 blur-[80px]" />
        <div className="absolute -left-32 top-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-violet-500/10 to-brand-500/10 blur-[80px]" />
        <div className="absolute bottom-0 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500/5 via-brand-500/5 to-violet-500/5 blur-[60px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black_70%,transparent_110%)]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-20 lg:pb-24">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1.5 text-xs font-bold tracking-tight text-violet-700 shadow-sm dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white"><Sparkles className="h-3 w-3" /></span>
            The modern way to prepare for IELTS
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-violet-700 shadow-sm dark:bg-white dark:text-violet-700">New 2026</span>
          </div>

          <h1 className="mt-6 font-display text-balance text-[34px] font-black leading-[0.95] tracking-[-0.03em] text-[#0a0a0f] sm:text-5xl lg:text-[58px] dark:text-white">
            Prepare <span className="relative">Smarter.
              <span className="absolute bottom-1 left-0 h-2 w-full bg-gradient-to-r from-brand-600/20 to-violet-600/20 -z-10" />
            </span>{" "}
            <span className="bg-gradient-to-r from-brand-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent dark:from-brand-400 dark:via-violet-400 dark:to-cyan-400">
              Achieve Your IELTS Goal.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-slate-600 dark:text-slate-300">
            Improve Listening, Reading, Writing and Speaking with personalized IELTS preparation — structured lessons, mock exams and AI feedback in one premium platform.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={user ? "/app" : "/signup"}>
              <Button size="lg" className="group">
                Start Free Practice <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link to={user ? "/app/mock-test" : "/login"}>
              <Button variant="outline" size="lg" className="gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0a0a0f] text-white dark:bg-white dark:text-[#0a0a0f]"><Play className="h-3 w-3 fill-current" /></span> Take a Free Test
              </Button>
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> No credit card</span>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {TRUST_STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="font-display text-xl font-black tracking-tight text-[#0a0a0f] dark:text-white">{s.value}</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/50">{s.label}</p>
              </div>
            ))}
            <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-[#0a0a0f] px-4 py-3 text-white dark:bg-white dark:text-[#0a0a0f]">
              <div className="flex -space-x-2">
                {[1,2,3].map(i=> <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" className="h-7 w-7 rounded-full border-2 border-[#0a0a0f] dark:border-white object-cover" />)}
              </div>
              <div className="text-xs leading-tight"><p className="font-bold">Trusted by 50k+</p><p className="opacity-70 flex items-center gap-0.5">5.0 <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> rating</p></div>
            </div>
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="border-y border-slate-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 text-xs sm:px-6 lg:px-8">
        <span className="flex items-center gap-2 font-bold uppercase tracking-widest text-slate-400"><Layers className="h-3.5 w-3.5" /> As featured in</span>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-semibold tracking-tight text-slate-700 dark:text-white/60">
          <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-white/10">Recognised by tutors</span>
          <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-white/10">Official rubrics</span>
          <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-white/10">100% online</span>
          <span className="rounded-full bg-[#0a0a0f] px-3 py-1 text-white dark:bg-white dark:text-[#0a0a0f]">Band-tested content</span>
        </div>
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden>
      <div className="absolute -inset-4 -z-10 rounded-[32px] bg-gradient-to-br from-brand-600/10 via-violet-600/10 to-cyan-500/10 blur-2xl" />
      <div className="animate-float rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-[0_16px_48px_rgb(10_10_15/0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#12121a]/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0a0a0f] text-white shadow dark:bg-white dark:text-[#0a0a0f]">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black tracking-tight text-[#0a0a0f] dark:text-white">IELTS Master</p>
              <p className="text-[11px] font-medium text-slate-500">Student dashboard • Live</p>
            </div>
          </div>
          <Badge tone="emerald" className="rounded-full"><Flame className="h-3 w-3" /> 7-day streak</Badge>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.06] border border-slate-100 dark:border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estimated band</p>
            <p className="font-display text-3xl font-black tracking-tight text-[#0a0a0f] dark:text-white">6.5</p>
            <ProgressBar value={72} tone="brand" className="mt-3" />
            <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-slate-500"><TrendingUp className="h-3 w-3 text-emerald-500" /> to target 7.5</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-[#0a0a0f] p-4 text-white dark:bg-white dark:text-[#0a0a0f]">
            <CircularProgress value={68} size={92} stroke={9} label="68%" sublabel="Overall" tone="#8b5cf6" track="#2a2a33" />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {[
            { label: "Listening", band: "7.2", color: "bg-violet-500" },
            { label: "Reading", band: "6.5", color: "bg-cyan-500" },
            { label: "Writing", band: "5.8", color: "bg-brand-500" },
            { label: "Speaking", band: "7.1", color: "bg-emerald-500" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-full bg-slate-50 px-3 py-2 dark:bg-white/[0.04] border border-transparent dark:border-white/5">
              <span className={cn("h-2.5 w-2.5 rounded-full", s.color)} />
              <span className="flex-1 text-sm font-bold text-slate-700 dark:text-white/80">{s.label}</span>
              <span className="text-sm font-black text-[#0a0a0f] dark:text-white">{s.band}</span>
              <span className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <span className={cn("block h-full rounded-full", s.color)} style={{ width: `${parseFloat(s.band) * 10}%` }} />
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-50 to-cyan-50 px-4 py-3 border border-emerald-100 dark:from-emerald-500/10 dark:to-cyan-500/10 dark:border-emerald-500/10">
          <span className="text-xs font-bold text-slate-700 dark:text-white">Weekly activity</span>
          <span className="text-xs font-black text-emerald-600">+12% this week</span>
        </div>
      </div>

      <div className="animate-float absolute -left-6 -top-6 flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl [animation-delay:1s] dark:border-white/10 dark:bg-[#1a1a23]">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow"><TrendingUp className="h-4 w-4" /></span>
        <div>
          <p className="text-xs font-black text-[#0a0a0f] dark:text-white">Band +1.5</p>
          <p className="text-[11px] font-medium text-slate-500">in 3 months</p>
        </div>
      </div>

      <div className="animate-float absolute -bottom-6 -right-4 flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl [animation-delay:2s] dark:border-white/10 dark:bg-[#1a1a23]">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white shadow"><Zap className="h-4 w-4" /></span>
        <div>
          <p className="text-xs font-black text-[#0a0a0f] dark:text-white">AI feedback ready</p>
          <p className="text-[11px] font-medium text-slate-500">Writing evaluated</p>
        </div>
      </div>
    </div>
  );
}

function SkillsSection() {
  return (
    <section id="skills" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"><Layers className="h-3 w-3" /> IELTS Skills</p>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-[#0a0a0f] sm:text-4xl dark:text-white">Master all four sections</h2>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">Structured lessons for every part of the exam, with progress tracked automatically.</p>
          </div>
          <Link to="/signup" className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white">View all skills <ArrowUpRight className="h-4 w-4" /></Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SKILL_HIGHLIGHTS.map((s) => (
            <Link key={s.id} to={`/app/${s.id}`} className="group block">
              <Card hover className="h-full p-1">
                <CardContent className="flex h-full flex-col rounded-[18px] bg-gradient-to-b from-white to-slate-50/50 p-5 dark:from-white/[0.06] dark:to-transparent">
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-2", s.color)}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-[17px] font-black tracking-tight text-[#0a0a0f] dark:text-white">{s.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.description}</p>
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600 dark:bg-white/10 dark:text-white/70">{s.lessons} lessons</span>
                      <span className="text-violet-600 dark:text-violet-300">{s.progress}%</span>
                    </div>
                    <ProgressBar value={s.progress} className="mt-2.5" tone={s.id === "reading" ? "cyan" : s.id === "writing" ? "brand" : s.id === "speaking" ? "emerald" : "violet"} />
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-black text-[#0a0a0f] dark:text-white">Practice Now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
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
  const bg = useBackground();
  return (
    <section id="how-it-works" className={`scroll-mt-24 py-20 ${bg.url ? "bg-white/40 backdrop-blur dark:bg-[#0a0a0f]/40" : "bg-[#0a0a0f] text-white dark:bg-[#0a0a0f]"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white border border-white/10">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">Three steps to your target band</h2>
          <p className="mt-3 text-white/70">A guided path from your first test to exam day — no guesswork.</p>
        </div>
        <div className="relative mt-12 grid gap-8 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent md:block" />
          {STEPS.map((step) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#0a0a0f] shadow-xl ring-1 ring-white/20">
                <step.icon className="h-7 w-7" />
              </div>
              <Badge tone="white" className="mt-5 rounded-full bg-white/10 text-white border-white/20 backdrop-blur">{step.tag}</Badge>
              <h3 className="mt-3 font-display text-lg font-black">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/70">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-24 py-20 bg-[#fcfcfd] dark:bg-[#070711]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Everything included" title="Features that move your band" description="Eight powerful tools working together — the way a serious prep platform should." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.id} id={f.id} className="group relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(10_10_15/0.08)] hover:border-slate-300 dark:border-white/10 dark:bg-[#12121a] dark:hover:border-white/15">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/[0.03] via-transparent to-violet-500/[0.03] opacity-0 group-hover:opacity-100 transition" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a0a0f] text-white dark:bg-white dark:text-[#0a0a0f] group-hover:scale-110 transition">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="relative mt-4 font-display text-sm font-black tracking-tight text-[#0a0a0f] dark:text-white">{f.title}</h3>
              <p className="relative mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section id="statistics" className="scroll-mt-24 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0a0a0f] p-8 lg:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-violet-600/20 to-cyan-500/10" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
          <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORM_STATS.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur">
                <p className="font-display text-3xl font-black tracking-tight text-white">{s.value}</p>
                <p className="mt-1 text-sm font-bold text-white">{s.label}</p>
                <p className="text-xs text-white/60">{s.suffix}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Student results" title="Real students. Real band gains." description="Thousands reached their target score with IELTS Master." />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.id} hover className="p-1">
              <CardContent className="rounded-[18px] bg-white p-5 dark:bg-[#12121a]">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10"><Quote className="h-4 w-4 text-slate-600 dark:text-white/60" /></div>
                  <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-black text-white">Band {t.score}</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">“{t.body}”</p>
                <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-white/10">
                  <Avatar name={t.name} color={t.avatarColor} />
                  <div className="min-w-0"><p className="truncate text-sm font-black text-[#0a0a0f] dark:text-white">{t.name}</p><p className="truncate text-xs font-medium text-slate-500">{t.program}</p></div>
                  <span className="ml-auto flex items-center gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</span>
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
  const bg = useBackground();
  return (
    <section id="pricing" className={`scroll-mt-24 py-20 ${bg.url ? "bg-white/40 backdrop-blur dark:bg-[#0a0a0f]/40" : "bg-slate-50 dark:bg-[#0a0a0f]"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Pricing" title="Start free. Upgrade when you're ready." description="Simple, transparent pricing — cancel anytime." />
        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <div key={plan.id} className={cn("relative flex flex-col rounded-[28px] border p-7 transition-all duration-300", plan.highlighted ? "border-violet-500 bg-[#0a0a0f] text-white shadow-[0_24px_48px_rgb(10_10_15/0.25)] lg:-translate-y-2 lg:scale-[1.02]" : "border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#12121a]")}>
              {plan.highlighted && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-brand-600 px-4 py-1.5 text-xs font-black text-white shadow-lg inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> {plan.badge}</span>}
              <h3 className={cn("font-display text-lg font-black", plan.highlighted ? "text-white" : "text-[#0a0a0f] dark:text-white")}>{plan.name}</h3>
              <p className={cn("mt-1 text-sm", plan.highlighted ? "text-white/60" : "text-slate-500")}>{plan.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1"><span className={cn("font-display text-4xl font-black", plan.highlighted ? "text-white" : "text-[#0a0a0f] dark:text-white")}>{plan.price}</span><span className={cn("text-sm font-semibold", plan.highlighted ? "text-white/60" : "text-slate-400")}>{plan.period}</span></div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className={cn("mt-0.5 flex h-5 w-5 items-center justify-center rounded-full", plan.highlighted ? "bg-white/15 text-white" : "bg-emerald-500 text-white")}><Check className="h-3 w-3" /></span>
                    <span className={plan.highlighted ? "font-medium text-white/90" : "font-medium text-slate-700 dark:text-slate-300"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to={user ? "/app/settings" : "/signup"} className="mt-7"><Button variant={plan.highlighted ? "white" : "primary"} className="w-full rounded-full">{plan.cta}</Button></Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 py-20 bg-white dark:bg-[#070711]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" description="Everything you need to know before you start." />
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
    <div className={cn("overflow-hidden rounded-2xl border bg-white transition-all dark:bg-[#12121a]", open ? "border-brand-200 shadow-md dark:border-violet-500/30" : "border-slate-200 dark:border-white/10")}>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-display text-sm font-bold text-[#0a0a0f] dark:text-white">{question}</span>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border transition", open ? "bg-[#0a0a0f] text-white border-[#0a0a0f] dark:bg-white dark:text-[#0a0a0f]" : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/10 dark:text-white/60 dark:border-white/10")}><ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} /></span>
      </button>
      <div className={cn("grid transition-all duration-200", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}><div className="overflow-hidden"><p className="px-5 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{answer}</p></div></div>
    </div>
  );
}

function FinalCta() {
  return (
    <section className="pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-[#0a0a0f] px-8 py-14 text-center lg:px-16 lg:py-16">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/30 via-violet-600/20 to-cyan-500/20" />
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white border border-white/10 backdrop-blur"><ShieldCheck className="h-3.5 w-3.5" /> No credit card required • Cancel anytime</span>
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">Your target band is one session away.</h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] text-white/70">Join 50,000+ students. Start free today and see your estimated band rise within the first month.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/signup"><Button variant="white" size="lg" className="rounded-full">Start Learning for Free <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/login"><Button variant="ghost" size="lg" className="rounded-full text-white hover:bg-white/10 border border-white/20">I already have an account</Button></Link>
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-white/50"><Timer className="h-3.5 w-3.5" /> Setup in 30 seconds • Start practicing immediately</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:bg-white/10 dark:text-white/70">{eyebrow}</p>
      <h2 className="mt-3 font-display text-balance text-3xl font-black tracking-tight text-[#0a0a0f] sm:text-4xl dark:text-white">{title}</h2>
      {description && <p className="mt-3 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
  );
}
