import { shelfEssays } from "@/lib/shelf-essays";
import type { Reading, ReadingStatus, ShelfId } from "@/lib/types";

export const STATUS_LABEL: Record<ReadingStatus, string> = {
  "to-read": "To read",
  reading: "Reading",
  done: "Done",
};

/**
 * Seeded shelf. Blurbs are original context written for this app.
 * The essays themselves are not stored here — only links to where they were published.
 */
const FIVE = "five-for-kyle" as const;

function curated(
  summary: string,
  resonance: string,
  question: string,
  readingTime: string,
): Pick<Reading, "blurb" | "summary" | "resonance" | "question" | "readingTime" | "collection"> {
  return {
    blurb: summary,
    summary,
    resonance,
    question,
    readingTime,
    collection: FIVE,
  };
}

export const whereToStart = [
  {
    label: "Emotional read",
    href: "/reading/joyas-voladoras",
    text: "Start with Doyle. Read once for feeling, again to notice how he creates it.",
  },
  {
    label: "Provocative discussion",
    href: "/reading/why-ai-isnt-going-to-make-art",
    text: "Start with Chiang.",
  },
  {
    label: "Focus and ambition",
    href: "/reading/how-to-do-great-work",
    text: "Read Graham when you have time to reflect.",
  },
] as const;

export const seededReadings: Reading[] = [
  {
    id: "federer-as-religious-experience",
    slug: "federer-as-religious-experience",
    title: "Federer as Religious Experience",
    author: "David Foster Wallace",
    year: 2006,
    published: "August 20, 2006",
    source: "Play Magazine / The New York Times",
    url: "https://www.nytimes.com/2006/08/20/sports/playmagazine/20federer.html",
    tags: ["essay", "sports", "tennis", "DFW"],
    minutes: 28,
    defaultStatus: "reading",
    ...curated(
      "Wallace explores the awe of watching an extraordinary athlete: the physical beauty, the impossible moments, and the difference between watching on television and being there.",
      "Brings together love of sports, analytical mind, and writing ambitions; connects with the emotional purpose behind Deep Seats: preserving what it felt like to witness something unforgettable.",
      "What sporting moment would I want to describe so vividly that someone else could feel what I felt?",
      "25–30 min",
    ),
  },
  {
    id: "joyas-voladoras",
    slug: "joyas-voladoras",
    title: "Joyas Voladoras",
    author: "Brian Doyle",
    year: 2004,
    published: "Autumn 2004",
    source: "The American Scholar",
    url: "https://theamericanscholar.org/joyas-volardores/",
    tags: ["essay", "lyric essay", "nature", "Doyle"],
    minutes: 6,
    defaultStatus: "to-read",
    ...curated(
      "Doyle begins with hummingbirds and moves through the hearts of other creatures into human vulnerability, loneliness, and love; the shift from physical observation to emotional revelation is beautifully controlled.",
      "Kyle's poetry explores longing, connection, and the hope of being known; shows how an ordinary image can carry a powerful feeling without explaining everything.",
      "What small detail from my walks around Green Lake could become the starting point for something emotionally larger?",
      "5–7 min",
    ),
  },
  {
    id: "why-ai-isnt-going-to-make-art",
    slug: "why-ai-isnt-going-to-make-art",
    title: "Why A.I. Isn't Going to Make Art",
    author: "Ted Chiang",
    year: 2024,
    published: "August 31, 2024",
    source: "The New Yorker",
    url: "https://www.newyorker.com/culture/the-weekend-essay/why-ai-isnt-going-to-make-art",
    tags: ["essay", "AI", "writing", "Chiang"],
    minutes: 20,
    defaultStatus: "to-read",
    ...curated(
      "Chiang argues that art emerges from the countless intentional choices a creator makes, and questions what happens when those choices are delegated to AI.",
      "Sits between AI and writing; a chance to decide which creative decisions to keep.",
      "Where does AI strengthen my voice, and where might it replace it?",
      "~20 min",
    ),
  },
  {
    id: "how-to-do-great-work",
    slug: "how-to-do-great-work",
    title: "How to Do Great Work",
    author: "Paul Graham",
    year: 2023,
    published: "July 2023",
    source: "paulgraham.com",
    url: "https://paulgraham.com/greatwork.html",
    tags: ["essay", "work", "writing", "Graham"],
    minutes: 45,
    defaultStatus: "to-read",
    ...curated(
      "An expansive essay about finding worthwhile work through curiosity, developing expertise, and pursuing ideas others overlook.",
      "Ambitions across product, AI, and authorship; which interests deserve sustained attention and how an unusual combination becomes an advantage.",
      "Which project would I keep exploring even if nobody rewarded me for it?",
      "~45 min",
    ),
  },
  {
    id: "hub-fans-bid-kid-adieu",
    slug: "hub-fans-bid-kid-adieu",
    title: "Hub Fans Bid Kid Adieu",
    author: "John Updike",
    year: 1960,
    published: "October 22, 1960",
    source: "The New Yorker",
    url: "https://www.newyorker.com/magazine/1960/10/22/hub-fans-bid-kid-adieu",
    tags: ["essay", "sports", "baseball", "Updike"],
    minutes: 30,
    defaultStatus: "to-read",
    ...curated(
      "Ted Williams's final game: Fenway's atmosphere, a complicated relationship with fans, and the weight of a remarkable career ending.",
      "Baseball, sports memorabilia, and storytelling meet; a single afternoon can hold decades of meaning.",
      "Which game from my own life deserves this kind of attention?",
      "~30 min",
    ),
  },
  ...shelfEssays,
  {
    id: "frank-sinatra-has-a-cold",
    slug: "frank-sinatra-has-a-cold",
    title: "Frank Sinatra Has a Cold",
    author: "Gay Talese",
    year: 1966,
    published: "April 1966",
    source: "Esquire",
    url: "https://www.esquire.com/news-politics/a638/frank-sinatra-has-a-cold-gay-talese/",
    tags: ["essay", "profile", "journalism", "Talese"],
    minutes: 60,
    defaultStatus: "to-read",
    blurb:
      "Esquire sent Gay Talese to write about Frank Sinatra in the winter of 1965. Sinatra had a cold, was in a dark mood, and would not sit for an interview. Talese stayed in Los Angeles and built the portrait from the people and rooms around him. It ran in April 1966 and became a model for writing about a famous person who refuses to talk.",
  },
  {
    id: "consider-the-lobster",
    slug: "consider-the-lobster",
    title: "Consider the Lobster",
    author: "David Foster Wallace",
    year: 2004,
    published: "August 2004",
    source: "Gourmet",
    url: "http://www.gourmet.com.s3-website-us-east-1.amazonaws.com/magazine/2000s/2004/08/consider_the_lobster.html",
    tags: ["essay", "food", "ethics", "DFW"],
    minutes: 40,
    defaultStatus: "to-read",
    blurb:
      "Gourmet sent David Foster Wallace to the 2003 Maine Lobster Festival. What it published in August 2004 will not stay inside a festival report. Wallace walks the crowds and the food, then keeps circling the pot and the question of boiling a living animal for dinner. The essay is long, footnoted, and deliberately uneasy.",
  },
  {
    id: "this-is-water",
    slug: "this-is-water",
    title: "This Is Water",
    author: "David Foster Wallace",
    year: 2005,
    published: "May 21, 2005",
    source: "Kenyon College commencement",
    url: "https://www.kenyon.edu/news/archive/this-is-water/",
    tags: ["essay", "speech", "DFW"],
    minutes: 20,
    defaultStatus: "to-read",
    blurb:
      "David Foster Wallace gave the Kenyon College commencement address on May 21, 2005. He starts with fish who cannot see the water they are swimming in, then talks about the practical freedom to choose what you notice on an ordinary adult day. The speech came to be called This Is Water. Kenyon still hosts the record of it.",
  },
  {
    id: "the-web-of-the-game",
    slug: "the-web-of-the-game",
    title: "The Web of the Game",
    author: "Roger Angell",
    year: 1981,
    published: "July 20, 1981",
    source: "The New Yorker",
    url: "https://www.newyorker.com/magazine/1981/07/20/the-web-of-the-game",
    tags: ["essay", "sports", "baseball", "Angell"],
    minutes: 35,
    defaultStatus: "to-read",
    blurb:
      "Roger Angell’s piece in the July 20, 1981 issue of The New Yorker sits at Yale Field during a college game: Ron Darling pitching for Yale, Frank Viola for St. John’s, and the old pitcher Smokey Joe Wood in the seat beside Angell. The innings on the field and Wood’s memory of an earlier baseball keep changing places, until the two afternoons feel like one cloth.",
  },
];

