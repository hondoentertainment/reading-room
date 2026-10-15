export const READING_STATUSES = ["to-read", "reading", "done"] as const;

export type ReadingStatus = (typeof READING_STATUSES)[number];

export const SHELF_IDS = [
  "sports-witness",
  "ai-tech",
  "writing-craft",
  "founders-work",
  "love-connection",
  "body-attention",
  "philosophy-meaning",
] as const;

export type ShelfId = (typeof SHELF_IDS)[number];

export type Reading = {
  id: string;
  slug: string;
  title: string;
  author: string;
  year: number | null;
  published: string;
  source: string;
  url: string;
  tags: string[];
  minutes: number | null;
  /** Shown instead of a single minute count, for example "25–30 min". */
  readingTime?: string;
  blurb: string;
  summary?: string;
  resonance?: string;
  question?: string;
  /** Seeded group. "five-for-kyle" leads the shelf. */
  collection?: "five-for-kyle";
  /** Themed shelf. Every seeded reading belongs to one, including the five. */
  shelf?: ShelfId;
  defaultStatus: ReadingStatus;
};

export type Highlight = {
  id: string;
  text: string;
};

export type UserEntry = {
  status: ReadingStatus;
  progress: number;
  rating: number | null;
  notes: string;
  highlights: Highlight[];
};

export type ShelfState = {
  version: 1;
  customReadings: Reading[];
  entries: Record<string, UserEntry>;
};

export type NewReadingInput = {
  title: string;
  author: string;
  url: string;
  tags: string;
  year: string;
  source: string;
  minutes: string;
  blurb: string;
};

export type FieldName = "title" | "author" | "url" | "tags" | "year" | "source" | "minutes" | "blurb";
