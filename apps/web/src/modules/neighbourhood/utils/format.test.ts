import { describe, expect, it, vi, afterEach } from "vitest";

import { formatAge, formatDistance, formatRelativeTime } from "./format";

describe("formatDistance", () => {
  it("uses whole metres under a kilometre", () => {
    expect(formatDistance(0)).toBe("0 m");
    expect(formatDistance(342.6)).toBe("343 m");
    expect(formatDistance(999)).toBe("999 m");
  });

  it("switches to kilometres at 1000 m", () => {
    expect(formatDistance(1000)).toBe("1.0 km");
    expect(formatDistance(2450)).toBe("2.5 km");
  });
});

describe("formatAge", () => {
  afterEach(() => vi.useRealTimers());

  const freeze = (iso: string) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(iso));
  };

  it("shows months only under a year", () => {
    freeze("2026-07-26T00:00:00Z");
    expect(formatAge("2026-02-26")).toBe("5m");
  });

  it("shows whole years with no remainder", () => {
    freeze("2026-07-26T00:00:00Z");
    expect(formatAge("2023-07-26")).toBe("3y");
  });

  it("shows years and months together", () => {
    freeze("2026-07-26T00:00:00Z");
    expect(formatAge("2024-04-26")).toBe("2y 3m");
  });

  it("does not count a month until the day-of-month is reached", () => {
    freeze("2026-07-10T00:00:00Z");
    // Born on the 20th: the July month isn't complete yet.
    expect(formatAge("2025-07-20")).toBe("11m");
  });

  it("handles a future or same-day birth date gracefully", () => {
    freeze("2026-07-26T00:00:00Z");
    expect(formatAge("2026-07-26")).toBe("0m");
    expect(formatAge("2027-01-01")).toBe("newborn");
  });

  it("returns a placeholder for an unparseable date", () => {
    expect(formatAge("not-a-date")).toBe("—");
  });
});

describe("formatRelativeTime", () => {
  afterEach(() => vi.useRealTimers());

  const at = (iso: string) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(iso));
  };

  it("collapses the last minute to 'just now'", () => {
    at("2026-07-26T12:00:00Z");
    expect(formatRelativeTime("2026-07-26T11:59:30Z")).toBe("just now");
  });

  it("counts minutes, hours, and days", () => {
    at("2026-07-26T12:00:00Z");
    expect(formatRelativeTime("2026-07-26T11:30:00Z")).toBe("30m ago");
    expect(formatRelativeTime("2026-07-26T06:00:00Z")).toBe("6h ago");
    expect(formatRelativeTime("2026-07-23T12:00:00Z")).toBe("3d ago");
  });

  it("falls back to a calendar date beyond a week", () => {
    at("2026-07-26T12:00:00Z");
    const result = formatRelativeTime("2026-06-01T12:00:00Z");
    expect(result).not.toMatch(/ago|just now/);
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatRelativeTime("nope")).toBe("");
  });
});
