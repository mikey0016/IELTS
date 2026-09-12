import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useBackground } from "@/hooks/useBackground";

export function PublicLayout() {
  const bg = useBackground();
  return (
    <div
      className={`flex min-h-screen flex-col ${bg.url ? "bg-transparent" : "bg-slate-50 dark:bg-slate-950"}`}
    >
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
