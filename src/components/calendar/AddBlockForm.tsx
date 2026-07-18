"use client";

import { useState } from "react";
import { Button } from "@/components/auth/Button";
import { Banner } from "@/components/auth/Banner";

export function AddBlockForm({
  initialStart,
  onCancel,
  onSubmit,
}: {
  initialStart?: string;
  onCancel: () => void;
  onSubmit: (payload: { startDate: string; endDate: string; note?: string }) => Promise<void>;
}) {
  const [startDate, setStartDate] = useState(initialStart ?? "");
  const [endDate, setEndDate] = useState(initialStart ?? "");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!startDate || !endDate) {
      setError("Pick both a start and end date.");
      return;
    }
    if (endDate < startDate) {
      setError("End date must be on or after the start date.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ startDate, endDate, note: note.trim() || undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save those dates.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-hairline rounded-xl p-3.5 mb-3">
      {error && <Banner kind="error">{error}</Banner>}
      <div className="grid grid-cols-2 gap-2.5 mb-2.5">
        <label className="text-xs">
          <span className="block font-semibold text-ink mb-1">Start date</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-[10px] border border-hairline px-2.5 py-2 text-sm outline-none focus:border-indigo"
          />
        </label>
        <label className="text-xs">
          <span className="block font-semibold text-ink mb-1">End date</span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-[10px] border border-hairline px-2.5 py-2 text-sm outline-none focus:border-indigo"
          />
        </label>
      </div>
      <label className="block mb-3 text-xs">
        <span className="block font-semibold text-ink mb-1">Note (optional)</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Family trip"
          maxLength={200}
          className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-indigo"
        />
      </label>
      <div className="flex gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={saving} className="flex-1">
          Block these dates
        </Button>
      </div>
    </form>
  );
}
