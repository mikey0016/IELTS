import { Outlet } from "react-router-dom";
import { GraduationCap, Target, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useBackground } from "@/hooks/useBackground";

const PERKS = [
  { icon: Target, text: "Personalized study plans for every target band" },
  { icon: Sparkles, text: "AI-powered feedback on every essay and recording" },
  { icon: ShieldCheck, text: "Exam-real mock tests scored with official rubrics" },
];

export function AuthLayout() {
  const bg = useBackground();
  return (
    <div className={`grid min-h-screen lg:grid-cols-[1.1fr_0.9fr] ${bg.url ? "bg-transparent" : ""}`}>
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12" style={{ background: "linear-gradient(145deg, #070711 0%, #1e1b4b 45%, #312e81 75%, #4f46e5 100%)" }}>
        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-violet-500/20 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-[600px] w-[600px] rounded-full bg-cyan-500/15 blur-[80px]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 border border-white/10 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white/90">Trusted by 50k+ learners</span>
          </div>
          <div className="mt-8 rounded-2xl bg-white p-4 inline-flex">
            <Logo onClick={() => (window.location.href = "/")} />
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="max-w-md font-display text-[36px] font-black leading-[0.95] tracking-[-0.03em] text-white">Prepare <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">Smarter.</span><br/>Achieve Your IELTS Goal.</h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">Join 50,000+ students improving Listening, Reading, Writing and Speaking every day — with structured lessons and AI feedback.</p>
          <ul className="mt-8 space-y-3">
            {PERKS.map((p) => (
              <li key={p.text} className="flex items-center gap-3 rounded-2xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0a0a0f]"><p.icon className="h-4 w-4" /></span>
                <span className="text-sm font-semibold text-white">{p.text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-3 text-sm font-bold text-white/80"><GraduationCap className="h-5 w-5" /> Trusted by learners in 120+ countries <ArrowRight className="h-4 w-4 opacity-60" /></div>
        </div>
        <p className="relative z-10 text-xs font-medium text-white/40">© {new Date().getFullYear()} IELTS Master — The modern IELTS platform.</p>
      </div>
      <div className={`flex flex-col ${bg.url ? "bg-white/40 backdrop-blur-sm dark:bg-[#070711]/40" : "bg-[#fcfcfd] dark:bg-[#070711]"}`}>
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Logo onClick={() => (window.location.href = "/")} />
          <a href="/" className="text-sm font-bold text-slate-600 dark:text-white/70">← Back to home</a>
        </div>
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="animate-slide-up w-full max-w-md">
            <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_16px_40px_rgb(10_10_15/0.08)] sm:p-8 dark:border-white/10 dark:bg-[#12121a] dark:shadow-none">
              <Outlet />
            </div>
            <p className="mt-6 text-center text-xs text-slate-400">Secure & encrypted — your data is safe with us.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
