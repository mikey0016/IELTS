import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight, Moon, Sun, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/#skills" },
  { label: "Practice", href: "/#how-it-works" },
  { label: "Mock Tests", href: "/#feature-mock-tests" },
  { label: "Vocabulary", href: "/#feature-vocabulary" },
  { label: "Pricing", href: "/#pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const goToDashboard = () => navigate("/app");

  return (
    <header className={cn("sticky top-0 z-50 w-full transition-all duration-300", scrolled ? "py-3" : "py-4")}>
      <div className={cn("mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 transition-all duration-300", scrolled ? "rounded-full border border-slate-200 bg-white/80 backdrop-blur-2xl shadow-[0_8px_32px_rgb(10_10_15/0.08)] dark:border-white/10 dark:bg-[#12121a]/80" : "border-transparent bg-transparent", scrolled && "py-2.5 lg:py-3")}>
        <div className={cn("flex items-center gap-8", !scrolled && "bg-white/70 dark:bg-[#12121a]/70 backdrop-blur-xl rounded-full px-4 py-2 border border-white/60 dark:border-white/10 shadow-sm lg:shadow-none")}>
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[13.5px] font-semibold tracking-tight transition",
                  "text-slate-600 hover:bg-slate-100 hover:text-[#0a0a0f] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className={cn("hidden items-center gap-2 lg:flex", !scrolled && "bg-white/70 dark:bg-[#12121a]/70 backdrop-blur-xl rounded-full px-2 py-1.5 border border-white/60 dark:border-white/10 shadow-sm")}>
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-[#0a0a0f] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user ? (
            <Button onClick={goToDashboard} size="md">
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 text-[13.5px] font-bold text-slate-700 transition hover:text-[#0a0a0f] dark:text-slate-200 dark:hover:text-white">
                Login
              </Link>
              <Link to="/signup">
                <Button size="md">
                  <Sparkles className="h-3.5 w-3.5" /> Start Learning
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <button onClick={toggleTheme} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur border border-slate-200 text-slate-600 shadow-sm dark:bg-white/10 dark:border-white/10 dark:text-white/70" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={() => setMobileOpen((o) => !o)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a0a0f] text-white shadow dark:bg-white dark:text-[#0a0a0f]" aria-expanded={mobileOpen} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-fade-in mx-4 mt-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-2xl lg:hidden dark:border-white/10 dark:bg-[#12121a]">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="rounded-2xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            {user ? <Button onClick={goToDashboard} className="w-full">Go to Dashboard</Button> : <>
              <Link to="/login"><Button variant="outline" className="w-full rounded-full">Login</Button></Link>
              <Link to="/signup"><Button className="w-full">Start Learning</Button></Link>
            </>}
          </div>
        </div>
      )}
    </header>
  );
}
