import { SHELVES, isFiveForKyle } from "@/lib/readings";
import type { Reading, ReadingStatus, ShelfId, UserEntry } from "@/lib/types";
import { READING_STATUSES, SHELF_IDS } from "@/lib/types";

/**
 * Publication order, newest first.
 *
 * A published string becomes a YYYYMMDD number:
 * - "July 24, 2026" uses that calendar day.
 * - "October 2024" (month and year, no day) uses the 1st of that month.
 * - "Autumn 2004" uses the first day of the season:
 *   Spring March 1, Summer June 1, Autumn/Fall September 1, Winter December 1.
 * - "1946" (year only) uses January 1 of that year.
 * - "2nd century" uses January 1 of the first year of that century
 *   (2nd century → 101 CE). That puts Epictetus after every dated essay here.
 * - A missing date falls back to January 1 of `year`, or 0 if that is missing too.
 *   0 sorts last.
 *
 * Ties break by title, then slug. The five Start here essays stay pinned, in
 * their existing order, in the numbered row. They are also listed again inside
 * their shelves, sorted by this date with everything else.
 */
const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

const SEASONS: Record<string, number> = {
  spring: 3,
  summer: 6,
  autumn: 9,
  fall: 9,
  winter: 12,
};

function dateKey(year: number, month = 1, day = 1): number {
  return year * 10000 + month * 100 + day;
}

export function publicationKey(reading: Pick<Reading, "published" | "year">): number {
  const text = reading.published.trim();

  const century = text.match(/^(\d+)(?:st|nd|rd|th)\s+century$/i);
  if (century) {
    const n = Number(century[1]);
    if (n > 0) return dateKey((n - 1) * 100 + 1);
  }

  const season = text.match(/^(spring|summer|autumn|fall|winter)\s+(\d{3,4})$/i);
  if (season) {
    const month = SEASONS[season[1].toLowerCase()];
    if (month) return dateKey(Number(season[2]), month, 1);
  }

  const full = text.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{3,4})$/);
  if (full) {
    const month = MONTHS[full[1].toLowerCase()];
    if (month) return dateKey(Number(full[3]), month, Number(full[2]));
  }

  const monthYear = text.match(/^([A-Za-z]+)\s+(\d{3,4})$/);
  if (monthYear) {
    const month = MONTHS[monthYear[1].toLowerCase()];
    if (month) return dateKey(Number(monthYear[2]), month, 1);
  }

  const yearOnly = text.match(/^(\d{3,4})$/);
  if (yearOnly) return dateKey(Number(yearOnly[1]));

  if (typeof reading.year === "number") return dateKey(reading.year);
  return 0;
}

export function compareByPublication(a: Reading, b: Reading): number {
  const byDate = publicationKey(b) - publicationKey(a);
  if (byDate !== 0) return byDate;
  const byTitle = a.title.localeCompare(b.title);
  if (byTitle !== 0) return byTitle;
  return a.slug.localeCompare(b.slug);
}

const PAYWALL_SOURCE =
  /new yorker|new york times|\bnyt\b|wall street journal|\bwsj\b|\bwired\b|the atlantic|\bharper'?s\b|\btime\b|\besquire\b|london review of books/i;

export function isPaywalled(source: string): boolean {
  return PAYWALL_SOURCE.test(source);
}

export type ShelfQuery = {
  q: string;
  status: ReadingStatus | "all";
  shelf: ShelfId | "all";
  tag: string | null;
  author: string | null;
  unread: boolean;
};

export function readShelfQuery(params: { get(name: string): string | null }): ShelfQuery {
  const statusRaw = params.get("status");
  const shelfRaw = params.get("shelf");
  const tag = params.get("tag");
  const author = params.get("author");
  const status =
    statusRaw && (READING_STATUSES as readonly string[]).includes(statusRaw)
      ? (statusRaw as ReadingStatus)
      : "all";
  const shelf =
    shelfRaw && (SHELF_IDS as readonly string[]).includes(shelfRaw) ? (shelfRaw as ShelfId) : "all";
  return {
    q: params.get("q") ?? "",
    status,
    shelf,
    tag: tag?.trim() ? tag : null,
    author: author?.trim() ? author : null,
    unread: params.get("unread") === "1",
  };
}

export function matchesShelfQuery(reading: Reading, entry: UserEntry, query: ShelfQuery): boolean {
  if (query.status !== "all" && entry.status !== query.status) return false;
  if (query.unread && entry.status === "done") return false;
  if (query.shelf !== "all" && reading.shelf !== query.shelf) return false;
  if (query.tag && !reading.tags.some((tag) => tag.toLowerCase() === query.tag?.toLowerCase())) {
    return false;
  }
  if (query.author && reading.author.toLowerCase() !== query.author.toLowerCase()) return false;
  const needle = query.q.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    reading.title,
    reading.author,
    reading.summary,
    reading.blurb,
    reading.note,
    reading.source,
    reading.published,
    reading.resonance,
    reading.question,
    ...reading.tags,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export type ShelfSection = {
  id: string;
  label: string;
  readings: Reading[];
};

/**
 * Start here stays in the order it arrived (the curated five).
 * Shelf sections include those five again, newest publication first.
 */
export function arrangeShelf(readings: Reading[]): { startHere: Reading[]; sections: ShelfSection[] } {
  const startHere = readings.filter(isFiveForKyle);
  const sorted = readings.slice().sort(compareByPublication);
  const sections: ShelfSection[] = SHELVES.map((shelf) => ({
    id: `shelf-${shelf.id}`,
    label: shelf.label,
    readings: sorted.filter((reading) => reading.shelf === shelf.id),
  })).filter((section) => section.readings.length > 0);
  const unshelved = sorted.filter((reading) => !reading.shelf);
  if (unshelved.length > 0) {
    sections.push({ id: "shelf-unshelved", label: "Unshelved", readings: unshelved });
  }
  return { startHere, sections };
}

export function allAuthors(readings: Reading[]): string[] {
  const authors: string[] = [];
  const seen = new Set<string>();
  for (const reading of readings) {
    const author = reading.author.trim();
    const key = author.toLowerCase();
    if (!author || seen.has(key)) continue;
    seen.add(key);
    authors.push(author);
  }
  return authors.sort((a, b) => a.localeCompare(b));
}
