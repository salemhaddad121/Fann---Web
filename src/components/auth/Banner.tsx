export function Banner({ kind, children }: { kind: "error" | "success"; children: React.ReactNode }) {
  const styles =
    kind === "error"
      ? "bg-danger-bg border-[#FCA5A5] text-danger"
      : "bg-success-bg border-[#86EFAC] text-success";
  return (
    <div className={`mb-4 rounded-[10px] border px-3.5 py-2.5 text-sm ${styles}`} role="status">
      {children}
    </div>
  );
}
