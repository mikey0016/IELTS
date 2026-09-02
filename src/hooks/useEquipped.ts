import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import {
  MARKET_ITEMS,
  type MarketCategory,
  type MarketItem,
} from "@/data/market";

export type EquippedMap = Record<MarketCategory, number | null>;

const EQUIPPED_KEY = "market:equipped";
const DEFAULT_EQUIPPED: EquippedMap = {
  badge: null,
  frame: null,
  avatar: null,
  banner: null,
  bg: null,
  emoji: null,
} as unknown as EquippedMap;
// compat: old key used 'avata' instead of 'avatar'
function normalizeEquipped(raw: any): EquippedMap {
  if (!raw) return { ...DEFAULT_EQUIPPED };
  const out: any = { ...DEFAULT_EQUIPPED };
  for (const k of Object.keys(raw)) {
    const nk = k === "avata" ? "avatar" : k;
    if (nk in out) out[nk] = raw[k];
  }
  return out;
}

export function getEquippedMap(): EquippedMap {
  const raw = storage.get<any>(EQUIPPED_KEY, DEFAULT_EQUIPPED as any);
  return normalizeEquipped(raw);
}

export function getEquippedItems(): Record<MarketCategory, MarketItem | null> {
  const map = getEquippedMap();
  const res: any = {};
  for (const cat of Object.keys(map) as MarketCategory[]) {
    const id = map[cat];
    res[cat] = id
      ? (MARKET_ITEMS.find((i) => i.id === id && i.category === cat) ??
        MARKET_ITEMS.find((i) => i.id === id) ??
        null)
      : null;
  }
  return res;
}

export function useEquipped() {
  const [equipped, setEquipped] = useState<EquippedMap>(() => getEquippedMap());
  const [items, setItems] = useState(() => getEquippedItems());

  useEffect(() => {
    const sync = () => {
      setEquipped(getEquippedMap());
      setItems(getEquippedItems());
    };
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key?.includes("market:equipped")) sync();
    };
    window.addEventListener("storage", onStorage);
    // also listen custom event from Market page
    window.addEventListener("market:equipped", sync as any);
    // poll for same-tab updates (storage event not fired in same tab)
    const iv = setInterval(sync, 800);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("market:equipped", sync as any);
      clearInterval(iv);
    };
  }, []);

  return { equipped, items };
}

export function dispatchEquippedUpdate() {
  window.dispatchEvent(new Event("market:equipped"));
}
