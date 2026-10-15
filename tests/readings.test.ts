import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { minutesLabel, seededReadings, wordCount } from "../src/lib/readings";

const forbidden = [
  "Gods do not answer letters",
  "pencil eraser",
  "Consider the hummingbird",
  "lyric little bandbox",
  "Morning, boys",
  "How’s the water",
  "How's the water",
];

describe("seeded shelf", () => {
  it("opens with Federer, then Joyas Voladoras", () => {
    assert.equal(seededReadings[0]?.slug, "federer-as-religious-experience");
    assert.equal(seededReadings[1]?.slug, "joyas-voladoras");
    assert.equal(seededReadings[0]?.defaultStatus, "reading");
    assert.ok(seededReadings.slice(2).every((reading) => reading.defaultStatus === "to-read"));
  });

  it("points at the published originals", () => {
    const urls = Object.fromEntries(seededReadings.map((reading) => [reading.slug, reading.url]));
    assert.equal(
      urls["federer-as-religious-experience"],
      "https://www.nytimes.com/2006/08/20/sports/playmagazine/20federer.html",
    );
    assert.equal(urls["joyas-voladoras"], "https://theamericanscholar.org/joyas-volardores/");
    assert.equal(
      urls["hub-fans-bid-kid-adieu"],
      "https://www.newyorker.com/magazine/1960/10/22/hub-fans-bid-kid-adieu",
    );
    assert.equal(
      urls["frank-sinatra-has-a-cold"],
      "https://www.esquire.com/news-politics/a638/frank-sinatra-has-a-cold-gay-talese/",
    );
    assert.equal(
      urls["consider-the-lobster"],
      "http://www.gourmet.com.s3-website-us-east-1.amazonaws.com/magazine/2000s/2004/08/consider_the_lobster.html",
    );
    assert.equal(urls["this-is-water"], "https://www.kenyon.edu/news/archive/this-is-water/");
    assert.equal(
      urls["the-web-of-the-game"],
      "https://www.newyorker.com/magazine/1981/07/20/the-web-of-the-game",
    );
  });

  it("keeps original context short and free of copied passages", () => {
    const counts = Object.fromEntries(
      seededReadings.map((reading) => [reading.slug, wordCount(reading.blurb)]),
    );
    assert.ok(counts["federer-as-religious-experience"] >= 100);
    assert.ok(counts["federer-as-religious-experience"] <= 140);
    assert.ok(counts["joyas-voladoras"] >= 85);
    assert.ok(counts["joyas-voladoras"] <= 120);
    for (const reading of seededReadings) {
      assert.ok(wordCount(reading.blurb) < 160, reading.slug);
      assert.ok(reading.blurb.length < 1200);
      for (const phrase of forbidden) {
        assert.equal(reading.blurb.includes(phrase), false, `${reading.slug} contains ${phrase}`);
      }
    }
  });

  it("uses the requested tags and a stable shape", () => {
    assert.deepEqual(seededReadings[0]?.tags, ["essay", "sports", "tennis", "DFW"]);
    assert.deepEqual(seededReadings[1]?.tags, ["essay", "lyric essay", "nature", "Doyle"]);
    const slugs = seededReadings.map((reading) => reading.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    assert.equal(seededReadings.length, 7);
    for (const reading of seededReadings) {
      assert.ok(reading.title && reading.author && reading.source);
      assert.match(reading.url, /^https?:\/\//);
      assert.ok((reading.minutes ?? 0) > 0);
    }
    assert.equal(minutesLabel(5), "About 5 min");
  });
});
