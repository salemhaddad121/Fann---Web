import { InputHTMLAttributes, forwardRef } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="mb-4">
        <label htmlFor={inputId} className="block text-xs font-semibold text-ink mb-1.5">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={`w-full rounded-[10px] border px-3.5 py-2.5 text-sm text-ink placeholder:text-faint outline-none transition-colors bg-surface focus:border-clay focus:ring-1 focus:ring-clay ${
            error ? "border-[#FCA5A5]" : "border-hairline"
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
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
