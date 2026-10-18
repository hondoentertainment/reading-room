import { seededReadings, wordCount } from "@/lib/readings";
import type {
  FieldName,
  Highlight,
  NewReadingInput,
  Reading,
  ReadingStatus,
  ShelfState,
  UserEntry,
} from "@/lib/types";
import { READING_STATUSES } from "@/lib/types";

export const HIGHLIGHT_MAX = 280;
export const NOTES_MAX = 100_000;
export const BLURB_MAX = 1_200;

const TITLE_MAX = 180;
const AUTHOR_MAX = 120;
const SOURCE_MAX = 120;
const TAG_MAX = 32;
const TAG_COUNT_MAX = 8;

export function emptyShelf(): ShelfState {
  return { version: 1, customReadings: [], entries: {} };
}

export function slugify(title: string): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "reading";
}

export function uniqueSlug(title: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const base = slugify(title);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function catalog(state: ShelfState): Reading[] {
  return [...seededReadings, ...state.customReadings];
}

export function findReading(slug: string, state: ShelfState): Reading | undefined {
  return catalog(state).find((reading) => reading.slug === slug);
}

export function defaultEntry(reading: Reading): UserEntry {
  return {
    status: reading.defaultStatus,
    progress: 0,
    rating: null,
    notes: "",
    highlights: [],
  };
}

export function entryFor(reading: Reading, state: ShelfState): UserEntry {
  return state.entries[reading.id] ?? defaultEntry(reading);
}

export function allTags(readings: Reading[]): string[] {
  const tags: string[] = [];
  const seen = new Set<string>();
  for (const reading of readings) {
    for (const tag of reading.tags) {
      const key = tag.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      tags.push(tag);
    }
  }
  return tags;
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function withEntry(
  state: ShelfState,
  id: string,
  entry: UserEntry,
): ShelfState {
  return { ...state, entries: { ...state.entries, [id]: entry } };
}

export function setProgress(entry: UserEntry, value: number): UserEntry {
  const progress = clampProgress(value);
  const status: ReadingStatus =
    progress >= 100 ? "done" : progress === 0 ? "to-read" : "reading";
  return { ...entry, progress, status };
}

export function setStatus(entry: UserEntry, status: ReadingStatus): UserEntry {
  if (status === "done") return { ...entry, status, progress: 100 };
  if (status === "to-read") return { ...entry, status, progress: 0 };
  const progress =
    entry.progress > 0 && entry.progress < 100 ? entry.progress : entry.progress >= 100 ? 92 : 8;
  return { ...entry, status, progress };
}

export function setRating(entry: UserEntry, rating: number | null): UserEntry {
  if (rating === null) return { ...entry, rating: null };
  const next = Math.round(rating);
  if (next < 1 || next > 5) return entry;
  return { ...entry, rating: entry.rating === next ? null : next };
}

export function setNotes(entry: UserEntry, notes: string): { entry: UserEntry; error?: string } {
  if (notes.length > NOTES_MAX) {
    return { entry, error: "Those notes are too long to keep in the browser." };
  }
  return { entry: { ...entry, notes } };
}

export function addHighlight(
  entry: UserEntry,
  text: string,
  id: string,
): { entry: UserEntry; error?: string } {
  const trimmed = text.trim();
  if (!trimmed) return { entry, error: "Write a line first." };
  if (trimmed.length > HIGHLIGHT_MAX) {
    return { entry, error: `Keep a highlight to ${HIGHLIGHT_MAX} characters.` };
  }
  const highlight: Highlight = { id, text: trimmed };
  return { entry: { ...entry, highlights: [...entry.highlights, highlight] } };
}

export function removeHighlight(entry: UserEntry, id: string): UserEntry {
  return { ...entry, highlights: entry.highlights.filter((highlight) => highlight.id !== id) };
}

function hostnameSource(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function parseTags(raw: string): { tags: string[]; error?: string } {
  const parts = raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (parts.length > TAG_COUNT_MAX) {
    return { tags: [], error: `Use up to ${TAG_COUNT_MAX} tags.` };
  }
  const tags: string[] = [];
  const seen = new Set<string>();
  for (const tag of parts) {
    if (tag.length > TAG_MAX) {
      return { tags: [], error: `Keep each tag under ${TAG_MAX} characters.` };
    }
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }
  return { tags };
}

export function addReading(
  state: ShelfState,
  input: NewReadingInput,
  id: string,
):
  | { ok: true; state: ShelfState; slug: string }
  | { ok: false; error: string; field: FieldName } {
  const title = input.title.trim();
  const author = input.author.trim();
  const url = input.url.trim();
  const sourceInput = input.source.trim();
  const blurb = input.blurb.trim();

  if (!title) return { ok: false, field: "title", error: "Add a title." };
  if (title.length > TITLE_MAX) {
    return { ok: false, field: "title", error: "That title is too long." };
  }
  if (!author) return { ok: false, field: "author", error: "Add an author." };
  if (author.length > AUTHOR_MAX) {
    return { ok: false, field: "author", error: "That author name is too long." };
  }
  if (!url) return { ok: false, field: "url", error: "Add a link to the original." };
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { ok: false, field: "url", error: "Use a full http or https link." };
  }
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return { ok: false, field: "url", error: "Use a full http or https link." };
  }
  if (catalog(state).some((reading) => reading.url === url)) {
    return { ok: false, field: "url", error: "That link is already on the shelf." };
  }

  const tags = parseTags(input.tags);
  if (tags.error) return { ok: false, field: "tags", error: tags.error };

  let year: number | null = null;
  const yearText = input.year.trim();
  if (yearText) {
    if (!/^\d{4}$/.test(yearText)) {
      return { ok: false, field: "year", error: "Use a four-digit year." };
    }
    year = Number(yearText);
    if (year < 1800 || year > 2100) {
      return { ok: false, field: "year", error: "That year looks off." };
    }
  }

  let minutes: number | null = null;
  const minutesText = input.minutes.trim();
  if (minutesText) {
    if (!/^\d+$/.test(minutesText)) {
      return { ok: false, field: "minutes", error: "Use a whole number of minutes." };
    }
    minutes = Number(minutesText);
    if (minutes < 1 || minutes > 600) {
      return { ok: false, field: "minutes", error: "Keep the estimate between 1 and 600 minutes." };
    }
  }

  if (sourceInput.length > SOURCE_MAX) {
    return { ok: false, field: "source", error: "That source line is too long." };
  }
  if (blurb.length > BLURB_MAX || wordCount(blurb) > 180) {
    return {
      ok: false,
      field: "blurb",
      error: "Keep the context to a short note. The piece itself stays at the link.",
    };
  }

  const slug = uniqueSlug(title, catalog(state).map((reading) => reading.slug));
  const reading: Reading = {
    id,
    slug,
    title,
    author,
    year,
    published: year ? String(year) : "",
    source: sourceInput || hostnameSource(url),
    url,
    tags: tags.tags,
    minutes,
    blurb,
    note: "",
    defaultStatus: "to-read",
  };

  return {
    ok: true,
    slug,
    state: { ...state, customReadings: [...state.customReadings, reading] },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStatus(value: unknown): value is ReadingStatus {
  return typeof value === "string" && (READING_STATUSES as readonly string[]).includes(value);
}

function readHighlight(value: unknown): Highlight | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.text !== "string") return null;
  const text = value.text.trim().slice(0, HIGHLIGHT_MAX);
  if (!text || value.id.length > 80) return null;
  return { id: value.id, text };
}

function readEntry(value: unknown): UserEntry | null {
  if (!isRecord(value) || !isStatus(value.status)) return null;
  if (typeof value.progress !== "number" || typeof value.notes !== "string") return null;
  if (value.notes.length > NOTES_MAX) return null;
  const progress = clampProgress(value.progress);
  const rating =
    value.rating === null
      ? null
      : typeof value.rating === "number" && value.rating >= 1 && value.rating <= 5
        ? Math.round(value.rating)
        : null;
  if (!Array.isArray(value.highlights)) return null;
  const highlights = value.highlights
    .slice(0, 200)
    .map(readHighlight)
    .filter((highlight): highlight is Highlight => highlight !== null);
  return { status: value.status, progress, rating, notes: value.notes, highlights };
}

function readCustom(value: unknown, takenSlugs: Set<string>): Reading | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.slug !== "string") return null;
  if (typeof value.title !== "string" || typeof value.author !== "string") return null;
  if (typeof value.url !== "string" || typeof value.blurb !== "string") return null;
  if (!value.id || value.id.length > 80 || value.slug.length > 80) return null;
  if (takenSlugs.has(value.slug)) return null;
  if (seededReadings.some((reading) => reading.id === value.id || reading.slug === value.slug)) {
    return null;
  }
  try {
    const url = new URL(value.url);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  } catch {
    return null;
  }
  if (value.title.length > TITLE_MAX || value.author.length > AUTHOR_MAX) return null;
  if (value.blurb.length > BLURB_MAX) return null;
  const tags = Array.isArray(value.tags)
    ? value.tags.filter((tag): tag is string => typeof tag === "string").slice(0, TAG_COUNT_MAX)
    : [];
  const year = typeof value.year === "number" ? value.year : null;
  const minutes = typeof value.minutes === "number" ? value.minutes : null;
  const reading: Reading = {
    id: value.id,
    slug: value.slug,
    title: value.title.trim(),
    author: value.author.trim(),
    year,
    published: typeof value.published === "string" ? value.published.slice(0, 40) : year ? String(year) : "",
    source: typeof value.source === "string" ? value.source.slice(0, SOURCE_MAX) : "",
    url: value.url,
    tags: tags.map((tag) => tag.slice(0, TAG_MAX)),
    minutes: minutes && minutes > 0 && minutes <= 600 ? Math.round(minutes) : null,
    blurb: value.blurb.trim(),
    note: typeof value.note === "string" ? value.note.slice(0, 2_000) : "",
    defaultStatus: "to-read",
  };
  takenSlugs.add(reading.slug);
  return reading;
}

