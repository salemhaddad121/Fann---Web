import { describe, it, expect } from "vitest";
import {
  checkResolution,
  MIN_VIDEO_SHORT_SIDE,
  MAX_VIDEO_LONG_SIDE,
  MIN_PHOTO_SHORT_SIDE,
  MAX_PHOTO_LONG_SIDE,
} from "./media-api";

describe("checkResolution", () => {
  it("accepts a landscape video at the minimum short side", () => {
    expect(checkResolution("video", 854, MIN_VIDEO_SHORT_SIDE)).toBeNull();
  });

  // The reason the rule is written as short/long side rather than
  // width/height: artists shoot on phones, so portrait is normal and a raw
  // width check would reject a perfectly good 1080x1920 clip.
  it("accepts a portrait video with the same dimensions swapped", () => {
    expect(checkResolution("video", MIN_VIDEO_SHORT_SIDE, 854)).toBeNull();
    expect(checkResolution("video", 1080, 1920)).toBeNull();
  });

  it("rejects a video below the minimum short side", () => {
    const result = checkResolution("video", 640, MIN_VIDEO_SHORT_SIDE - 1);
    expect(result).toContain(`${MIN_VIDEO_SHORT_SIDE}p`);
    expect(result).toContain("640x479");
  });

  it("rejects a video above the maximum long side in either orientation", () => {
    expect(checkResolution("video", MAX_VIDEO_LONG_SIDE + 1, 2160)).toContain("at most");
    expect(checkResolution("video", 2160, MAX_VIDEO_LONG_SIDE + 1)).toContain("at most");
  });

  it("accepts a video exactly at the maximum long side", () => {
    expect(checkResolution("video", MAX_VIDEO_LONG_SIDE, 2160)).toBeNull();
  });

  it("applies the photo limits to photos, not the video ones", () => {
    // 500px short side passes the video floor (480) but fails the photo one.
    expect(checkResolution("video", 900, 500)).toBeNull();
    expect(checkResolution("photo", 900, 500)).toContain(`${MIN_PHOTO_SHORT_SIDE}px`);
  });

  it("accepts a photo at both boundaries", () => {
    expect(checkResolution("photo", MIN_PHOTO_SHORT_SIDE, MIN_PHOTO_SHORT_SIDE)).toBeNull();
    expect(checkResolution("photo", MAX_PHOTO_LONG_SIDE, MIN_PHOTO_SHORT_SIDE)).toBeNull();
  });

  it("rejects a photo above the maximum long side", () => {
    expect(checkResolution("photo", MAX_PHOTO_LONG_SIDE + 1, 1000)).toContain("at most");
  });

  // A file the browser can't decode reports 0x0 rather than throwing, so
  // this has to be caught explicitly or a broken file would sail through.
  it("rejects unreadable dimensions instead of treating 0 as valid", () => {
    expect(checkResolution("video", 0, 0)).toContain("Couldn't read");
    expect(checkResolution("photo", 1000, 0)).toContain("Couldn't read");
  });
});
