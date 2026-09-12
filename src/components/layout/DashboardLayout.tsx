import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useBackground } from "@/hooks/useBackground";

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const bg = useBackground();

  return (
    <div className={`flex min-h-screen ${bg.url ? "bg-transparent" : "bg-[#fcfcfd] dark:bg-[#070711]"}`}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="relative flex min-w-0 flex-1 flex-col lg:pl-[288px]">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div key={location.pathname} className="animate-fade-in mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
        <footer className="border-t border-slate-200/60 px-6 py-4 text-center text-xs font-medium text-slate-400 dark:border-white/10 dark:text-white/30">© {new Date().getFullYear()} IELTS Master — Keep learning. Keep shipping.</footer>
      </div>
    </div>
  );
}
