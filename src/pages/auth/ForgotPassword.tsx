import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSentTo(email);
      toast("Password reset link sent", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <div className="animate-scale-in text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-extrabold text-slate-900 dark:text-white">
          Check your inbox
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We sent a password reset link to{" "}
          <b className="text-slate-700 dark:text-slate-200">{sentTo}</b>. The
          link expires in 30 minutes.
        </p>
        <div className="mt-7 flex flex-col gap-2.5">
          <Button variant="outline" onClick={() => setSentTo(null)}>
            Use a different email
          </Button>
          <Link to="/login">
            <Button className="w-full">Back to login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>
      <h1 className="mt-5 font-display text-2xl font-extrabold text-slate-900 dark:text-white">
        Reset your password
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Enter the email you used to create your account and we'll send you a
        reset link.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <Field label="Email" error={error} required>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              placeholder="you@example.com"
              invalid={Boolean(error)}
            />
          </div>
        </Field>
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Send reset link
        </Button>
      </form>
    </div>
  );
}
