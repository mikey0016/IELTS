import { useEffect, useState } from "react";
import { adminGetStats } from "@/api/admin";
import type { AdminStats } from "@/api/admin";
import {
  Users,
  BookOpen,
  BookMarked,
  ClipboardCheck,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      tone: "brand" as const,
    },
    {
      label: "Active Users",
      value: stats.activeUsers,
      icon: TrendingUp,
      tone: "emerald" as const,
    },
    {
      label: "Questions",
      value: stats.totalQuestions,
      icon: BookOpen,
      tone: "amber" as const,
    },
    {
      label: "Vocabulary",
      value: stats.totalWords,
      icon: BookMarked,
      tone: "violet" as const,
    },
    {
      label: "Mock Tests",
      value: stats.totalMocks,
      icon: ClipboardCheck,
      tone: "rose" as const,
    },
    {
      label: "Revenue Estimate",
      value: `$${stats.revenueEstimate}`,
      icon: DollarSign,
      tone: "emerald" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          System overview and key metrics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {card.value}
                </p>
              </div>
              <card.icon className="h-8 w-8 text-slate-400" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Band Distribution
          </h3>
          <div className="mt-4 space-y-2">
            {stats.bandDistribution.map((item) => (
              <div key={item.band} className="flex items-center gap-3">
                <span className="w-12 text-sm font-medium text-slate-600 dark:text-slate-400">
                  {item.band}
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-brand"
                    style={{
                      width: `${Math.max(0, (item.count / Math.max(1, stats.totalUsers)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right text-sm text-slate-500">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Plan Distribution
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {stats.planDistribution.map((item) => (
              <Badge
                key={item.plan}
                tone={
                  item.plan === "pro"
                    ? "violet"
                    : item.plan === "premium"
                      ? "brand"
                      : "slate"
                }
              >
                {item.plan}: {item.count}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Recent Activity
        </h3>
        <div className="mt-4 space-y-3">
          {stats.recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 dark:border-slate-800"
            >
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {activity.user}
                </p>
                <p className="text-xs text-slate-500">{activity.action}</p>
              </div>
              <span className="text-xs text-slate-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
