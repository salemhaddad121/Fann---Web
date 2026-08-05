import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  tone?: "clay" | "teal";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  tone = "clay",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "w-full rounded-[10px] py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? `${tone === "teal" ? "bg-teal" : "bg-clay-deep"} text-white hover:opacity-90`
      : "bg-transparent text-ink border-[1.5px] border-ink hover:bg-sand";

  return (
    <button className={`${base} ${styles} ${className}`} disabled={disabled || loading} {...props}>
      {loading && (
        <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      )}
      {children}
    </button>
  );
}
