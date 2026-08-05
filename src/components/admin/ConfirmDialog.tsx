"use client";

import { useEffect, useRef } from "react";

// Shared "are you sure?" gate for destructive or state-changing admin
// actions. Rendered only while a confirmation is pending — the caller holds
// the pending action in state and clears it on confirm or cancel.
//
// Escape and a backdrop click both cancel, and focus moves to the confirm
// button on open so the dialog is reachable without a mouse.
export function ConfirmDialog({
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-ink/40"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-surface rounded-[14px] border border-hairline p-5 shadow-xl"
      >
        <p className="text-sm font-bold text-ink mb-1.5">{title}</p>
        <div className="text-[13px] text-muted leading-relaxed mb-4">{body}</div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={busy}
            className="text-sm font-semibold text-muted px-4 py-2 rounded-[10px] border border-hairline disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={busy}
            className={`text-sm font-semibold text-white px-4 py-2 rounded-[10px] disabled:opacity-50 ${
              destructive ? "bg-danger" : "bg-clay"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
