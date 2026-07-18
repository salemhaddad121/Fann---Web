"use client";

import { useState } from "react";
import { Button } from "@/components/auth/Button";
import { Banner } from "@/components/auth/Banner";

const DIMENSIONS: { key: "communication" | "professionalism" | "punctuality" | "quality"; label: string }[] = [
  { key: "communication", label: "Communication" },
  { key: "professionalism", label: "Professionalism" },
  { key: "punctuality", label: "Punctuality" },
  { key: "quality", label: "Quality" },
];

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} star${n === 1 ? "" : "s"}`}>
          <i className={`ti text-xl ${n <= value ? "ti-star-filled text-indigo" : "ti-star text-hairline"}`} />
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (scores: {
    overallScore: number;
    scoreCommunication: number;
    scoreProfessionalism: number;
    scorePunctuality: number;
    scoreQuality: number;
    body?: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [overall, setOverall] = useState(0);
  const [scores, setScores] = useState({ communication: 0, professionalism: 0, punctuality: 0, quality: 0 });
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (overall === 0 || Object.values(scores).some((v) => v === 0)) {
      setError("Please rate every category.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        overallScore: overall,
        scoreCommunication: scores.communication,
        scoreProfessionalism: scores.professionalism,
        scorePunctuality: scores.punctuality,
        scoreQuality: scores.quality,
        body: body.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit your review.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-hairline rounded-xl p-4">
      {error && <Banner kind="error">{error}</Banner>}

      <div className="mb-3.5">
        <span className="block text-xs font-semibold text-ink mb-1.5">Overall rating</span>
        <StarPicker value={overall} onChange={setOverall} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3.5">
        {DIMENSIONS.map((d) => (
          <div key={d.key}>
            <span className="block text-xs font-semibold text-ink mb-1.5">{d.label}</span>
            <StarPicker
              value={scores[d.key]}
              onChange={(n) => setScores((prev) => ({ ...prev, [d.key]: n }))}
            />
          </div>
        ))}
      </div>

      <label className="block mb-4">
        <span className="block text-xs font-semibold text-ink mb-1.5">Comments (optional)</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="How did it go?"
          className="w-full rounded-[10px] border border-hairline px-3.5 py-2.5 text-sm outline-none focus:border-indigo"
        />
      </label>

      <p className="text-[11px] text-faint mb-3">
        Your review stays hidden until the other party also reviews, or after 7 days — whichever
        comes first.
      </p>

      <div className="flex gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={saving} className="flex-1">
          Submit review
        </Button>
      </div>
    </form>
  );
}
