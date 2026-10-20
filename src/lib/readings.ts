import { moreEssays } from "@/lib/more-essays";
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

/**
 * Curated pairs. Each slug points at essays that belong beside it.
 * Both directions are listed so either card can link to the other.
 */
const PAIRS: Record<string, string[]> = {
  "draft-no-4": ["what-writers-really-do-when-they-write"],
  "what-writers-really-do-when-they-write": ["draft-no-4"],
  "the-bitter-lesson": ["the-bitter-lesson-versus-the-garbage-can"],
  "the-bitter-lesson-versus-the-garbage-can": ["the-bitter-lesson"],
  "why-ai-isnt-going-to-make-art": ["chatgpt-is-a-blurry-jpeg-of-the-web", "ghosts"],
  "chatgpt-is-a-blurry-jpeg-of-the-web": ["why-ai-isnt-going-to-make-art"],
  "machines-of-loving-grace": ["the-urgency-of-interpretability"],
  "the-urgency-of-interpretability": ["machines-of-loving-grace"],
  "federer-as-religious-experience": ["the-web-of-the-game"],
  "the-web-of-the-game": ["federer-as-religious-experience"],
  "politics-and-the-english-language": ["shooting-an-elephant"],
  "shooting-an-elephant": ["politics-and-the-english-language"],
  "how-to-do-great-work": ["the-bus-ticket-theory-of-genius"],
  "the-bus-ticket-theory-of-genius": ["how-to-do-great-work"],
  "this-is-water": ["the-enchiridion"],
  "the-enchiridion": ["this-is-water"],
  "why-ai-will-save-the-world": ["the-myth-of-a-superhuman-ai"],
  "the-myth-of-a-superhuman-ai": ["why-ai-will-save-the-world"],
  "there-is-no-ai": ["digital-maoism"],
  "digital-maoism": ["there-is-no-ai"],
  "the-poet": ["the-summer-day", "on-fear"],
  "the-summer-day": ["the-poet"],
  "on-fear": ["the-poet"],
  "the-philosophy-of-composition": ["one-art", "digging"],
  "one-art": ["the-philosophy-of-composition"],
  "digging": ["the-philosophy-of-composition"],
  "someday-ill-love-ocean-vuong": ["having-a-coke-with-you"],
  "having-a-coke-with-you": ["someday-ill-love-ocean-vuong"],
  "shipping-out": ["consider-the-lobster"],
  "consider-the-lobster": ["shipping-out"],
  "ghosts": ["why-ai-isnt-going-to-make-art"],
  "the-weight-of-glory": ["gazing-into-the-abyss"],
  "gazing-into-the-abyss": ["the-weight-of-glory"],
  "on-fairy-stories": ["c-s-lewis-reviews-the-hobbit-1937"],
  "c-s-lewis-reviews-the-hobbit-1937": ["on-fairy-stories"],
  "the-silent-season-of-a-hero": ["hub-fans-bid-kid-adieu"],
  "hub-fans-bid-kid-adieu": ["the-silent-season-of-a-hero"],
};

type ReadingSeed = Omit<Reading, "note"> & { note?: string };

function attachShelfMeta(reading: ReadingSeed): Reading {
  return {
    ...reading,
    note: reading.note ?? "",
    pairsWith: reading.pairsWith ?? PAIRS[reading.id],
  };
}

