/** The themes actually applied to `<html data-theme>`, after "system" has been resolved. */
export type ResolvedTheme = "light" | "sky" | "dark" | "oled";

/**
 * The dark-based themes. Dark and OLED dark share every dark treatment and differ only in their
 * token values, so anything branching on "is this dark?" should ask this rather than compare to
 * "dark" directly.
 */
export function isDarkTheme(theme: string | undefined): boolean {
  return theme === "dark" || theme === "oled";
}

/**
 * The light/dark the embedded editor hosts (drawio, OpenAPI, SQL schema) understand. They have no
 * OLED palette of their own, so both dark-based themes collapse to "dark".
 */
export function currentHostTheme(): "light" | "dark" {
  return isDarkTheme(document.documentElement.dataset.theme) ? "dark" : "light";
}
