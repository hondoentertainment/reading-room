import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seededReadings } from "../src/lib/readings";
import { defaultEntry } from "../src/lib/shelf";
import {
  allAuthors,
  arrangeShelf,
  isPaywalled,
  matchesShelfQuery,
  publicationKey,
  readShelfQuery,
} from "../src/lib/shelf-view";

const dated = (published: string, year: number | null = null) => ({ published, year });

describe("publication order", () => {
  it("parses full dates, month-year, seasons, years, and centuries", () => {
    assert.equal(publicationKey(dated("July 24, 2026", 2026)), 20260724);
    assert.equal(publicationKey(dated("April 2025", 2025)), 20250401);
    assert.equal(publicationKey(dated("Autumn 2004", 2004)), 20040901);
    assert.equal(publicationKey(dated("Spring 1999", 1999)), 19990301);
    assert.equal(publicationKey(dated("Summer 1999", 1999)), 19990601);
    assert.equal(publicationKey(dated("Winter 1999", 1999)), 19991201);
    assert.equal(publicationKey(dated("1946", 1946)), 19460101);
    assert.equal(publicationKey(dated("April 1846", 1846)), 18460401);
    assert.equal(publicationKey(dated("2nd century", null)), 1010101);
    assert.ok(publicationKey(dated("July 24, 2026")) > publicationKey(dated("June 2, 2025")));
    assert.ok(publicationKey(dated("April 1846")) > publicationKey(dated("1844")));
    assert.ok(publicationKey(dated("1844")) > publicationKey(dated("2nd century")));
  });

  it("puts LeBron first and Epictetus last, with Start here pinned above the shelves", () => {
    for (const reading of seededReadings) {
      assert.ok(publicationKey(reading) > 0, reading.slug);
    }
    const keys = seededReadings.map(publicationKey);
    const lebron = seededReadings.find((reading) => reading.slug === "lebron-james-an-odyssey");
    const epictetus = seededReadings.find((reading) => reading.slug === "the-enchiridion");
    assert.equal(publicationKey(lebron!), Math.max(...keys));
    assert.equal(publicationKey(epictetus!), Math.min(...keys));

    const arranged = arrangeShelf(seededReadings);
    assert.deepEqual(
      arranged.startHere.map((reading) => reading.slug),
      [
        "federer-as-religious-experience",
        "joyas-voladoras",
        "why-ai-isnt-going-to-make-art",
        "how-to-do-great-work",
        "hub-fans-bid-kid-adieu",
      ],
    );
    assert.equal(arranged.sections[0]?.readings[0]?.slug, "lebron-james-an-odyssey");
    const philosophy = arranged.sections.find((section) => section.id === "shelf-philosophy-meaning");
    assert.equal(philosophy?.readings.at(-1)?.slug, "the-enchiridion");
    const ai = arranged.sections.find((section) => section.id === "shelf-ai-tech");
    assert.equal(ai?.readings[0]?.slug, "microgpt");
  });
});

describe("shelf query", () => {
  it("reads shareable params and matches title, author, summary, author, and unread", () => {
    const query = readShelfQuery(
      new URLSearchParams("q=Bradley&author=John%20McPhee&unread=1&shelf=sports-witness&status=to-read"),
    );
    assert.equal(query.q, "Bradley");
    assert.equal(query.author, "John McPhee");
    assert.equal(query.unread, true);
    assert.equal(query.shelf, "sports-witness");
    assert.equal(query.status, "to-read");

    const sense = seededReadings.find((reading) => reading.slug === "a-sense-of-where-you-are")!;
    const entry = defaultEntry(sense);
    assert.equal(matchesShelfQuery(sense, entry, query), true);
    assert.equal(
      matchesShelfQuery(sense, { ...entry, status: "done", progress: 100 }, query),
      false,
    );
    assert.equal(
      matchesShelfQuery(sense, entry, { ...query, q: "hummingbirds" }),
      false,
    );

    const joyas = seededReadings.find((reading) => reading.slug === "joyas-voladoras")!;
    assert.equal(
      matchesShelfQuery(joyas, defaultEntry(joyas), {
        q: "hummingbirds",
        status: "all",
        shelf: "all",
        tag: null,
        author: null,
        unread: false,
      }),
      true,
    );
  });

  it("lists each author once and flags paywalled sources", () => {
    const authors = allAuthors(seededReadings);
    assert.equal(authors.filter((author) => author === "John McPhee").length, 1);
    assert.ok(authors[0]!.localeCompare(authors[1]!) < 0);
    assert.equal(isPaywalled("The New Yorker"), true);
    assert.equal(isPaywalled("Play Magazine / The New York Times"), true);
    assert.equal(isPaywalled("Wired"), true);
    assert.equal(isPaywalled("The Wall Street Journal"), true);
    assert.equal(isPaywalled("The Atlantic"), true);
    assert.equal(isPaywalled("Harper's"), true);
    assert.equal(isPaywalled("Time"), true);
    assert.equal(isPaywalled("Esquire"), true);
    assert.equal(isPaywalled("London Review of Books"), true);
    assert.equal(isPaywalled("Poetry Foundation"), false);
    assert.equal(isPaywalled("paulgraham.com"), false);
    assert.equal(isPaywalled("Andreessen Horowitz"), false);
  });
});
