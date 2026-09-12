import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const INPUT_CLASS =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 shadow-[0_1px_2px_rgb(10_10_15/0.04)] transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:shadow-[0_0_0_4px_rgb(99_102_241/0.08)] disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/35 dark:focus:bg-white/[0.08] dark:focus:border-violet-500";

interface FieldWrapperProps { label?: string; error?: string; hint?: string; required?: boolean; children: ReactNode; }

export function Field({ label, error, hint, required, children }: FieldWrapperProps) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-[13px] font-bold tracking-tight text-slate-800 dark:text-white/90">{label}{required && <span className="text-rose-500"> *</span>}</label>}
      {children}
      {error ? <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">{error}</p> : hint ? <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> { invalid?: boolean; }
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, invalid, ...props }, ref) {
  return <input ref={ref} className={cn(INPUT_CLASS, invalid && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10", className)} {...props} />;
});
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(INPUT_CLASS, "min-h-[140px] resize-y py-3", className)} {...props} />;
});
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
  return <select ref={ref} className={cn(INPUT_CLASS, "appearance-none pr-10", className)} {...props}>{children}</select>;
});