export function parseShelf(
  raw: string,
): { ok: true; state: ShelfState } | { ok: false; error: string } {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, error: "That file isn’t valid JSON." };
  }
  if (!isRecord(data) || data.version !== 1) {
    return { ok: false, error: "This room reads shelf files marked version 1." };
  }
  if (!Array.isArray(data.customReadings) || !isRecord(data.entries)) {
    return { ok: false, error: "That file is missing the shelf’s readings or notes." };
  }

  const taken = new Set(seededReadings.map((reading) => reading.slug));
  const customReadings: Reading[] = [];
  for (const item of data.customReadings) {
    const reading = readCustom(item, taken);
    if (!reading) {
      return { ok: false, error: "A reading in that file couldn’t be read. Nothing was changed." };
    }
    customReadings.push(reading);
  }

  const entries: Record<string, UserEntry> = {};
  for (const [id, value] of Object.entries(data.entries)) {
    if (id.length > 80) {
      return { ok: false, error: "A note in that file couldn’t be read. Nothing was changed." };
    }
    const entry = readEntry(value);
    if (!entry) {
      return { ok: false, error: "A note in that file couldn’t be read. Nothing was changed." };
    }
    entries[id] = entry;
  }

  return { ok: true, state: { version: 1, customReadings, entries } };
}

export function serializeShelf(state: ShelfState): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      customReadings: state.customReadings,
      entries: state.entries,
    },
    null,
    2,
  );
}
