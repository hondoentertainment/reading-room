export type Inline =
  | { kind: "text"; text: string }
  | { kind: "strong"; text: string }
  | { kind: "em"; text: string }
  | { kind: "link"; text: string; href: string };

export type Block =
  | { kind: "p"; lines: Inline[][] }
  | { kind: "ul"; items: Inline[][] };

const INLINE =
  /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;

export function parseInlines(input: string): Inline[] {
  const inlines: Inline[] = [];
  const pattern = new RegExp(INLINE.source, "g");
  let cursor = 0;
  for (const match of input.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      inlines.push({ kind: "text", text: input.slice(cursor, index) });
    }
    if (match[1] && match[2]) {
      inlines.push({ kind: "link", text: match[1], href: match[2] });
    } else if (match[3]) {
      inlines.push({ kind: "strong", text: match[3] });
    } else if (match[4]) {
      inlines.push({ kind: "em", text: match[4] });
    }
    cursor = index + match[0].length;
  }
  if (cursor < input.length) {
    inlines.push({ kind: "text", text: input.slice(cursor) });
  }
  return inlines;
}

function isList(lines: string[]): boolean {
  return lines.length > 0 && lines.every((line) => /^[-*] /.test(line));
}

export function parseNotes(source: string): Block[] {
  const chunks = source.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const blocks: Block[] = [];
  for (const chunk of chunks) {
    const lines = chunk.split("\n").filter((line) => line.trim().length > 0);
    if (lines.length === 0) continue;
    if (isList(lines)) {
      blocks.push({
        kind: "ul",
        items: lines.map((line) => parseInlines(line.replace(/^[-*] /, ""))),
      });
      continue;
    }
    blocks.push({ kind: "p", lines: lines.map((line) => parseInlines(line)) });
  }
  return blocks;
}
