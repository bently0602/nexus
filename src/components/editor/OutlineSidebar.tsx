import { useEffect, useMemo, useRef, useState } from "react";
import { ListTree, Search, X } from "lucide-react";
import type { OutlineHeading } from "../../lib/outline";
import { OUTLINE_WIDTH_MAX_PIXELS, OUTLINE_WIDTH_MIN_PIXELS } from "../../lib/settings";

const UNTITLED_HEADING_LABEL = "(untitled heading)";
const OUTLINE_WIDTH_KEYBOARD_STEP_PIXELS = 16;
/** Keep at least this much room for the editor when dragging the outline wider. */
const MIN_EDITOR_WIDTH_PIXELS = 240;
/** Under this many headings the outline fits on screen at a glance, so a filter box is just noise. */
const OUTLINE_FILTER_MIN_HEADINGS = 8;

function clampOutlineWidth(width: number, containerWidth: number) {
  const maxByContainer =
    containerWidth > 0 ? containerWidth - MIN_EDITOR_WIDTH_PIXELS : OUTLINE_WIDTH_MAX_PIXELS;
  const max = Math.max(OUTLINE_WIDTH_MIN_PIXELS, Math.min(OUTLINE_WIDTH_MAX_PIXELS, maxByContainer));
  return Math.round(Math.min(max, Math.max(OUTLINE_WIDTH_MIN_PIXELS, width)));
}

