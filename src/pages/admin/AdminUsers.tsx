import { useEffect, useState } from "react";
import {
  adminListUsers,
  adminBanUser,
  adminUnbanUser,
  adminSetRole,
  adminSetPlan,
  adminDeleteUser,
  adminGetWallet,
  adminAddCoins,
  adminSetCoins,
} from "@/api/admin";
import type { UserProfile } from "@/types";
import {
  Search,
  Shield,
  Ban,
  Trash2,
  MoreVertical,
  Coins,
  Gift,
  Plus,
  Minus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

export function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [wallets, setWallets] = useState<
    Record<string, { coins: number; xp: number; level: number }>
  >({});
  const [coinModal, setCoinModal] = useState<{
    user: UserProfile | null;
    amount: string;
    reason: string;
    mode: "add" | "set";
  }>({ user: null, amount: "", reason: "Admin gift", mode: "add" });
  const [coinLoading, setCoinLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await adminListUsers();
    setUsers(data);
    setLoading(false);
    // load wallets for each user
    const map: Record<string, { coins: number; xp: number; level: number }> =
      {};
    await Promise.all(
      data.map(async (u) => {
        try {
          const w = await adminGetWallet(u.id);
          map[u.id] = { coins: w.coins, xp: w.xp, level: w.level };
        } catch {
          map[u.id] = { coins: 250, xp: 0, level: 1 };
        }
      }),
    );
    setWallets(map);
  };

  useEffect(() => {
    load();
  }, []);

  const handleGiveCoins = async () => {
    if (!coinModal.user) return;
    const amt = parseInt(coinModal.amount);
    if (!Number.isFinite(amt) || amt === 0) {
      toast("Miqdorni kiriting (masalan 100 yoki -50)", "error");
      return;
    }
    if (Math.abs(amt) > 10000) {
      toast("Maksimal 10000", "error");
      return;
    }
    setCoinLoading(true);
    try {
      let res;
      if (coinModal.mode === "add") {
        res = await adminAddCoins(
          coinModal.user.id,
          amt,
          coinModal.reason || "Admin gift",
        );
      } else {
        res = await adminSetCoins(coinModal.user.id, amt);
      }
      setWallets((prev) => ({
        ...prev,
        [coinModal.user!.id]: {
          coins: res.coins,
          xp: res.xp,
          level: res.level,
        },
      }));
      toast(
        `${amt > 0 ? "+" : ""}${amt} coins ${coinModal.mode === "add" ? "berildi" : "o'rnatildi"} — ${coinModal.user.name}: ${res.coins} coins`,
        amt > 0 ? "success" : "info",
      );
      setCoinModal({
        user: null,
        amount: "",
        reason: "Admin gift",
        mode: "add",
      });
    } catch (e: any) {
      toast(e.message || "Xato", "error");
    } finally {
      setCoinLoading(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()),
  );

  const handleBan = async (id: string) => {
    await adminBanUser(id, "Banned by admin");
    load();
  };

  const handleUnban = async (id: string) => {
    await adminUnbanUser(id);
    load();
  };

  const handleRole = async (id: string, role: UserProfile["role"]) => {
    await adminSetRole(id, role);
    load();
  };

  const handlePlan = async (id: string, plan: UserProfile["planType"]) => {
    await adminSetPlan(id, plan);
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this user?")) {
      await adminDeleteUser(id);
      load();
    }
  };

  if (loading)
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Users
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage all registered users
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  User
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Role
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Plan
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Coins
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Joined
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const w = wallets[user.id];
                return (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: user.avatarColor }}
                        >
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRole(
                            user.id,
                            e.target.value as UserProfile["role"],
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.planType}
                        onChange={(e) =>
                          handlePlan(
                            user.id,
                            e.target.value as UserProfile["planType"],
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="pro">Pro</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          user.status === "active"
                            ? "emerald"
                            : user.status === "banned"
                              ? "rose"
                              : "amber"
                        }
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-xs font-extrabold text-white">
                          🪙 {w?.coins ?? 250}
                        </span>
                        <span className="text-xs text-slate-400">
                          Lv{w?.level ?? 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            setCoinModal({
                              user,
                              amount: "100",
                              reason: "Admin gift",
                              mode: "add",
                            })
                          }
                          className="rounded-lg bg-amber-50 p-1.5 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/40"
                          title="Give coins"
                        >
                          <Coins className="h-4 w-4" />
                        </button>
                        {user.status === "banned" ? (
                          <button
                            onClick={() => handleUnban(user.id)}
                            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                            title="Unban"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBan(user.id)}
                            className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50"
                            title="Ban"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Coin modal */}
      {coinModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Gift className="h-5 w-5 text-amber-500" /> {coinModal.user.name}{" "}
              ga coin berish
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Hozir: 🪙 {wallets[coinModal.user.id]?.coins ?? 250} coins · Lv
              {wallets[coinModal.user.id]?.level ?? 1}
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setCoinModal((m) => ({ ...m, mode: "add" }))}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-bold ${coinModal.mode === "add" ? "bg-amber-500 text-white border-amber-500" : "bg-white border-slate-200 dark:bg-slate-800"}`}
                >
                  Qo'shish
                </button>
                <button
                  onClick={() => setCoinModal((m) => ({ ...m, mode: "set" }))}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-bold ${coinModal.mode === "set" ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900" : "bg-white border-slate-200 dark:bg-slate-800"}`}
                >
                  O'rnatish
                </button>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {coinModal.mode === "add"
                    ? "Miqdor (+ berish / - ayirish)"
                    : "Yangi balance"}
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    value={coinModal.amount}
                    onChange={(e) =>
                      setCoinModal((m) => ({ ...m, amount: e.target.value }))
                    }
                    placeholder={coinModal.mode === "add" ? "100" : "500"}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCoinModal((m) => ({
                        ...m,
                        amount: String((parseInt(m.amount) || 0) + 50),
                      }))
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCoinModal((m) => ({
                        ...m,
                        amount: String((parseInt(m.amount) || 0) - 50),
                      }))
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[50, 100, 250, 500, 1000].map((v) => (
                    <button
                      key={v}
                      onClick={() =>
                        setCoinModal((m) => ({ ...m, amount: String(v) }))
                      }
                      className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-bold hover:bg-slate-50 dark:border-slate-700"
                    >
                      +{v}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCoinModal((m) => ({ ...m, amount: "-100" }))
                    }
                    className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600"
                  >
                    -100
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Sabab (ixtiyoriy)
                </label>
                <input
                  value={coinModal.reason}
                  onChange={(e) =>
                    setCoinModal((m) => ({ ...m, reason: e.target.value }))
                  }
                  placeholder="Masalan: Bonus, sovrin..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  setCoinModal({
                    user: null,
                    amount: "",
                    reason: "Admin gift",
                    mode: "add",
                  })
                }
              >
                Bekor
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600"
                loading={coinLoading}
                onClick={handleGiveCoins}
              >
                <Coins className="h-4 w-4" />{" "}
                {coinModal.mode === "add" ? "Berish" : "Saqlash"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
