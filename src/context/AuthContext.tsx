import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { UserProfile } from "@/types";
import { storage } from "@/lib/storage";
import {
  loginUser,
  signupUser,
  googleLogin,
  forgotPasswordRequest,
} from "@/api/auth";
import { setToken } from "@/api/http";

const SESSION_KEY = "session";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (patch: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() =>
    storage.get<UserProfile | null>(SESSION_KEY, null),
  );
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const profile = await loginUser(email, password);
      storage.set(SESSION_KEY, profile);
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        const profile = await signupUser(name, email, password);
        storage.set(SESSION_KEY, profile);
        setUser(profile);
        return profile;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await googleLogin();
      storage.set(SESSION_KEY, profile);
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await forgotPasswordRequest(email);
  }, []);

  const logout = useCallback(() => {
    storage.remove(SESSION_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      storage.set(SESSION_KEY, next);
      return next;
    });
  }, []);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuperAdmin = user?.role === "superadmin";

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      isSuperAdmin,
      login,
      signup,
      loginWithGoogle,
      forgotPassword,
      logout,
      updateUser,
    }),
    [
      user,
      loading,
      isAdmin,
      isSuperAdmin,
      login,
      signup,
      loginWithGoogle,
      forgotPassword,
      logout,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
