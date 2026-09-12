import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export function Signup() {
  const { signup, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Please enter a valid email address.";
    if (password.length < 6)
      next.password = "Password must be at least 6 characters.";
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await signup(name, email, password);
      toast("Account created — welcome to IELTS Master! 🎉", "success");
      navigate("/app", { replace: true });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Sign up failed", "error");
    }
  };

  return (
    <div>
      <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">New account</div>
      <h1 className="font-display text-[26px] font-black tracking-tight text-[#0a0a0f] dark:text-white">
        Create your account
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Start free — no credit card required. Cancel anytime.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <Field label="Full name" error={errors.name} required>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
              placeholder="Alex Carter"
              invalid={Boolean(errors.name)}
              autoComplete="name"
            />
          </div>
        </Field>
        <Field label="Email" error={errors.email} required>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              placeholder="you@example.com"
              invalid={Boolean(errors.email)}
              autoComplete="email"
            />
          </div>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" error={errors.password} required>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-9"
                placeholder="Min. 6 characters"
                invalid={Boolean(errors.password)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </Field>
          <Field label="Confirm password" error={errors.confirm} required>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              invalid={Boolean(errors.confirm)}
              autoComplete="new-password"
            />
          </Field>
        </div>

        <label className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded accent-brand-700"
          />
          I agree to the Terms of Service and Privacy Policy.
        </label>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create account <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-bold text-brand-700 transition hover:text-brand-800 dark:text-brand-400"
        >
          Log in
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-slate-400">
        By signing up you agree to receive practice reminders — you can
        unsubscribe anytime.
      </p>
    </div>
  );
}
