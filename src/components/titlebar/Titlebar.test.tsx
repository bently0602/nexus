import { describe, expect, it } from "vitest";
import { getFileNameFromPath } from "./Titlebar";

// The recents entries come from the main process as absolute paths, so the renderer has to label
// them without node:path — and a document opened on Windows may still be listed with either
// separator.
describe("getFileNameFromPath", () => {
  it("labels a Windows path with its file name", () => {
    expect(getFileNameFromPath("C:\\Users\\me\\Documents\\notes.md")).toBe("notes.md");
  });

  it("labels a POSIX path with its file name", () => {
    expect(getFileNameFromPath("/home/me/documents/notes.md")).toBe("notes.md");
  });

  it("falls back to the whole path when there is no separator", () => {
    expect(getFileNameFromPath("notes.md")).toBe("notes.md");
  });

  it("falls back to the whole path for a trailing separator", () => {
    expect(getFileNameFromPath("C:\\Users\\me\\")).toBe("C:\\Users\\me\\");
  });
});
