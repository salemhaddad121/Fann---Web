"use client";

import { useState } from "react";

export function ChipInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
    setDraft("");
  }

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-ink mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v) => (
          <span
            key={v}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-2xl bg-sand border border-hairline text-ink"
          >
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}>
              <i className="ti ti-x text-[10px] text-faint" />
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        placeholder={placeholder ?? "Type and press Enter"}
        className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-clay"
      />
    </div>
  );
}
