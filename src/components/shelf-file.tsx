"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { parseShelf, serializeShelf } from "@/lib/shelf";
import type { ShelfState } from "@/lib/types";

export function ShelfFile({
  state,
  ready,
  onImport,
}: {
  state: ShelfState;
  ready: boolean;
  onImport: (state: ShelfState) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  function exportShelf() {
    const blob = new Blob([serializeShelf(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kyles-reading-room.json";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Exported. The file holds your notes, highlights, progress, and added readings.");
  }

  async function importShelf(file: File) {
    const text = await file.text();
    const parsed = parseShelf(text);
    if (!parsed.ok) {
      setMessage(parsed.error);
      return;
    }
    const confirmed = window.confirm(
      "Replace notes, highlights, progress, ratings, and added readings on this device with this file?",
    );
    if (!confirmed) {
      setMessage("Import canceled. Nothing changed.");
      return;
    }
    onImport(parsed.state);
    setMessage("Imported. This device is now using that shelf file.");
  }

  return (
    <details className="rounded-2xl border border-border bg-card/70 px-4 py-3">
      <summary className="cursor-pointer text-sm font-medium">Shelf file</summary>
      <p className="mt-3 max-w-prose text-sm leading-6 text-muted-foreground">
        Notes, highlights, progress, ratings, and readings you add stay in this browser. Export a
        JSON copy, or import one later. The seeded essays stay in the app.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={exportShelf} disabled={!ready}>
          Export
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={!ready}
        >
          Import
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void importShelf(file);
          }}
        />
      </div>
      {message ? (
        <p className="mt-3 text-sm" role="status">
          {message}
        </p>
      ) : null}
    </details>
  );
}
