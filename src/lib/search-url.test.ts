import { describe, it, expect } from "vitest";
import {
  readArtistSearchUrl,
  readPlannerSearchUrl,
  buildArtistSearchQuery,
  buildPlannerSearchQuery,
  resolveCategorySelection,
  selectionToUrlSlugs,
  apiCategorySlugs,
  validateEventTypes,
  parsePage,
} from "./search-url";
import type { CategoryGroup } from "@/types/artists";

// A cut-down copy of the real taxonomy from migration 005 — two groups, real
// slugs. "band-group" and "mc-host" specifically, because those are the two
// the footer links point at and the two that were previously wrong.
function group(slug: string, leaves: string[]): CategoryGroup {
  return {
    id: `id-${slug}`,
    name: slug,
    slug,
    icon: null,
    sort_order: 1,
    categories: leaves.map((leaf) => ({ id: `id-${leaf}`, name: leaf, slug: leaf })),
  };
}

const GROUPS: CategoryGroup[] = [
  group("music", ["dj", "singer-vocalist", "band-group", "oud-player"]),
  group("visual", ["photographer", "videographer"]),
  group("performance-entertainment", ["mc-host", "magician"]),
];

function params(search: string) {
  return new URLSearchParams(search);
}

describe("parsePage", () => {
  it("defaults to 1 for anything that is not a positive integer", () => {
    expect(parsePage(null)).toBe(1);
    expect(parsePage("")).toBe(1);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-3")).toBe(1);
    expect(parsePage("1.5")).toBe(1);
    // parseInt would read this as 2; a malformed page should not half-work.
    expect(parsePage("2abc")).toBe(1);
    expect(parsePage("banana")).toBe(1);
  });

  it("reads a valid page", () => {
    expect(parsePage("2")).toBe(2);
    expect(parsePage("47")).toBe(47);
  });
});

describe("readArtistSearchUrl", () => {
  it("reads an empty URL as empty state", () => {
    expect(readArtistSearchUrl(params(""))).toEqual({ q: "", categories: [], page: 1 });
  });

  it("reads the full set", () => {
    expect(readArtistSearchUrl(params("q=jazz&categories=band-group&page=2"))).toEqual({
      q: "jazz",
      categories: ["band-group"],
      page: 2,
    });
  });

  it("accepts both comma-separated and repeated list forms", () => {
    expect(readArtistSearchUrl(params("categories=dj,band-group")).categories).toEqual([
      "dj",
      "band-group",
    ]);
    expect(readArtistSearchUrl(params("categories=dj&categories=band-group")).categories).toEqual([
      "dj",
      "band-group",
    ]);
  });

  it("trims whitespace and drops empty entries", () => {
    expect(readArtistSearchUrl(params("q=%20jazz%20&categories=dj,,%20band-group%20"))).toEqual({
      q: "jazz",
      categories: ["dj", "band-group"],
      page: 1,
    });
  });
});

describe("resolveCategorySelection", () => {
  it("maps a leaf slug onto its parent group with the leaf ticked", () => {
    expect(resolveCategorySelection(GROUPS, ["band-group"])).toEqual({
      group: "music",
      subs: ["band-group"],
    });
    expect(resolveCategorySelection(GROUPS, ["mc-host"])).toEqual({
      group: "performance-entertainment",
      subs: ["mc-host"],
    });
  });

  it("maps a group slug onto the group with nothing ticked", () => {
    expect(resolveCategorySelection(GROUPS, ["music"])).toEqual({ group: "music", subs: [] });
  });

  it("keeps several leaves from the same group", () => {
    expect(resolveCategorySelection(GROUPS, ["dj", "band-group"])).toEqual({
      group: "music",
      subs: ["dj", "band-group"],
    });
  });

  // The filter can only show one group at a time, so there is nowhere to put
  // the second group's leaves. Narrowing beats sending a filter the UI is not
  // displaying.
  it("narrows leaves from more than one group to the first group seen", () => {
    expect(resolveCategorySelection(GROUPS, ["band-group", "photographer"])).toEqual({
      group: "music",
      subs: ["band-group"],
    });
  });

  it("drops unknown slugs so a stale bookmark broadens rather than errors", () => {
    expect(resolveCategorySelection(GROUPS, ["retired-slug"])).toEqual({ group: null, subs: [] });
    expect(resolveCategorySelection(GROUPS, ["retired-slug", "dj"])).toEqual({
      group: "music",
      subs: ["dj"],
    });
  });

  it("dedupes repeated slugs", () => {
    expect(resolveCategorySelection(GROUPS, ["dj", "dj"])).toEqual({ group: "music", subs: ["dj"] });
  });

  it("resolves to nothing while the category list is still loading", () => {
    expect(resolveCategorySelection([], ["band-group"])).toEqual({ group: null, subs: [] });
  });
});

