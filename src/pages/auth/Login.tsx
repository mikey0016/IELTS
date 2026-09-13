import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export function Login() {
  const { login, loginWithGoogle, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Please enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 4)
      next.password = "Password must be at least 4 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const profile = await login(email, password);
      toast("Welcome back! Ready to improve your score?", "success");
      const target =
        profile.role === "admin" || profile.role === "superadmin"
          ? "/admin"
          : from || "/app";
      navigate(target, { replace: true });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Login failed", "error");
    }
  };

  const onGoogle = async () => {
    setGoogleLoading(true);
    try {
      const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim();
      // Real Google OAuth if client ID configured and GIS available
      if (clientId && clientId.length > 10) {
        const idToken = await triggerGoogleOneTap(clientId);
        const profile = await loginWithGoogle(idToken);
        toast("Signed in with Google", "success");
        const target = profile.role === "admin" || profile.role === "superadmin" ? "/admin" : from || "/app";
        navigate(target, { replace: true });
        return;
      }
      // Fallback demo (old behavior) if no client ID
      const profile = await loginWithGoogle();
      toast("Signed in with Google (demo)", "success");
      const target = profile.role === "admin" || profile.role === "superadmin" ? "/admin" : from || "/app";
      navigate(target, { replace: true });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Google login failed", "error");
    } finally {
      setGoogleLoading(false);
    }
  };

  function triggerGoogleOneTap(clientId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const g = (window as unknown as { google?: { accounts: { id: { initialize: (o: unknown)=>void; prompt: (cb?:(n:{isNotDisplayed:()=>boolean})=>void)=>void } } } }).google;
      const doPrompt = () => {
        try {
          const google = (window as unknown as { google: { accounts: { id: { initialize: (o: {client_id:string; callback:(r:{credential:string})=>void; auto_select?:boolean; cancel_on_tap_outside?:boolean})=>void; prompt:(cb?:(n:{isNotDisplayed:()=>boolean; isSkippedMoment:()=>boolean})=>void)=>void } } } }).google;
          google.accounts.id.initialize({
            client_id: clientId,
            callback: (resp: { credential: string }) => {
              if (resp?.credential) resolve(resp.credential);
              else reject(new Error("No credential returned"));
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              reject(new Error("Google prompt not displayed - check client ID and origin"));
            }
          });
        } catch (e) {
          reject(e as Error);
        }
      };
      if (g?.accounts?.id) {
        doPrompt();
        return;
      }
      // Load GIS script dynamically
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => doPrompt();
      script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
      document.head.appendChild(script);
    });
  }

  return (
    <div>
      <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:bg-white/10 dark:text-white/60">Welcome back</div>
      <h1 className="font-display text-[26px] font-black tracking-tight text-[#0a0a0f] dark:text-white">
        Log in to IELTS with Doniyor
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Continue your IELTS journey — your study plan is waiting.
      </p>

      <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          <b>Demo account:</b> alex@ieltsmaster.com / demo1234
        </span>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
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
        <Field label="Password" error={errors.password} required>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              placeholder="••••••••"
              invalid={Boolean(errors.password)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded accent-brand-700"
            />{" "}
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="font-semibold text-brand-700 transition hover:text-brand-800 dark:text-brand-400"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Log in <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          or continue with
        </span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={onGoogle}
        loading={googleLoading}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.97 10.97 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z"
          />
        </svg>
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-bold text-brand-700 transition hover:text-brand-800 dark:text-brand-400"
        >
          Create one — it's free
        </Link>
      </p>
    </div>
  );
}
