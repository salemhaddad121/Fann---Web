/**
 * Placeholder cards for a search that has not landed yet.
 *
 * Every loading state in the app was the bare word "Loading…" or
 * "Searching…", which on /search meant the grid collapsed to a single line
 * of text and then jumped back to full height when results arrived. This
 * holds the shape of the grid still while the request is in flight.
 *
 * Matches ArtistCard's geometry exactly — the same 14px radius and the same
 * pt-[120%] portrait frame — so nothing moves when the real cards replace
 * these. If that frame changes, change it here too.
 */
export function CardSkeleton() {
  return (
    <div
      aria-hidden
      className="animate-pulse overflow-hidden rounded-[14px] border border-hairline bg-surface"
    >
      <div className="relative w-full bg-sand pt-[120%]">
        <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-3">
          <div className="h-3.5 w-3/4 rounded bg-hairline" />
          <div className="h-2.5 w-1/2 rounded bg-hairline/70" />
        </div>
      </div>
    </div>
  );
}

/**
 * A grid's worth of them. `count` should match the page size the directory
 * actually asks for, so the skeleton does not promise more rows than the
 * response can fill.
 */
export function CardSkeletonGrid({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </>
  );
}
