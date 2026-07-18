export function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-4 py-5 text-sm">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1.5 rounded-[10px] border border-hairline text-muted disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-faint">
        Page {page} of {pages}
      </span>
      <button
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1.5 rounded-[10px] border border-hairline text-muted disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
