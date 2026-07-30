import { Check } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog";
import type {
  EditorFontFamily,
  EditorPageMargins,
  EditorPageMarginSide,
  EditorPageOrientation,
  EditorPageSize,
  EditorThemePreference
} from "../../lib/settings";
import {
  EDITOR_FONT_OPTIONS,
  EDITOR_FONT_SIZE_MAX_PIXELS,
  EDITOR_FONT_SIZE_MIN_PIXELS,
  EDITOR_FONT_SIZE_STEP_PIXELS,
  EDITOR_PAGE_MARGIN_MAX_INCHES,
  EDITOR_PAGE_MARGIN_MIN_INCHES,
  EDITOR_PAGE_MARGIN_SIDES,
  EDITOR_PAGE_MARGIN_STEP_INCHES,
  EDITOR_PAGE_ORIENTATION_OPTIONS,
  EDITOR_PAGE_SIZE_OPTIONS,
  EDITOR_PARAGRAPH_SPACING_MAX_PIXELS,
  EDITOR_PARAGRAPH_SPACING_MIN_PIXELS,
  EDITOR_PARAGRAPH_SPACING_STEP_PIXELS,
  EDITOR_THEME_OPTIONS
} from "../../lib/settings";

type SettingsDialogProps = {
  fontFamily: EditorFontFamily;
  fontSizePixels: number;
  onFontFamilyChange: (fontFamily: EditorFontFamily) => void;
  onFontSizePixelsChange: (fontSizePixels: number) => void;
  onPageMarginsChange: (pageMargins: EditorPageMargins) => void;
  onPageOrientationChange: (pageOrientation: EditorPageOrientation) => void;
  onPageSizeChange: (pageSize: EditorPageSize) => void;
  onParagraphSpacingPixelsChange: (paragraphSpacingPixels: number) => void;
  onResetSettings: () => void;
  onThemePreferenceChange: (themePreference: EditorThemePreference) => void;
  onDiagramsAsFilesChange: (diagramsAsFiles: boolean) => void;
  onAutoShowDiffOnExternalChangeChange: (autoShowDiffOnExternalChange: boolean) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pageMargins: EditorPageMargins;
  pageOrientation: EditorPageOrientation;
  pageSize: EditorPageSize;
  paragraphSpacingPixels: number;
  profileName: string;
  themePreference: EditorThemePreference;
  diagramsAsFiles: boolean;
  autoShowDiffOnExternalChange: boolean;
};

function clampFontSize(value: number) {
  return Math.min(EDITOR_FONT_SIZE_MAX_PIXELS, Math.max(EDITOR_FONT_SIZE_MIN_PIXELS, value));
}

function clampMargin(value: number) {
  return Math.min(EDITOR_PAGE_MARGIN_MAX_INCHES, Math.max(EDITOR_PAGE_MARGIN_MIN_INCHES, value));
}

function clampParagraphSpacing(value: number) {
  return Math.min(
    EDITOR_PARAGRAPH_SPACING_MAX_PIXELS,
    Math.max(EDITOR_PARAGRAPH_SPACING_MIN_PIXELS, value)
  );
}

function formatNumber(value: number) {
  return String(value);
}

