"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ShelfFile } from "@/components/shelf-file";
import { useShelf } from "@/hooks/use-shelf";
import { SHELVES, timeLabel } from "@/lib/readings";
import { catalog, entryFor, setStatus, withEntry } from "@/lib/shelf";
import {
  arrangeShelf,
  isPaywalled,
  matchesShelfQuery,
  readShelfQuery,
} from "@/lib/shelf-view";
import type { Reading, ReadingStatus, ShelfId } from "@/lib/types";

const PREVIEW_COUNT = 4;
const AUTHOR_PREVIEW = 12;

function shelfMeta(id: ShelfId | undefined) {
  return SHELVES.find((shelf) => shelf.id === id);
}

function kindLabel(reading: Reading): string {
  return reading.kind === "poem" ? "Poem" : "Essay";
}

function noteText(reading: Reading, notes: string): string {
  return notes.trim() || reading.note.trim();
}

export function LibraryView() {
  const shelf = useShelf();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = readShelfQuery(searchParams);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(filters.q);
  const [syncedQuery, setSyncedQuery] = useState(filters.q);
  if (filters.q !== syncedQuery) {
    setSyncedQuery(filters.q);
    setQuery(filters.q);
  }
  const [surpriseMessage, setSurpriseMessage] = useState<string | null>(null);
  const [authorsOpen, setAuthorsOpen] = useState(false);
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    document.getElementById(id)?.scrollIntoView();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      searchRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function replaceQuery(patch: Record<string, string | null>) {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const qs = next.toString();
    const hash = window.location.hash;
    router.replace(`${pathname}${qs ? `?${qs}` : ""}${hash}`, { scroll: false });
  }

  const readings = catalog(shelf.state);
  const bySlug = useMemo(() => new Map(readings.map((reading) => [reading.slug, reading])), [readings]);
  const activeQuery = { ...filters, q: query };
  const visible = readings.filter((reading) =>
    matchesShelfQuery(reading, entryFor(reading, shelf.state), activeQuery),
  );
  const arranged = arrangeShelf(visible);
  const filtering =
    query.trim() !== "" ||
    filters.status !== "all" ||
    filters.tag !== null ||
    filters.shelf !== "all" ||
    filters.author !== null ||
    filters.unread;

  const shelfCounts = useMemo(() => {
    const counts = new Map<ShelfId, number>();
    for (const reading of readings) {
      if (!reading.shelf) continue;
      counts.set(reading.shelf, (counts.get(reading.shelf) ?? 0) + 1);
    }
    return counts;
  }, [readings]);

  const rankedAuthors = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const reading of readings) {
      const name = reading.author.trim();
      const key = name.toLowerCase();
      if (!name) continue;
      const current = counts.get(key);
      if (current) current.count += 1;
      else counts.set(key, { name, count: 1 });
    }
    return [...counts.values()].sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    );
  }, [readings]);

  const authorChips = authorsOpen ? rankedAuthors : rankedAuthors.slice(0, AUTHOR_PREVIEW);
  const hiddenAuthors = Math.max(0, rankedAuthors.length - AUTHOR_PREVIEW);

  const doneCount = readings.filter((reading) => entryFor(reading, shelf.state).status === "done").length;
  const unreadCount = readings.length - doneCount;
  const notedCount = readings.filter((reading) =>
    Boolean(noteText(reading, entryFor(reading, shelf.state).notes)),
  ).length;
  const minutesLeft = readings.reduce((total, reading) => {
    if (entryFor(reading, shelf.state).status === "done") return total;
    return total + (reading.minutes ?? 0);
  }, 0);
  const hoursLeft = Math.round(minutesLeft / 60);
  const readShare = readings.length === 0 ? 0 : Math.round((doneCount / readings.length) * 100);

  function mark(reading: Reading, status: ReadingStatus) {
    shelf.commit((current) =>
      withEntry(current, reading.id, setStatus(entryFor(reading, current), status)),
    );
  }

  function surprise() {
    const unread = readings.filter((reading) => entryFor(reading, shelf.state).status !== "done");
    if (unread.length === 0) {
      setSurpriseMessage("Every piece on the shelf is marked read.");
      return;
    }
    setSurpriseMessage(null);
    const pick = unread[Math.floor(Math.random() * unread.length)];
    if (!pick) return;
    router.push(`/reading/${pick.slug}`);
  }

  function sectionOpen(id: string, index: number) {
    if (filtering) return true;
    if (filters.shelf !== "all") return id === `shelf-${filters.shelf}`;
    if (id in closed) return !closed[id];
    return index === 0;
  }

  const ledgerQuestion =
    arranged.startHere[0]?.question ??
    readings.find((reading) => reading.question)?.question ??
    "What is worth keeping?";

  return (
    <div className="room">
      <header className="mast">
        <div className="topline">
          <span className="rule" />
          <span>Est. 2026</span>
          <span aria-hidden="true">·</span>
          <span>A personal library</span>
          <span aria-hidden="true">·</span>
          <span>{readings.length} volumes</span>
          <span className="rule" />
        </div>
        <h1>
          Kyle&apos;s <em>Reading Room</em>
        </h1>
        <p className="tagline">Essays, poems, and the hope of being known.</p>
        <div className="dbl" />
      </header>

      {arranged.startHere.length > 0 ? (
        <section aria-labelledby="start-heading">
          <div className="secthead">
            <p className="kicker" id="start-heading">
              Start here
            </p>
            <h2>Five to begin</h2>
            <p className="hint">Pinned in the order they were chosen. They also sit in their shelves.</p>
          </div>
          <div className="startrow">
            {arranged.startHere.map((reading, index) => {
              const meta = shelfMeta(reading.shelf);
              return (
                <article key={reading.id} className="sh" style={{ ["--shelf" as string]: meta?.color }}>
                  <div className="cap" />
                  <p className="num">{String(index + 1).padStart(2, "0")}</p>
                  <p className="shshelf">{meta?.label}</p>
                  <h3>
                    <Link href={`/reading/${reading.slug}`}>{reading.title}</Link>
                  </h3>
                  <p className="sha">{reading.author}</p>
                  <p className="shrt">{timeLabel(reading)}</p>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="controls" aria-label="Filters">
        <div className="searchrow">
          <label className="search">
            <span className="mag" aria-hidden="true">
              ⌕
            </span>
            <input
              ref={searchRef}
              id="shelf-search"
              value={query}
              onChange={(event) => {
                const value = event.target.value;
                setQuery(value);
                replaceQuery({ q: value.trim() ? value : null });
              }}
              placeholder="Title, author, or summary"
            />
            <kbd className="kbd">/</kbd>
          </label>
          <button
            type="button"
            className="unread"
            aria-pressed={filters.unread}
            onClick={() => replaceQuery({ unread: filters.unread ? null : "1" })}
          >
            <span className={filters.unread ? "sw on" : "sw"}>
              <span className="knob" />
            </span>
            Show unread
          </button>
          <button type="button" className="surprise" onClick={surprise}>
            Surprise me
          </button>
        </div>
        {surpriseMessage ? (
          <p className="hint" role="status">
            {surpriseMessage}
          </p>
        ) : null}

        <p className="label" id="shelf-filter-label">
          Shelves
        </p>
        <div className="tabs" role="group" aria-labelledby="shelf-filter-label">
          <button
            type="button"
            className={filters.shelf === "all" ? "tab on" : "tab"}
            aria-pressed={filters.shelf === "all"}
            onClick={() => replaceQuery({ shelf: null })}
          >
            All <b>{readings.length}</b>
          </button>
          {SHELVES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={filters.shelf === item.id ? "tab on" : "tab"}
              aria-pressed={filters.shelf === item.id}
              style={{ ["--shelf" as string]: item.color }}
              onClick={() => replaceQuery({ shelf: filters.shelf === item.id ? null : item.id })}
            >
              <i />
              {item.label} <b>{shelfCounts.get(item.id) ?? 0}</b>
            </button>
          ))}
        </div>

        <p className="label" id="author-filter-label">
          Authors
        </p>
        <div className="achips" role="group" aria-labelledby="author-filter-label">
          <button
            type="button"
            className={filters.author === null ? "achip on" : "achip"}
            aria-pressed={filters.author === null}
            onClick={() => replaceQuery({ author: null })}
          >
            All
          </button>
          {authorChips.map((author) => {
            const pressed = filters.author?.toLowerCase() === author.name.toLowerCase();
            return (
              <button
                key={author.name}
                type="button"
                className={pressed ? "achip on" : "achip"}
                aria-pressed={pressed}
                onClick={() => replaceQuery({ author: pressed ? null : author.name })}
              >
                {author.name}
              </button>
            );
          })}
          {hiddenAuthors > 0 ? (
            <button type="button" className="achip" onClick={() => setAuthorsOpen((open) => !open)}>
              {authorsOpen ? "Fewer authors" : `+ ${hiddenAuthors} more`}
            </button>
          ) : null}
        </div>
      </section>

      {shelf.error ? (
        <p className="room-alert" role="alert">
          {shelf.error}
        </p>
      ) : null}

      <div className="body">
        <div>
          <p className="live" aria-live="polite">
            {visible.length} {visible.length === 1 ? "piece" : "pieces"}
            {filtering ? " match" : ""}
          </p>
          {visible.length === 0 ? (
            <div className="empty">
              <p>Nothing matches.</p>
              <button type="button" className="more" onClick={() => router.replace(pathname, { scroll: false })}>
                Clear filters
              </button>
            </div>
          ) : (
            arranged.sections.map((section, index) => {
              const meta = SHELVES.find((item) => section.id === `shelf-${item.id}`);
              const open = sectionOpen(section.id, index);
              const readHere = section.readings.filter(
                (reading) => entryFor(reading, shelf.state).status === "done",
              ).length;
              const authors = [...new Set(section.readings.map((reading) => reading.author))].slice(0, 3);
              const showAll = filtering || expanded[section.id];
              const shown = showAll ? section.readings : section.readings.slice(0, PREVIEW_COUNT);
              const hidden = section.readings.length - shown.length;
              return (
                <section key={section.id} id={section.id} style={{ ["--shelf" as string]: meta?.color }}>
                  <button
                    type="button"
                    className={open ? "sect" : "sect closed"}
                    aria-expanded={open}
                    onClick={() => setClosed((current) => ({ ...current, [section.id]: open }))}
                  >
                    <span className="roman">{meta?.roman}</span>
                    <span className="stitle">
                      <h2>{section.label}</h2>
                      <span className="sx">{authors.join(", ")}</span>
                    </span>
                    <span className="scount">
                      {section.readings.length} {section.readings.length === 1 ? "piece" : "pieces"} · {readHere}{" "}
                      read
                    </span>
                    <span className="chev" aria-hidden="true">
                      {open ? "–" : "+"}
                    </span>
                  </button>
                  {open ? (
                    <>
                      <div className="grid">
                        {shown.map((reading) => {
                          const entry = entryFor(reading, shelf.state);
                          const partners = (reading.pairsWith ?? [])
                            .map((slug) => bySlug.get(slug))
                            .filter((partner): partner is Reading => Boolean(partner));
                          const note = noteText(reading, entry.notes);
                          const paywalled = isPaywalled(reading.source);
                          const color = shelfMeta(reading.shelf)?.color;
                          const read = entry.status === "done";
                          return (
                            <article
                              key={reading.id}
                              id={reading.slug}
                              className="card"
                              style={{ ["--shelf" as string]: color }}
                            >
                              <span className="spine" />
                              <div className="cardtop">
                                <p className="shelf">
                                  <i />
                                  {kindLabel(reading)}
                                </p>
                                {reading.collection === "five-for-kyle" ? (
                                  <span className="startmark">★ Start here</span>
                                ) : null}
                                <span className="spacer" />
                                <span className={paywalled ? "badge pay" : "badge free"}>
                                  {paywalled ? "Paywall" : "Free to read"}
                                </span>
                              </div>
                              <h3>
                                <Link href={`/reading/${reading.slug}`}>{reading.title}</Link>
                              </h3>
                              <div className="byline">
                                <button
                                  type="button"
                                  className="author"
                                  aria-pressed={filters.author?.toLowerCase() === reading.author.toLowerCase()}
                                  onClick={() =>
                                    replaceQuery({
                                      author:
                                        filters.author?.toLowerCase() === reading.author.toLowerCase()
                                          ? null
                                          : reading.author,
                                    })
                                  }
                                >
                                  <span className="dot" />
                                  {reading.author}
                                </button>
                                <p className="meta">
                                  {reading.published}
                                  {reading.source ? <em> · {reading.source}</em> : null}
                                </p>
                              </div>
                              <p className="sum">{reading.summary ?? reading.blurb}</p>
                              <p className={note ? "note filled" : "note"}>
                                <span className="notelabel">Marginal note</span>
                                {note ? <span>{note}</span> : <span className="ph">Add a marginal note…</span>}
                              </p>
                              {partners.length > 0 ? (
                                <p className="pair">
                                  <span>Pairs well with </span>
                                  {partners.map((partner, partnerIndex) => (
                                    <span key={partner.slug}>
                                      {partnerIndex > 0 ? ", " : null}
                                      <Link href={`/reading/${partner.slug}`}>{partner.title}</Link>
                                    </span>
                                  ))}
                                </p>
                              ) : null}
                              <div className="cardfoot">
                                <p className="rt">{timeLabel(reading)}</p>
                                <div className="toggle" role="group" aria-label={`Mark ${reading.title}`}>
                                  <button
                                    type="button"
                                    className={read ? "" : "on"}
                                    aria-pressed={!read}
                                    onClick={() => mark(reading, "to-read")}
                                  >
                                    To read
                                  </button>
                                  <button
                                    type="button"
                                    className={read ? "on read" : ""}
                                    aria-pressed={read}
                                    onClick={() => mark(reading, "done")}
                                  >
                                    Read
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                      {hidden > 0 ? (
                        <button
                          type="button"
                          className="more"
                          onClick={() => setExpanded((current) => ({ ...current, [section.id]: true }))}
                        >
                          Show {hidden} more
                        </button>
                      ) : null}
                    </>
                  ) : null}
                </section>
              );
            })
          )}
        </div>

        <aside className="ledger" aria-label="Ledger">
          <p className="lh">Ledger</p>
          <p className="big">
            {doneCount}
            <span>/{readings.length}</span>
          </p>
          <p className="lsub">pieces marked read on this device</p>
          <div className="bar" aria-hidden="true">
            <i style={{ width: `${readShare}%` }} />
          </div>
          <p className="lrow">
            <span>To read</span>
            <span>{unreadCount}</span>
          </p>
          <p className="lrow">
            <span>With notes</span>
            <span>{notedCount}</span>
          </p>
          <p className="lrow">
            <span>Hours left</span>
            <span>≈{hoursLeft}</span>
          </p>
          <p className="lq">{ledgerQuestion}</p>
        </aside>
      </div>

      <footer className="foot">
        <p>Kyle&apos;s Reading Room</p>
        <p>Notes and progress are saved on this device.</p>
        <Link href="/add">Add a piece</Link>
      </footer>
      <details className="file">
        <summary>Import or export this shelf</summary>
        <ShelfFile state={shelf.state} ready={shelf.ready} onImport={shelf.replace} />
      </details>
    </div>
  );
}
