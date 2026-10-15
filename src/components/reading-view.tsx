"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { NotesBody } from "@/components/notes-body";
import { ShelfFile } from "@/components/shelf-file";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useShelf } from "@/hooks/use-shelf";
import { STATUS_LABEL, findSeeded, metaLine } from "@/lib/readings";
import {
  HIGHLIGHT_MAX,
  addHighlight,
  entryFor,
  removeHighlight,
  setNotes,
  setProgress,
  setRating,
  setStatus,
  withEntry,
} from "@/lib/shelf";
import type { Reading, ShelfState, UserEntry } from "@/lib/types";
import { READING_STATUSES } from "@/lib/types";
import { cn } from "@/lib/utils";

function ReadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6" aria-hidden="true">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-8 h-12 w-4/5 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-6 w-1/2 animate-pulse rounded bg-muted" />
      <div className="mt-8 h-40 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

function MissingReading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl tracking-tight">Not on the shelf</h1>
      <p className="mt-4 max-w-prose font-serif text-lg leading-8 text-muted-foreground">
        That reading isn’t in the seeded list or among the ones added on this device.
      </p>
      <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
        Back to the shelf
      </Link>
    </div>
  );
}

export function ReadingView({ slug }: { slug: string }) {
  const shelf = useShelf();
  const seeded = findSeeded(slug);
  const reading =
    seeded ?? shelf.state.customReadings.find((item) => item.slug === slug) ?? null;

  if (!seeded && !shelf.ready) return <ReadingSkeleton />;
  if (!reading) return <MissingReading />;

  return (
    <ReadingArticle
      reading={reading}
      ready={shelf.ready}
      entry={entryFor(reading, shelf.state)}
      error={shelf.error}
      commit={shelf.commit}
      state={shelf.state}
      replace={shelf.replace}
    />
  );
}

