// Watchdog for uploads that stop responding without failing.
//
// Why this exists: @uppy/aws-s3 reads the ETag off the PUT response to decide
// a non-multipart upload finished. If the bucket's CORS policy doesn't list
// ETag under ExposeHeaders, the browser hides the header, and the plugin
// bare-`return`s out of its promise without resolving OR rejecting it — see
// the `if (etag == null)` branch in @uppy/aws-s3/lib/index.js. The upload then
// sits at 100% forever: no error, no timeout, and our `complete` handler never
// runs, so POST /media/confirm never fires and the object is orphaned in the
// bucket with no database row pointing at it. That happened on 2026-08-05.
//
// Uppy's own `xhr.timeout` cannot catch this. It only applies while the
// request is in flight, and by the time the ETag read fails the response has
// already arrived and `load` has fired.
//
// So: watch for silence. Every file gets a timer that is pushed back on each
// sign of life (progress ticks) and cleared on a real outcome. If it ever
// actually elapses, the upload is wedged and we say so out loud.

/** How long a file may go without progress or an outcome before it's wedged. */
export const STALL_TIMEOUT_MS = 45_000;

type TimerId = ReturnType<typeof setTimeout>;

export class UploadStallWatchdog {
  private timers = new Map<string, TimerId>();

  constructor(
    private readonly onStall: (fileId: string) => void,
    private readonly timeoutMs: number = STALL_TIMEOUT_MS,
  ) {}

  /**
   * (Re)start the countdown for a file. Called when its upload starts and
   * again on every progress tick, so a slow-but-moving upload is never
   * flagged — only silence is.
   */
  arm(fileId: string): void {
    this.clear(fileId);
    this.timers.set(
      fileId,
      setTimeout(() => {
        // Drop the handle first: onStall may re-enter (removing the file
        // can emit events that call clear), and we don't want to leave a
        // dead id behind.
        this.timers.delete(fileId);
        this.onStall(fileId);
      }, this.timeoutMs),
    );
  }

  /** Stop watching a file — it succeeded, failed, or was removed. */
  clear(fileId: string): void {
    const timer = this.timers.get(fileId);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(fileId);
    }
  }

  /** Stop watching everything. Must run on unmount, or timers outlive the component. */
  clearAll(): void {
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }

  /** Files currently being watched. Exposed for tests. */
  get watching(): string[] {
    return [...this.timers.keys()];
  }
}

/**
 * The message shown when an upload wedges. Deliberately concrete about the
 * consequence — the bytes may well have reached the bucket, so "try again"
 * alone would be misleading if it silently duplicates.
 */
export function stallMessage(fileName: string | undefined): string {
  return `${fileName ?? "That file"} stopped responding and didn't finish saving. It wasn't added to your profile — please try again.`;
}
