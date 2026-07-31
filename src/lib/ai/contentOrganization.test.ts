import { describe, expect, it } from "vitest";
import { validateContentOrganizationOutput } from "./contentOrganization";

describe("validateContentOrganizationOutput", () => {
  const frontmatter = "---\ntitle: Example\n---\n";
  const protectedMarkdown = [
    "[Nexus](https://example.com/docs)",
    "`math:x + y`",
    "```math",
    "x + y",
    "```"
  ].join("\n");

  it("allows protected constructs to move without changing their payloads", () => {
    const original = `${frontmatter}\n# Later\n\n${protectedMarkdown}\n\n# Earlier\n\nText`;
    const proposed = `${frontmatter}\n# Earlier\n\nText\n\n# Later\n\n${protectedMarkdown}`;

    expect(validateContentOrganizationOutput(original, proposed)).toEqual({ ok: true });
  });

  it("rejects altered frontmatter, code, links, and image data", () => {
    const original = `${frontmatter}\n${protectedMarkdown}\n\n![scan](data:image/png;base64,AAAA)`;
    const proposed = original
      .replace("title: Example", "title: Changed")
      .replace("x + y\n```", "x - y\n```")
      .replace("example.com/docs", "example.com/other")
      .replace("AAAA", "BBBB");

    expect(validateContentOrganizationOutput(original, proposed)).toEqual({
      ok: false,
      changedKinds: [
        "YAML frontmatter",
        "fenced code, math, or embedded blocks",
        "link or image destinations",
        "embedded image data"
      ]
    });
  });

  it("allows table alignment cleanup but protects table cells, footnotes, and directives", () => {
    const original = [
      "| Name | Value |",
      "| --- | ---: |",
      "| Alpha | 1 |",
      "",
      "[^note]: Keep this text.",
      "",
      ":::note{title=\"Keep\"}"
    ].join("\n");
    const reformatted = original.replace(
      "| Name | Value |\n| --- | ---: |\n| Alpha | 1 |",
      "| Name  | Value |\n| :---- | ----: |\n| Alpha |     1 |"
    );
    expect(validateContentOrganizationOutput(original, reformatted)).toEqual({ ok: true });

    const altered = reformatted
      .replace("Keep this text.", "Changed text.")
      .replace('title="Keep"', 'title="Changed"')
      .replace("Alpha", "Beta");
    expect(validateContentOrganizationOutput(original, altered)).toEqual({
      ok: false,
      changedKinds: ["tables", "footnotes", "directives"]
    });
  });
});
