import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Target,
  LogOut,
  UserRound,
  Award,
  ChevronDown,
  Flame,
  BookOpen,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/cn";

const NOTIFICATIONS = [
  {
    id: "n1",
    icon: Award,
    text: "Achievement unlocked — 7 Day Streak!",
    time: "2m ago",
    tone: "amber",
  },
  {
    id: "n2",
    icon: BookOpen,
    text: "Your Reading mock test result is ready.",
    time: "1h ago",
    tone: "brand",
  },
  {
    id: "n3",
    icon: Flame,
    text: "Daily goal: 20 vocabulary words due today.",
    time: "3h ago",
    tone: "violet",
  },
];

export interface TopbarProps {
  onMenuClick: () => void;
}

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
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node))
        setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    const paths: [string, string[]][] = [
      ["/app/vocabulary", ["vocabulary", "words", "flashcard", "deck"]],
      ["/app/writing", ["writing", "essay"]],
      ["/app/speaking", ["speaking"]],
      ["/app/mock-test", ["mock", "test"]],
      ["/app/practice", ["practice", "exercise"]],
      ["/app/grammar", ["grammar"]],
      ["/app/study-plan", ["plan", "study"]],
      ["/app/listening", ["listening", "audio"]],
      ["/app/reading", ["reading"]],
    ];
    const match = paths.find(([, keys]) => keys.some((k) => q.includes(k)));
    if (match) {
      navigate(match[0]);
      toast(`Showing results for «${query}»`);
    } else {
      toast(
        `No results for «${query}» — try «writing» or «vocabulary»`,
        "error",
      );
    }
    setQuery("");
  };

  const handleLogout = () => {
    logout();
    toast("Signed out successfully", "success");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur-xl sm:px-6 dark:border-slate-800 dark:bg-slate-950/80">
      <button
        onClick={onMenuClick}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <form
        onSubmit={onSearch}
        className="relative hidden max-w-md flex-1 sm:block"
        role="search"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search lessons, vocabulary, mock tests…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:focus:bg-slate-800"
        />
      </form>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <div className="hidden items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 md:flex dark:border-brand-800 dark:bg-brand-950/50">
          <Target className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <span className="text-xs font-semibold text-brand-800 dark:text-brand-200">
            Current {overallBandValue.toFixed(1)} → Target{" "}
            {user?.targetBand.toFixed(1) ?? "7.0"}
          </span>
        </div>
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>
          {notifOpen && (
            <div className="animate-scale-in absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-card-hover dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Notifications
                </p>
                <Badge tone="rose">{NOTIFICATIONS.length} new</Badge>
              </div>
              {NOTIFICATIONS.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setNotifOpen(false);
                    toast(n.text, "info");
                  }}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      n.tone === "amber" &&
                        "bg-amber-100 text-amber-600 dark:bg-amber-900/50",
                      n.tone === "brand" &&
                        "bg-brand-100 text-brand-600 dark:bg-brand-900/50",
                      n.tone === "violet" &&
                        "bg-violet-100 text-violet-600 dark:bg-violet-900/50",
                    )}
                  >
                    <n.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                      {n.text}
                    </span>
                    <span className="text-xs text-slate-400">{n.time}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl p-1 pr-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Account menu"
          >
            <Avatar
              name={user?.name ?? "Guest"}
              color={user?.avatarColor}
              size="md"
            />
            <ChevronDown
              className={cn(
                "hidden h-4 w-4 text-slate-400 transition-transform sm:block",
                userOpen && "rotate-180",
              )}
            />
          </button>
          {userOpen && (
            <div className="animate-scale-in absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-card-hover dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                <p className="truncate text-sm font-bold text-slate-800 dark:text-white">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setUserOpen(false);
                  navigate("/app/settings");
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <UserRound className="h-4 w-4" /> Profile & Settings
              </button>
              <button
                onClick={() => {
                  setUserOpen(false);
                  navigate("/app/achievements");
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Award className="h-4 w-4" /> Achievements
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
