import { haversineMeters } from "../../shared/geo/haversine";
import { FUZZ_GRID_METERS, fuzzLocation } from "./location-privacy";

const POINT = { lat: 28.6139, lng: 77.209 };

describe("fuzzLocation", () => {
  it("is deterministic for the same pet and point", () => {
    const a = fuzzLocation("pet-1", POINT);
    const b = fuzzLocation("pet-1", POINT);
    expect(a).toEqual(b);
  });

  it("moves the point, so the true position is never published", () => {
    const fuzzed = fuzzLocation("pet-1", POINT);
    expect(fuzzed.lat === POINT.lat && fuzzed.lng === POINT.lng).toBe(false);
  });

  it("stays within roughly one grid cell of the truth", () => {
    // Worst case is a corner of the cell: half a cell on each axis.
    const maxOffset = FUZZ_GRID_METERS * Math.SQRT1_2 * 2;

    for (let i = 0; i < 200; i++) {
      const point = { lat: 28.6 + i * 0.0007, lng: 77.2 + i * 0.0009 };
      const fuzzed = fuzzLocation(`pet-${i}`, point);
      const drift = haversineMeters(
        point.lat,
        point.lng,
        fuzzed.lat,
        fuzzed.lng
      );
      expect(drift).toBeLessThanOrEqual(maxOffset);
    }
  });

  it("gives different pets different grid origins", () => {
    // Same true position, different pets → different published points, so
    // cell boundaries can't be correlated to triangulate the truth.
    const a = fuzzLocation("pet-a", POINT);
    const b = fuzzLocation("pet-b", POINT);
    expect(a).not.toEqual(b);
  });

  it("collapses GPS-jitter-sized movement onto a handful of cell centres", () => {
    // ~40 m of drift across many samples: the published point can only change
    // when the pet crosses a cell edge, so outputs stay far fewer than inputs.
    const outputs = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const fuzzed = fuzzLocation("pet-1", {
        lat: POINT.lat + i * 0.0000035,
        lng: POINT.lng + i * 0.0000035
      });
      outputs.add(`${fuzzed.lat},${fuzzed.lng}`);
    }
    expect(outputs.size).toBeLessThanOrEqual(4);
  });

  it("produces finite coordinates near the poles", () => {
    const fuzzed = fuzzLocation("polar-pet", { lat: 89.999, lng: 12.3 });
    expect(Number.isFinite(fuzzed.lat)).toBe(true);
    expect(Number.isFinite(fuzzed.lng)).toBe(true);
  });

  it("publishes cell centres, never the raw input", () => {
    // Sweeping a full cell width must yield at least two distinct outputs
    // (proving quantisation is real) while never echoing an input verbatim.
    const outputs = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const point = { lat: POINT.lat + i * 0.00005, lng: POINT.lng };
      const fuzzed = fuzzLocation("pet-1", point);
      expect(fuzzed.lat).not.toBe(point.lat);
      outputs.add(`${fuzzed.lat},${fuzzed.lng}`);
    }
    expect(outputs.size).toBeGreaterThan(1);
  });
});
