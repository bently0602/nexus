import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const mainSource = readFileSync(new URL("./main.cjs", import.meta.url), "utf8");
const titlebarSource = readFileSync(
  new URL("../src/components/titlebar/Titlebar.tsx", import.meta.url),
  "utf8"
);
const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");

describe("AI Content Organization contract", () => {
  it("is available from both AI menus and dispatches one shared action", () => {
    expect(mainSource).toContain('label: "Content Organization"');
    expect(mainSource).toContain('sendMenuAction("contentOrganization")');
    expect(titlebarSource).toContain('dispatchMenuAction("contentOrganization")');
    expect(appSource).toContain('case "contentOrganization":');
    expect(appSource).toContain("void h.runContentOrganization();");
  });

  it("previews a whole-document proposal and applies it through one replacement", () => {
    expect(appSource).toContain('kind: "document", originalMarkdown, proposedText');
    expect(appSource).toContain('target: "document"');
    expect(appSource).toContain("beginProgrammaticMarkdownChange(pending.proposedText);");
    expect(appSource).toContain("editorRef.current?.setMarkdown(pending.proposedText);");
    expect(appSource).toContain("from: 0,");
    expect(appSource).toContain("to: sourceView.state.doc.length,");
  });

  it("keeps failure, stale proposals, and discard paths non-destructive", () => {
    expect(appSource).toContain("if (!result.ok)");
    expect(appSource).toContain("setAiNotice({ message: result.error");
    expect(appSource).toContain("The model returned an empty document");
    expect(appSource).toContain("The document changed while the proposal was open");
    expect(appSource).toContain("pendingAiApplyRef.current = null;");
    expect(appSource).toContain("setPendingAiEdit(null);");
  });
});
