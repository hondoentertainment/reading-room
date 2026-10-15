import type { Inline } from "@/lib/markdown";
import { parseNotes } from "@/lib/markdown";

function InlineRun({ inlines }: { inlines: Inline[] }) {
  return (
    <>
      {inlines.map((inline, index) => {
        if (inline.kind === "strong") return <strong key={index}>{inline.text}</strong>;
        if (inline.kind === "em") return <em key={index}>{inline.text}</em>;
        if (inline.kind === "link") {
          return (
            <a
              key={index}
              href={inline.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-primary/50 underline-offset-4"
            >
              {inline.text}
            </a>
          );
        }
        return <span key={index}>{inline.text}</span>;
      })}
    </>
  );
}

export function NotesBody({ source }: { source: string }) {
  const blocks = parseNotes(source);
  if (blocks.length === 0) {
    return <p className="text-muted-foreground">Nothing written yet.</p>;
  }

  return (
    <div className="font-serif text-lg leading-8 text-foreground">
      {blocks.map((block, index) => {
        if (block.kind === "ul") {
          return (
            <ul key={index} className="my-4 list-disc space-y-1 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <InlineRun inlines={item} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="my-4 first:mt-0">
            {block.lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 ? <br /> : null}
                <InlineRun inlines={line} />
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
