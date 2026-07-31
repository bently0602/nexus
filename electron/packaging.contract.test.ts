import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type PackageManifest = {
  build?: {
    asar?: boolean | { smartUnpack?: boolean };
    asarUnpack?: string[];
    files?: string[];
  };
};

const manifest = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
) as PackageManifest;

describe("Electron packaging contract", () => {
  it("keeps canvas JavaScript in ASAR while unpacking platform-native canvas packages", () => {
    const files = manifest.build?.files ?? [];
    const asarUnpack = manifest.build?.asarUnpack ?? [];

    expect(manifest.build?.asar).toBe(true);
    expect(files).toContain("node_modules/@napi-rs/canvas/**");
    expect(asarUnpack).toContain("node_modules/@napi-rs/canvas-*/**");
    expect(asarUnpack).not.toContain("node_modules/@napi-rs/canvas/**");
  });
});
