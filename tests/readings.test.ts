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
  it("leads with Five Essays for Kyle, then the rest of the shelf", () => {
    assert.deepEqual(
      seededReadings.filter((reading) => reading.collection === "five-for-kyle").map((reading) => reading.slug),
      [
        "federer-as-religious-experience",
        "joyas-voladoras",
        "why-ai-isnt-going-to-make-art",
        "how-to-do-great-work",
        "hub-fans-bid-kid-adieu",
      ],
    );
    assert.deepEqual(
      seededReadings.filter((reading) => reading.collection !== "five-for-kyle").map((reading) => reading.slug),
      [
        "frank-sinatra-has-a-cold",
        "consider-the-lobster",
        "this-is-water",
        "the-web-of-the-game",
      ],
    );
    assert.equal(seededReadings[0]?.defaultStatus, "reading");
    assert.ok(seededReadings.slice(1).every((reading) => reading.defaultStatus === "to-read"));
  });

  it("points at the published originals", () => {
    const urls = Object.fromEntries(seededReadings.map((reading) => [reading.slug, reading.url]));
    assert.equal(
      urls["federer-as-religious-experience"],
      "https://www.nytimes.com/2006/08/20/sports/playmagazine/20federer.html",
    );
    assert.equal(urls["joyas-voladoras"], "https://theamericanscholar.org/joyas-volardores/");
    assert.equal(
      urls["why-ai-isnt-going-to-make-art"],
      "https://www.newyorker.com/culture/the-weekend-essay/why-ai-isnt-going-to-make-art",
    );
    assert.equal(urls["how-to-do-great-work"], "https://paulgraham.com/greatwork.html");
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

  it("uses Kyle's notes for the five and keeps every blurb free of copied passages", () => {
    const five = seededReadings.filter((reading) => reading.collection === "five-for-kyle");
    assert.equal(
      five[0]?.question,
      "What sporting moment would I want to describe so vividly that someone else could feel what I felt?",
    );
    assert.equal(
      five[1]?.question,
      "What small detail from my walks around Green Lake could become the starting point for something emotionally larger?",
    );
    assert.equal(five[2]?.question, "Where does AI strengthen my voice, and where might it replace it?");
    assert.equal(
      five[3]?.question,
      "Which project would I keep exploring even if nobody rewarded me for it?",
    );
    assert.equal(five[4]?.question, "Which game from my own life deserves this kind of attention?");
    assert.deepEqual(
      five.map((reading) => reading.readingTime),
      ["25–30 min", "5–7 min", "~20 min", "~45 min", "~30 min"],
    );
    for (const reading of five) {
      assert.equal(reading.blurb, reading.summary);
      assert.ok(reading.resonance);
    }
    assert.ok(five[0]?.summary?.startsWith("Wallace explores"));
    assert.ok(five[1]?.summary?.startsWith("Doyle begins"));
    assert.ok(five[4]?.summary?.startsWith("Ted Williams's final game"));
    for (const reading of seededReadings) {
      const text = [reading.blurb, reading.summary, reading.resonance, reading.question].join(" ");
      assert.ok(wordCount(reading.blurb) < 160, reading.slug);
      assert.ok(reading.blurb.length < 1200);
      for (const phrase of forbidden) {
        assert.equal(text.includes(phrase), false, `${reading.slug} contains ${phrase}`);
      }
    }
  });

  it("uses the requested tags and a stable shape", () => {
    assert.deepEqual(seededReadings[0]?.tags, ["essay", "sports", "tennis", "DFW"]);
    assert.deepEqual(seededReadings[1]?.tags, ["essay", "lyric essay", "nature", "Doyle"]);
    const slugs = seededReadings.map((reading) => reading.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    assert.equal(seededReadings.length, 9);
    for (const reading of seededReadings) {
      assert.ok(reading.title && reading.author && reading.source);
      assert.match(reading.url, /^https?:\/\//);
      assert.ok((reading.minutes ?? 0) > 0);
    }
    assert.equal(minutesLabel(5), "About 5 min");
  });
});
