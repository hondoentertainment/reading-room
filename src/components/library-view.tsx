"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ShelfFile } from "@/components/shelf-file";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShelf } from "@/hooks/use-shelf";
import { SHELVES, STATUS_LABEL, isFiveForKyle, metaLine, shelfLabel, timeLabel } from "@/lib/readings";
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
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("h-6 px-2.5", statusBadgeClass(status))}>
            {STATUS_LABEL[status]}
          </Badge>
          {isFiveForKyle(reading) ? (
            <Badge className="h-6 border-transparent bg-primary px-2.5 text-primary-foreground">Start here</Badge>
          ) : null}
        </div>
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
      {reading.shelf ? (
        <p className="mt-1 text-xs tracking-[0.14em] text-muted-foreground uppercase">{shelfLabel(reading.shelf)}</p>
      ) : null}
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
  const filtering = query.trim() !== "" || status !== "all" || tag !== null || shelfId !== "all";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-2xl">
        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">The shelf</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">{"Kyle's Reading Room"}</h1>
        <p className="mt-4 font-serif text-lg leading-8 text-muted-foreground">
          One shelf for sports, AI, writing, and the hope of being known. The five marked Start here are the place to begin.
        </p>
      </div>

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
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {visible.map((reading) => (
            <ReadingCard
              key={reading.id}
              reading={reading}
              status={entryFor(reading, shelf.state).status}
              onTag={setTag}
            />
          ))}
        </div>
      )}

      <div className="mt-10">
        <ShelfFile state={shelf.state} ready={shelf.ready} onImport={shelf.replace} />
      </div>
    </div>
  );
}
