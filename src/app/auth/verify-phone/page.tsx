"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/auth/Button";
import { Banner } from "@/components/auth/Banner";
import { OtpInput } from "@/components/auth/OtpInput";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function VerifyPhonePage() {
  const { user, isLoading, sendOtp, verifyOtp } = useAuth();
  const router = useRouter();

  const [phoneOverride, setPhoneOverride] = useState<string | null>(null);
  const phone = phoneOverride ?? (user?.phone ? String(user.phone) : "");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth/login");
  }, [isLoading, user, router]);

  async function handleSendCode() {
    setError(null);
    if (!/^\+?[1-9]\d{6,14}$/.test(phone)) {
      setError("Enter a valid international phone number, e.g. +9613123456.");
      return;
    }
    setLoading(true);
    try {
      await sendOtp(phone);
      setStep("code");
      setNotice("We sent a 6-digit code over WhatsApp.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send the code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setError(null);
    if (code.length !== 6) {
      setError("Enter all 6 digits.");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(phone, code);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That code didn't work. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading || !user) return null;

  return (
    <AuthShell
      title="Verify your phone"
      subtitle="Planners can reach you on WhatsApp once this is confirmed."
      footer={
        <button onClick={() => router.push("/dashboard")} className="font-semibold text-indigo">
          Skip for now
        </button>
      }
    >
      {error && <Banner kind="error">{error}</Banner>}
      {notice && step === "code" && <Banner kind="success">{notice}</Banner>}

      {step === "phone" && (
        <>
          <FormField
            label="Phone number"
            name="phone"
            type="tel"
            placeholder="+9613123456"
            value={phone}
            onChange={(e) => setPhoneOverride(e.target.value)}
          />
          <Button onClick={handleSendCode} loading={loading}>
            Send code
          </Button>
        </>
      )}

      {step === "code" && (
        <>
          <span className="block text-xs font-semibold text-ink mb-1.5">6-digit code</span>
          <div className="mb-4">
            <OtpInput value={code} onChange={setCode} />
          </div>
          <Button onClick={handleVerify} loading={loading}>
            Verify
          </Button>
          <button
            type="button"
            onClick={handleSendCode}
            className="mt-3 text-xs font-semibold text-indigo block"
          >
            Didn&apos;t receive it? Resend code
          </button>
        </>
      )}
    </AuthShell>
  );
}
