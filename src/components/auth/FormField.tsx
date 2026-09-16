"use client";

import { InputHTMLAttributes, forwardRef, useId, useState } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/**
 * A labelled input, with a reveal toggle on password fields.
 *
 * The toggle is here rather than at each call site because every password
 * field in the app already goes through this component — login, register,
 * reset, change-password, change-email and delete-account, nine fields in
 * total — so this is the one place that covers all of them.
 *
 * It earns its place: the rule is eight characters with three character
 * classes, and without this there is no way to check what was typed. That
 * is the rule people fail repeatedly and silently, on a form that will not
 * say which of the three they missed.
 *
 * 44x44, per item 26's tap-target floor. `pr-12` on the input keeps the
 * text from running underneath it.
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, className = "", type, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? props.name ?? generatedId;
    const [revealed, setRevealed] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword && revealed ? "text" : type;

    return (
      <div className="mb-4">
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold text-ink">
          {label}
        </label>
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={inputType}
            className={`w-full rounded-[10px] border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-clay focus:ring-1 focus:ring-clay ${
              error ? "border-[#FCA5A5]" : "border-hairline"
            } ${isPassword ? "pr-12" : ""} ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              // The control is a toggle, so its state is announced rather
              // than baked into a label that would go stale.
              aria-pressed={revealed}
              aria-controls={inputId}
              aria-label={revealed ? "Hide password" : "Show password"}
              // Skipped by the keyboard: the field's own submit flow should
              // not have to step over it, and it is reachable by pointer or
              // by shift-tabbing back.
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex h-11 w-11 items-center justify-center self-center text-muted"
            >
              <i className={`ti ${revealed ? "ti-eye-off" : "ti-eye"} text-base`} aria-hidden />
            </button>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);
FormField.displayName = "FormField";
