import { storage } from "@/lib/storage";

export interface Wallet {
  coins: number;
  xp: number;
  level: number;
}

const DEFAULT_WALLET: Wallet = { coins: 250, xp: 0, level: 1 };

function walletKey(userId: string | null): string {
  return userId ? `wallet:${userId}` : "wallet:guest";
}

export function getWallet(userId: string | null): Wallet {
  const key = walletKey(userId);
  const w = storage.get<Wallet>(key, DEFAULT_WALLET);
  // normalize
  return { coins: w.coins ?? 250, xp: w.xp ?? 0, level: w.level ?? 1 };
}

export function setWallet(userId: string | null, wallet: Wallet): void {
  storage.set(walletKey(userId), wallet);
  // dispatch event for UI sync
  window.dispatchEvent(
    new CustomEvent("wallet:update", { detail: { userId, wallet } }),
  );
}

export function addCoins(
  userId: string | null,
  amount: number,
  reason?: string,
): Wallet {
  const w = getWallet(userId);
  const next: Wallet = {
    coins: Math.max(0, w.coins + amount),
    xp: w.xp + (amount > 0 ? amount : 0),
    level: Math.floor((w.xp + (amount > 0 ? amount : 0)) / 200) + 1,
  };
  setWallet(userId, next);
  // also log transaction
  const txKey = `wallet:transactions:${userId ?? "guest"}`;
  const txs = storage.get<any[]>(txKey, []);
  txs.unshift({
    amount,
    reason: reason ?? "admin",
    date: new Date().toISOString(),
    balance: next.coins,
  });
  storage.set(txKey, txs.slice(0, 50));
  return next;
}

export function getPurchases(userId: string | null): number[] {
  const key = userId ? `market:purchases:${userId}` : "market:purchases:guest";
  return storage.get<number[]>(key, []);
}
export function setPurchases(userId: string | null, ids: number[]): void {
  const key = userId ? `market:purchases:${userId}` : "market:purchases:guest";
  storage.set(key, ids);
}
export function getEquipped(
  userId: string | null,
): Record<string, number | null> {
  const key = userId ? `market:equipped:${userId}` : "market:equipped:guest";
  const raw = storage.get<any>(key, null);
  if (!raw)
    return {
      badge: null,
      frame: null,
      avatar: null,
      banner: null,
      bg: null,
      emoji: null,
    } as any;
  // compat avata -> avatar
  if (raw.avata && !raw.avatar) {
    raw.avatar = raw.avata;
    delete raw.avata;
  }
  return raw;
}
export function setEquipped(
  userId: string | null,
  eq: Record<string, number | null>,
): void {
  const key = userId ? `market:equipped:${userId}` : "market:equipped:guest";
  storage.set(key, eq);
  window.dispatchEvent(new Event("market:equipped"));
}

// compat helpers for old global keys -> migrate to per-user guest
export function migrateGlobalWallet(): void {
  try {
    const globalCoins = storage.get<number | null>("wallet:coins", null);
    if (globalCoins !== null) {
      const guestWallet = getWallet(null);
      if (guestWallet.coins === 250 && globalCoins !== 250) {
        setWallet(null, { ...guestWallet, coins: globalCoins });
      }
    }
    const globalPurchases = storage.get<number[] | null>(
      "market:purchases",
      null,
    );
    if (globalPurchases && globalPurchases.length > 0) {
      const guestPurchases = getPurchases(null);
      if (guestPurchases.length === 0) setPurchases(null, globalPurchases);
    }
    const globalEquipped = storage.get<any>("market:equipped", null);
    if (globalEquipped) {
      const norm = globalEquipped.avata
        ? { ...globalEquipped, avatar: globalEquipped.avata }
        : globalEquipped;
      delete (norm as any).avata;
      const guestEq = getEquipped(null);
      if (!guestEq.avatar && !guestEq.badge) {
        setEquipped(null, norm);
      }
    }
  } catch {}
}