function ReadingArticle({
  reading,
  ready,
  entry,
  error,
  commit,
  state,
  replace,
}: {
  reading: Reading;
  ready: boolean;
  entry: UserEntry;
  error: string | null;
  commit: (updater: (current: ShelfState) => ShelfState) => void;
  state: ShelfState;
  replace: (next: ShelfState) => void;
}) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [draft, setDraft] = useState("");
  const [highlightError, setHighlightError] = useState<string | null>(null);

  function update(mutate: (current: UserEntry) => UserEntry) {
    commit((current) => withEntry(current, reading.id, mutate(entryFor(reading, current))));
  }

  function saveHighlight() {
    const preview = addHighlight(entry, draft, "preview");
    if (preview.error) {
      setHighlightError(preview.error);
      return;
    }
    const id = crypto.randomUUID();
    update((current) => addHighlight(current, draft, id).entry);
    setDraft("");
    setHighlightError(null);
  }

  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Shelf
      </Link>
      <p className="mt-8 text-xs tracking-[0.18em] text-muted-foreground uppercase">
        {STATUS_LABEL[entry.status]}
      </p>
      <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
        {reading.title}
      </h1>
      <p className="mt-4 font-serif text-xl text-muted-foreground italic">{reading.author}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{metaLine(reading)}</p>
      {reading.tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {reading.tags.map((tag) => (
            <li key={tag}>
              <Badge variant="secondary">{tag}</Badge>
            </li>
          ))}
        </ul>
      ) : null}

      <a
        href={reading.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ size: "lg" }), "mt-8 h-12 px-5 text-base")}
      >
        Read the original
        <ArrowUpRight />
      </a>

      <section className="mt-10" aria-labelledby="context-heading">
        <h2 id="context-heading" className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
          Context
        </h2>
        {reading.blurb ? (
          <p className="mt-3 border-l-2 border-primary/50 pl-4 font-serif text-lg leading-8">
            {reading.blurb}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            No context yet. The original is one link away.
          </p>
        )}
        <p className="mt-3 text-sm text-muted-foreground">
          Written for this shelf. It is not a substitute for the piece.
        </p>
      </section>

      {!ready ? (
        <p className="mt-10 text-sm text-muted-foreground">Opening your notes…</p>
      ) : (
        <>
          {error ? (
            <p className="mt-8 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm" role="alert">
              {error}
            </p>
          ) : null}

          <section className="mt-10 rounded-2xl border border-border bg-card p-4 sm:p-5" aria-labelledby="place-heading">
            <h2 id="place-heading" className="font-display text-2xl tracking-tight">
              Your place in it
            </h2>
            <div className="mt-5">
              <p className="text-sm font-medium" id="status-label">
                Status
              </p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="status-label">
                {READING_STATUSES.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant={entry.status === status ? "default" : "outline"}
                    aria-pressed={entry.status === status}
                    onClick={() => update((current) => setStatus(current, status))}
                  >
                    {STATUS_LABEL[status]}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-baseline justify-between gap-3">
                <p id="progress-label" className="text-sm font-medium">
                Progress
              </p>
                <span className="font-display text-lg tabular-nums">{entry.progress}%</span>
              </div>
              <Slider
                className="mt-3 py-2"
                value={[entry.progress]}
                min={0}
                max={100}
                step={1}
                aria-labelledby="progress-label"
                onValueChange={(value) => {
                  const next = Array.isArray(value) ? value[0] : value;
                  if (typeof next !== "number") return;
                  update((current) => setProgress(current, next));
                }}
              />
              <p className="mt-2 text-sm text-muted-foreground">Zero is to-read. The far end is done.</p>
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium" id="rating-label">
                Rating
              </p>
              <div className="mt-2 flex gap-1" role="group" aria-labelledby="rating-label">
                {[1, 2, 3, 4, 5].map((value) => {
                  const active = (entry.rating ?? 0) >= value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={entry.rating === value}
                      aria-label={`Rate ${value} of 5`}
                      onClick={() => update((current) => setRating(current, value))}
                      className={cn(
                        "grid size-11 place-items-center rounded-full border text-lg transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {entry.rating ? `${entry.rating} of 5. Choose it again to clear.` : "Optional. Choose a number, then choose it again to clear."}
              </p>
            </div>
          </section>

          <section className="mt-10" aria-labelledby="notes-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="notes-heading" className="font-display text-2xl tracking-tight">
                  Notes
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">Markdown is fine. Kept on this device.</p>
              </div>
              <div className="flex gap-2" role="group" aria-label="Notes view">
                <Button
                  type="button"
                  size="sm"
                  variant={mode === "write" ? "default" : "outline"}
                  aria-pressed={mode === "write"}
                  onClick={() => setMode("write")}
                >
                  Write
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={mode === "preview" ? "default" : "outline"}
                  aria-pressed={mode === "preview"}
                  onClick={() => setMode("preview")}
                >
                  Preview
                </Button>
              </div>
            </div>
            {mode === "write" ? (
              <Textarea
                value={entry.notes}
                onChange={(event) => {
                  const notes = event.target.value;
                  if (setNotes(entry, notes).error) return;
                  update((current) => setNotes(current, notes).entry);
                }}
                aria-labelledby="notes-heading"
                placeholder="What you noticed, what you argue with, what you want to steal for your own sentences."
                className="mt-4 min-h-64 font-serif text-lg leading-8 md:text-lg"
              />
            ) : (
              <div className="mt-4 rounded-2xl border border-border bg-card px-4 py-2">
                <NotesBody source={entry.notes} />
              </div>
            )}
          </section>

          <section className="mt-10" aria-labelledby="highlights-heading">
            <h2 id="highlights-heading" className="font-display text-2xl tracking-tight">
              Highlights
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Short excerpts you type yourself. A line or two, not a passage.
            </p>
            {entry.highlights.length === 0 ? (
              <p className="mt-4 font-serif text-lg text-muted-foreground italic">
                No lines yet. When a sentence stays with you, put it here.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {entry.highlights.map((highlight) => (
                  <li key={highlight.id} className="rounded-2xl border border-border bg-card px-4 py-3">
                    <blockquote className="font-serif text-lg leading-8 italic">
                      {highlight.text}
                    </blockquote>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-1"
                      onClick={() => update((current) => removeHighlight(current, highlight.id))}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <label htmlFor="highlight-draft" className="text-sm font-medium">
                Add a highlight
              </label>
              <Textarea
                id="highlight-draft"
                value={draft}
                maxLength={HIGHLIGHT_MAX}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type a short line you want to keep."
                className="mt-2 min-h-24 font-serif text-lg leading-8 md:text-lg"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground tabular-nums">
                  {draft.trim().length}/{HIGHLIGHT_MAX}
                </p>
                <Button type="button" onClick={saveHighlight} disabled={draft.trim().length === 0}>
                  Keep this line
                </Button>
              </div>
              {highlightError ? (
                <p className="mt-2 text-sm text-destructive" role="alert">
                  {highlightError}
                </p>
              ) : null}
            </div>
          </section>

          <div className="mt-10">
            <ShelfFile state={state} ready={ready} onImport={replace} />
          </div>
        </>
      )}
    </article>
  );
}
