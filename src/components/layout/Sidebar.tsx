import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, BookMarked, Languages, ClipboardCheck, CalendarDays, TrendingUp, Trophy, Settings, X, Flame, Sparkles, Shield, ShoppingBag, Users, Swords,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { cn } from "@/lib/cn";

const NAV_SECTIONS: { label: string; items: { to: string; label: string; icon: typeof LayoutDashboard }[] }[] = [
  { label: "Learning", items: [{ to: "/app", label: "Dashboard", icon: LayoutDashboard }, { to: "/app/courses", label: "My Courses", icon: BookOpen }] },
  { label: "Skills", items: [{ to: "/app/vocabulary", label: "Vocabulary", icon: BookMarked }, { to: "/app/grammar", label: "Grammar", icon: Languages }] },
  { label: "Progress", items: [{ to: "/app/arena", label: "IELTS Arena", icon: Swords }, { to: "/app/mock-test", label: "Mock Tests", icon: ClipboardCheck }, { to: "/app/cdi-practice", label: "CDI Practice", icon: BookOpen }, { to: "/app/study-plan", label: "Study Plan", icon: CalendarDays }, { to: "/app/progress", label: "Progress", icon: TrendingUp }, { to: "/app/achievements", label: "Achievements", icon: Trophy }, { to: "/app/market", label: "Market", icon: ShoppingBag }, { to: "/app/friends", label: "Friends", icon: Users }, { to: "/app/settings", label: "Settings", icon: Settings }] },
];

export interface SidebarProps { mobileOpen: boolean; onClose: () => void; }

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { user, isAdmin } = useAuth();
  const { streak } = useProgress();
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-[#070711]/60 backdrop-blur-md lg:hidden" onClick={onClose} aria-hidden />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-[288px] flex-col border-r bg-white transition-transform duration-300 lg:translate-x-0 dark:bg-[#0a0a0f] dark:border-white/[0.06]", mobileOpen ? "translate-x-0 shadow-[8px_0_40px_rgb(10_10_15/0.12)]" : "-translate-x-full")}>
        <div className="flex h-[68px] items-center justify-between border-b border-slate-100 px-6 dark:border-white/[0.06]">
          <Logo onClick={onClose} />
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 lg:hidden dark:bg-white/10 dark:text-white/70"><X className="h-4 w-4" /></button>
        </div>
        <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6 scrollbar-none">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-white/30">{section.label}</p>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} onClick={onClose} end={item.to === "/app"} className={({ isActive }) => cn("group flex items-center gap-3 rounded-full px-3.5 py-2.5 text-[14px] font-semibold tracking-tight transition-all duration-200", isActive ? "bg-[#0a0a0f] text-white shadow-[0_4px_16px_rgb(10_10_15/0.2)] dark:bg-white dark:text-[#0a0a0f]" : "text-slate-600 hover:bg-slate-100 hover:text-[#0a0a0f] dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white")}>
                      <span className={cn("flex h-8 w-8 items-center justify-center rounded-full transition-colors", "bg-slate-100 dark:bg-white/10 group-[.bg-\\[\\#0a0a0f\\]]:bg-white/15 group-[.bg-white]:bg-[#0a0a0f]/10")}>
                        <item.icon className="h-[16px] w-[16px]" />
                      </span>
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="space-y-3 border-t border-slate-100 p-4 dark:border-white/[0.06]">
          <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-amber-500 to-orange-600 px-4 py-4 text-white shadow-[0_8px_24px_rgb(245_158_11/0.25)]">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 blur-xl" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur border border-white/20"><Flame className="h-5 w-5" /></div>
              <div><p className="text-sm font-black">{streak} day streak</p><p className="text-xs font-medium text-white/80">Keep it going! 🔥</p></div>
              <span className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse shadow" />
            </div>
          </div>
          {user?.planType === "free" && (
            <div className="relative overflow-hidden rounded-[20px] bg-[#0a0a0f] p-4 text-white shadow-xl dark:bg-white dark:text-[#0a0a0f] border border-white/10 dark:border-transparent">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 to-violet-600/20 dark:from-brand-600/10" />
              <div className="relative">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 dark:bg-[#0a0a0f]/10"><Sparkles className="h-3.5 w-3.5" /></span>
                <p className="mt-2 text-sm font-black">Go Premium</p>
                <p className="text-xs opacity-70">Unlimited practice & mocks.</p>
                <a href="/#pricing" className="mt-3 inline-flex rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#0a0a0f] hover:bg-slate-100 dark:bg-[#0a0a0f] dark:text-white">Upgrade →</a>
              </div>
            </div>
          )}
          {user && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
              <Avatar name={user.name} color={user.avatarColor} />
              <div className="min-w-0"><p className="truncate text-sm font-bold dark:text-white">{user.name}</p><p className="truncate text-xs text-slate-500 dark:text-white/50">{user.email}</p></div>
              <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
            </div>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={onClose} className={({ isActive }) => cn("flex items-center gap-3 rounded-full px-3.5 py-3 text-sm font-bold transition", isActive ? "bg-violet-600 text-white shadow-[0_4px_16px_rgb(124_58_237/0.3)]" : "bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-500/15 dark:text-violet-300")}>
              <Shield className="h-[18px] w-[18px]" /> Admin Panel
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
}
