import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function AdminSettings() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          System configuration and preferences
        </p>
      </div>

      <Card className="p-5">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          General
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              App Name
            </label>
            <input
              defaultValue="IELTS Master"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Support Email
            </label>
            <input
              defaultValue="support@ieltsmaster.com"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Security
        </h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                Two-Factor Authentication
              </p>
              <p className="text-sm text-slate-500">
                Require 2FA for admin accounts
              </p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-slate-300"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                Session Timeout
              </p>
              <p className="text-sm text-slate-500">
                Auto-logout after inactivity
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-5 w-5 rounded border-slate-300"
            />
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave}>
          {saved ? "Saved!" : "Save Changes"}
        </Button>
        <Button variant="ghost">Reset</Button>
      </div>
    </div>
  );
}
