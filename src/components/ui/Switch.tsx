import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  className,
  ...props
}: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label ?? "Toggle"}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        checked
          ? "bg-brand-600 dark:bg-brand-500"
          : "bg-slate-300 dark:bg-slate-700",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