const seededSource: ReadingSeed[] = [
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
    shelf: "sports-witness",
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
    shelf: "writing-craft",
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
    shelf: "ai-tech",
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
    shelf: "founders-work",
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
    shelf: "sports-witness",
    ...curated(
      "Ted Williams's final game: Fenway's atmosphere, a complicated relationship with fans, and the weight of a remarkable career ending.",
      "Baseball, sports memorabilia, and storytelling meet; a single afternoon can hold decades of meaning.",
      "Which game from my own life deserves this kind of attention?",
      "~30 min",
    ),
  },
  ...shelfEssays,
  ...moreEssays,
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
    readingTime: "~60 min",
    defaultStatus: "to-read",
    shelf: "writing-craft",
    blurb:
      "Talese builds a portrait of Frank Sinatra from the rooms and people around him, after the singer refuses an interview and spends the winter in a dark mood.",
    summary:
      "Talese builds a portrait of Frank Sinatra from the rooms and people around him, after the singer refuses an interview and spends the winter in a dark mood.",
    resonance:
      "A lesson for a novelist: you can write someone who will not sit down and explain himself, if you stay close to the life around him.",
    question: "Who in Xavier Transport would I understand better by writing the people around them?",
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
    readingTime: "~40 min",
    defaultStatus: "to-read",
    shelf: "philosophy-meaning",
    blurb:
      "Wallace goes to the Maine Lobster Festival for a food magazine and cannot leave the harder question alone: what it means to boil a living animal for a pleasant afternoon.",
    summary:
      "Wallace goes to the Maine Lobster Festival for a food magazine and cannot leave the harder question alone: what it means to boil a living animal for a pleasant afternoon.",
    resonance:
      "The poems and the products share this habit. Follow a pleasure until it turns into a question you cannot shrug off.",
    question: "Where am I treating a comfortable habit as if it had no cost?",
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
    readingTime: "~20 min",
    defaultStatus: "to-read",
    shelf: "philosophy-meaning",
    blurb:
      "In a commencement speech, Wallace asks graduates to notice the water of ordinary adult life, and to treat attention itself as the freedom they still have.",
    summary:
      "In a commencement speech, Wallace asks graduates to notice the water of ordinary adult life, and to treat attention itself as the freedom they still have.",
    resonance:
      "Green Lake, the gym, and a Wednesday night are all water. The speech asks whether you are actually there for them.",
    question: "What did I move through today without noticing it was the life I meant to be living?",
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
    readingTime: "~35 min",
    defaultStatus: "to-read",
    shelf: "sports-witness",
    blurb:
      "Angell sits at a college game with an old pitcher beside him, and the innings in front of them keep changing places with a game from long ago.",
    summary:
      "Angell sits at a college game with an old pitcher beside him, and the innings in front of them keep changing places with a game from long ago.",
    resonance:
      "Deep Seats is this essay's wager: a game you witnessed can hold another person's memory, if someone writes the two afternoons together.",
    question: "Which game of mine is still unfinished until I tell it to someone who was not there?",
  },
];

export const seededReadings: Reading[] = seededSource.map(attachShelfMeta);

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

export const SHELVES: ReadonlyArray<{ id: ShelfId; label: string; color: string; roman: string }> = [
  { id: "sports-witness", label: "Sports & Witness", color: "#8C3B2E", roman: "I" },
  { id: "ai-tech", label: "AI", color: "#33546B", roman: "II" },
  { id: "tech-internet", label: "Tech & the Internet", color: "#3D6A6A", roman: "III" },
  { id: "writing-craft", label: "Writing & Craft", color: "#7A5A2B", roman: "IV" },
  { id: "founders-work", label: "Founders & Great Work", color: "#3E5A43", roman: "V" },
  { id: "love-connection", label: "Love, Friendship & Connection", color: "#9A4B5A", roman: "VI" },
  { id: "body-attention", label: "Body, Health & Attention", color: "#6B5B86", roman: "VII" },
  { id: "philosophy-meaning", label: "Philosophy & Meaning", color: "#6A5344", roman: "VIII" },
  { id: "humor", label: "Humor", color: "#A5683A", roman: "IX" },
  { id: "memoir", label: "Memoir & Personal Essay", color: "#5C6B7A", roman: "X" },
  { id: "poetry", label: "Poetry", color: "#6E4F6A", roman: "XI" },
];

export function shelfLabel(id: ShelfId): string {
  return SHELVES.find((shelf) => shelf.id === id)?.label ?? id;
}
