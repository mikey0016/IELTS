import type { UserProfile } from "@/types";
import { storage } from "@/lib/storage";
import { randomId } from "@/lib/format";
import { mockRequest, MockApiError } from "./mockClient";
import { apiFetch, isRealApi, setToken } from "./http";

const USERS_KEY = "users";

const DEMO_USER: UserProfile = {
  id: "u_demo",
  name: "Alex Carter",
  email: "alex@ieltsmaster.com",
  avatarColor: "#4c56ec",
  targetBand: 7.5,
  examDate: "2026-12-15",
  dailyGoalMin: 30,
  notifications: { practice: true, reminders: true, results: true },
  planType: "premium",
  role: "student",
  status: "active",
  createdAt: "2025-11-10T10:00:00.000Z",
  lastActiveAt: new Date().toISOString(),
};

const ADMIN_USER: UserProfile = {
  id: "u_admin",
  name: "Admin Master",
  email: "admin@ieltsmaster.com",
  avatarColor: "#7c3aed",
  targetBand: 9,
  examDate: "",
  dailyGoalMin: 60,
  notifications: { practice: true, reminders: true, results: true },
  planType: "pro",
  role: "admin",
  status: "active",
  createdAt: "2025-01-01T08:00:00.000Z",
  lastActiveAt: new Date().toISOString(),
};

const SUPERADMIN_USER: UserProfile = {
  id: "u_superadmin",
  name: "Super Admin",
  email: "superadmin@ieltsmaster.com",
  avatarColor: "#0f172a",
  targetBand: 9,
  examDate: "",
  dailyGoalMin: 60,
  notifications: { practice: true, reminders: true, results: true },
  planType: "pro",
  role: "superadmin",
  status: "active",
  createdAt: "2024-12-01T08:00:00.000Z",
  lastActiveAt: new Date().toISOString(),
};

const OWNER_USER: UserProfile = {
  id: "u_owner_vmd",
  name: "vmd_xz",
  email: "vmd_xz@gmail.com",
  avatarColor: "#0f172a",
  targetBand: 9,
  examDate: "",
  dailyGoalMin: 60,
  notifications: { practice: true, reminders: true, results: true },
  planType: "pro",
  role: "superadmin",
  status: "active",
  createdAt: "2024-12-01T08:00:00.000Z",
  lastActiveAt: new Date().toISOString(),
};

const GOOGLE_USER: UserProfile = {
  id: "u_google",
  name: "Alex Carter",
  email: "alex.carter@gmail.com",
  avatarColor: "#0ea5e9",
  targetBand: 7,
  examDate: "",
  dailyGoalMin: 30,
  notifications: { practice: true, reminders: true, results: true },
  planType: "free",
  role: "student",
  status: "active",
  createdAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
};

export const ADMIN_CREDENTIALS = {
  email: "admin@ieltsmaster.com",
  password: "admin123",
};
export const SUPERADMIN_CREDENTIALS = {
  email: "superadmin@ieltsmaster.com",
  password: "superadmin123",
};
export const OWNER_CREDENTIALS = {
  email: "vmd_xz@gmail.com",
  password: "Faxa2000",
};

const USERS_SEEDED_KEY = "users_seeded_v2";

