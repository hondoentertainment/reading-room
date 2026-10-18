import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SHELVES, minutesLabel, seededReadings, timeLabel, wordCount } from "../src/lib/readings";

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
      seededReadings.slice(0, 5).map((reading) => reading.slug),
      [
        "federer-as-religious-experience",
        "joyas-voladoras",
        "why-ai-isnt-going-to-make-art",
        "how-to-do-great-work",
        "hub-fans-bid-kid-adieu",
      ],
    );
    assert.ok(seededReadings.every((reading) => reading.shelf));
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
    assert.equal(urls["software-2-0"], "https://karpathy.medium.com/software-2-0-a64152b37c35");
    assert.equal(urls["the-scaling-hypothesis"], "https://gwern.net/scaling-hypothesis");
    assert.equal(
      urls["the-urgency-of-interpretability"],
      "https://darioamodei.com/post/the-urgency-of-interpretability",
    );
    assert.equal(
      urls["there-is-no-ai"],
      "https://www.newyorker.com/science/annals-of-artificial-intelligence/there-is-no-ai",
    );
    assert.equal(urls["the-age-of-ai-has-begun"], "https://www.gatesnotes.com/the-age-of-ai-has-begun");
    assert.equal(
      urls["the-myth-of-a-superhuman-ai"],
      "https://www.wired.com/2017/04/the-myth-of-a-superhuman-ai/",
    );
    assert.equal(
      urls["this-changes-everything"],
      "https://www.nytimes.com/2023/03/12/opinion/chatbots-artificial-intelligence-future-weirdness.html",
    );
    assert.equal(
      urls["plentiful-high-paying-jobs-in-the-age-of-ai"],
      "https://www.noahpinion.blog/p/plentiful-high-paying-jobs-in-the",
    );
    assert.equal(
      urls["why-i-dont-think-agi-is-right-around-the-corner"],
      "https://www.dwarkesh.com/p/timelines-june-2025",
    );
    assert.equal(urls["feature-visualization"], "https://distill.pub/2017/feature-visualization/");
    assert.equal(urls["aggregation-theory"], "https://stratechery.com/2015/aggregation-theory/");
    assert.equal(urls["shipping-out"], "https://harpers.org/archive/1996/01/shipping-out/");
    assert.equal(urls["crying-in-h-mart"], "https://www.newyorker.com/culture/culture-desk/crying-in-h-mart");
    assert.equal(urls["one-art"], "https://www.poetryfoundation.org/poems/47536/one-art");
    assert.equal(urls["digging"], "https://www.poetryfoundation.org/poems/47555/digging");
    assert.equal(urls["on-fear"], "https://www.poetryfoundation.org/poetrymagazine/articles/69815/on-fear");
    assert.equal(
      seededReadings.find((reading) => reading.slug === "digital-maoism")?.shelf,
      "tech-internet",
    );
    assert.equal(seededReadings.find((reading) => reading.slug === "one-art")?.kind, "poem");
    assert.equal(
      seededReadings.find((reading) => reading.slug === "twenty-little-poems-that-could-save-america")?.kind,
      "essay",
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
    assert.equal(seededReadings.length, 125);
    const shelved = seededReadings.filter((reading) => reading.shelf);
    assert.equal(shelved.length, 125);
    assert.deepEqual(
      SHELVES.map((shelf) => shelved.filter((reading) => reading.shelf === shelf.id).length),
      [11, 36, 9, 10, 8, 7, 6, 9, 9, 8, 12],
    );
    for (const slug of [
      "situational-awareness",
      "the-intelligence-age",
      "the-gentle-singularity",
      "ai-as-normal-technology",
      "centaurs-and-cyborgs",
      "speaking-things-into-existence",
      "writes-and-write-nots",
      "what-is-chatgpt-doing",
      "will-ai-become-the-new-mckinsey",
      "llms-are-cultural-technologies",
      "microgpt",
      "things-we-learned-about-llms-in-2024",
      "why-ai-will-save-the-world",
      "the-bitter-lesson-versus-the-garbage-can",
      "lebron-james-an-odyssey",
      "software-2-0",
      "the-scaling-hypothesis",
      "the-urgency-of-interpretability",
      "there-is-no-ai",
      "the-age-of-ai-has-begun",
      "the-myth-of-a-superhuman-ai",
      "this-changes-everything",
      "plentiful-high-paying-jobs-in-the-age-of-ai",
      "why-i-dont-think-agi-is-right-around-the-corner",
    ]) {
      assert.ok(slugs.includes(slug), slug);
    }
    const urls = new Set(seededReadings.map((reading) => reading.url));
    assert.equal(urls.size, seededReadings.length);
    for (const reading of seededReadings.filter((item) => !item.collection)) {
      assert.equal(reading.blurb, reading.summary);
      assert.ok(reading.resonance && reading.question && reading.readingTime);
      assert.ok(wordCount(reading.summary ?? "") <= 80, reading.slug);
      assert.ok(wordCount(reading.summary ?? "") >= 15, reading.slug);
    }
    for (const reading of seededReadings) {
      assert.ok(reading.title && reading.author && reading.source);
      assert.match(reading.url, /^https?:\/\//);
      assert.ok((reading.minutes ?? 0) > 0);
    }
    assert.equal(minutesLabel(5), "About 5 min");
  });

  it("keeps an author, shelf, and read time on every entry", () => {
    assert.ok(seededReadings.length > 0);
    for (const reading of seededReadings) {
      assert.equal(typeof reading.author, "string", reading.slug);
      assert.ok(reading.author.trim(), `${reading.slug} is missing an author`);
      assert.ok(reading.shelf, `${reading.slug} is missing a shelf`);
      assert.ok(SHELVES.some((shelf) => shelf.id === reading.shelf), `${reading.slug} has an unknown shelf`);
      assert.equal(typeof reading.readingTime, "string", reading.slug);
      assert.ok(reading.readingTime?.trim(), `${reading.slug} is missing a read time`);
      assert.equal(timeLabel(reading), reading.readingTime, reading.slug);
      assert.ok(reading.tags.length > 0, `${reading.slug} is missing tags`);
      assert.equal(reading.note, "", `${reading.slug} should keep an empty note placeholder`);
    }
    const draft = seededReadings.find((reading) => reading.slug === "draft-no-4");
    const saunders = seededReadings.find((reading) => reading.slug === "what-writers-really-do-when-they-write");
    assert.deepEqual(draft?.pairsWith, ["what-writers-really-do-when-they-write"]);
    assert.deepEqual(saunders?.pairsWith, ["draft-no-4"]);
    for (const reading of seededReadings) {
      for (const slug of reading.pairsWith ?? []) {
        const partner = seededReadings.find((item) => item.slug === slug);
        assert.ok(partner, `${reading.slug} pairs with a missing essay ${slug}`);
        assert.ok(
          partner?.pairsWith?.includes(reading.slug),
          `${slug} does not pair back to ${reading.slug}`,
        );
      }
    }
  });
});