function OutlineSidebar({
  headings,
  width,
  activeIndex,
  onSelect,
  onResize
}: {
  headings: OutlineHeading[];
  width: number;
  activeIndex: number;
  onSelect: (heading: OutlineHeading) => void;
  onResize: (width: number) => void;
}) {
  const asideRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState("");
  // Position (within the visible list) of the item holding the list's single tab stop. Null means
  // "follow the scroll-spy entry" — it only pins once the user has moved focus themselves.
  const [focusPosition, setFocusPosition] = useState<number | null>(null);

  const showFilter = headings.length >= OUTLINE_FILTER_MIN_HEADINGS;
  const trimmedFilter = filter.trim().toLowerCase();
  const isFiltering = showFilter && trimmedFilter !== "";

  const visibleHeadings = useMemo(() => {
    if (!isFiltering) {
      return headings;
    }
    return headings.filter((heading) => heading.text.toLowerCase().includes(trimmedFilter));
  }, [headings, isFiltering, trimmedFilter]);

  const activePosition = visibleHeadings.findIndex((heading) => heading.index === activeIndex);
  // The list is one tab stop (roving tabindex): arrow keys move between entries rather than Tab
  // walking every heading in the document.
  const tabPosition = Math.min(
    Math.max(focusPosition ?? (activePosition >= 0 ? activePosition : 0), 0),
    Math.max(visibleHeadings.length - 1, 0)
  );

  // Keep the active (scroll-spy) entry visible without scrolling the page or the
  // editor: nudge only the outline list when the highlighted item drifts out of view.
  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    const active = list.querySelector<HTMLElement>(".nexus-outline-item-active");
    if (!active) {
      return;
    }

    const listRect = list.getBoundingClientRect();
    const itemRect = active.getBoundingClientRect();
    if (itemRect.top < listRect.top) {
      list.scrollTop -= listRect.top - itemRect.top + 8;
    } else if (itemRect.bottom > listRect.bottom) {
      list.scrollTop += itemRect.bottom - listRect.bottom + 8;
    }
  }, [activeIndex, headings, visibleHeadings]);

  const focusItemAt = (position: number) => {
    if (visibleHeadings.length === 0) {
      return;
    }

    const clamped = Math.max(0, Math.min(visibleHeadings.length - 1, position));
    setFocusPosition(clamped);
    const items = listRef.current?.querySelectorAll<HTMLButtonElement>(".nexus-outline-item");
    items?.[clamped]?.focus();
  };

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusItemAt(tabPosition + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusItemAt(tabPosition - 1);
        break;
      case "Home":
        event.preventDefault();
        focusItemAt(0);
        break;
      case "End":
        event.preventDefault();
        focusItemAt(visibleHeadings.length - 1);
        break;
      default:
        break;
    }
  };

  const clearFilter = () => {
    setFilter("");
    setFocusPosition(null);
  };

  const handleFilterKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      // Straight from typing into the results, without a Tab detour.
      event.preventDefault();
      focusItemAt(0);
      return;
    }

    if (event.key === "Escape" && filter !== "") {
      // Clear the filter rather than letting Escape bubble out to the editor.
      event.preventDefault();
      event.stopPropagation();
      clearFilter();
    }
  };

  const handleResizePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const aside = asideRef.current;
    // The outline overlays the editor surface, so its parent gives both the
    // available width and the element that carries the --outline-width variable.
    const surface = aside?.parentElement ?? null;
    if (!aside || !surface) {
      return;
    }

    event.preventDefault();
    const sidebarLeft = aside.getBoundingClientRect().left;
    let latestWidth = width;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      latestWidth = clampOutlineWidth(moveEvent.clientX - sidebarLeft, surface.clientWidth);
      // Update the live width via the CSS variable so dragging stays smooth
      // without re-rendering the editor on every pointer move.
      surface.style.setProperty("--outline-width", `${latestWidth}px`);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.classList.remove("nexus-resizing-col");
      onResize(latestWidth);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    document.body.classList.add("nexus-resizing-col");
  };

  const handleResizeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    const containerWidth = asideRef.current?.parentElement?.clientWidth ?? 0;
    const delta =
      event.key === "ArrowLeft"
        ? -OUTLINE_WIDTH_KEYBOARD_STEP_PIXELS
        : OUTLINE_WIDTH_KEYBOARD_STEP_PIXELS;
    onResize(clampOutlineWidth(width + delta, containerWidth));
  };

  return (
    <aside ref={asideRef} className="nexus-outline" aria-label="Document outline">
      <div className="nexus-outline-header">
        <ListTree aria-hidden="true" className="nexus-outline-header-icon" />
        <span className="nexus-outline-title">Outline</span>
        {headings.length > 0 && (
          <span className="nexus-outline-count">
            {isFiltering ? `${visibleHeadings.length}/${headings.length}` : headings.length}
          </span>
        )}
      </div>

      {showFilter && (
        <div className="nexus-outline-filter">
          <Search aria-hidden="true" className="nexus-outline-filter-icon" />
          <input
            className="nexus-outline-filter-input"
            type="text"
            value={filter}
            placeholder="Filter headings"
            aria-label="Filter headings"
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => {
              setFilter(event.target.value);
              setFocusPosition(null);
            }}
            onKeyDown={handleFilterKeyDown}
          />
          {filter !== "" && (
            <button
              type="button"
              className="nexus-outline-filter-clear"
              aria-label="Clear heading filter"
              onClick={clearFilter}
            >
              <X aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {headings.length === 0 ? (
        <p className="nexus-outline-empty">
          No headings yet
          <span>Headings you add appear here as a clickable outline.</span>
        </p>
      ) : visibleHeadings.length === 0 ? (
        <p className="nexus-outline-empty">
          No matches
          <span>No heading contains “{filter.trim()}”.</span>
        </p>
      ) : (
        <div
          className="nexus-outline-list"
          ref={listRef}
          role="tree"
          aria-label="Document headings"
          onKeyDown={handleListKeyDown}
        >
          {visibleHeadings.map((heading, position) => {
            const label = heading.text || UNTITLED_HEADING_LABEL;
            const isActive = heading.index === activeIndex;
            return (
              <button
                key={heading.index}
                type="button"
                role="treeitem"
                aria-level={heading.level}
                aria-selected={isActive}
                tabIndex={position === tabPosition ? 0 : -1}
                className={`nexus-outline-item nexus-outline-item-level-${heading.level}${
                  isActive ? " nexus-outline-item-active" : ""
                }`}
                // Indent guides are drawn from the depth (see .nexus-outline-item). A filtered list
                // is no longer a contiguous tree, so it renders flat rather than implying a
                // hierarchy whose parents are hidden.
                style={{ "--outline-depth": isFiltering ? 0 : heading.level - 1 } as React.CSSProperties}
                onClick={() => onSelect(heading)}
                onFocus={() => setFocusPosition(position)}
                title={label}
              >
                <span className="nexus-outline-item-label">{label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div
        className="nexus-outline-resizer"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize outline panel"
        aria-valuemin={OUTLINE_WIDTH_MIN_PIXELS}
        aria-valuemax={OUTLINE_WIDTH_MAX_PIXELS}
        aria-valuenow={Math.round(width)}
        tabIndex={0}
        onPointerDown={handleResizePointerDown}
        onKeyDown={handleResizeKeyDown}
      />
    </aside>
  );
}

export default OutlineSidebar;
