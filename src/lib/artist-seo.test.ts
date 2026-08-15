import { describe, it, expect } from "vitest";
import {
  artistLocation,
  artistCategoryPhrase,
  artistSeoTitle,
  artistSeoDescription,
  truncateAtWord,
} from "./artist-seo";
import type { Category } from "@/types/artists";

function cats(...names: string[]): Category[] {
  return names.map((name) => ({ id: `id-${name}`, name, slug: name.toLowerCase() }));
}

describe("artistLocation", () => {
  it("prefers the city", () => {
    expect(artistLocation("Beirut", "Lebanon")).toBe("Beirut");
  });

  it("falls back to the country, then to Lebanon", () => {
    expect(artistLocation(null, "Lebanon")).toBe("Lebanon");
    expect(artistLocation(null, null)).toBe("Lebanon");
    expect(artistLocation("   ", null)).toBe("Lebanon");
  });
});

describe("artistCategoryPhrase", () => {
  it("names one category, or joins two", () => {
    expect(artistCategoryPhrase(cats("DJ"))).toBe("DJ");
    expect(artistCategoryPhrase(cats("Band / Group", "Jazz Musician"))).toBe(
      "Band / Group & Jazz Musician",
    );
  });

  it("caps at two so the title stays inside what Google renders", () => {
    expect(artistCategoryPhrase(cats("DJ", "Pianist", "Saxophonist", "Choir"))).toBe(
      "DJ & Pianist",
    );
  });

  it("drops the Other catch-all, which nobody searches for", () => {
    expect(artistCategoryPhrase(cats("Other", "DJ"))).toBe("DJ");
    expect(artistCategoryPhrase(cats("Other"))).toBe("Artist");
  });

  it("falls back to Artist when there is nothing usable", () => {
    expect(artistCategoryPhrase([])).toBe("Artist");
  });
});

describe("artistSeoTitle", () => {
  it("titles on category and city", () => {
    expect(
      artistSeoTitle({
        categories: cats("Band / Group"),
        location_city: "Beirut",
        location_country: "Lebanon",
      }),
    ).toBe("Band / Group in Beirut");
  });

  // The whole point of the rule: a booker searches the category, not the
  // performer. This also keeps the guest name mask intact.
  it("never contains the artist's name, masked or otherwise", () => {
    const title = artistSeoTitle({
      categories: cats("DJ"),
      location_city: "Beirut",
      location_country: "Lebanon",
    });
    expect(title).toBe("DJ in Beirut");
    expect(title).not.toMatch(/karim/i);
  });

  it("still produces a real title with no category and no city", () => {
    expect(
      artistSeoTitle({ categories: [], location_city: null, location_country: null }),
    ).toBe("Artist in Lebanon");
  });
});

describe("truncateAtWord", () => {
  it("leaves short text alone and collapses whitespace", () => {
    expect(truncateAtWord("A  short   bio", 50)).toBe("A short bio");
  });

  it("cuts at a word boundary and never mid-word", () => {
    // The 20-char cut lands inside "band"; the whole word is dropped rather
    // than shown as "ban…".
    expect(truncateAtWord("Five piece rock band out of Beirut", 20)).toBe("Five piece rock…");
  });

  it("does not leave dangling punctuation before the ellipsis", () => {
    expect(truncateAtWord("Beirut, Lebanon and beyond", 8)).toBe("Beirut…");
  });
});

describe("artistSeoDescription", () => {
  it("prefers the artist's own bio, which is the distinguishing text", () => {
    const desc = artistSeoDescription({
      bio: "Five-piece rock band out of Beirut — high-energy covers and originals.",
      categories: cats("Band / Group"),
      location_city: "Beirut",
      location_country: "Lebanon",
    });
    expect(desc).toContain("Five-piece rock band");
  });

  it("keeps the description inside the length search engines show", () => {
    const desc = artistSeoDescription({
      bio: "x".repeat(400),
      categories: cats("DJ"),
      location_city: "Beirut",
      location_country: "Lebanon",
    });
    expect(desc.length).toBeLessThanOrEqual(156);
  });

  it("falls back to a generated line when there is no bio", () => {
    expect(
      artistSeoDescription({
        bio: null,
        categories: cats("DJ"),
        location_city: "Beirut",
        location_country: "Lebanon",
      }),
    ).toBe(
      "Book dj in Beirut on Fann. Compare portfolios and availability, and book directly — no booking commissions.",
    );
  });
});
