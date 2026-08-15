"use client";

import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/shell/AppShell";
import { GuestChrome } from "@/components/shell/GuestChrome";
import { FaqAccordion } from "@/components/support/FaqAccordion";
import { ContactForm } from "@/components/support/ContactForm";

function HelpContent() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold text-ink">Help</h1>
      <p className="mt-1.5 text-sm text-muted">
        Answers to the questions we get most, and a way to reach us if yours
        isn&apos;t here.
      </p>

      <div className="mt-6">
        <FaqAccordion />
      </div>

      <div className="mt-6">
        <ContactForm />
      </div>
    </div>
  );
}

/**
 * Reachable signed in or out.
 *
 * A help page behind a login wall is useless to the people most likely to
 * need it — anyone who cannot get into their account. Guests get the same
 * FAQ and the same contact form, with an email field added so there is
 * somewhere to reply.
 */
export default function HelpPage() {
  const { user, isLoading } = useAuth();

  // Wait for the session probe so a signed-in user does not flash the
  // guest header before the shell resolves.
  if (isLoading) return null;

  if (!user) {
    return (
      <GuestChrome>
        <HelpContent />
      </GuestChrome>
    );
  }

  return (
    <AppShell user={user}>
      <HelpContent />
    </AppShell>
  );
}
