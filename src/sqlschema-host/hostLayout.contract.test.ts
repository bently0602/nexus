import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./host.css", import.meta.url), "utf8");

describe("SQL schema host layout", () => {
  it("constrains the host and workspace to the modal viewport", () => {
    expect(css).toMatch(/html,\s*body,\s*#root\s*{[^}]*height:\s*100%/s);
    expect(css).toMatch(/\.schema-host\s*{[^}]*height:\s*100%[^}]*overflow:\s*hidden/s);
    expect(css).toMatch(
      /\.schema-workspace\s*{[^}]*min-height:\s*0[^}]*flex:\s*1 1 0[^}]*overflow:\s*hidden/s
    );
    expect(css).not.toContain("min-height: 620px");
  });

  it("gives the inspector an independent vertical scrollbar", () => {
    expect(css).toMatch(
      /\.schema-inspector\s*{[^}]*min-height:\s*0[^}]*overflow-x:\s*hidden[^}]*overflow-y:\s*auto/s
    );
    expect(css).toMatch(/\.schema-canvas\s*{[^}]*min-height:\s*0[^}]*overflow:\s*hidden/s);
  });

  it("keeps the optional SQL preview bounded inside the same flex shell", () => {
    expect(css).toMatch(
      /\.schema-sql\s*{[^}]*min-height:\s*0[^}]*max-height:\s*42vh[^}]*flex:\s*0 1 42vh[^}]*overflow:\s*auto/s
    );
  });
});
