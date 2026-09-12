import { useEffect, useState } from "react";
import { adminGetStats } from "@/api/admin";
import type { AdminStats } from "@/api/admin";
import { Users, BookOpen, BookMarked, ClipboardCheck, TrendingUp, DollarSign, LayoutDashboard, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { isRealApi } from "@/api/http";

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-32 rounded-[24px] bg-slate-200 animate-pulse dark:bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-[20px]" />)}</div>
        <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-48 rounded-[20px]" /><Skeleton className="h-48 rounded-[20px]" /></div>
      </div>
    );
  }
  if (!stats) return <Card glass><CardContent className="py-10 text-center text-slate-500">No stats available.</CardContent></Card>;

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, tone: "brand" as const, grad: "from-violet-600 to-indigo-600" },
    { label: "Active Users", value: stats.activeUsers, icon: TrendingUp, tone: "emerald" as const, grad: "from-emerald-500 to-teal-600" },
    { label: "Questions", value: stats.totalQuestions, icon: BookOpen, tone: "amber" as const, grad: "from-amber-500 to-orange-600" },
    { label: "Vocabulary", value: stats.totalWords, icon: BookMarked, tone: "violet" as const, grad: "from-violet-500 to-purple-600" },
    { label: "Mock Tests", value: stats.totalMocks, icon: ClipboardCheck, tone: "rose" as const, grad: "from-rose-500 to-pink-600" },
    { label: "Revenue Estimate", value: `$${stats.revenueEstimate}`, icon: DollarSign, tone: "emerald" as const, grad: "from-emerald-600 to-green-700" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-[24px] bg-slate-900 p-7 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-slate-900 opacity-90" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur"><LayoutDashboard className="h-3.5 w-3.5" /> Admin — Dashboard {isRealApi() ? <span className="inline-flex items-center gap-1"><Database className="h-3 w-3" /> DB live</span> : "· Mock"}</p>
            <h1 className="mt-3 font-display text-2xl font-black tracking-tight">System overview</h1>
            <p className="mt-1.5 max-w-xl text-sm text-white/80">Key metrics · /api/admin/* — {isRealApi() ? "PostgreSQL connected" : "localStorage fallback"}</p>
          </div>
          <Badge tone="white" className="rounded-full">{stats.totalUsers} users · {stats.totalQuestions} Qs</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label} glass hover className="overflow-hidden">
            <div className={`h-1 w-full bg-gradient-to-r ${card.grad}`} />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{card.label}</p>
                  <p className="mt-1 font-display text-2xl font-black text-slate-900 dark:text-white">{card.value}</p>
                </div>
                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${card.grad} text-white shadow`}><card.icon className="h-5 w-5" /></span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card glass className="p-5">
          <h3 className="font-display text-[17px] font-bold dark:text-white">Band Distribution</h3>
          <div className="mt-4 space-y-3">
            {stats.bandDistribution.map((item) => (
              <div key={item.band} className="flex items-center gap-3">
                <span className="w-12 text-sm font-bold text-slate-600 dark:text-slate-400">{item.band}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-white/10"><div className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-brand-600" style={{ width: `${Math.max(0, (item.count / Math.max(1, stats.totalUsers)) * 100)}%` }} /></div>
                <span className="w-8 text-right text-sm font-bold text-slate-500">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card glass className="p-5">
          <h3 className="font-display text-[17px] font-bold dark:text-white">Plan Distribution</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {stats.planDistribution.map((item) => (
              <Badge key={item.plan} tone={item.plan === "pro" ? "violet" : item.plan === "premium" ? "brand" : "slate"} className="rounded-full">{item.plan}: {item.count}</Badge>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500 dark:bg-white/[0.04]">DB live via <code className="rounded bg-slate-200 px-1.5 py-0.5 dark:bg-white/10">/api/admin/stats</code> — counts update on real mutations.</div>
        </Card>
      </div>

      <Card glass className="p-5">
        <h3 className="font-display text-[17px] font-bold dark:text-white">Recent Activity</h3>
        <div className="mt-4 space-y-3">
          {stats.recentActivity.length === 0 ? <p className="text-sm text-slate-400">No recent activity.</p> : stats.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
              <div><p className="text-sm font-bold dark:text-white">{activity.user}</p><p className="text-xs text-slate-500">{activity.action}</p></div>
              <span className="text-xs font-medium text-slate-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
