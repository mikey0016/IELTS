import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MARKET_ITEMS } from "@/data/market";
import { getEquipped } from "@/lib/wallet";
import { storage } from "@/lib/storage";

function getCurrentUserId(): string | null {
  try {
    const s = storage.get<any>("session", null);
    return s?.id ?? null;
  } catch {
    return null;
  }
}
function getEquippedBg(): { url: string | null; isVideo: boolean } {
  try {
    const uid = getCurrentUserId();
    const raw: any = getEquipped(uid) as any;
    if (!raw?.bg) return { url: null, isVideo: false };
    const item =
      MARKET_ITEMS.find((i) => i.id === raw.bg && i.category === "bg") ||
      MARKET_ITEMS.find((i) => i.id === raw.bg);
    if (!item) return { url: null, isVideo: false };
    if (item.imageUrl.startsWith("/bg/")) {
      // local bg'lar uchun gradient fallback — taqilganda darhol ko'rinadi
      const gradients: Record<number, string> = {
        75: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        76: "linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%)",
        77: "linear-gradient(135deg, #0c4a6e 0%, #06b6d4 100%)",
        78: "linear-gradient(135deg, #14532d 0%, #22c55e 100%)",
        80: "linear-gradient(135deg, #7c2d12 0%, #f97316 100%)",
        81: "linear-gradient(135deg, #831843 0%, #ec4899 100%)",
        82: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
      };
      return {
        url:
          gradients[item.id] ||
          "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
        isVideo: false,
      };
    }
    return { url: item.imageUrl, isVideo: item.mediaType === "video" };
  } catch {
    return { url: null, isVideo: false };
  }
}

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [bg, setBg] = useState(() => getEquippedBg());

  useEffect(() => {
    const sync = () => setBg(getEquippedBg());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("market:equipped", sync as any);
    const iv = setInterval(sync, 900);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("market:equipped", sync as any);
      clearInterval(iv);
    };
  }, []);

  const isGradient = !!bg.url && bg.url.startsWith("linear-gradient");
  return (
    <div
      className="flex min-h-screen bg-slate-50 dark:bg-slate-950"
      style={
        bg.url
          ? isGradient
            ? { background: bg.url, backgroundAttachment: "fixed" }
            : {
                backgroundImage: `url(${bg.url})`,
                backgroundSize: "cover",
                backgroundAttachment: "fixed",
                backgroundPosition: "center",
              }
          : undefined
      }
    >
      {bg.url && (
        <div className="pointer-events-none fixed inset-0 bg-white/60 backdrop-blur-[1px] dark:bg-slate-950/60" />
      )}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="relative flex min-w-0 flex-1 flex-col lg:pl-64">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div
            key={location.pathname}
            className="animate-fade-in mx-auto max-w-6xl"
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
