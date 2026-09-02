import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Target,
  Calendar,
  Clock,
  Bell,
  Shield,
  LogOut,
  RotateCcw,
  Save,
  Crown,
} from "lucide-react";
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
import { Field, Input, Select } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { useToast } from "@/context/ToastContext";

export function Settings() {
  const { user, updateUser, logout } = useAuth();
  const progress = useProgress();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [targetBand, setTargetBand] = useState(String(user?.targetBand ?? 7.5));
  const [examDate, setExamDate] = useState(user?.examDate ?? "");
  const [dailyGoalMin, setDailyGoalMin] = useState(
    String(user?.dailyGoalMin ?? 30),
  );
  const [saving, setSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Settings"
          title="Settings"
          description="Account and preferences."
        />
        <Card>
          <CardContent>
            <p className="py-8 text-center text-sm text-slate-500">
              No user session — please log in.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    if (!name.trim() || name.trim().length < 2) {
      toast("Name must be at least 2 characters.", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast("Please enter a valid email address.", "error");
      return;
    }
    const band = Number(targetBand);
    if (Number.isNaN(band) || band < 0 || band > 9) {
      toast("Target band must be between 0 and 9.", "error");
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      updateUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        targetBand: Math.round(band * 2) / 2,
        examDate,
        dailyGoalMin: Number(dailyGoalMin),
      });
      setSaving(false);
      toast("Profile updated successfully!", "success");
    }, 500);
  };

  const handleNotifications = (
    key: "practice" | "reminders" | "results",
    checked: boolean,
  ) => {
    updateUser({
      notifications: { ...user.notifications, [key]: checked },
    });
    toast(`${key} notifications ${checked ? "enabled" : "disabled"}.`, "info");
  };

  const handleReset = () => {
    progress.resetProgress();
    setShowResetModal(false);
    toast("Progress reset — fresh start!", "success");
  };

  const handleLogout = () => {
    logout();
    toast("Logged out. See you soon!", "info");
    navigate("/login");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Account and preferences"
        description="Manage your profile, study goals, notifications and data."
        actions={
          <Badge
            tone={
              user.planType === "premium"
                ? "violet"
                : user.planType === "pro"
                  ? "amber"
                  : "slate"
            }
            className="gap-1.5"
          >
            <Crown className="h-3 w-3" />{" "}
            {user.planType.charAt(0).toUpperCase() + user.planType.slice(1)}{" "}
            plan
          </Badge>
        }
      />

      {/* Profile form */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-slate-400" /> Profile
            </CardTitle>
            <CardDescription>
              Your personal details and exam targets.
            </CardDescription>
          </div>
          <Badge tone="slate">
            <Shield className="h-3 w-3" /> {user.id}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="pl-9"
                />
              </div>
            </Field>
            <Field label="Email" required>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9"
                />
              </div>
            </Field>
            <Field label="Target band" hint="Half bands allowed, e.g. 6.5">
              <div className="relative">
                <Target className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Select
                  value={targetBand}
                  onChange={(e) => setTargetBand(e.target.value)}
                  className="pl-9"
                >
                  {[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((b) => (
                    <option key={b} value={String(b)}>
                      Band {b.toFixed(1)}
                    </option>
                  ))}
                </Select>
              </div>
            </Field>
            <Field label="Exam date">
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="pl-9"
                />
              </div>
            </Field>
            <Field label="Daily goal">
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Select
                  value={dailyGoalMin}
                  onChange={(e) => setDailyGoalMin(e.target.value)}
                  className="pl-9"
                >
                  <option value="15">15 min / day</option>
                  <option value="30">30 min / day</option>
                  <option value="45">45 min / day</option>
                  <option value="60">60 min / day</option>
                  <option value="90">90 min / day</option>
                </Select>
              </div>
            </Field>
            <Field label="Plan type">
              <div className="flex h-[42px] items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold capitalize text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Crown className="mr-2 h-4 w-4 text-amber-500" />{" "}
                {user.planType} —{" "}
                {user.planType === "free"
                  ? "Upgrade for mocks & insights"
                  : "All features unlocked"}
              </div>
            </Field>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setName(user.name);
                setEmail(user.email);
                setTargetBand(String(user.targetBand));
                setExamDate(user.examDate);
                setDailyGoalMin(String(user.dailyGoalMin));
                toast("Changes discarded.", "info");
              }}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-slate-400" /> Notifications
            </CardTitle>
            <CardDescription>
              Choose what we notify you about. Toggle anytime.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Practice reminders
              </p>
              <p className="text-xs text-slate-400">
                Daily nudge to keep your streak alive.
              </p>
            </div>
            <Switch
              checked={user.notifications.practice}
              onChange={(v) => handleNotifications("practice", v)}
              label="Practice reminders"
            />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Study reminders
              </p>
              <p className="text-xs text-slate-400">
                Upcoming exam and weekly plan alerts.
              </p>
            </div>
            <Switch
              checked={user.notifications.reminders}
              onChange={(v) => handleNotifications("reminders", v)}
              label="Study reminders"
            />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Results & feedback
              </p>
              <p className="text-xs text-slate-400">
                When mock and practice results are ready.
              </p>
            </div>
            <Switch
              checked={user.notifications.results}
              onChange={(v) => handleNotifications("results", v)}
              label="Results notifications"
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-rose-200 dark:border-rose-900">
        <CardHeader>
          <div>
            <CardTitle className="text-rose-700 dark:text-rose-300">
              Danger zone
            </CardTitle>
            <CardDescription>
              Irreversible actions — proceed with care.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30">
            <div>
              <p className="text-sm font-bold text-rose-800 dark:text-rose-200">
                Reset progress
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-300">
                Clear mock history, band history and streaks. Lessons and
                account stay.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowResetModal(true)}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300"
            >
              <RotateCcw className="h-4 w-4" /> Reset progress
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Log out
              </p>
              <p className="text-xs text-slate-400">
                End your session on this device.
              </p>
            </div>
            <Button variant="danger" onClick={() => setShowLogoutModal(true)}>
              <LogOut className="h-4 w-4" /> Log out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset all progress?"
        description="This will clear your band history, weekly activity, mock results and achievements. It cannot be undone."
      >
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowResetModal(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReset} className="flex-1">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </Modal>

      <Modal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Log out?"
        description="You will need to log in again to access your dashboard."
      >
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowLogoutModal(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout} className="flex-1">
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </Modal>
    </div>
  );
}
