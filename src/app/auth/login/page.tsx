"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/auth/Button";
import { Banner } from "@/components/auth/Banner";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your Aynu account."
      footer={
        <>
          New to Aynu?{" "}
          <Link href="/auth/register" className="font-semibold text-indigo">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && <Banner kind="error">{error}</Banner>}

        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div>
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="-mt-3 mb-4 text-right">
            <Link href="/auth/forgot-password" className="text-xs font-semibold text-indigo">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" loading={loading}>
          Log in
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1 bg-hairline" />
        <span className="text-xs text-faint">or continue with</span>
        <div className="h-px flex-1 bg-hairline" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <a href={`${API_URL}/auth/google`}>
          <Button type="button" variant="ghost">
            Google
          </Button>
        </a>
        <a href={`${API_URL}/auth/apple`}>
          <Button type="button" variant="ghost">
            Apple
          </Button>
        </a>
      </div>
    </AuthShell>
  );
}
