import { describe, it, expect } from "vitest";
import { digitsOnly, decimalOnly } from "./numeric-input";

describe("digitsOnly — the fee field", () => {
  it("keeps a plain amount", () => {
    expect(digitsOnly("750")).toBe("750");
  });

  it("strips letters", () => {
    expect(digitsOnly("abc")).toBe("");
    expect(digitsOnly("12abc")).toBe("12");
  });

  // The actual bug: type="number" accepted "7e5" as a value, which submits
  // as 700000 rather than 7.
  it("strips scientific notation", () => {
    expect(digitsOnly("7e5")).toBe("75");
    expect(digitsOnly("1E10")).toBe("110");
  });

  it("strips signs, so a fee can't go negative", () => {
    expect(digitsOnly("-5")).toBe("5");
    expect(digitsOnly("+5")).toBe("5");
  });

  it("strips decimals — fees are whole dollars", () => {
    expect(digitsOnly("750.50")).toBe("75050");
  });

  it("degrades a pasted currency string instead of discarding it", () => {
    expect(digitsOnly("$1,200")).toBe("1200");
  });

  it("leaves an empty field empty", () => {
    expect(digitsOnly("")).toBe("");
  });
});

describe("decimalOnly — the duration field", () => {
  it("keeps whole and half hours", () => {
    expect(decimalOnly("2")).toBe("2");
    expect(decimalOnly("2.5")).toBe("2.5");
  });

  it("allows a trailing point mid-typing", () => {
    // Someone typing "2.5" passes through "2." — dropping it would make the
    // decimal point impossible to enter.
    expect(decimalOnly("2.")).toBe("2.");
  });

  it("strips letters and signs", () => {
    expect(decimalOnly("2h")).toBe("2");
    expect(decimalOnly("-2.5")).toBe("2.5");
  });

  it("strips scientific notation", () => {
    expect(decimalOnly("7e5")).toBe("75");
  });

  it("keeps only the first decimal point", () => {
    expect(decimalOnly("2.5.5")).toBe("2.55");
    expect(decimalOnly("1.2.3.4")).toBe("1.234");
  });

  it("leaves an empty field empty", () => {
    expect(decimalOnly("")).toBe("");
  });
});
