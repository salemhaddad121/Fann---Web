"use client";

import { useState } from "react";
import type { UserStatus } from "@/types/admin";

type Role = "artist" | "planner";

const COPY: Record<Exclude<UserStatus, "active">, Record<Role, { heading: string; body: string }>> = {
  pending_review: {
    artist: {
      heading: "Awaiting Admin Approval",
      body: "Your ID document is being reviewed. Once approved, your profile goes live and planners can find and message you.",
    },
    planner: {
      heading: "Awaiting Payment & Admin Confirmation",
      body: "Transfer your membership fee via OMT, Wish, or Western Union, then wait for an admin to confirm it. Once confirmed, your profile goes live and you can message artists.",
    },
  },
  suspended: {
    artist: {
      heading: "Account Suspended",
      body: "Your account has been suspended by an admin. Your profile isn't visible to planners while this is in effect.",
    },
    planner: {
      heading: "Account Suspended",
      body: "Your account has been suspended by an admin. Your profile isn't visible to artists while this is in effect.",
    },
  },
  banned: {
    artist: {
      heading: "Account Banned",
      body: "Your account has been banned. Your profile is no longer visible on Aynu.",
    },
    planner: {
      heading: "Account Banned",
      body: "Your account has been banned. Your profile is no longer visible on Aynu.",
    },
  },
};

export function LiveStatusBanner({ role, status }: { role: Role; status: UserStatus }) {
  const [open, setOpen] = useState(false);

  if (status === "active") {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-success-bg border-b border-[#86EFAC] text-sm text-success font-semibold">
        <i className="ti ti-circle-check" /> Live — visible to {role === "artist" ? "planners" : "artists"} in search
      </div>
    );
  }

  const copy = COPY[status][role];
  const tone =
    status === "pending_review"
      ? "bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]"
      : "bg-danger-bg border-[#FCA5A5] text-danger";

  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className={`w-full text-left border-b ${tone}`}
    >
      <div className="flex items-center gap-2 px-4 py-2.5">
        <i className={`ti ${status === "pending_review" ? "ti-clock" : "ti-alert-triangle"}`} />
        <span className="flex-1 text-sm font-semibold">Not live yet</span>
        <i className={`ti ti-chevron-${open ? "up" : "down"} text-xs`} />
      </div>
      {open && (
        <div className="px-4 pb-3 -mt-1">
          <p className="text-sm font-bold mb-1">{copy.heading}</p>
          <p className="text-xs leading-relaxed opacity-90">{copy.body}</p>
        </div>
      )}
    </button>
  );
}
