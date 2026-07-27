/**
 * Decisions behind reloading a watched file that changed outside the editor. Both live here rather
 * than inline in `App.tsx` so they can be tested directly — the surrounding path needs Electron's
 * file watcher (`window.nexus`), which neither the browser preview nor a unit test can drive.
 */

export type ExternalFileChangeEvent = {
  filePath: string;
  kind: "changed" | "missing";
  timestamp: number;
};

export type ExternalDiffBaseline = {
  filePath: string;
  markdown: string;
};

/**
 * Collapse a burst of watched-file events into a single delivery of the most recent one.
 *
 * A coding harness editing a document typically writes several times in quick succession, and every
 * write would otherwise run a full reload — re-importing the Markdown and replacing the whole
 * document in each diff pane. Overlapping reloads are what make the diff panes visibly judder.
 *
 * Only the newest event is kept: the disk is read when the event is delivered, so an older event
 * carries no state the newer one lacks, and a "missing" arriving last still wins.
 */
export function createExternalFileChangeCoalescer(
  delayMs: number,
  deliver: (event: ExternalFileChangeEvent) => void
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: ExternalFileChangeEvent | null = null;

  return {
    push(event: ExternalFileChangeEvent) {
      pending = event;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const coalesced = pending;
        pending = null;
        timer = undefined;
        if (coalesced) {
          deliver(coalesced);
        }
      }, delayMs);
    },
    /** Drop any event still waiting out the window, so an unmounting subscription delivers nothing. */
    cancel() {
      clearTimeout(timer);
      timer = undefined;
      pending = null;
    }
  };
}

/**
 * The "before" side to diff an external change against.
 *
 * Taken once per run of external edits, not once per edit: re-taking it would make the diff show
 * only the most recent write (silently dropping earlier ones from view) and would replace the whole
 * left-hand document on every write. An existing baseline is only reused for the file it was taken
 * from, so switching documents mid-run starts a fresh one.
 */
export function resolveExternalDiffBaseline(
  existingBaseline: ExternalDiffBaseline | null,
  changedFilePath: string,
  currentMarkdown: string,
  areFilePathsEquivalent: (first: string | undefined, second: string | undefined) => boolean
): ExternalDiffBaseline {
  if (
    existingBaseline &&
    areFilePathsEquivalent(existingBaseline.filePath, changedFilePath)
  ) {
    return existingBaseline;
  }

  return { filePath: changedFilePath, markdown: currentMarkdown };
}
