import { describe, expect, it } from "vitest";
import { mediaShortfall } from "./profile-completeness";
import type { MediaItem } from "@/types/artists";

function photo(isPrimary = false): MediaItem {
  return {
    id: Math.random().toString(36),
    media_type: "photo",
    cdn_url: "https://cdn.example/x.jpg",
    duration_sec: null,
    is_primary: isPrimary,
    sort_order: 0,
  };
}

function video(): MediaItem {
  return { ...photo(), media_type: "video" };
}

describe("mediaShortfall", () => {
  it("is satisfied by a profile picture plus two gallery images", () => {
    expect(mediaShortfall([photo(true), photo(), photo()])).toEqual([]);
  });

  it("names both requirements on an empty profile", () => {
    expect(mediaShortfall([])).toEqual(["a profile picture", "2 more gallery images"]);
  });

  it("counts down the shortfall rather than repeating the total", () => {
    // "1 more gallery image" is actionable; "2 gallery images required"
    // when you already have one is not.
    expect(mediaShortfall([photo(true), photo()])).toEqual(["1 more gallery image"]);
  });

  it("does not let the profile picture count toward the gallery", () => {
    // Otherwise one upload satisfies two separate requirements.
    expect(mediaShortfall([photo(true)])).toEqual(["2 more gallery images"]);
  });

  it("does not let videos stand in for gallery images", () => {
    // The requirement exists so a search result has something to show, and
    // a video thumbnail is not guaranteed.
    expect(mediaShortfall([photo(true), video(), video()])).toEqual([
      "2 more gallery images",
    ]);
  });

  it("still asks for a profile picture when only gallery images exist", () => {
    expect(mediaShortfall([photo(), photo(), photo()])).toEqual(["a profile picture"]);
  });
});