const DEMO_STUDENTS_SEED: UserProfile[] = [
  {
    id: "u_s1",
    name: "Sarvar Rahimov",
    email: "sarvar.r@ielts.uz",
    avatarColor: "#305c8d",
    targetBand: 8,
    examDate: "2026-09-20",
    dailyGoalMin: 45,
    notifications: { practice: true, reminders: true, results: true },
    planType: "premium",
    role: "student",
    status: "active",
    createdAt: "2026-02-14T09:00:00Z",
    lastActiveAt: "2026-08-26T10:30:00Z",
  },
  {
    id: "u_s2",
    name: "Madina Yusupova",
    email: "madina.y@ielts.uz",
    avatarColor: "#7c3aed",
    targetBand: 7.5,
    examDate: "2026-10-05",
    dailyGoalMin: 30,
    notifications: { practice: true, reminders: false, results: true },
    planType: "premium",
    role: "student",
    status: "active",
    createdAt: "2026-03-01T09:00:00Z",
    lastActiveAt: "2026-08-27T08:00:00Z",
  },
  {
    id: "u_s3",
    name: "Jasur Toshpulatov",
    email: "jasur.t@ielts.uz",
    avatarColor: "#0e7490",
    targetBand: 7,
    examDate: "2026-11-12",
    dailyGoalMin: 30,
    notifications: { practice: true, reminders: true, results: false },
    planType: "free",
    role: "student",
    status: "banned",
    createdAt: "2026-01-20T09:00:00Z",
    lastActiveAt: "2026-07-15T09:00:00Z",
    bannedReason: "Spam activity",
  },
  {
    id: "u_s4",
    name: "Nilufar Azimova",
    email: "nilufar.a@ielts.uz",
    avatarColor: "#059669",
    targetBand: 8.5,
    examDate: "2026-08-30",
    dailyGoalMin: 60,
    notifications: { practice: true, reminders: true, results: true },
    planType: "pro",
    role: "student",
    status: "active",
    createdAt: "2025-12-05T09:00:00Z",
    lastActiveAt: "2026-08-28T07:00:00Z",
  },
  {
    id: "u_s5",
    name: "Otabek Karimov",
    email: "otabek.k@ielts.uz",
    avatarColor: "#d97706",
    targetBand: 6.5,
    examDate: "2026-12-01",
    dailyGoalMin: 30,
    notifications: { practice: false, reminders: true, results: true },
    planType: "free",
    role: "student",
    status: "pending",
    createdAt: "2026-08-20T09:00:00Z",
    lastActiveAt: "2026-08-20T09:00:00Z",
  },
];

function seedUsers(existing: UserProfile[]): UserProfile[] {
  const alreadySeeded = storage.get<boolean>(USERS_SEEDED_KEY, false);
  // Faqat birinchi marta seed — o'chirilgan userlar (masalan Alex Carter u_demo) qayta paydo bo'lmasin
  if (!alreadySeeded) {
    let changed = false;
    if (existing.length === 0) {
      for (const seed of [DEMO_USER, ADMIN_USER, SUPERADMIN_USER, OWNER_USER]) {
        if (!existing.some((u) => u.id === seed.id)) {
          existing.unshift(seed);
          changed = true;
        }
      }
      for (const s of DEMO_STUDENTS_SEED) {
        if (!existing.some((u) => u.id === s.id)) {
          existing.push(s);
          changed = true;
        }
      }
    }
    storage.set(USERS_SEEDED_KEY, true);
    if (changed) storage.set(USERS_KEY, existing);
  }
  return existing;
}

export function getAllUsers(): UserProfile[] {
  const raw = storage.get<UserProfile[] | null>(USERS_KEY, null);
  if (raw === null) return seedUsers([]);
  // legacy migration: if we have data but never set flag, set flag to prevent future re-seed of deleted students
  const flag = storage.get<boolean>(USERS_SEEDED_KEY, false);
  if (!flag && raw.length > 0) {
    storage.set(USERS_SEEDED_KEY, true);
  }
  const users = seedUsers(raw);
  // owner migratsiyasi — eski install'larda vmd_xz yo'q bo'lsa qo'shamiz
  if (!users.some((u) => u.id === OWNER_USER.id)) {
    users.unshift(OWNER_USER);
    storage.set(USERS_KEY, users);
  }
  return users;
}

function saveUsers(users: UserProfile[]) {
  storage.set(USERS_KEY, users);
}

