"use client";

import { useCallback, useSyncExternalStore } from "react";
import { emptyShelf } from "@/lib/shelf";
import { loadShelf, saveShelf } from "@/lib/storage";
import type { ShelfState } from "@/lib/types";

type ShelfSnapshot = {
  state: ShelfState;
  ready: boolean;
  error: string | null;
};

const serverSnapshot: ShelfSnapshot = {
  state: emptyShelf(),
  ready: false,
  error: null,
};

let snapshot: ShelfSnapshot = serverSnapshot;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function readClientSnapshot(): ShelfSnapshot {
  if (snapshot.ready) return snapshot;
  const loaded = loadShelf();
  snapshot = {
    state: loaded.state,
    ready: true,
    error: loaded.ok ? null : loaded.error,
  };
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return readClientSnapshot();
}

export function useShelf() {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);

  const commit = useCallback((updater: (current: ShelfState) => ShelfState) => {
    const base = readClientSnapshot().state;
    const next = updater(base);
    const saved = saveShelf(next);
    snapshot = saved.ok
      ? { state: next, ready: true, error: null }
      : { state: base, ready: true, error: saved.error };
    emit();
  }, []);

  const replace = useCallback(
    (next: ShelfState) => {
      commit(() => next);
    },
    [commit],
  );

  return {
    state: current.state,
    ready: current.ready,
    error: current.error,
    commit,
    replace,
  };
}
