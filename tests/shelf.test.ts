import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addHighlight,
  addReading,
  catalog,
  defaultEntry,
  emptyShelf,
  parseShelf,
  removeHighlight,
  serializeShelf,
  setProgress,
  setRating,
  setStatus,
  uniqueSlug,
} from "../src/lib/shelf";
import { seededReadings } from "../src/lib/readings";

const blank = {
  title: "",
  author: "",
  url: "",
  tags: "",
  year: "",
  source: "",
  minutes: "",
  blurb: "",
};

describe("shelf", () => {
  it("moves status with the progress slider", () => {
    const start = defaultEntry(seededReadings[1]!);
    assert.equal(start.status, "to-read");
    const started = setProgress(start, 12.4);
    assert.equal(started.progress, 12);
    assert.equal(started.status, "reading");
    const finished = setProgress(started, 100);
    assert.equal(finished.status, "done");
    const cleared = setProgress(finished, 0);
    assert.equal(cleared.status, "to-read");
  });

  it("aligns progress when status is chosen directly", () => {
    const start = defaultEntry(seededReadings[0]!);
    const done = setStatus(start, "done");
    assert.equal(done.progress, 100);
    const reading = setStatus(done, "reading");
    assert.equal(reading.status, "reading");
    assert.equal(reading.progress, 92);
    const unread = setStatus(reading, "to-read");
    assert.equal(unread.progress, 0);
    assert.equal(setStatus(unread, "reading").progress, 8);
  });

  it("keeps highlights short and removable", () => {
    const start = defaultEntry(seededReadings[0]!);
    const empty = addHighlight(start, "   ", "q1");
    assert.ok(empty.error);
    const tooLong = addHighlight(start, "a".repeat(281), "q1");
    assert.ok(tooLong.error);
    const added = addHighlight(start, "  a line worth keeping  ", "q1");
    assert.equal(added.entry.highlights[0]?.text, "a line worth keeping");
    const removed = removeHighlight(added.entry, "q1");
    assert.equal(removed.highlights.length, 0);
    const rated = setRating(setRating(start, 4), 4);
    assert.equal(rated.rating, null);
  });

  it("adds a reading after the seeded shelf", () => {
    const result = addReading(
      emptyShelf(),
      {
        ...blank,
        title: "A New Piece",
        author: "Ada Writer",
        url: "https://example.com/piece",
        tags: "essay, Essay, night",
        year: "1999",
        minutes: "12",
        blurb: "A note in my own words.",
      },
      "custom-1",
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.slug, "a-new-piece");
    assert.deepEqual(catalog(result.state).at(-1)?.tags, ["essay", "night"]);
    assert.equal(catalog(result.state)[0]?.slug, "federer-as-religious-experience");
    const again = addReading(
      result.state,
      { ...blank, title: "A New Piece", author: "Ada Writer", url: "https://example.com/other" },
      "custom-2",
    );
    assert.equal(again.ok && again.slug, "a-new-piece-2");
    assert.equal(uniqueSlug("Federer as Religious Experience", ["federer-as-religious-experience"]), "federer-as-religious-experience-2");
  });

  it("round-trips a shelf file and rejects a bad one", () => {
    const created = addReading(
      emptyShelf(),
      { ...blank, title: "Night Game", author: "Ada Writer", url: "https://example.com/night" },
      "custom-1",
    );
    assert.equal(created.ok, true);
    if (!created.ok) return;
    const withNotes = {
      ...created.state,
      entries: {
        "federer-as-religious-experience": {
          ...defaultEntry(seededReadings[0]!),
          notes: "My margin.",
          progress: 40,
          status: "reading" as const,
          highlights: [{ id: "h1", text: "A short line." }],
        },
      },
    };
    const parsed = parseShelf(serializeShelf(withNotes));
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.state.customReadings[0]?.title, "Night Game");
    assert.equal(parsed.state.entries["federer-as-religious-experience"]?.notes, "My margin.");
    assert.equal(parseShelf("[]").ok, false);
    assert.equal(parseShelf("{").ok, false);
  });
});
