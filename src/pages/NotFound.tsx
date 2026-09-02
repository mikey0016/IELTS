import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
        <Compass className="h-8 w-8" />
      </span>
      <h1 className="mt-6 font-display text-6xl font-extrabold text-slate-900 dark:text-white">
        404
      </h1>
      <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
        This page doesn't exist or has been moved. Let's get you back on track.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
        <Link to="/app">
          <Button variant="outline">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
