"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRequireAuth } from "@/lib/use-require-auth";
import { getPlanner } from "@/lib/planners-api";
import { requestConversation } from "@/lib/messaging-api";
import { AppShell } from "@/components/shell/AppShell";
import { PlannerProfileView } from "@/components/profile/PlannerProfileView";
import { ReportDialog } from "@/components/support/ReportDialog";
import type { PlannerDetail } from "@/types/planners";
import { ApiError } from "@/lib/api";

// Artists only. A thread an artist opens is a request the planner has to
// accept, so this deliberately doesn't jump straight into the thread the
// way the planner-side Message button does — there may be nothing to
// show yet, and the wording should set the expectation.
function MessageRequestCta({ planner }: { planner: PlannerDetail }) {
  const { user } = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user?.role !== "artist") return null;

  async function handleRequest() {
    setError(null);
    setSending(true);
    try {
      const conversation = await requestConversation(planner.user_id);
      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send that message request.");
      setSending(false);
    }
  }

  return (
    <div className="sticky bottom-0 bg-surface border-t border-hairline p-3 max-w-lg mx-auto">
      {error && <p className="text-xs text-danger mb-2">{error}</p>}
      <button
        onClick={handleRequest}
        disabled={sending}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] border-[1.5px] border-ink text-sm font-semibold text-ink disabled:opacity-60"
      >
        <i className="ti ti-message-circle text-sm" />
        {sending ? "Sending…" : "Message"}
      </button>
      <p className="mt-1.5 text-[12px] text-faint text-center">
        They&apos;ll need to accept before they can reply.
      </p>
    </div>
  );
}

/**
 * What to say when a booker profile will not load.
 *
 * C5 gave this route three failure modes it did not have before, and the
 * API's own wording is not what any of them should show a person:
 *
 *   401  no session. Handled before this by useRequireAuth, which
 *        redirects — so it is here only as a backstop.
 *   403  a booker trying to read another booker. The directory is for
 *        artists; one customer does not get to read the customer list.
 *   404  an individual, or a profile that does not exist. Deliberately
 *        indistinguishable: telling the caller which would confirm that a
 *        particular id names a real private person, which is the fact the
 *        404 exists to protect.
 */
function describeLoadFailure(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403) {
      return "Booker profiles are only visible to artists.";
    }
    if (err.status === 404) {
      return "This profile isn't available.";
    }
    if (err.status === 401) {
      return "Sign in to view this profile.";
    }
  }
  return "Couldn't load this profile.";
}

function Content({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [planner, setPlanner] = useState<PlannerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPlanner(id)
      .then((data) => {
        if (!cancelled) setPlanner(data);
      })
      .catch((err) => {
        if (!cancelled) setError(describeLoadFailure(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;
  if (error || !planner) {
    return (
      <div className="px-4 py-10">
        <p className="text-sm text-danger mb-3">{error ?? "This profile isn't available."}</p>
        <Link href="/search" className="text-sm font-semibold text-teal">
          ← Back to search
        </Link>
      </div>
    );
  }

  const isOwnProfile = user?.id === planner.user_id;

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-muted">
          <i className="ti ti-arrow-left" /> Back
        </button>
      </div>

      <PlannerProfileView
        planner={planner}
        isOwnProfile={isOwnProfile}
        accountStatus={isOwnProfile ? user?.status : undefined}
      />

      {!isOwnProfile && (
        <div className="px-4 pb-3 pt-1">
          <ReportDialog
            kind="planner"
            targetId={planner.user_id}
            targetName={planner.display_name}
          />
        </div>
      )}

      {isOwnProfile ? (
        <div className="sticky bottom-0 bg-surface border-t border-hairline p-3 max-w-lg mx-auto">
          <Link
            href="/profile/edit"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] bg-teal text-white text-sm font-semibold"
          >
            <i className="ti ti-pencil text-sm" /> Edit profile
          </Link>
        </div>
      ) : (
        <MessageRequestCta planner={planner} />
      )}
    </div>
  );
}

export function PlannerDetailClient({ id }: { id: string }) {
  const { user, isLoading } = useRequireAuth();

  if (isLoading || !user) return null;

  return (
    <AppShell user={user} background="planner">
      <Content id={id} />
    </AppShell>
  );
}
