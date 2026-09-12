import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, Sun, Moon, Target, LogOut, UserRound, Award, ChevronDown, Flame, BookOpen, Command } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/cn";

const NOTIFICATIONS = [
  { id: "n1", icon: Award, text: "Achievement unlocked — 7 Day Streak!", time: "2m ago", tone: "amber" as const },
  { id: "n2", icon: BookOpen, text: "Your Reading mock test result is ready.", time: "1h ago", tone: "brand" as const },
  { id: "n3", icon: Flame, text: "Daily goal: 20 vocabulary words due today.", time: "3h ago", tone: "violet" as const },
];

export interface TopbarProps { onMenuClick: () => void; }

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { overallBandValue } = useProgress();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [query, setQuery] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    const paths: [string, string[]][] = [
      ["/app/vocabulary", ["vocabulary", "words"]],
      ["/app/mock-test", ["mock", "test"]],
      ["/app/grammar", ["grammar"]],
      ["/app/study-plan", ["plan"]],
    ];
    const match = paths.find(([, keys]) => keys.some((k) => q.includes(k)));
    if (match) { navigate(match[0]); toast(`Showing results for «${query}»`); }
    else toast(`No results for «${query}» — try «vocabulary»`, "error");
    setQuery("");
  };

  const handleLogout = () => { logout(); toast("Signed out successfully", "success"); navigate("/"); };

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-slate-200/60 bg-white/75 px-4 backdrop-blur-2xl sm:px-6 dark:border-white/[0.06] dark:bg-[#070711]/70">
      <button onClick={onMenuClick} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a0a0f] text-white lg:hidden dark:bg-white dark:text-[#0a0a0f]"><Menu className="h-5 w-5" /></button>
      <form onSubmit={onSearch} className="relative hidden max-w-lg flex-1 sm:block" role="search">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search lessons, vocabulary, mocks…" className="h-11 w-full rounded-full border border-slate-200 bg-slate-100/70 pl-10 pr-16 text-[14px] font-medium placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/40" />
        <span className="pointer-events-none absolute right-1.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-500 shadow border border-slate-200 dark:bg-white/10 dark:border-white/10 dark:text-white/60 lg:flex"><Command className="h-3 w-3" /> K</span>
      </form>
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex dark:border-white/10 dark:bg-white/[0.06]">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgb(16_185_129/0.5)] animate-pulse" />
          <span className="text-xs font-black tracking-tight dark:text-white">{overallBandValue.toFixed(1)} → {(user?.targetBand ?? 7).toFixed(1)}</span>
          <Target className="h-3.5 w-3.5 text-slate-400" />
        </div>
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen((o) => !o)} className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white border border-slate-200 hover:bg-slate-50 dark:bg-white/[0.06] dark:border-white/10 dark:hover:bg-white/10 transition">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#070711] animate-pulse" />
          </button>
          {notifOpen && (
            <div className="animate-scale-in absolute right-0 mt-3 w-80 rounded-[20px] border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-[#12121a]">
              <div className="flex items-center justify-between px-3 py-2"><p className="text-sm font-black dark:text-white">Notifications</p><Badge tone="rose">{NOTIFICATIONS.length} new</Badge></div>
              {NOTIFICATIONS.map((n) => (
                <button key={n.id} onClick={() => { setNotifOpen(false); toast(n.text, "info"); }} className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition">
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-full text-white shadow", n.tone === "amber" && "bg-amber-500", n.tone === "brand" && "bg-brand-600", n.tone === "violet" && "bg-violet-600")}><n.icon className="h-4 w-4" /></span>
                  <span className="min-w-0"><span className="block text-sm font-semibold leading-tight dark:text-white">{n.text}</span><span className="text-xs text-slate-400">{n.time}</span></span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={toggleTheme} className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-slate-200 hover:bg-slate-50 dark:bg-white/[0.06] dark:border-white/10 dark:hover:bg-white/10 transition">{theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
        <div className="relative" ref={userRef}>
          <button onClick={() => setUserOpen((o) => !o)} className="flex items-center gap-2 rounded-full bg-white border border-slate-200 p-1 pr-3 shadow-sm hover:bg-slate-50 dark:bg-white/[0.06] dark:border-white/10 dark:hover:bg-white/10 transition">
            <Avatar name={user?.name ?? "Guest"} color={user?.avatarColor} size="md" />
            <ChevronDown className={cn("hidden h-4 w-4 text-slate-400 transition sm:block", userOpen && "rotate-180")} />
          </button>
          {userOpen && (
            <div className="animate-scale-in absolute right-0 mt-3 w-60 rounded-[20px] border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#12121a]">
              <div className="border-b border-slate-100 px-3 py-3 dark:border-white/10"><p className="truncate text-sm font-black dark:text-white">{user?.name}</p><p className="truncate text-xs text-slate-500 dark:text-white/60">{user?.email}</p></div>
              <button onClick={() => { setUserOpen(false); navigate("/app/settings"); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/10 dark:text-white/90"><UserRound className="h-4 w-4" /> Profile</button>
              <button onClick={() => { setUserOpen(false); navigate("/app/achievements"); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/10 dark:text-white/90"><Award className="h-4 w-4" /> Achievements</button>
              <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"><LogOut className="h-4 w-4" /> Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
