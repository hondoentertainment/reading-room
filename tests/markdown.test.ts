import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseNotes } from "../src/lib/markdown";

describe("notes markdown", () => {
  it("parses emphasis, links, and lists without treating html as markup", () => {
    const blocks = parseNotes(
      "A **kept** word and *another*.\nSee [the magazine](https://example.com/essay).\n\n- first\n- second *line*\n\n<script>alert(1)</script>",
    );
    assert.equal(blocks.length, 3);
    assert.deepEqual(blocks[0], {
      kind: "p",
      lines: [
        [
          { kind: "text", text: "A " },
          { kind: "strong", text: "kept" },
          { kind: "text", text: " word and " },
          { kind: "em", text: "another" },
          { kind: "text", text: "." },
        ],
        [
          { kind: "text", text: "See " },
          { kind: "link", text: "the magazine", href: "https://example.com/essay" },
          { kind: "text", text: "." },
        ],
      ],
    });
    assert.equal(blocks[1]?.kind, "ul");
    assert.equal(blocks[2]?.kind, "p");
    const html = JSON.stringify(blocks[2]);
    assert.match(html, /<script>/);
    assert.equal(html.includes('"kind":"link"'), false);
  });

  it("ignores non-http links", () => {
    const blocks = parseNotes("[nope](javascript:alert(1))");
    assert.deepEqual(blocks[0], {
      kind: "p",
      lines: [[{ kind: "text", text: "[nope](javascript:alert(1))" }]],
    });
  });
});