import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createExternalFileChangeCoalescer,
  resolveExternalDiffBaseline,
  type ExternalFileChangeEvent
} from "./externalFileChange";

function changeEvent(filePath: string, timestamp: number): ExternalFileChangeEvent {
  return { filePath, kind: "changed", timestamp };
}

describe("createExternalFileChangeCoalescer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("delivers a lone event once the window elapses", () => {
    const deliver = vi.fn();
    const coalescer = createExternalFileChangeCoalescer(200, deliver);

    coalescer.push(changeEvent("/doc.md", 1));
    expect(deliver).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(deliver).toHaveBeenCalledTimes(1);
    expect(deliver).toHaveBeenCalledWith(changeEvent("/doc.md", 1));
  });

  it("collapses a burst of writes into the most recent one", () => {
    const deliver = vi.fn();
    const coalescer = createExternalFileChangeCoalescer(200, deliver);

    coalescer.push(changeEvent("/doc.md", 1));
    vi.advanceTimersByTime(50);
    coalescer.push(changeEvent("/doc.md", 2));
    vi.advanceTimersByTime(50);
    coalescer.push(changeEvent("/doc.md", 3));
    vi.advanceTimersByTime(199);
    expect(deliver).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(deliver).toHaveBeenCalledTimes(1);
    expect(deliver).toHaveBeenCalledWith(changeEvent("/doc.md", 3));
  });

  it("delivers separately when writes are further apart than the window", () => {
    const deliver = vi.fn();
    const coalescer = createExternalFileChangeCoalescer(200, deliver);

    coalescer.push(changeEvent("/doc.md", 1));
    vi.advanceTimersByTime(200);
    coalescer.push(changeEvent("/doc.md", 2));
    vi.advanceTimersByTime(200);

    expect(deliver).toHaveBeenCalledTimes(2);
    expect(deliver).toHaveBeenNthCalledWith(1, changeEvent("/doc.md", 1));
    expect(deliver).toHaveBeenNthCalledWith(2, changeEvent("/doc.md", 2));
  });

  it("lets a trailing deletion win over the writes it followed", () => {
    const deliver = vi.fn();
    const coalescer = createExternalFileChangeCoalescer(200, deliver);

    coalescer.push(changeEvent("/doc.md", 1));
    coalescer.push({ filePath: "/doc.md", kind: "missing", timestamp: 2 });
    vi.advanceTimersByTime(200);

    expect(deliver).toHaveBeenCalledTimes(1);
    expect(deliver).toHaveBeenCalledWith({ filePath: "/doc.md", kind: "missing", timestamp: 2 });
  });

  it("drops a pending event when cancelled", () => {
    const deliver = vi.fn();
    const coalescer = createExternalFileChangeCoalescer(200, deliver);

    coalescer.push(changeEvent("/doc.md", 1));
    coalescer.cancel();
    vi.advanceTimersByTime(1000);

    expect(deliver).not.toHaveBeenCalled();
  });

  it("can be reused after cancelling", () => {
    const deliver = vi.fn();
    const coalescer = createExternalFileChangeCoalescer(200, deliver);

    coalescer.push(changeEvent("/doc.md", 1));
    coalescer.cancel();
    coalescer.push(changeEvent("/doc.md", 2));
    vi.advanceTimersByTime(200);

    expect(deliver).toHaveBeenCalledTimes(1);
    expect(deliver).toHaveBeenCalledWith(changeEvent("/doc.md", 2));
  });
});

describe("resolveExternalDiffBaseline", () => {
  const samePath = (first: string | undefined, second: string | undefined) =>
    Boolean(first && second && first.toLowerCase() === second.toLowerCase());

  it("takes the current content when no run is in progress", () => {
    expect(resolveExternalDiffBaseline(null, "/doc.md", "original", samePath)).toEqual({
      filePath: "/doc.md",
      markdown: "original"
    });
  });

  it("keeps the first baseline across a run of edits to the same file", () => {
    const first = resolveExternalDiffBaseline(null, "/doc.md", "original", samePath);
    const second = resolveExternalDiffBaseline(first, "/doc.md", "after edit 1", samePath);
    const third = resolveExternalDiffBaseline(second, "/doc.md", "after edit 2", samePath);

    // Still diffing against what the document looked like before the harness started.
    expect(third).toEqual({ filePath: "/doc.md", markdown: "original" });
  });

  it("matches paths through the supplied comparison, not raw equality", () => {
    const first = resolveExternalDiffBaseline(null, "/Doc.md", "original", samePath);
    expect(resolveExternalDiffBaseline(first, "/doc.md", "after edit", samePath).markdown).toBe(
      "original"
    );
  });

  it("starts a fresh baseline when a different file changes", () => {
    const first = resolveExternalDiffBaseline(null, "/doc.md", "original", samePath);
    expect(resolveExternalDiffBaseline(first, "/other.md", "other content", samePath)).toEqual({
      filePath: "/other.md",
      markdown: "other content"
    });
  });
});
