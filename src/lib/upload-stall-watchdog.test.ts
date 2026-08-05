import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UploadStallWatchdog, STALL_TIMEOUT_MS, stallMessage } from "./upload-stall-watchdog";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("UploadStallWatchdog", () => {
  it("fires once the timeout elapses with no sign of life", () => {
    const onStall = vi.fn();
    new UploadStallWatchdog(onStall).arm("file-1");

    vi.advanceTimersByTime(STALL_TIMEOUT_MS - 1);
    expect(onStall).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onStall).toHaveBeenCalledWith("file-1");
  });

  // The real point of the watchdog: a slow upload is still a live one. Each
  // progress tick re-arms, so only silence trips it — otherwise a large video
  // on a poor connection would be cancelled mid-flight.
  it("does not fire while progress keeps arriving", () => {
    const onStall = vi.fn();
    const watchdog = new UploadStallWatchdog(onStall);

    watchdog.arm("file-1");
    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(STALL_TIMEOUT_MS - 1000);
      watchdog.arm("file-1"); // progress tick
    }
    expect(onStall).not.toHaveBeenCalled();

    // ...but stops being re-armed, and then it does fire.
    vi.advanceTimersByTime(STALL_TIMEOUT_MS);
    expect(onStall).toHaveBeenCalledTimes(1);
  });

  it("does not fire for a file that finished", () => {
    const onStall = vi.fn();
    const watchdog = new UploadStallWatchdog(onStall);

    watchdog.arm("file-1");
    watchdog.clear("file-1");
    vi.advanceTimersByTime(STALL_TIMEOUT_MS * 2);

    expect(onStall).not.toHaveBeenCalled();
    expect(watchdog.watching).toEqual([]);
  });

  it("tracks files independently", () => {
    const onStall = vi.fn();
    const watchdog = new UploadStallWatchdog(onStall);

    watchdog.arm("ok");
    watchdog.arm("wedged");
    watchdog.clear("ok");
    vi.advanceTimersByTime(STALL_TIMEOUT_MS);

    expect(onStall).toHaveBeenCalledTimes(1);
    expect(onStall).toHaveBeenCalledWith("wedged");
  });

  it("fires only once per armed file", () => {
    const onStall = vi.fn();
    new UploadStallWatchdog(onStall).arm("file-1");

    vi.advanceTimersByTime(STALL_TIMEOUT_MS * 5);
    expect(onStall).toHaveBeenCalledTimes(1);
  });

  it("stops watching a file once it has fired", () => {
    const watchdog = new UploadStallWatchdog(vi.fn());
    watchdog.arm("file-1");
    vi.advanceTimersByTime(STALL_TIMEOUT_MS);
    expect(watchdog.watching).toEqual([]);
  });

  // clearAll runs on unmount. Without it a pending timer fires against a
  // destroyed Uppy instance.
  it("clearAll cancels everything still pending", () => {
    const onStall = vi.fn();
    const watchdog = new UploadStallWatchdog(onStall);

    watchdog.arm("a");
    watchdog.arm("b");
    watchdog.clearAll();
    vi.advanceTimersByTime(STALL_TIMEOUT_MS * 2);

    expect(onStall).not.toHaveBeenCalled();
    expect(watchdog.watching).toEqual([]);
  });

  it("survives clear() being called for a file it isn't watching", () => {
    const watchdog = new UploadStallWatchdog(vi.fn());
    expect(() => watchdog.clear("never-armed")).not.toThrow();
  });

  it("honours a custom timeout", () => {
    const onStall = vi.fn();
    new UploadStallWatchdog(onStall, 1000).arm("file-1");

    vi.advanceTimersByTime(999);
    expect(onStall).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onStall).toHaveBeenCalledWith("file-1");
  });
});

describe("stallMessage", () => {
  it("names the file and says it wasn't saved", () => {
    const msg = stallMessage("headshot.png");
    expect(msg).toContain("headshot.png");
    expect(msg).toContain("wasn't added");
  });

  it("falls back when the name is missing", () => {
    expect(stallMessage(undefined)).toContain("That file");
  });
});
