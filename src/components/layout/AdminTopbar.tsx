import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Shield,
  LogOut,
  UserRound,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/cn";

const ADMIN_NOTIFICATIONS = [
  {
    id: "n1",
    text: "New user registration — 12 pending approvals",
    time: "5m ago",
    tone: "violet" as const,
  },
  {
    id: "n2",
    text: "Content report: Question #342 flagged for review",
    time: "1h ago",
    tone: "amber" as const,
  },
  {
    id: "n3",
    text: "Mock test results exported successfully",
    time: "3h ago",
    tone: "brand" as const,
  },
];

export interface AdminTopbarProps {
  onMenuClick: () => void;
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
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
      ["/admin/users", ["user", "users", "student", "admin", "member"]],
      ["/admin/courses", ["course", "courses", "lesson", "curriculum"]],
      [
        "/admin/questions",
        ["question", "questions", "quiz", "exercise", "bank"],
      ],
      ["/admin/vocabulary", ["vocabulary", "vocab", "word", "words", "deck"]],
      ["/admin/writing", ["writing", "essay", "prompt", "task"]],
      ["/admin/speaking", ["speaking", "cue", "mic", "prompt"]],
      ["/admin/grammar", ["grammar", "language"]],
      [
        "/admin/mock-tests",
        ["mock", "mock-test", "mock-tests", "test", "exam"],
      ],
      [
        "/admin/analytics",
        ["analytic", "analytics", "stat", "stats", "dashboard"],
      ],
      [
        "/admin/achievements",
        ["achievement", "achievements", "trophy", "badge"],
      ],
      ["/admin/settings", ["setting", "settings", "config", "system"]],
    ];
    const match = paths.find(([, keys]) => keys.some((k) => q.includes(k)));
    if (match) {
      navigate(match[0]);
      toast(`Showing results for «${query}»`);
    } else {
      toast(`No results for «${query}» — try «users» or «courses»`, "error");
    }
    setQuery("");
  };

  const handleLogout = () => {
    logout();
    toast("Signed out successfully", "success");
    navigate("/");
  };

  const roleLabel =
    user?.role === "superadmin"
      ? "Super Admin"
      : user?.role === "admin"
        ? "Admin"
        : "Admin";
  const roleTone =
    user?.role === "superadmin" ? ("violet" as const) : ("brand" as const);

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
          placeholder="Search users, courses, questions…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/25 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:focus:bg-slate-800"
        />
      </form>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* Admin badge */}
        <div className="hidden items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 md:flex dark:border-violet-800 dark:bg-violet-950/40">
          <Shield className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <span className="text-xs font-bold tracking-wide text-violet-800 dark:text-violet-200">
            ADMIN
          </span>
          {user?.role && (
            <Badge tone={roleTone} className="ml-1 text-[11px] capitalize">
              {roleLabel}
            </Badge>
          )}
        </div>

        {/* Mobile role badge */}
        {user?.role && (
          <Badge tone={roleTone} className="capitalize md:hidden">
            {roleLabel}
          </Badge>
        )}

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
                <Badge tone="rose">{ADMIN_NOTIFICATIONS.length} new</Badge>
              </div>
              {ADMIN_NOTIFICATIONS.map((n) => (
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
                      n.tone === "violet" &&
                        "bg-violet-100 text-violet-600 dark:bg-violet-900/50",
                      n.tone === "amber" &&
                        "bg-amber-100 text-amber-600 dark:bg-amber-900/50",
                      n.tone === "brand" &&
                        "bg-brand-100 text-brand-600 dark:bg-brand-900/50",
                    )}
                  >
                    <Bell className="h-4 w-4" />
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
              name={user?.name ?? "Admin"}
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
                {user?.role && (
                  <Badge tone={roleTone} className="mt-1.5 capitalize">
                    {roleLabel}
                  </Badge>
                )}
              </div>
              <button
                onClick={() => {
                  setUserOpen(false);
                  navigate("/admin/settings");
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <UserRound className="h-4 w-4" /> Profile
              </button>
              <button
                onClick={() => {
                  setUserOpen(false);
                  navigate("/app");
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <LayoutDashboard className="h-4 w-4" /> Back to App
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