function SettingsDialog({
  fontFamily,
  fontSizePixels,
  onFontFamilyChange,
  onFontSizePixelsChange,
  onPageMarginsChange,
  onPageOrientationChange,
  onPageSizeChange,
  onParagraphSpacingPixelsChange,
  onResetSettings,
  onThemePreferenceChange,
  onDiagramsAsFilesChange,
  onAutoShowDiffOnExternalChangeChange,
  onOpenChange,
  open,
  pageMargins,
  pageOrientation,
  pageSize,
  paragraphSpacingPixels,
  profileName,
  themePreference,
  diagramsAsFiles,
  autoShowDiffOnExternalChange
}: SettingsDialogProps) {
  function handleFontSizeChange(value: string) {
    const nextFontSize = Number.parseFloat(value);
    if (!Number.isFinite(nextFontSize)) {
      return;
    }

    onFontSizePixelsChange(clampFontSize(nextFontSize));
  }

  function handlePageMarginChange(side: EditorPageMarginSide, value: string) {
    const nextMargin = Number.parseFloat(value);
    if (!Number.isFinite(nextMargin)) {
      return;
    }

    onPageMarginsChange({
      ...pageMargins,
      [side]: clampMargin(nextMargin)
    });
  }

  function handleParagraphSpacingChange(value: string) {
    const nextParagraphSpacing = Number.parseFloat(value);
    if (!Number.isFinite(nextParagraphSpacing)) {
      return;
    }

    onParagraphSpacingPixelsChange(clampParagraphSpacing(nextParagraphSpacing));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Preferences are saved for the current OS profile.</DialogDescription>
        </DialogHeader>

        <div className="nexus-settings-form">
          <section className="nexus-settings-section">
            <h3 className="nexus-settings-eyebrow">Appearance</h3>
            <p className="nexus-settings-section-help">
              Choose how Nexus looks. Changes are saved automatically.
            </p>

            <div
              className="nexus-settings-theme-options"
              role="radiogroup"
              aria-label="Application theme"
            >
              {EDITOR_THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={themePreference === option.value}
                  className="nexus-settings-theme-option"
                  data-selected={themePreference === option.value || undefined}
                  onClick={() => onThemePreferenceChange(option.value)}
                >
                  <span className="nexus-settings-theme-preview" aria-hidden="true">
                    {option.swatches.map((color) => (
                      <span key={color} style={{ backgroundColor: color }} />
                    ))}
                  </span>
                  <span className="nexus-settings-theme-copy">
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                  <span className="nexus-settings-theme-check" aria-hidden="true">
                    {themePreference === option.value ? <Check /> : null}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="nexus-settings-section">
            <h3 className="nexus-settings-eyebrow">Editor</h3>

            <label className="nexus-settings-field">
              <span className="nexus-settings-label">Editor font</span>
              <select
                className="nexus-settings-select"
                value={fontFamily}
                onChange={(event) => onFontFamilyChange(event.target.value as EditorFontFamily)}
              >
                {EDITOR_FONT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div
              className="nexus-settings-preview"
              style={{ fontFamily, fontSize: fontSizePixels }}
            >
              The quick brown fox jumps over 0123456789.
            </div>

            <label className="nexus-settings-field">
              <span className="nexus-settings-label">Base font size</span>
              <span className="nexus-settings-input-with-unit">
                <input
                  className="nexus-settings-input"
                  inputMode="numeric"
                  max={EDITOR_FONT_SIZE_MAX_PIXELS}
                  min={EDITOR_FONT_SIZE_MIN_PIXELS}
                  onChange={(event) => handleFontSizeChange(event.target.value)}
                  step={EDITOR_FONT_SIZE_STEP_PIXELS}
                  type="number"
                  value={formatNumber(fontSizePixels)}
                />
                <span className="nexus-settings-unit">px</span>
              </span>
            </label>

            <label className="nexus-settings-field">
              <span className="nexus-settings-label">Paragraph spacing</span>
              <span className="nexus-settings-input-with-unit">
                <input
                  className="nexus-settings-input"
                  inputMode="numeric"
                  max={EDITOR_PARAGRAPH_SPACING_MAX_PIXELS}
                  min={EDITOR_PARAGRAPH_SPACING_MIN_PIXELS}
                  onChange={(event) => handleParagraphSpacingChange(event.target.value)}
                  step={EDITOR_PARAGRAPH_SPACING_STEP_PIXELS}
                  type="number"
                  value={formatNumber(paragraphSpacingPixels)}
                />
                <span className="nexus-settings-unit">px</span>
              </span>
            </label>
          </section>

          <section className="nexus-settings-section">
            <h3 className="nexus-settings-eyebrow">Page setup</h3>

            <label className="nexus-settings-field">
              <span className="nexus-settings-label">Paper size</span>
              <select
                className="nexus-settings-select"
                value={pageSize}
                onChange={(event) => onPageSizeChange(event.target.value as EditorPageSize)}
              >
                {EDITOR_PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.widthInches} x {option.heightInches} in)
                  </option>
                ))}
              </select>
            </label>

            <label className="nexus-settings-field">
              <span className="nexus-settings-label">Paper orientation</span>
              <select
                className="nexus-settings-select"
                value={pageOrientation}
                onChange={(event) =>
                  onPageOrientationChange(event.target.value as EditorPageOrientation)
                }
              >
                {EDITOR_PAGE_ORIENTATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="nexus-settings-fieldset">
              <legend className="nexus-settings-label">Margins</legend>
              <div className="nexus-settings-margin-grid">
                {EDITOR_PAGE_MARGIN_SIDES.map((side) => (
                  <label className="nexus-settings-margin-field" key={side.value}>
                    <span>{side.label}</span>
                    <span className="nexus-settings-input-with-unit">
                      <input
                        className="nexus-settings-input"
                        inputMode="decimal"
                        max={EDITOR_PAGE_MARGIN_MAX_INCHES}
                        min={EDITOR_PAGE_MARGIN_MIN_INCHES}
                        onChange={(event) =>
                          handlePageMarginChange(side.value, event.target.value)
                        }
                        step={EDITOR_PAGE_MARGIN_STEP_INCHES}
                        type="number"
                        value={formatNumber(pageMargins[side.value])}
                      />
                      <span className="nexus-settings-unit">in</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className="nexus-settings-section">
            <h3 className="nexus-settings-eyebrow">Documents</h3>

            <label className="nexus-settings-field">
              <span className="nexus-settings-label">Store diagrams as .svg files</span>
              <input
                type="checkbox"
                checked={diagramsAsFiles}
                onChange={(event) => onDiagramsAsFilesChange(event.target.checked)}
              />
            </label>
            <p className="nexus-settings-help">
              When on, drawio and isoflow diagrams are saved as <code>.svg</code> files next to the
              document (referenced by relative path) instead of embedded inline as base64 — better
              for other Markdown readers that struggle with large inline images. Diagrams stay
              editable in Nexus either way. Off by default.
            </p>

            <label className="nexus-settings-field">
              <span className="nexus-settings-label">
                Automatically show diff view for outside edits
              </span>
              <input
                type="checkbox"
                checked={autoShowDiffOnExternalChange}
                onChange={(event) => onAutoShowDiffOnExternalChangeChange(event.target.checked)}
              />
            </label>
            <p className="nexus-settings-help">
              When a file changes outside Nexus and this window has no unsaved edits, reload it and
              open the diff view automatically. When off, the file is still reloaded, but you
              instead get a brief notice that it changed on disk — no diff view opens. On by
              default.
            </p>
          </section>

          <p className="nexus-settings-profile">Profile: {profileName}</p>
        </div>

        <DialogFooter className="nexus-settings-footer">
          <Button type="button" variant="outline" onClick={onResetSettings}>
            Reset defaults
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
