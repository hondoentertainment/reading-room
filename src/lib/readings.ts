import type { Reading, ReadingStatus } from "@/lib/types";

export const STATUS_LABEL: Record<ReadingStatus, string> = {
  "to-read": "To read",
  reading: "Reading",
  done: "Done",
};

/**
 * Seeded shelf. Blurbs are original context written for this app.
 * The essays themselves are not stored here — only links to where they were published.
 */
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
    minutes: 25,
    defaultStatus: "reading",
    blurb:
      "In July 2006, Roger Federer and Rafael Nadal played the Wimbledon men’s final, a match that made ordinary tennis language feel too small. Writing for Play Magazine in The New York Times that August, David Foster Wallace tried to name what he saw in Federer’s game: brief stretches when the body seems to solve space while the point is still live. He called them Federer Moments. The essay treats those moments as a kind of beauty specific to sport — not decoration on top of the score, but the score itself becoming something you feel in the chest. This page does not stand in for the piece. It keeps a link to the Times text, and room for your notes.",
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
    minutes: 5,
    defaultStatus: "to-read",
    blurb:
      "Brian Doyle’s short lyric essay appeared in The American Scholar in autumn 2004. It begins with the hummingbird, whose heart is almost the whole animal and beats too fast for our ears, then sets that frenzy beside the blue whale, whose heart is a room and whose pulse is a slow tide. Between those two scales he turns to the human heart: the one that has to carry love, fear, and loss at a pace we can actually feel. The piece is brief and wide. Read it at the magazine; this page is for the lines and notes you want to keep.",
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
    minutes: 28,
    defaultStatus: "to-read",
    blurb:
      "On September 28, 1960, John Updike sat at Fenway Park for Ted Williams’s last home game. The New Yorker ran his account that October. It is a farewell from the stands: an oddly shaped ballpark, a tired team, and a player who could end the day with one swing and still withhold the salute the crowd wanted. Sports writing, here, behaves like a story about fame.",
  },
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

export function metaLine(reading: Pick<Reading, "published" | "source" | "minutes">): string {
  const parts = [reading.published, reading.source, minutesLabel(reading.minutes)].filter(
    (part): part is string => Boolean(part),
  );
  return parts.join(" · ");
}
