"use client";

import { useState } from "react";
import { Button } from "@/components/auth/Button";
import { Banner } from "@/components/auth/Banner";

export function ProposeBookingForm({
  onCancel,
  onSubmit,
  initialDate,
  containerClassName = "absolute inset-0 bg-surface z-10 flex flex-col",
}: {
  onCancel: () => void;
  onSubmit: (payload: {
    eventName: string;
    eventDate: string;
    eventLocation?: string;
    durationHours?: number;
    agreedFeeUsd?: number;
    notes?: string;
  }) => Promise<void>;
  // Prefills the date — set when the flow starts from a calendar day
  // rather than from the message thread's "propose" button.
  initialDate?: string;
  // The message thread renders this as a full-bleed overlay inside its
  // own relative container; the profile needs a centred modal. Kept as a
  // prop so the thread's layout is untouched.
  containerClassName?: string;
}) {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(initialDate ?? "");
  const [eventLocation, setEventLocation] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [agreedFeeUsd, setAgreedFeeUsd] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!eventName.trim() || !eventDate) {
      setError("Event name and date are required.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        eventName: eventName.trim(),
        eventDate,
        eventLocation: eventLocation.trim() || undefined,
        durationHours: durationHours ? Number(durationHours) : undefined,
        agreedFeeUsd: agreedFeeUsd ? Number(agreedFeeUsd) : undefined,
        notes: notes.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send that booking request.");
      setSaving(false);
    }
  }

  return (
    <div className={containerClassName}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-hairline shrink-0">
        <button type="button" onClick={onCancel} className="text-muted" aria-label="Close">
          <i className="ti ti-x text-lg" />
        </button>
        <span className="text-sm font-semibold text-ink">Propose a booking</span>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
        {error && <Banner kind="error">{error}</Banner>}

        <label className="block mb-3.5">
          <span className="block text-xs font-semibold text-ink mb-1.5">Event name</span>
          <input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="e.g. Saab Family Wedding"
            className="w-full rounded-[10px] border border-hairline px-3.5 py-2.5 text-sm outline-none focus:border-clay"
          />
        </label>

        <div className="grid grid-cols-2 gap-3 mb-3.5">
          <label className="text-xs">
            <span className="block font-semibold text-ink mb-1.5">Event date</span>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-[10px] border border-hairline px-3 py-2.5 text-sm outline-none focus:border-clay"
            />
          </label>
          <label className="text-xs">
            <span className="block font-semibold text-ink mb-1.5">Duration (hours)</span>
            <input
              type="number"
              min={0.5}
              max={24}
              step={0.5}
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              className="w-full rounded-[10px] border border-hairline px-3 py-2.5 text-sm outline-none focus:border-clay"
            />
          </label>
        </div>

        <label className="block mb-3.5">
          <span className="block text-xs font-semibold text-ink mb-1.5">Location (optional)</span>
          <input
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            placeholder="e.g. Phoenicia Hotel, Beirut"
            className="w-full rounded-[10px] border border-hairline px-3.5 py-2.5 text-sm outline-none focus:border-clay"
          />
        </label>

        <label className="block mb-3.5">
          <span className="block text-xs font-semibold text-ink mb-1.5">Agreed fee, USD (optional)</span>
          <input
            type="number"
            min={0}
            value={agreedFeeUsd}
            onChange={(e) => setAgreedFeeUsd(e.target.value)}
            className="w-full rounded-[10px] border border-hairline px-3.5 py-2.5 text-sm outline-none focus:border-clay"
          />
        </label>

        <label className="block mb-4">
          <span className="block text-xs font-semibold text-ink mb-1.5">Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={1000}
            className="w-full rounded-[10px] border border-hairline px-3.5 py-2.5 text-sm outline-none focus:border-clay"
          />
        </label>

        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={saving} className="flex-1">
            Send request
          </Button>
        </div>
      </form>
    </div>
  );
}
