import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Headphones,
  FileText,
  PenLine,
  Mic,
  BookMarked,
  Languages,
  ClipboardCheck,
  CalendarDays,
  TrendingUp,
  Trophy,
  Settings,
  X,
  Flame,
  Sparkles,
  Shield,
  ShoppingBag,
  Users,
  Swords,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { cn } from "@/lib/cn";

const NAV_SECTIONS: {
  label: string;
  items: { to: string; label: string; icon: typeof LayoutDashboard }[];
}[] = [
  {
    label: "Learning",
    items: [
      { to: "/app", label: "Dashboard", icon: LayoutDashboard },
      { to: "/app/courses", label: "My Courses", icon: BookOpen },
    ],
  },
  {
    label: "Skills",
    items: [
      { to: "/app/listening", label: "Listening", icon: Headphones },
      { to: "/app/reading", label: "Reading", icon: FileText },
      { to: "/app/writing", label: "Writing", icon: PenLine },
      { to: "/app/speaking", label: "Speaking", icon: Mic },
      { to: "/app/vocabulary", label: "Vocabulary", icon: BookMarked },
      { to: "/app/grammar", label: "Grammar", icon: Languages },
    ],
  },
  {
    label: "Progress",
    items: [
      { to: "/app/arena", label: "IELTS Arena", icon: Swords },
      { to: "/app/mock-test", label: "Mock Tests", icon: ClipboardCheck },
      { to: "/app/study-plan", label: "Study Plan", icon: CalendarDays },
      { to: "/app/progress", label: "Progress", icon: TrendingUp },
      { to: "/app/achievements", label: "Achievements", icon: Trophy },
      { to: "/app/market", label: "Market", icon: ShoppingBag },
      { to: "/app/friends", label: "Friends", icon: Users },
      { to: "/app/settings", label: "Settings", icon: Settings },
    ],
  },
];

export interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { user, isAdmin } = useAuth();
  const { streak } = useProgress();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 dark:border-slate-800 dark:bg-slate-950",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
          <Logo onClick={onClose} />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-5"
          aria-label="Dashboard"
        >
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      end={item.to === "/app"}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                          isActive
                            ? "bg-brand-700 text-white shadow-sm dark:bg-brand-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white",
                        )
                      }
                    >
                      <item.icon className="h-[18px] w-[18px] opacity-80" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="space-y-3 border-t border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center justify-between rounded-xl bg-orange-50 px-4 py-3 ring-1 ring-orange-100 dark:bg-orange-950/40 dark:ring-orange-900/50">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-bold text-orange-700 dark:text-orange-300">
                  {streak} day streak
                </p>
                <p className="text-[11px] text-orange-600/80 dark:text-orange-400/70">
                  Keep it going! 🔥
                </p>
              </div>
            </div>
          </div>
          {user?.planType === "free" && (
            <div className="rounded-xl bg-gradient-to-br from-violet-600 to-brand-700 p-4 text-white shadow-sm">
              <Sparkles className="h-4 w-4 text-violet-200" />
              <p className="mt-1.5 text-sm font-bold">Go Premium</p>
              <p className="mt-0.5 text-xs text-violet-100">
                Unlock unlimited practice & mock tests.
              </p>
              <a
                href="/#pricing"
                className="mt-2 inline-block rounded-lg bg-white/15 px-3 py-1.5 text-xs font-bold hover:bg-white/25"
              >
                Upgrade →
              </a>
            </div>
          )}
          {user && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <Avatar name={user.name} color={user.avatarColor} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800 dark:text-white">
                  {user.name}
                </p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
          )}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-150",
                  isActive
                    ? "bg-violet-600 text-white shadow-sm dark:bg-violet-500"
                    : "bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-950/50 dark:text-violet-300 dark:hover:bg-violet-900/50",
                )
              }
            >
              <Shield className="h-[18px] w-[18px] opacity-80" />
              Admin Panel
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
}
