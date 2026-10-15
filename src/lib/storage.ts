import { emptyShelf, parseShelf } from "@/lib/shelf";
import type { ShelfState } from "@/lib/types";

export const SHELF_KEY = "krr.shelf.v1";

export function loadShelf():
  | { ok: true; state: ShelfState }
  | { ok: false; error: string; state: ShelfState } {
  if (typeof window === "undefined") return { ok: true, state: emptyShelf() };
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(SHELF_KEY);
  } catch {
    return {
      ok: false,
      error: "This browser blocked local storage, so notes can’t be kept here.",
      state: emptyShelf(),
    };
  }
  if (!raw) return { ok: true, state: emptyShelf() };
  const parsed = parseShelf(raw);
  if (!parsed.ok) {
    return {
      ok: false,
      error: `${parsed.error} Your previous file was left untouched.`,
      state: emptyShelf(),
    };
  }
  return parsed;
}

export function saveShelf(state: ShelfState): { ok: true } | { ok: false; error: string } {
  try {
    window.localStorage.setItem(SHELF_KEY, JSON.stringify(state));
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "This browser couldn’t save the shelf. Export a copy before you leave.",
    };
  }
}
