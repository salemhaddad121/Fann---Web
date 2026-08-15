import { describe, it, expect, beforeEach, vi } from "vitest";
import { getSessionId, normalisePath } from "./page-timing";

describe("normalisePath", () => {
  it("leaves static routes alone", () => {
    expect(normalisePath("/search")).toBe("/search");
    expect(normalisePath("/dashboard")).toBe("/dashboard");
    expect(normalisePath("/profile/edit")).toBe("/profile/edit");
  });

  it("normalises the root", () => {
    expect(normalisePath("/")).toBe("/");
    expect(normalisePath("")).toBe("/");
  });

  // The privacy-critical case. Storing which specific artist a booker
  // looked at is a much more sensitive record than "they viewed an artist
  // page", and raw ids would also give the table unbounded cardinality.
  it("collapses uuid segments so no real id is ever stored", () => {
    expect(normalisePath("/artists/10000000-0000-0000-0000-000000000016")).toBe("/artists/[id]");
    expect(normalisePath("/planners/20000000-0000-0000-0000-000000000001")).toBe("/planners/[id]");
    expect(normalisePath("/messages/abcdef12-3456-7890-abcd-ef1234567890")).toBe("/messages/[id]");
  });

  it("collapses numeric segments too", () => {
    expect(normalisePath("/bookings/12345")).toBe("/bookings/[id]");
  });

  it("collapses every dynamic segment, not just the first", () => {
    expect(normalisePath("/a/10000000-0000-0000-0000-000000000016/b/42")).toBe("/a/[id]/b/[id]");
  });

  it("does not mistake a normal word for an id", () => {
    expect(normalisePath("/admin/panel")).toBe("/admin/panel");
    expect(normalisePath("/auth/reset-password")).toBe("/auth/reset-password");
  });

  it("is case-insensitive about uuids", () => {
    expect(normalisePath("/artists/ABCDEF12-3456-7890-ABCD-EF1234567890")).toBe("/artists/[id]");
  });

  it("ignores trailing slashes rather than emitting an empty segment", () => {
    expect(normalisePath("/search/")).toBe("/search");
  });
});

describe("getSessionId", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("returns the same id on repeated calls within a tab", () => {
    // Page views only group into a session if the id is stable.
    const first = getSessionId();
    expect(first).toBeTruthy();
    expect(getSessionId()).toBe(first);
  });

  it("stores the id in sessionStorage, never in localStorage or a cookie", () => {
    // This is what makes recording signed-out visitors defensible without a
    // consent banner: the id dies with the tab and is never sent on its own.
    const id = getSessionId();

    expect(window.sessionStorage.getItem("fann_session_id")).toBe(id);
    expect(window.localStorage.getItem("fann_session_id")).toBeNull();
    expect(document.cookie).not.toContain("fann_session_id");
  });

  it("issues a fresh id once the stored one is gone", () => {
    const first = getSessionId();
    window.sessionStorage.clear();

    expect(getSessionId()).not.toBe(first);
  });

  it("produces a uuid the API will accept", () => {
    // The endpoint validates with @IsUUID(), so a malformed id would get the
    // whole batch rejected.
    expect(getSessionId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("returns null instead of throwing when storage is unavailable", () => {
    // Private browsing can throw on sessionStorage access; telemetry must
    // not take the page down with it.
    //
    // Spied on the prototype, not the instance: jsdom backs sessionStorage
    // with a Proxy, so assigning `sessionStorage.getItem = fn` stores an
    // item called "getItem" instead of replacing the method, and the test
    // silently passes through to the real implementation.
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(getSessionId()).toBeNull();

    spy.mockRestore();
  });
});
