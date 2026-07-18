"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getArtistAvailability,
  createAvailabilityBlock,
  deleteAvailabilityBlock,
} from "@/lib/artists-api";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { AddBlockForm } from "@/components/calendar/AddBlockForm";
import { BlockedDatesList } from "@/components/calendar/BlockedDatesList";
import { ComingSoon } from "@/components/shell/ComingSoon";
import { todayKey } from "@/lib/calendar";
import type { AvailabilityBlock } from "@/types/artists";

function ArtistCalendar({ userId }: { userId: string }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [blocks, setBlocks] = useState<AvailabilityBlock[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formStart, setFormStart] = useState<string | undefined>(undefined);
  const [notice, setNotice] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getArtistAvailability(userId)
      .then((data) => {
        if (!cancelled) setBlocks(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your calendar. Try refreshing.");
      });
    return () => {
      cancelled = true;
    };
  }, [userId, reloadCount]);

  function reload() {
    setReloadCount((n) => n + 1);
  }

  function flash(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  }

  function handleSelectDay(dateKey: string, blocked: boolean) {
    if (blocked) {
      flash("Already blocked — remove it from the list below.");
      return;
    }
    setFormStart(dateKey);
    setFormOpen(true);
  }

  async function handleCreate(payload: { startDate: string; endDate: string; note?: string }) {
    await createAvailabilityBlock(payload);
    setFormOpen(false);
    flash("Dates blocked.");
    reload();
  }

  async function handleDelete(id: string) {
    await deleteAvailabilityBlock(id);
    flash("Dates removed.");
    reload();
  }

  function changeMonth(dir: 1 | -1) {
    let m = month + dir;
    let y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setMonth(m);
    setYear(y);
  }

  if (error) return <p className="px-4 py-10 text-sm text-danger">{error}</p>;
  if (!blocks) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  // Only blocks touching the currently viewed month, nearest first —
  // matches the mockup's "blocked dates for this view" list.
  const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const monthEnd = `${year}-${String(month + 1).padStart(2, "0")}-31`;
  const visibleBlocks = blocks
    .filter((b) => b.end_date >= monthStart && b.start_date <= monthEnd)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  return (
    <div className="max-w-lg mx-auto pb-8">
      {notice && (
        <div className="mx-4 mt-3 px-3.5 py-2 rounded-[10px] bg-ink text-white text-xs text-center">
          {notice}
        </div>
      )}

      <CalendarGrid
        year={year}
        month={month}
        blocks={blocks}
        onSelectDay={handleSelectDay}
        onPrevMonth={() => changeMonth(-1)}
        onNextMonth={() => changeMonth(1)}
      />

      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-bold text-ink">Blocked dates</span>
          <button
            onClick={() => {
              setFormStart(todayKey());
              setFormOpen(true);
            }}
            className="flex items-center gap-1 text-xs font-semibold text-indigo px-2.5 py-1.5 rounded-lg bg-mist border border-[#93ADE8]"
          >
            <i className="ti ti-plus text-xs" /> Add dates
          </button>
        </div>

        {formOpen && (
          <AddBlockForm
            key={formStart}
            initialStart={formStart}
            onCancel={() => setFormOpen(false)}
            onSubmit={handleCreate}
          />
        )}

        <BlockedDatesList blocks={visibleBlocks} onDelete={handleDelete} />
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { user, isLoading } = useAuth();
  if (isLoading || !user) return null;

  if (user.role !== "artist") {
    return (
      <ComingSoon
        title="Calendar"
        blurb="This page manages an artist's availability — nothing to show for a planner account."
      />
    );
  }

  return <ArtistCalendar userId={user.id} />;
}
