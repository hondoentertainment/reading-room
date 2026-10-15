"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ShelfFile } from "@/components/shelf-file";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShelf } from "@/hooks/use-shelf";
import { SHELVES, STATUS_LABEL, isFiveForKyle, metaLine, timeLabel, whereToStart } from "@/lib/readings";
import { allTags, catalog, entryFor } from "@/lib/shelf";
import type { Reading, ReadingStatus, ShelfId } from "@/lib/types";
import { cn } from "@/lib/utils";

const statuses: Array<ReadingStatus | "all"> = ["all", "to-read", "reading", "done"];

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function statusBadgeClass(status: ReadingStatus): string {
  if (status === "reading") return "border-transparent bg-primary text-primary-foreground";
  if (status === "done") {
    return "border-transparent bg-[oklch(0.42_0.06_155)] text-[oklch(0.97_0.012_90)] dark:bg-[oklch(0.74_0.07_155)] dark:text-[oklch(0.22_0.03_155)]";
  }
  return "border-border bg-transparent text-muted-foreground";
}

function ReadingCard({
  reading,
  status,
  onTag,
}: {
  reading: Reading;
  status: ReadingStatus;
  onTag: (tag: string) => void;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-[0_1px_0_oklch(0.4_0.03_50/0.04)]">
      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline" className={cn("h-6 px-2.5", statusBadgeClass(status))}>
          {STATUS_LABEL[status]}
        </Badge>
        <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
          {timeLabel(reading) ?? "Untimed"}
        </span>
      </div>
      <h2 className="mt-4 font-display text-[1.65rem] leading-tight tracking-tight">
        <Link
          href={`/reading/${reading.slug}`}
          className="rounded-sm underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {reading.title}
        </Link>
      </h2>
      <p className="mt-2 font-serif text-lg text-muted-foreground italic">{reading.author}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{metaLine(reading)}</p>
      {reading.summary ? (
        <p className="mt-3 font-serif text-base leading-7 text-foreground">{reading.summary}</p>
      ) : null}
      {reading.tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {reading.tags.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                onClick={() => onTag(tag)}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground hover:bg-accent"
              >
                {tag}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function ShelfSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-56 animate-pulse rounded-2xl border border-border bg-card" />
      ))}
    </div>
  );
}

