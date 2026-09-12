import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { MARKET_ITEMS, type MarketCategory } from "@/data/market";
import { ShoppingBag, Coins, Check, Sparkles, Database } from "lucide-react";
import { dispatchEquippedUpdate } from "@/hooks/useEquipped";
import { getWallet, setWallet, getPurchases, setPurchases, getEquipped, setEquipped as setEquippedStore, migrateGlobalWallet } from "@/lib/wallet";
import { isRealApi } from "@/api/http";

type Equipped = Record<MarketCategory, number | null>;
const categories: Array<MarketCategory | "all"> = ["all", "badge", "frame", "avatar", "banner", "bg", "emoji"];
const catLabel: Record<string, string> = { all: "All", badge: "🏅 Badge", frame: "🖼️ Frame", avatar: "👤 Avatar", banner: "🎨 Banner", bg: "🌄 BG", emoji: "🦊 Emoji" };
const catColor: Record<string, string> = { badge: "bg-amber-500", frame: "bg-sky-500", avatar: "bg-emerald-500", banner: "bg-violet-500", bg: "bg-rose-500", emoji: "bg-orange-500" };

export function Market() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [filter, setFilter] = useState<MarketCategory | "all">("all");
  const [dbBadge, setDbBadge] = useState(false);

  useEffect(() => { migrateGlobalWallet(); setDbBadge(isRealApi()); }, []);
  const userId = user?.id ?? null;
  const [coins, setCoins] = useState(() => getWallet(userId).coins);
  const [purchases, setPurchasesState] = useState<number[]>(() => getPurchases(userId));
  const [equipped, setEquippedState] = useState<Equipped>(() => getEquipped(userId) as Equipped);
  const [itemsLoading] = useState(false);

  useEffect(() => { setCoins(getWallet(userId).coins); setPurchasesState(getPurchases(userId)); setEquippedState(getEquipped(userId) as Equipped); }, [userId]);
  useEffect(() => {
    const onWallet = (e: any) => { if (e?.detail?.userId === userId) setCoins(e.detail.wallet.coins); else if (!userId && !e?.detail?.userId) setCoins(e.detail.wallet.coins); };
    window.addEventListener("wallet:update" as any, onWallet);
    const iv = setInterval(() => setCoins(getWallet(userId).coins), 1200);
    return () => { window.removeEventListener("wallet:update" as any, onWallet); clearInterval(iv); };
  }, [userId]);
  useEffect(() => { window.addEventListener("market:equipped" as any, () => setEquippedState(getEquipped(userId) as Equipped)); }, [userId]);

  const filtered = useMemo(() => (filter === "all" ? MARKET_ITEMS : MARKET_ITEMS.filter((i) => i.category === filter)), [filter]);

  const handleBuy = (id: number) => {
    if (!user) { toast("Login kerak — market faqat login qilganlar uchun", "error"); return; }
    const item = MARKET_ITEMS.find((i) => i.id === id); if (!item) return;
    if (purchases.includes(id)) { toast("Allaqachon sotib olingan", "info"); return; }
    if (item.price > 0 && coins < item.price) { toast(`Coins yetarli emas (${coins}/${item.price})`, "error"); return; }
    if (item.price > 0) { const w = getWallet(userId); const next = { ...w, coins: w.coins - item.price }; setWallet(userId, next); setCoins(next.coins); }
    const newPurchases = [...purchases, id]; setPurchases(userId, newPurchases); setPurchasesState(newPurchases);
    if (!equipped[item.category]) { const nextEq = { ...equipped, [item.category]: id } as Equipped; setEquippedStore(userId, nextEq as any); setEquippedState(nextEq); dispatchEquippedUpdate(); }
    toast(`${item.name} sotib olindi!`, "success");
  };
  const handleEquip = (id: number) => {
    const item = MARKET_ITEMS.find((i) => i.id === id); if (!item) return;
    if (!purchases.includes(id) && item.price !== 0) { toast("Avval sotib oling", "error"); return; }
    const nextEq = { ...equipped, [item.category]: id } as Equipped; setEquippedStore(userId, nextEq as any); setEquippedState(nextEq); dispatchEquippedUpdate(); toast(`${item.name} taqildi!`, "success");
  };
  const isEquipped = (id: number, cat: MarketCategory) => equipped[cat] === id;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-[24px] bg-slate-900 p-7 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-violet-600 opacity-90" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur"><ShoppingBag className="h-3.5 w-3.5" /> Market — 80+ Premium Items {dbBadge && <span className="inline-flex items-center gap-1"><Database className="h-3 w-3" /> DB fallback</span>}</p>
            <h1 className="mt-3 font-display text-2xl font-black">Market Do'koni</h1>
            <p className="mt-1.5 max-w-xl text-sm text-white/80">Task va testlardan coins yig'ing, profil uchun badge, frame, avatar, banner va fonlarga almashtiring. Hammasi profilingizda ko'rinadi.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-slate-900 shadow"><Coins className="h-4 w-4 text-amber-500" /> {coins} coins</span>
        </div>
      </div>

      <Card glass>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)} className={`rounded-full border px-3.5 py-1.5 text-sm font-bold transition ${filter === cat ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900" : "bg-white text-slate-700 border-slate-200 hover:border-brand-300 dark:bg-white/[0.06] dark:text-white dark:border-white/10"}`}>{catLabel[cat]}</button>
            ))}
          </div>
          <Badge tone="slate" className="rounded-full">{filtered.length} ta mahsulot</Badge>
        </CardContent>
      </Card>

      {user && (
        <Card glass className="border-dashed">
          <CardContent className="py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">TAQILGAN — darhol avatar/banner/fon da ko'rinadi:</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {equipped.badge && <Badge tone="amber">🏅 Badge #{equipped.badge}</Badge>}
              {equipped.frame && <Badge tone="cyan">🖼️ Frame #{equipped.frame}</Badge>}
              {(equipped as any).avatar && <Badge tone="emerald">👤 Avatar #{(equipped as any).avatar}</Badge>}
              {equipped.banner && <Badge tone="violet">🎨 Banner #{equipped.banner}</Badge>}
              {equipped.bg && <Badge tone="rose">🌄 BG #{equipped.bg}</Badge>}
              {equipped.emoji && <Badge tone="slate">🦊 Emoji</Badge>}
              {!equipped.badge && !equipped.frame && !(equipped as any).avatar && <span className="text-xs text-slate-400">Hech narsa taqilmagan — sotib olib taqing!</span>}
            </div>
          </CardContent>
        </Card>
      )}

      {itemsLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-[20px]" />)}</div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => {
            const owned = purchases.includes(item.id);
            const equippedNow = isEquipped(item.id, item.category);
            return (
              <Card key={item.id} glass hover className={`overflow-hidden p-0 ${owned ? "ring-1 ring-emerald-200 dark:ring-emerald-900" : ""}`}>
                <div className="relative flex h-40 items-center justify-center overflow-hidden bg-slate-900">
                  {item.mediaType === "video" ? <video src={item.imageUrl} autoPlay muted loop playsInline className="h-full w-full object-cover" /> : item.mediaType === "emoji" || item.imageUrl === "🦊" ? <span className="text-6xl">🦊</span> : item.category === "bg" && item.imageUrl.startsWith("/bg/") ? <div className="h-full w-full" style={{ background: ({ 75: "linear-gradient(135deg,#0f172a,#1e293b)", 76: "linear-gradient(135deg,#1e1b4b,#7c3aed)", 77: "linear-gradient(135deg,#0c4a6e,#06b6d4)", 78: "linear-gradient(135deg,#14532d,#22c55e)", 80: "linear-gradient(135deg,#7c2d12,#f97316)", 81: "linear-gradient(135deg,#831843,#ec4899)", 82: "linear-gradient(135deg,#1e293b,#475569)" } as any)[item.id] || "linear-gradient(135deg,#0f172a,#334155)" }} /> : <><img src={item.imageUrl} alt={item.name} loading="lazy" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; const n = (e.target as HTMLImageElement).nextElementSibling as HTMLElement; if (n) n.style.display = "flex"; }} /><span style={{ display: "none" }} className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-3xl text-white">{item.icon}</span></>}
                  <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-extrabold uppercase text-white ${catColor[item.category]}`}>{item.category}</span>
                  {item.mediaType === "video" && <span className="absolute right-2 top-2 rounded-full bg-brand-600 px-2 py-1 text-[10px] font-bold text-white">VIDEO</span>}
                  {owned && <span className="absolute bottom-2 right-2 rounded-full bg-emerald-500 px-2 py-1 text-[11px] font-bold text-white">✓ Owned</span>}
                </div>
                <div className="p-3.5">
                  <h4 className="truncate text-sm font-bold leading-tight dark:text-white">{item.name}</h4>
                  <p className="mt-0.5 line-clamp-2 min-h-[32px] text-xs text-slate-500">{item.desc}</p>
                  <div className="mt-2 flex items-center gap-1.5"><span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-xs font-extrabold text-white">🪙 {item.price === 0 ? "TEKIN" : item.price}</span>{equippedNow && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300">✓ Taqilgan</span>}</div>
                  {owned ? equippedNow ? <Button variant="outline" size="sm" disabled className="mt-3 w-full rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"><Check className="h-4 w-4" /> Taqilgan</Button> : <Button onClick={() => handleEquip(item.id)} size="sm" className="mt-3 w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700">Taqish →</Button> : <Button onClick={() => handleBuy(item.id)} size="sm" className="mt-3 w-full rounded-2xl">{item.price === 0 ? "Olish →" : "Sotib olish →"}</Button>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && <Card glass className="border-dashed"><CardContent className="py-10 text-center text-slate-400">Bu kategoriyada mahsulot topilmadi.</CardContent></Card>}

      <Card glass className="border-dashed bg-slate-50/50 dark:bg-white/[0.03]">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"><Sparkles className="h-4 w-4 text-violet-500" /> Coins yig'ish uchun Task va Mock testlarni bajaring!</p>
          <div className="flex gap-2"><a href="/app/study-plan" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-900">📋 Tasks →</a><a href="/app/mock-test" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold dark:border-white/10 dark:bg-white/[0.06] dark:text-white">🎯 Mock →</a></div>
        </CardContent>
      </Card>
    </div>
  );
}
