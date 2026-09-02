import { useEffect } from "react";
import { useToast } from "@/context/ToastContext";

export function XpToastListener() {
  const { toast } = useToast();
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        coins: number;
        xp: number;
        msg: string;
      };
      if (!detail) return;
      toast(`${detail.msg} · +${detail.coins}🪙 +${detail.xp} XP`, "success");
    };
    window.addEventListener("xp:gain", handler as EventListener);
    return () =>
      window.removeEventListener("xp:gain", handler as EventListener);
  }, [toast]);
  return null;
}
