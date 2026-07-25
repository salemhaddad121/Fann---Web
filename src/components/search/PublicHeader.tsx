import Link from "next/link";

export function PublicHeader() {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white border-b border-hairline">
      <Link href="/" className="font-display text-base font-bold text-ink">
        fan<span className="text-indigo">n</span>
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/auth/login" className="text-sm font-semibold text-ink px-3 py-1.5">
          Log in
        </Link>
        <Link
          href="/auth/register"
          className="text-sm font-semibold text-white bg-indigo px-3.5 py-1.5 rounded-[10px]"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
