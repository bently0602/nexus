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
import { APP_NAME } from "../../lib/appInfo";
import {
  APP_FONT_OPTIONS,
  APP_THEME_OPTIONS,
  type AppFontFamily,
  type AppThemePreference
} from "../../lib/settings";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  themePreference: AppThemePreference;
  fontFamily: AppFontFamily;
  sampleToggle: boolean;
  onThemeChange: (themePreference: AppThemePreference) => void;
  onFontChange: (fontFamily: AppFontFamily) => void;
  onSampleToggleChange: (value: boolean) => void;
  onResetSettings: () => void;
};

function SettingsDialog({
  open,
  onOpenChange,
  themePreference,
  fontFamily,
  sampleToggle,
  onThemeChange,
  onFontChange,
  onSampleToggleChange,
  onResetSettings
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Preferences are saved on this device.</DialogDescription>
        </DialogHeader>

        <div className="nexus-settings-form">
          <section className="nexus-settings-section">
            <h3 className="nexus-settings-eyebrow">Appearance</h3>
            <p className="nexus-settings-section-help">
              Choose how {APP_NAME} looks. Changes are saved automatically.
            </p>

            <div
              className="nexus-settings-theme-options"
              role="radiogroup"
              aria-label="Application theme"
            >
              {APP_THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={themePreference === option.value}
                  className="nexus-settings-theme-option"
                  data-selected={themePreference === option.value || undefined}
                  onClick={() => onThemeChange(option.value)}
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
            <h3 className="nexus-settings-eyebrow">Text</h3>

            <label className="nexus-settings-field">
              <span className="nexus-settings-label">Font</span>
              <select
                className="nexus-settings-select"
                value={fontFamily}
                onChange={(event) => onFontChange(event.target.value as AppFontFamily)}
              >
                {APP_FONT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="nexus-settings-preview" style={{ fontFamily }}>
              The quick brown fox jumps over 0123456789.
            </div>
          </section>

          <section className="nexus-settings-section">
            <h3 className="nexus-settings-eyebrow">Behavior</h3>

            <label className="nexus-settings-field nexus-settings-field-row">
              <span className="nexus-settings-label">Sample toggle</span>
              <input
                type="checkbox"
                checked={sampleToggle}
                onChange={(event) => onSampleToggleChange(event.target.checked)}
              />
            </label>
          </section>
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
