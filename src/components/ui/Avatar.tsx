import { useEffect, useState } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { MARKET_ITEMS } from "@/data/market";
import { storage } from "@/lib/storage";
import { getEquipped } from "@/lib/wallet";

export function initialsOf(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}
export interface AvatarProps extends HTMLAttributes<HTMLDivElement> { name: string; color?: string; size?: "sm" | "md" | "lg" | "xl"; imageUrl?: string; frameUrl?: string; }
const SIZES = { sm: "h-8 w-8 text-xs", md: "h-9 w-9 text-sm", lg: "h-12 w-12 text-base", xl: "h-16 w-16 text-xl" };
function getCurrentUserId(): string | null { try { const sess = storage.get<any>("session", null); return sess?.id ?? null; } catch { return null; } }
function getEquippedImage(category: "avatar" | "frame"): string | null {
  try {
    const uid = getCurrentUserId(); const raw: any = getEquipped(uid) as any; if (!raw) return null;
    const id = raw[category]; if (!id) return null;
    const item = MARKET_ITEMS.find((i) => i.id === id && i.category === category) || MARKET_ITEMS.find((i) => i.id === id);
    return item?.imageUrl ?? null;
  } catch { return null; }
}
export function Avatar({ name, color = "#3b6cf6", size = "md", className, imageUrl, frameUrl, ...props }: AvatarProps) {
  const [eqAvatar, setEqAvatar] = useState<string | null>(() => getEquippedImage("avatar"));
  const [eqFrame, setEqFrame] = useState<string | null>(() => getEquippedImage("frame"));
  useEffect(() => {
    const sync = () => { setEqAvatar(getEquippedImage("avatar")); setEqFrame(getEquippedImage("frame")); };
    sync(); const onStorage = () => sync();
    window.addEventListener("storage", onStorage); window.addEventListener("market:equipped", onStorage as any);
    const iv = setInterval(sync, 900);
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("market:equipped", onStorage as any); clearInterval(iv); };
  }, []);
  const avatarImg = imageUrl ?? eqAvatar;
  const frameImg = frameUrl ?? eqFrame;
  const showImage = !!avatarImg && avatarImg !== "🦊" && !avatarImg.startsWith("/bg/");
  return (
    <div className={cn("relative flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-md ring-2 ring-white/80 dark:ring-white/10 overflow-hidden", SIZES[size], className)} style={!showImage ? { background: `linear-gradient(135deg, ${color}, #7c3aed)`, boxShadow: `0 4px 14px ${color}30` } : undefined} aria-label={name} {...props}>
      {showImage ? <img src={avatarImg!} alt={name} className="h-full w-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} /> : initialsOf(name)}
      {frameImg && frameImg !== "🦊" && <img src={frameImg} alt="frame" className="pointer-events-none absolute inset-0 h-full w-full object-contain" />}
    </div>
  );
}
