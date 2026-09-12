import { storage } from "@/lib/storage";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

// Real API faqat VITE_API_URL to'g'ri backend'ga ishora qilsa yoqiladi.
// example.com yoki bo'sh bo'lsa — mock (localStorage) ishlaydi.
const trimmed = (API_URL || "").trim().replace(/\/+$/, "");
const USE_REAL = trimmed.length > 5 && !trimmed.includes("example.com") && (() => { try { return URL.canParse(trimmed); } catch { return false; } })();

export const API_BASE_URL = trimmed;

export function isRealApi(): boolean {
  return USE_REAL;
}

export function getToken(): string | null {
  return storage.get<string | null>("auth_token", null);
}

export function setToken(token: string | null) {
  if (token) storage.set("auth_token", token);
  else storage.remove("auth_token");
}

export async function apiFetch(path: string, opts: RequestInit = {}) {
  if (!USE_REAL) throw new Error("Real API not configured");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as any),
  };
  if (API_BASE_URL.includes("ngrok")) headers["ngrok-skip-browser-warning"] = "true";
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }
  return data;
}
