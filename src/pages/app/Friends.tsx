import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getAllUsers } from "@/api/auth";
import type { UserProfile } from "@/types";
import { storage } from "@/lib/storage";
import {
  Users,
  UserPlus,
  Clock,
  Trophy,
  Search,
  Check,
  Flame,
  Crown,
} from "lucide-react";

interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: "pending" | "accepted";
  createdAt: string;
}

const FRIEND_KEY = "friendships";

function loadFriendships(): Friendship[] {
  return storage.get<Friendship[]>(FRIEND_KEY, []);
}
function saveFriendships(arr: Friendship[]) {
  storage.set(FRIEND_KEY, arr);
}

export function Friends() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [friendships, setFriendships] = useState<Friendship[]>(() =>
    loadFriendships(),
  );

  useEffect(() => {
    saveFriendships(friendships);
  }, [friendships]);

  // reload on refresh
  useEffect(() => {
    setFriendships(loadFriendships());
  }, [refresh]);

  const allUsers = useMemo(() => getAllUsers(), [refresh]);

  const currentId = user?.id ?? "";

  const friends = useMemo(() => {
    if (!currentId) return [] as UserProfile[];
    const ids = friendships
      .filter(
        (f) =>
          f.status === "accepted" &&
          (f.userId === currentId || f.friendId === currentId),
      )
      .map((f) => (f.userId === currentId ? f.friendId : f.userId));
    return allUsers.filter((u) => ids.includes(u.id));
  }, [friendships, allUsers, currentId]);

  const pendingReceived = useMemo(() => {
    if (!currentId) return [] as UserProfile[];
    const pend = friendships.filter(
      (f) => f.status === "pending" && f.friendId === currentId,
    );
    return pend
      .map((f) => allUsers.find((u) => u.id === f.userId)!)
      .filter(Boolean);
  }, [friendships, allUsers, currentId]);

  const pendingSentIds = useMemo(
    () =>
      friendships
        .filter((f) => f.status === "pending" && f.userId === currentId)
        .map((f) => f.friendId),
    [friendships, currentId],
  );

  const filteredUsers = useMemo(() => {
    const exclude = new Set([
      currentId,
      ...friends.map((f) => f.id),
      ...pendingReceived.map((p) => p.id),
      ...pendingSentIds,
    ]);
    let list = allUsers.filter((u) => !exclude.has(u.id));
    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(qq) ||
          u.email.toLowerCase().includes(qq),
      );
    }
    return list.slice(0, 20);
  }, [allUsers, friends, pendingReceived, pendingSentIds, q, currentId]);

  const leaderboard = useMemo(() => {
    // sort by targetBand + planType weight
    const weight = (u: UserProfile) =>
      u.targetBand * 10 +
      (u.planType === "pro" ? 5 : u.planType === "premium" ? 3 : 0);
    return [...allUsers].sort((a, b) => weight(b) - weight(a)).slice(0, 10);
  }, [allUsers]);

  const handleAdd = (friendId: string) => {
    if (!currentId) {
      toast("Login kerak", "error");
      return;
    }
    if (friendId === currentId) {
      toast("O‘zingizni qo‘sholmaysiz", "error");
      return;
    }
    const exists = friendships.some(
      (f) =>
        (f.userId === currentId && f.friendId === friendId) ||
        (f.userId === friendId && f.friendId === currentId),
    );
    if (exists) {
      toast("Allaqachon so‘rov bor", "info");
      return;
    }
    const newF: Friendship = {
      id: `fr_${Date.now()}`,
      userId: currentId,
      friendId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setFriendships((prev) => [...prev, newF]);
    toast("So‘rov yuborildi", "success");
    setRefresh((x) => x + 1);
  };

  const handleAccept = (requesterId: string) => {
    if (!currentId) return;
    setFriendships((prev) =>
      prev.map((f) =>
        f.userId === requesterId &&
        f.friendId === currentId &&
        f.status === "pending"
          ? { ...f, status: "accepted" as const }
          : f,
      ),
    );
    toast("Qabul qilindi", "success");
    setRefresh((x) => x + 1);
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Friends"
          title="Do'stlar ro'yxati"
          description="Login qiling va do'stlar qo'shing."
        />
        <Card>
          <CardContent className="py-10 text-center text-slate-500">
            Iltimos login qiling.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Friendlist — Do'stlar"
        title="Do'stlar ro'yxati"
        description="Do'stlaringizni qo'shing, progressini ko'ring, birga bellashing."
        actions={
          <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 ring-1 ring-violet-200 dark:bg-violet-950/40">
            {friends.length} do'st
          </span>
        }
      />

      <Card>
        <CardContent className="flex gap-2 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Qidirish: ism yoki email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={() => setQ("")}>
            Tozalash
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-violet-600" /> Do'stlarim (
                {friends.length}){" "}
                <Badge tone="emerald">{friends.length} online</Badge>
              </CardTitle>
              <CardDescription>
                Accepted friends — birga progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {friends.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                  Hali do'st yo'q. Pastdagi foydalanuvchilardan qo'shing! 👇
                </div>
              ) : (
                friends.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <Avatar name={u.name} color={u.avatarColor} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{u.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {u.email} · Band {u.targetBand} · {u.planType}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/30">
                      Do'st ✓
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5 text-amber-600" /> So'rovlar (
                {pendingReceived.length})
              </CardTitle>
              <CardDescription>
                Sizni do'st qilmoqchi bo'lganlar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingReceived.length === 0 ? (
                <div className="rounded-xl bg-slate-50 py-6 text-center text-sm text-slate-500 dark:bg-slate-900">
                  So'rov yo'q.
                </div>
              ) : (
                pendingReceived.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30"
                  >
                    <Avatar name={u.name} color={u.avatarColor} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-bold">{u.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {u.email}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleAccept(u.id)}>
                      <Check className="h-4 w-4" /> Qabul
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-5 w-5 text-brand-600" /> Foydalanuvchilar{" "}
                {q && (
                  <span className="text-xs font-normal text-slate-500">
                    — "{q}"
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Taklif yuboring — ular qabul qilgach do'st bo'lasiz.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-400">
                  Foydalanuvchi topilmadi.
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isPending = pendingSentIds.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <Avatar name={u.name} color={u.avatarColor} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{u.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {u.email} · Band {u.targetBand}
                        </p>
                      </div>
                      {isPending ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                          Yuborildi
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdd(u.id)}
                        >
                          <UserPlus className="h-4 w-4" /> Qo'shish
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-5 w-5 text-amber-400" /> Leaderboard
              </CardTitle>
              <CardDescription className="text-slate-300">
                Eng yuqori Band & Premium
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {leaderboard.map((u, idx) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold text-white ${idx === 0 ? "bg-amber-500" : idx === 1 ? "bg-slate-400" : idx === 2 ? "bg-amber-700" : "bg-white/15"}`}
                  >
                    {idx + 1}
                  </span>
                  <Avatar name={u.name} color={u.avatarColor} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">
                      {u.name}
                    </p>
                    <p className="truncate text-xs text-slate-300">
                      Band {u.targetBand} · {u.planType}
                    </p>
                  </div>
                  {idx === 0 && <Crown className="h-4 w-4 text-amber-400" />}
                  <span className="rounded-full bg-white/15 px-2 py-1 text-xs font-bold">
                    Lv {Math.round(u.targetBand * 10)}
                  </span>
                </div>
              ))}
              <Button
                variant="outline"
                className="mt-2 w-full border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                🎮 Play da bellash →
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                💡 Do'stlar bilan nima qilasiz?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-violet-100 p-1.5 dark:bg-violet-900/50">
                  👥
                </span>{" "}
                Progressni solishtirish
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-900/50">
                  🎮
                </span>{" "}
                Mock Test da 1v1
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-amber-100 p-1.5 dark:bg-amber-900/50">
                  🔥
                </span>{" "}
                Birga streak yig'ish
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-rose-100 p-1.5 dark:bg-rose-900/50">
                  🎁
                </span>{" "}
                Market gift (tez kunda)
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="flex items-center gap-2 py-4 text-sm text-slate-500">
              <Flame className="h-4 w-4 text-orange-500" /> Hozir{" "}
              {allUsers.length} ta foydalanuvchi · {friendships.length} ta aloqa
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
