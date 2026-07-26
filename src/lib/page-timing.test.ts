import { describe, it, expect } from "vitest";
import { normalisePath } from "./page-timing";

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
