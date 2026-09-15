"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { LoginResponse, RegisterPayload, RegisterResponse, SafeUser } from "@/types/auth";
import { clearSessionHint, markSessionLikely } from "@/lib/session-hint";

interface AuthContextValue {
  user: SafeUser | null;
  isLoading: boolean; // true while we check for an existing session on first load
  login: (email: string, password: string) => Promise<SafeUser>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  refreshUser: () => Promise<SafeUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On first load, ask the API who the ambient httpOnly cookie (if any)
  // belongs to via GET /auth/me. This still cannot be skipped client-side —
  // JS can't read an httpOnly cookie, so there is no way to know locally
  // whether a session exists without asking. A 401 here just means "not
  // logged in," not an error.
  //
  // What the session hint changes is only what happens AFTER that 401:
  // apiFetch no longer chases it with a refresh for a browser that has never
  // had a session. So this is the place the hint has to be set — it is the
  // one path every kind of login ends up on. Google and Apple set their
  // cookies server-side and redirect, so login() never runs for them, and
  // marking the hint only there would sign those users out the first time
  // their access token expired.
  useEffect(() => {
    async function bootstrap() {
      try {
        const me = await apiFetch<SafeUser>("/auth/me");
        setUser(me);
        markSessionLikely();
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    bootstrap();
  }, []);

  async function login(email: string, password: string) {
    const data = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    setUser(data.user);
    markSessionLikely();
    return data.user;
  }

  async function register(payload: RegisterPayload) {
    return apiFetch<RegisterResponse>("/auth/register", {
      method: "POST",
      body: payload,
      auth: false,
    });
  }

  async function logout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // even if the network call fails, still clear local state
    }
    setUser(null);
    clearSessionHint();
    // /auth/login, not /login — there has never been a route at the latter,
    // so logging out sent every user to a 404. Nothing in the app links to
    // it, which is why nothing caught this until check:dead-ends did.
    router.push("/auth/login");
  }

  async function sendOtp(phone: string) {
    await apiFetch("/auth/send-otp", { method: "POST", body: { phone } });
  }

  async function verifyOtp(phone: string, code: string) {
    await apiFetch("/auth/verify-otp", { method: "POST", body: { phone, code } });
    await refreshUser();
  }

  async function refreshUser() {
    try {
      const me = await apiFetch<SafeUser>("/auth/me");
      setUser(me);
      // Covers every way a session can start, not just the login form —
      // Google and Apple set their cookies server-side and redirect, so this
      // is the first moment the client learns a session exists at all.
      markSessionLikely();
      return me;
    } catch {
      return null;
    }
  }

  const value: AuthContextValue = {
    user,
    isLoading,
    login,
    register,
    logout,
    sendOtp,
    verifyOtp,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
