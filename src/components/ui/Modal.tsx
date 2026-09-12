import { useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

export function Modal({ open, onClose, title, description, children, size = "md", className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
      <div className="animate-fade-in absolute inset-0 bg-[#0a0a0f]/60 backdrop-blur-xl" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" className={cn("animate-scale-in relative w-full rounded-[28px] border border-white/20 bg-white p-7 shadow-[0_24px_64px_rgb(10_10_15/0.25)] dark:bg-[#12121a] dark:border-white/10", SIZES[size], className)}>
        <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/30 to-transparent opacity-60 dark:from-white/[0.02]" />
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white/60">
          <X className="h-4 w-4" />
        </button>
        <div className="relative">
          {title && <h2 className="font-display pr-8 text-[19px] font-bold tracking-tight text-[#0a0a0f] dark:text-white">{title}</h2>}
          {description && <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
