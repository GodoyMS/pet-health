import { describe, expect, it } from "vitest";

import { speciesTheme } from "./speciesTheme";

describe("speciesTheme", () => {
  it("gives known species a hand-picked identity", () => {
    const dog = speciesTheme({ id: "s1", name: "Dog" });
    const cat = speciesTheme({ id: "s2", name: "Cat" });
    expect(dog.color).not.toBe(cat.color);
    expect(dog.icon).toBeTruthy();
  });

  it("matches known species regardless of case or padding", () => {
    expect(speciesTheme({ id: "s1", name: "  DOG " })).toEqual(
      speciesTheme({ id: "s1", name: "dog" })
    );
  });

  it("is stable for the same species id", () => {
    const a = speciesTheme({ id: "abc", name: "Axolotl" });
    const b = speciesTheme({ id: "abc", name: "Axolotl" });
    expect(a).toEqual(b);
  });

  it("still returns a saturated colour for unknown species", () => {
    const theme = speciesTheme({ id: "xyz", name: "Chinchilla" });
    expect(theme.color).toMatch(/^hsl\(/);
    expect(theme.icon).toBe("pets");
  });

  it("spreads unknown species across different hues", () => {
    const colors = new Set(
      ["a", "b", "c", "d", "e", "f"].map(
        (id) => speciesTheme({ id, name: `Species ${id}` }).color
      )
    );
    // Not all collapsing onto one hue.
    expect(colors.size).toBeGreaterThan(1);
  });
});
