import { Outlet } from "react-router-dom";
import { GraduationCap, Target, Sparkles, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const PERKS = [
  { icon: Target, text: "Personalized study plans for every target band" },
  { icon: Sparkles, text: "AI-powered feedback on every essay and recording" },
  {
    icon: ShieldCheck,
    text: "Exam-real mock tests scored with official rubrics",
  },
];

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <Logo onClick={() => (window.location.href = "/")} />
        <div className="relative z-10">
          <h2 className="max-w-md font-display text-4xl font-extrabold leading-tight text-white">
            Prepare Smarter. <span className="text-cyan-300">Achieve</span> Your
            IELTS Goal.
          </h2>
          <p className="mt-4 max-w-md text-slate-300">
            Join 50,000+ students improving their Listening, Reading, Writing
            and Speaking skills every day.
          </p>
          <ul className="mt-8 space-y-4">
            {PERKS.map((p) => (
              <li
                key={p.text}
                className="flex items-center gap-3 text-sm font-medium text-slate-200"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <p.icon className="h-4 w-4 text-cyan-300" />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
          <GraduationCap className="h-4 w-4" />
          Trusted by learners in 120+ countries
        </p>
      </div>

      <div className="flex flex-col bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Logo onClick={() => (window.location.href = "/")} />
        </div>
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="animate-slide-up w-full max-w-md">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
