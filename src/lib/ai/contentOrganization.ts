export type ContentOrganizationValidation =
  | { ok: true }
  | { ok: false; changedKinds: string[] };

function normalizedSorted(values: string[]): string[] {
  return values.map((value) => value.replace(/\r\n/g, "\n")).sort();
}

function sameMultiset(left: string[], right: string[]): boolean {
  const a = normalizedSorted(left);
  const b = normalizedSorted(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function leadingFrontmatter(markdown: string): string[] {
  const match = /^(?:\uFEFF)?---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/.exec(markdown);
  return match ? [match[0]] : [];
}

function fencedBlocks(markdown: string): string[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const opening = /^(\s*)(`{3,}|~{3,})(.*)$/.exec(lines[index]);
    if (!opening) {
      continue;
    }

    const markerCharacter = opening[2][0];
    const markerLength = opening[2].length;
    const block = [lines[index]];
    for (index += 1; index < lines.length; index += 1) {
      block.push(lines[index]);
      const closing = new RegExp(`^\\s*${markerCharacter}{${markerLength},}\\s*$`);
      if (closing.test(lines[index])) {
        break;
      }
    }
    blocks.push(block.join("\n"));
  }
  return blocks;
}

function regexMatches(markdown: string, pattern: RegExp): string[] {
  return Array.from(markdown.matchAll(pattern), (match) => match[0]);
}

function tablePayloads(markdown: string): string[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const tables: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].includes("|")) {
      continue;
    }
    const block: string[] = [];
    while (index < lines.length && lines[index].includes("|")) {
      block.push(lines[index]);
      index += 1;
    }
    index -= 1;
    const hasSeparator = block.some((line) =>
      line
        .replace(/^\s*\||\|\s*$/g, "")
        .split("|")
        .every((cell) => /^\s*:?-{3,}:?\s*$/.test(cell))
    );
    if (hasSeparator) {
      tables.push(
        block
          .map((line) =>
            line
              .replace(/^\s*\||\|\s*$/g, "")
              .split("|")
              .map((cell) => {
                const value = cell.trim();
                if (!/^:?-{3,}:?$/.test(value)) {
                  return value;
                }
                if (value.startsWith(":") && value.endsWith(":")) {
                  return "<center>";
                }
                return value.endsWith(":") ? "<right>" : "<left>";
              })
              .join("|")
          )
          .join("\n")
      );
    }
  }
  return tables;
}

/**
 * Reject model output that changes opaque Markdown payloads. Reordering is allowed because each
 * category is compared as a multiset; changing, adding, or removing a protected value is not.
 */
export function validateContentOrganizationOutput(
  originalMarkdown: string,
  proposedMarkdown: string
): ContentOrganizationValidation {
  const checks: Array<[string, string[], string[]]> = [
    ["YAML frontmatter", leadingFrontmatter(originalMarkdown), leadingFrontmatter(proposedMarkdown)],
    ["fenced code, math, or embedded blocks", fencedBlocks(originalMarkdown), fencedBlocks(proposedMarkdown)],
    [
      "inline code or math",
      regexMatches(originalMarkdown, /(?<!`)`(?!`)[^`\r\n]+`(?!`)/g),
      regexMatches(proposedMarkdown, /(?<!`)`(?!`)[^`\r\n]+`(?!`)/g)
    ],
    [
      "link or image destinations",
      regexMatches(originalMarkdown, /!?\[[^\]\r\n]*\]\((?:\\.|[^)\r\n])+\)/g),
      regexMatches(proposedMarkdown, /!?\[[^\]\r\n]*\]\((?:\\.|[^)\r\n])+\)/g)
    ],
    [
      "embedded image data",
      regexMatches(originalMarkdown, /data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+/gi),
      regexMatches(proposedMarkdown, /data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+/gi)
    ],
    ["tables", tablePayloads(originalMarkdown), tablePayloads(proposedMarkdown)],
    [
      "footnotes",
      regexMatches(originalMarkdown, /^\[\^[^\]\r\n]+\]:[^\r\n]*(?:\r?\n(?: {2,}|\t)[^\r\n]*)*/gm),
      regexMatches(proposedMarkdown, /^\[\^[^\]\r\n]+\]:[^\r\n]*(?:\r?\n(?: {2,}|\t)[^\r\n]*)*/gm)
    ],
    [
      "directives",
      regexMatches(originalMarkdown, /^:{1,3}[a-z][^\r\n]*$/gim),
      regexMatches(proposedMarkdown, /^:{1,3}[a-z][^\r\n]*$/gim)
    ]
  ];

  const changedKinds = checks
    .filter(([, original, proposed]) => !sameMultiset(original, proposed))
    .map(([label]) => label);

  return changedKinds.length === 0 ? { ok: true } : { ok: false, changedKinds };
}
