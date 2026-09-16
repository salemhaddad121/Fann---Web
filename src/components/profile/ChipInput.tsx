"use client";

import { useId, useState } from "react";

/**
 * A tag input. The label has to reach the input it labels.
 *
 * It was a bare <label> with no htmlFor next to an <input> with no id, so
 * the two were never associated: a screen reader announced the field as
 * "edit text, blank", and clicking the word "Languages" did nothing.
 *
 * `name` is here for the same reason it is on FormField — an input without
 * one is invisible to autofill and to anything that reads the form
 * generically. Defaults to a slug of the label so no call site has to
 * remember, while staying overridable.
 */
export function ChipInput({
  label,
  values,
  onChange,
  placeholder,
  name,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  name?: string;
}) {
  const [draft, setDraft] = useState("");
  const inputId = useId();
  const inputName = name ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
    setDraft("");
  }

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block text-xs font-semibold text-ink mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v) => (
          <span
            key={v}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-2xl bg-sand border border-hairline text-ink"
          >
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}>
              <i className="ti ti-x text-[12px] text-faint" />
            </button>
          </span>
        ))}
      </div>
      <input
        id={inputId}
        name={inputName}
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
