import { readFileSync } from "node:fs";
import { Marked } from "marked";
import { describe, expect, it } from "vitest";

const mainSource = readFileSync(new URL("./main.cjs", import.meta.url), "utf8");

// The editor keeps a soft line break as a literal "\n" inside a single paragraph and paints it as a
// line break, because MDXEditor's contenteditable is `white-space: pre-wrap`. Exported HTML has no
// such rule, so the export renderer has to turn those newlines into <br> or the lines silently
// collapse into one — the "why does the PDF differ from the editor?" bug.
describe("export line-break contract", () => {
  it("renders soft line breaks as <br> in the shared export renderer", () => {
    expect(mainSource).toContain("breaks: true");
    expect(mainSource).not.toContain("breaks: false");
  });

  it("keeps one marked configuration behind every export path", () => {
    // PDF/print preview, publish, and the baseline used by HTML/Word all funnel through it, so the
    // single `breaks` setting above governs all of them.
    expect(mainSource).toContain("async function renderMarkdownExportHtml(markdown, currentPath");
    expect(mainSource.match(/new Marked\(/g)).toHaveLength(1);
  });
});

// Pins the marked behaviour the export renderer depends on, so a marked upgrade that changed how
// `breaks` treats soft breaks (or hard breaks) fails here rather than in an exported document.
describe("marked line-break behaviour with breaks: true", () => {
  const marked = new Marked({ async: false, breaks: true, gfm: true });

  it("turns a soft line break into <br>", () => {
    expect(marked.parse("Mobile, AL 36695\n251-442-5261")).toContain(
      "Mobile, AL 36695<br>251-442-5261"
    );
  });

  it("still honours explicit hard breaks", () => {
    expect(marked.parse("line one  \nline two")).toContain("line one<br>line two");
    expect(marked.parse(`line one${String.fromCharCode(92)}\nline two`)).toContain(
      "line one<br>line two"
    );
  });

  it("does not break paragraphs apart or touch blank-line separation", () => {
    const html = marked.parse("first para\n\nsecond para") as string;
    expect(html).not.toContain("<br>");
    expect(html.match(/<p>/g)).toHaveLength(2);
  });
});