export function wordCount(text: string): number {
  const words = text.trim().match(/[A-Za-z0-9’']+/g);
  return words?.length ?? 0;
}

export function findSeeded(slug: string): Reading | undefined {
  return seededReadings.find((reading) => reading.slug === slug);
}

export function minutesLabel(minutes: number | null): string | null {
  if (!minutes) return null;
  return `About ${minutes} min`;
}

export function timeLabel(
  reading: Pick<Reading, "minutes" | "readingTime">,
): string | null {
  return reading.readingTime ?? minutesLabel(reading.minutes);
}

export function metaLine(
  reading: Pick<Reading, "published" | "source" | "minutes" | "readingTime">,
): string {
  const parts = [reading.published, reading.source, timeLabel(reading)].filter(
    (part): part is string => Boolean(part),
  );
  return parts.join(" · ");
}

export function isFiveForKyle(reading: Reading): boolean {
  return reading.collection === "five-for-kyle";
}

export const SHELVES: ReadonlyArray<{ id: ShelfId; label: string }> = [
  { id: "sports-witness", label: "Sports & Witness" },
  { id: "ai-tech", label: "AI, Tech & the Future" },
  { id: "writing-craft", label: "Writing & Craft" },
  { id: "founders-work", label: "Founders & Great Work" },
  { id: "love-connection", label: "Love, Friendship & Connection" },
  { id: "body-attention", label: "Body, Health & Attention" },
  { id: "philosophy-meaning", label: "Philosophy & Meaning" },
];

export function shelfLabel(id: ShelfId): string {
  return SHELVES.find((shelf) => shelf.id === id)?.label ?? id;
}
