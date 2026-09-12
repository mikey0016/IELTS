import { useEffect, useState } from "react";
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

export interface BgInfo {
  url: string | null;
  isVideo: boolean;
}

export function getEquippedBg(): BgInfo {
  try {
    const uid = getCurrentUserId();
    const raw: any = getEquipped(uid) as any;
    if (!raw?.bg) return { url: null, isVideo: false };
    const item =
      MARKET_ITEMS.find((i) => i.id === raw.bg && i.category === "bg") ||
      MARKET_ITEMS.find((i) => i.id === raw.bg);
    if (!item) return { url: null, isVideo: false };
    if (item.imageUrl.startsWith("/bg/")) {
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

export function useBackground(): BgInfo {
  const [bg, setBg] = useState<BgInfo>(() => getEquippedBg());

  useEffect(() => {
    const sync = () => setBg(getEquippedBg());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("market:equipped", sync as any);
    // also listen for auth changes (login/logout) via storage
    const iv = setInterval(sync, 900);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("market:equipped", sync as any);
      clearInterval(iv);
    };
  }, []);

  return bg;
}
