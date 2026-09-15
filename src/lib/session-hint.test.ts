import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { clearSessionHint, markSessionLikely, sessionMayExist } from "./session-hint";

describe("session hint", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is absent for a visitor who has never signed in", () => {
    // The whole point: a first-time guest must not trigger a refresh that
    // can only 401.
    expect(sessionMayExist()).toBe(false);
  });

  it("is set once a session is proven", () => {
    markSessionLikely();

    expect(sessionMayExist()).toBe(true);
  });

  it("is cleared on logout", () => {
    markSessionLikely();
    clearSessionHint();

    expect(sessionMayExist()).toBe(false);
  });

  it("survives being set twice", () => {
    markSessionLikely();
    markSessionLikely();

    expect(sessionMayExist()).toBe(true);
  });

  it("ignores a value that is not ours", () => {
    // Nothing here is a security control, but a stray value should not read
    // as a session.
    window.localStorage.setItem("fann.session-hint", "yes");

    expect(sessionMayExist()).toBe(false);
  });

  describe("when storage is unavailable", () => {
    // The direction that matters. "Unsure" has to mean "try the refresh",
    // because the alternative is signing out a real user in private mode.
    it("reports that a session MAY exist when reading throws", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("storage disabled");
      });

      expect(sessionMayExist()).toBe(true);
    });

    it("does not throw when writing fails", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("storage disabled");
      });

      expect(() => markSessionLikely()).not.toThrow();
    });

    it("does not throw when clearing fails", () => {
      vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new Error("storage disabled");
      });

      expect(() => clearSessionHint()).not.toThrow();
    });
  });
});