export function LibraryView() {
  const shelf = useShelf();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ReadingStatus | "all">("all");
  const [tag, setTag] = useState<string | null>(null);
  const [shelfId, setShelfId] = useState<ShelfId | "all">("all");

  const readings = catalog(shelf.state);
  const tags = useMemo(() => allTags(readings), [readings]);
  const visible = readings.filter((reading) => {
    const entry = entryFor(reading, shelf.state);
    if (status !== "all" && entry.status !== status) return false;
    if (tag && !reading.tags.some((item) => item.toLowerCase() === tag.toLowerCase())) return false;
    if (shelfId !== "all" && reading.shelf !== shelfId) return false;
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    const haystack = [
      reading.title,
      reading.author,
      reading.source,
      reading.published,
      reading.summary,
      reading.resonance,
      reading.question,
      ...reading.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
  const featured = visible.filter(isFiveForKyle);
  const more = visible.filter((reading) => !isFiveForKyle(reading) && !reading.shelf);
  const featuredOrder = readings.filter(isFiveForKyle);
  const shelfSections = SHELVES.map((shelf) => ({
    ...shelf,
    readings: visible.filter((reading) => reading.shelf === shelf.id),
  })).filter((shelf) => shelf.readings.length > 0);

  const filtering = query.trim() !== "" || status !== "all" || tag !== null || shelfId !== "all";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-2xl">
        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">The shelf</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">Five Essays for Kyle</h1>
        <p className="mt-4 font-serif text-lg leading-8 text-muted-foreground">
          Essays selected for your interests in sports, AI, writing, and meaningful connection.
        </p>
      </div>

      {shelfId === "all" ? (
      <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6" aria-labelledby="where-to-start">
        <h2 id="where-to-start" className="font-display text-2xl tracking-tight">
          Where to start
        </h2>
        <ul className="mt-4 space-y-4">
          {whereToStart.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="group block rounded-xl px-1 py-1 hover:bg-secondary/70">
                <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{item.label}</span>
                <span className="mt-1 block font-serif text-lg leading-7 group-hover:underline">{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      ) : null}

      {shelf.error ? (
        <p className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm" role="alert">
          {shelf.error}
        </p>
      ) : null}

      <div className="mt-8 space-y-4">
        <div>
          <label htmlFor="shelf-search" className="text-sm font-medium">
            Search
          </label>
          <Input
            id="shelf-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, author, source, or tag"
            className="mt-2 h-11 md:text-base"
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium" id="status-filter-label">
            Status
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="status-filter-label">
            {statuses.map((item) => (
              <Chip key={item} pressed={status === item} onClick={() => setStatus(item)}>
                {item === "all" ? "All" : STATUS_LABEL[item]}
              </Chip>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium" id="shelf-filter-label">
            Shelf
          </p>
          <div
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
            role="group"
            aria-labelledby="shelf-filter-label"
          >
            <Chip pressed={shelfId === "all"} onClick={() => setShelfId("all")}>
              All shelves
            </Chip>
            {SHELVES.map((shelf) => (
              <Chip key={shelf.id} pressed={shelfId === shelf.id} onClick={() => setShelfId(shelf.id)}>
                {shelf.label}
              </Chip>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium" id="tag-filter-label">
            Tag
          </p>
          <div
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
            role="group"
            aria-labelledby="tag-filter-label"
          >
            <Chip pressed={tag === null} onClick={() => setTag(null)}>
              All tags
            </Chip>
            {tags.map((item) => (
              <Chip key={item} pressed={tag === item} onClick={() => setTag(item)}>
                {item}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground" aria-live="polite">
        {`${visible.length} ${visible.length === 1 ? "piece" : "pieces"}`}
      </p>

      {!shelf.ready && visible.length === 0 ? (
        <div className="mt-4">
          <ShelfSkeleton />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <p className="font-display text-3xl tracking-tight">Nothing matches</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Try another word, or clear the filters and look through the shelf again.
          </p>
          {filtering ? (
            <Button
              type="button"
              variant="outline"
              className="mt-5"
              onClick={() => {
                setQuery("");
                setStatus("all");
                setTag(null);
                setShelfId("all");
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="mt-8 space-y-12">
          {shelfId === "all" && featured.length > 0 ? (
            <section aria-labelledby="five-heading">
              <h2 id="five-heading" className="font-display text-2xl tracking-tight">
                The five
              </h2>
              <ol className="mt-4 space-y-4">
                {featured.map((reading) => (
                  <li key={reading.id} className="grid grid-cols-[auto_1fr] gap-3 sm:gap-4">
                    <span className="pt-5 font-display text-2xl text-muted-foreground tabular-nums">
                      {featuredOrder.findIndex((item) => item.id === reading.id) + 1}
                    </span>
                    <ReadingCard
                      reading={reading}
                      status={entryFor(reading, shelf.state).status}
                      onTag={setTag}
                    />
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          {shelfSections.map((section) => (
            <section key={section.id} aria-labelledby={`shelf-${section.id}`}>
              <h2 id={`shelf-${section.id}`} className="font-display text-2xl tracking-tight">
                {section.label}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {section.readings.map((reading) => (
                  <ReadingCard
                    key={reading.id}
                    reading={reading}
                    status={entryFor(reading, shelf.state).status}
                    onTag={setTag}
                  />
                ))}
              </div>
            </section>
          ))}
          {shelfId === "all" && more.length > 0 ? (
            <section aria-labelledby="more-heading">
              <h2 id="more-heading" className="font-display text-2xl tracking-tight">
                More to read
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {more.map((reading) => (
                  <ReadingCard
                    key={reading.id}
                    reading={reading}
                    status={entryFor(reading, shelf.state).status}
                    onTag={setTag}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}

      <div className="mt-10">
        <ShelfFile state={shelf.state} ready={shelf.ready} onImport={shelf.replace} />
      </div>
    </div>
  );
}
