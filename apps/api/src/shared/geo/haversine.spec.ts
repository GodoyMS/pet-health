import { boundingBox, haversineMeters, normalizeLng } from "./haversine";

describe("haversineMeters", () => {
  it("is zero for the same point", () => {
    expect(haversineMeters(28.6139, 77.209, 28.6139, 77.209)).toBeCloseTo(0, 6);
  });

  it("matches a known distance (Delhi → Mumbai ≈ 1150 km)", () => {
    const d = haversineMeters(28.6139, 77.209, 19.076, 72.8777);
    expect(d).toBeGreaterThan(1_140_000);
    expect(d).toBeLessThan(1_170_000);
  });

  it("is symmetric", () => {
    const a = haversineMeters(10, 20, 30, 40);
    const b = haversineMeters(30, 40, 10, 20);
    expect(a).toBeCloseTo(b, 6);
  });

  it("measures one degree of latitude as ~111 km anywhere", () => {
    expect(haversineMeters(0, 0, 1, 0)).toBeCloseTo(111_195, -2);
    expect(haversineMeters(60, 30, 61, 30)).toBeCloseTo(111_195, -2);
  });
});

describe("boundingBox", () => {
  it("contains every point within the radius", () => {
    const lat = 28.6139;
    const lng = 77.209;
    const radius = 2_000;
    const box = boundingBox(lat, lng, radius);

    // Sample the circle's rim; every point must fall inside the box.
    for (let bearing = 0; bearing < 360; bearing += 15) {
      const rad = (bearing * Math.PI) / 180;
      const dLat = (radius / 111_320) * Math.cos(rad);
      const dLng =
        (radius / (111_320 * Math.cos((lat * Math.PI) / 180))) * Math.sin(rad);

      expect(lat + dLat).toBeGreaterThanOrEqual(box.minLat);
      expect(lat + dLat).toBeLessThanOrEqual(box.maxLat);
      expect(lng + dLng).toBeGreaterThanOrEqual(box.minLng);
      expect(lng + dLng).toBeLessThanOrEqual(box.maxLng);
    }
  });

  it("widens the longitude span at high latitude", () => {
    const equator = boundingBox(0, 0, 5_000);
    const arctic = boundingBox(70, 0, 5_000);

    const equatorSpan = equator.maxLng - equator.minLng;
    const arcticSpan = arctic.maxLng - arctic.minLng;

    // Same ground distance covers far more degrees near the pole.
    expect(arcticSpan).toBeGreaterThan(equatorSpan * 2);
  });

  it("falls back to a full longitude sweep at the poles", () => {
    const box = boundingBox(90, 0, 5_000);
    expect(box.minLng).toBe(-180);
    expect(box.maxLng).toBe(180);
    expect(box.wrapsAntimeridian).toBe(false);
  });

  it("clamps latitude to the valid range", () => {
    const box = boundingBox(89.99, 0, 50_000);
    expect(box.maxLat).toBeLessThanOrEqual(90);
    expect(box.minLat).toBeGreaterThanOrEqual(-90);
  });

  it("flags and wraps a box straddling the antimeridian", () => {
    const box = boundingBox(0, 179.99, 5_000);
    expect(box.wrapsAntimeridian).toBe(true);
    expect(box.minLng).toBeGreaterThan(0);
    expect(box.maxLng).toBeLessThan(0);
  });

  it("does not flag a wrap for an ordinary box", () => {
    expect(boundingBox(28.6, 77.2, 5_000).wrapsAntimeridian).toBe(false);
  });
});

describe("normalizeLng", () => {
  it("leaves in-range values untouched", () => {
    expect(normalizeLng(77.2)).toBeCloseTo(77.2, 9);
    expect(normalizeLng(-120)).toBeCloseTo(-120, 9);
  });

  it("wraps values past the antimeridian", () => {
    expect(normalizeLng(181)).toBeCloseTo(-179, 9);
    expect(normalizeLng(-181)).toBeCloseTo(179, 9);
  });
});
