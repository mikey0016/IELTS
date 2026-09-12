import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  BookOpen,
  HelpCircle,
  BookMarked,
  PenLine,
  Mic,
  Languages,
  ClipboardCheck,
  Trophy,
  Settings,
  Shield,
  Layers,
  Music,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/cn";

const ADMIN_NAV_SECTIONS: {
  label: string;
  items: { to: string; label: string; icon: typeof LayoutDashboard }[];
}[] = [
  {
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Users",
    items: [{ to: "/admin/users", label: "All Users", icon: Users }],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/ielts-builder", label: "IELTS Builder", icon: Layers },
      { to: "/admin/courses", label: "Courses", icon: BookOpen },
      { to: "/admin/questions", label: "Questions", icon: HelpCircle },
      { to: "/admin/vocabulary", label: "Vocabulary", icon: BookMarked },
      { to: "/admin/writing", label: "Writing Prompts", icon: PenLine },
      { to: "/admin/speaking", label: "Speaking Prompts", icon: Mic },
      { to: "/admin/grammar", label: "Grammar", icon: Languages },
    ],
  },
  {
    label: "Exams",
    items: [
      { to: "/admin/mock-tests", label: "Mock Tests", icon: ClipboardCheck },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/music", label: "Music", icon: Music },
      { to: "/admin/achievements", label: "Achievements", icon: Trophy },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export interface AdminSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  const { user } = useAuth();

  const roleLabel =
    user?.role === "superadmin"
      ? "Super Admin"
      : user?.role === "admin"
        ? "Admin"
        : "Admin";

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <div className="flex items-center gap-2.5">
            <Logo
              className="[&_span:last-child]:text-white"
              onClick={onClose}
            />
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Admin badge */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 px-3.5 py-3 text-white shadow-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <Shield className="h-4 w-4 text-white" />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-bold leading-none">
                Admin Panel
                <Badge
                  tone="white"
                  className="px-1.5 py-0 text-[10px] font-extrabold tracking-wide"
                >
                  {roleLabel.toUpperCase()}
                </Badge>
              </p>
              <p className="mt-1 text-xs text-violet-100">
                {user?.role ? `${user.role} access` : "Restricted access"}
              </p>
            </div>
          </div>
        </div>

        <nav
          className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-5"
          aria-label="Admin"
        >
          {ADMIN_NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      end={item.to === "/admin"}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                          isActive
                            ? "bg-violet-600 text-white shadow-sm"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white",
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

        {/* Quick stats + user */}
        <div className="space-y-3 border-t border-slate-800 p-4">
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-800 px-3 py-3 text-center ring-1 ring-white/5">
              <p className="text-lg font-extrabold leading-none text-white">
                1,248
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                Total Users
              </p>
            </div>
            <div className="rounded-xl bg-slate-800 px-3 py-3 text-center ring-1 ring-white/5">
              <p className="text-lg font-extrabold leading-none text-white">
                86
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                Courses
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/50 p-3">
              <Avatar name={user.name} color={user.avatarColor} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {user.name}
                </p>
                <p className="truncate text-xs capitalize text-slate-400">
                  {user.role}
                  <span className="text-slate-600"> · </span>
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <NavLink
            to="/app"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-150",
                isActive
                  ? "bg-brand-700 text-white shadow-sm dark:bg-brand-600"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white dark:bg-slate-800/80 dark:hover:bg-slate-700",
              )
            }
          >
            <LayoutDashboard className="h-[18px] w-[18px] opacity-80" />
            Back to App
          </NavLink>
        </div>
      </aside>
    </>
  );
}
