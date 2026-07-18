"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { LoginResponse, RegisterPayload, RegisterResponse, SafeUser } from "@/types/auth";

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
  // belongs to via GET /auth/me. Unlike the old localStorage version, this
  // can't be skipped client-side first — JS can't read an httpOnly cookie,
  // so there's no way to know locally whether a session exists without
  // asking the server. A 401 here just means "not logged in," not an error.
  useEffect(() => {
    async function bootstrap() {
      try {
        const me = await apiFetch<SafeUser>("/auth/me");
        setUser(me);
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
    router.push("/login");
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
