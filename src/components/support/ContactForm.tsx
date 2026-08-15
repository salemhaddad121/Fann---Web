"use client";

import { FormEvent, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { createSupportTicket } from "@/lib/support-api";
import { normalisePath } from "@/lib/page-timing";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/auth/Button";
import { Banner } from "@/components/auth/Banner";

export function ContactForm() {
  const { user } = useAuth();
  const pathname = usePathname();

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Mirrors the server's validation so the common mistakes are caught
    // without a round trip. The server still enforces all of it.
    if (subject.trim().length < 3) {
      setError("Give your message a short subject.");
      return;
    }
    if (body.trim().length < 10) {
      setError("Tell us a little more so we can help.");
      return;
    }
    if (!user && !guestEmail.trim()) {
      setError("We need an email address to reply to.");
      return;
    }

    setSending(true);
    try {
      await createSupportTicket({
        subject: subject.trim(),
        body: body.trim(),
        ...(user ? {} : { guestEmail: guestEmail.trim(), guestName: guestName.trim() || undefined }),
        // Normalised, so support learns which screen someone was on
        // without us recording which specific artist they were viewing.
        sourcePath: normalisePath(pathname ?? "/help"),
      });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't send that. Please try again in a moment.",
      );
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface p-5">
        <h3 className="text-base font-bold text-ink">Message sent</h3>
        <p className="mt-1.5 text-sm text-muted">
          We&apos;ve got it and will reply by email
          {user ? "" : ` to ${guestEmail.trim()}`}. You don&apos;t need to send it again.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-hairline bg-surface p-5">
      <h3 className="text-base font-bold text-ink">Still need help?</h3>
      <p className="mb-4 mt-1 text-sm text-muted">
        Send us a message and we&apos;ll reply by email.
      </p>

      {error && <Banner kind="error">{error}</Banner>}

      {/* Guests have to tell us where to reply. Signed-in users do not —
          the server takes their address from the account and ignores
          anything sent in the body. */}
      {!user && (
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            label="Your email"
            type="email"
            autoComplete="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
          />
          <FormField
            label="Your name (optional)"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
        </div>
      )}

      <FormField
        label="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="e.g. I can't activate my day pass"
      />

      <label className="mb-4 block">
        <span className="mb-1.5 block text-xs font-semibold text-ink">Message</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          maxLength={5000}
          placeholder="What happened, and what were you trying to do?"
          className="w-full rounded-[10px] border border-hairline px-3.5 py-2.5 text-sm outline-none focus:border-clay"
        />
      </label>

      <Button type="submit" loading={sending}>
        Send message
      </Button>
    </form>
  );
}