describe("apiCategorySlugs", () => {
  it("expands a group with nothing ticked to all of its leaves", () => {
    expect(apiCategorySlugs(GROUPS, { group: "visual", subs: [] })).toEqual([
      "photographer",
      "videographer",
    ]);
  });

  it("sends only the ticked leaves when there are any", () => {
    expect(apiCategorySlugs(GROUPS, { group: "music", subs: ["dj"] })).toEqual(["dj"]);
  });

  it("sends nothing when no group is selected", () => {
    expect(apiCategorySlugs(GROUPS, { group: null, subs: [] })).toEqual([]);
  });
});

describe("URL round trip", () => {
  // The property that matters: a URL renders exactly the state it describes,
  // and that state reproduces that URL. Anything that fails this makes a
  // shared or bookmarked search show something other than what was shared.
  const cases = [
    "",
    "q=jazz",
    "categories=music",
    "categories=band-group",
    "categories=dj%2Cband-group",
    "page=2",
    "q=jazz&categories=band-group&page=2",
    "q=oud&categories=music&page=7",
    "categories=mc-host",
  ];

  for (const search of cases) {
    it(`is stable for "${search || "(empty)"}"`, () => {
      const read = readArtistSearchUrl(params(search));
      const selection = resolveCategorySelection(GROUPS, read.categories);
      const rebuilt = buildArtistSearchQuery({
        q: read.q,
        categories: selectionToUrlSlugs(selection),
        page: read.page,
      });
      expect(rebuilt).toBe(search);
    });
  }

  it("normalises a URL that cannot round trip, rather than half-applying it", () => {
    // Two groups at once: the UI shows Music, so the URL must be rewritten to
    // say Music. The alternative is a URL that disagrees with the screen.
    const read = readArtistSearchUrl(params("categories=band-group,photographer"));
    const selection = resolveCategorySelection(GROUPS, read.categories);
    expect(
      buildArtistSearchQuery({ q: read.q, categories: selectionToUrlSlugs(selection), page: read.page }),
    ).toBe("categories=band-group");
  });

  it("drops a page beyond the defaults rather than pinning page=1 in the URL", () => {
    const read = readArtistSearchUrl(params("page=1"));
    expect(buildArtistSearchQuery({ q: read.q, categories: [], page: read.page })).toBe("");
  });
});

describe("planner view", () => {
  const AVAILABLE = ["Wedding", "Corporate Event", "Private Party"];

  it("reads and rebuilds event types, including ones with spaces", () => {
    const read = readPlannerSearchUrl(params("q=beirut&eventTypes=Corporate+Event&page=3"));
    expect(read).toEqual({ q: "beirut", eventTypes: ["Corporate Event"], page: 3 });
    expect(buildPlannerSearchQuery(read)).toBe("q=beirut&eventTypes=Corporate+Event&page=3");
  });

  it("keeps several event types", () => {
    const read = readPlannerSearchUrl(params("eventTypes=Wedding,Private+Party"));
    expect(read.eventTypes).toEqual(["Wedding", "Private Party"]);
  });

  it("drops event types the API does not offer", () => {
    expect(validateEventTypes(AVAILABLE, ["Wedding", "Bar Mitzvah"])).toEqual(["Wedding"]);
    expect(validateEventTypes(AVAILABLE, ["Wedding", "Wedding"])).toEqual(["Wedding"]);
  });

  it("holds back every event type while the list is still loading", () => {
    expect(validateEventTypes([], ["Wedding"])).toEqual([]);
  });
});