export async function loginUser(
  email: string,
  password: string,
): Promise<UserProfile> {
  if (isRealApi()) {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    storage.set("session", data.user);
    return data.user as UserProfile;
  }
  await new Promise((r) => setTimeout(r, 700));
  const normalized = email.trim().toLowerCase();
  // hard-coded credentials — respect banned status from storage and return stored profile if exists
  const checkBannedAndGetStored = (emailLower: string): UserProfile | null => {
    const stored = getAllUsers().find((u) => u.email.toLowerCase() === emailLower);
    if (stored?.status === "banned") {
      throw new MockApiError(`Account banned: ${stored.bannedReason ?? "contact support"}`);
    }
    return stored ?? null;
  };
  if (
    normalized === ADMIN_CREDENTIALS.email &&
    password === ADMIN_CREDENTIALS.password
  ) {
    const stored = checkBannedAndGetStored(normalized);
    const profile = stored ?? ADMIN_USER;
    // touch lastActive
    const users = getAllUsers();
    const idx = users.findIndex((u) => u.id === profile.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], lastActiveAt: new Date().toISOString() };
      storage.set(USERS_KEY, users);
      return users[idx];
    }
    return profile;
  }
  if (
    normalized === SUPERADMIN_CREDENTIALS.email &&
    password === SUPERADMIN_CREDENTIALS.password
  ) {
    const stored = checkBannedAndGetStored(normalized);
    const profile = stored ?? SUPERADMIN_USER;
    const users = getAllUsers();
    const idx = users.findIndex((u) => u.id === profile.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], lastActiveAt: new Date().toISOString() };
      storage.set(USERS_KEY, users);
      return users[idx];
    }
    return profile;
  }
  if (
    normalized === OWNER_CREDENTIALS.email &&
    password === OWNER_CREDENTIALS.password
  ) {
    const stored = checkBannedAndGetStored(normalized);
    const profile = stored ?? OWNER_USER;
    const users = getAllUsers();
    const idx = users.findIndex((u) => u.id === profile.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], lastActiveAt: new Date().toISOString() };
      storage.set(USERS_KEY, users);
      return users[idx];
    }
    return profile;
  }
  if (normalized === "demo@ieltsmaster.com" && password === "demo1234") {
    const stored = checkBannedAndGetStored(normalized);
    const profile = stored ?? DEMO_USER;
    const users = getAllUsers();
    const idx = users.findIndex((u) => u.id === profile.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], lastActiveAt: new Date().toISOString() };
      storage.set(USERS_KEY, users);
      return users[idx];
    }
    return profile;
  }
  const found = getAllUsers().find((u) => u.email.toLowerCase() === normalized);
  if (!found || password.length < 4) {
    throw new MockApiError(
      "Invalid email or password. Try demo@ieltsmaster.com / demo1234 or admin@ieltsmaster.com / admin123.",
    );
  }
  if (found.status === "banned")
    throw new MockApiError(
      `Account banned: ${found.bannedReason ?? "contact support"}`,
    );
  // touch lastActive
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === found.id);
  if (idx >= 0) {
    users[idx] = { ...users[idx], lastActiveAt: new Date().toISOString() };
    storage.set(USERS_KEY, users);
  }
  return found;
}

export async function signupUser(
  name: string,
  email: string,
  password: string,
): Promise<UserProfile> {
  if (isRealApi()) {
    const data = await apiFetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setToken(data.token);
    storage.set("session", data.user);
    return data.user as UserProfile;
  }
  await new Promise((r) => setTimeout(r, 800));
  const users = getAllUsers();
  const normalized = email.trim().toLowerCase();
  if (!name || name.length < 2)
    throw new MockApiError("Please enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new MockApiError("Please enter a valid email address.");
  if (password.length < 6)
    throw new MockApiError("Password must be at least 6 characters.");
  if (users.some((u) => u.email.toLowerCase() === normalized)) {
    throw new MockApiError(
      "An account with this email already exists. Please log in.",
    );
  }
  const profile: UserProfile = {
    id: randomId("u"),
    name: name.trim(),
    email: normalized,
    avatarColor: "#7c3aed",
    targetBand: 7,
    examDate: "",
    dailyGoalMin: 30,
    notifications: { practice: true, reminders: true, results: true },
    planType: "free",
    role: "student",
    status: "active",
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };
  saveUsers([...users, profile]);
  return profile;
}

export async function googleLogin(): Promise<UserProfile> {
  if (isRealApi()) {
    const data = await apiFetch("/api/auth/google", { method: "POST" });
    setToken(data.token);
    storage.set("session", data.user);
    return data.user as UserProfile;
  }
  await new Promise((r) => setTimeout(r, 900));
  return GOOGLE_USER;
}

export async function forgotPasswordRequest(email: string): Promise<void> {
  if (isRealApi()) {
    await apiFetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return;
  }
  await new Promise((r) => setTimeout(r, 900));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new MockApiError("Please enter a valid email address.");
  }
  // Mock: always "sends" a reset link.
  return undefined;
}

export async function fetchDemoUser(): Promise<UserProfile> {
  return mockRequest(() => DEMO_USER, 300);
}
