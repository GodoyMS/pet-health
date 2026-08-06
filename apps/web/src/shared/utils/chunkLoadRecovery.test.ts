import { describe, expect, it } from "vitest";

import { isChunkLoadError } from "./chunkLoadRecovery";

describe("isChunkLoadError", () => {
  it("detects Vite dynamic import fetch failures", () => {
    expect(
      isChunkLoadError(
        new TypeError(
          "Failed to fetch dynamically imported module: https://pethealth.life/assets/RegisterPage-CG_rorWY.js",
        ),
      ),
    ).toBe(true);
  });

  it("detects module script import failures", () => {
    expect(
      isChunkLoadError(new TypeError("Importing a module script failed.")),
    ).toBe(true);
  });

  it("ignores unrelated errors", () => {
    expect(isChunkLoadError(new Error("Network request failed"))).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
  });
});
