import { describe, it, expect, vi, afterEach } from "vitest"
import { computeExperienceLabel } from "@/lib/experience"

describe("computeExperienceLabel", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns 'less than a month' label when started this month", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-15T00:00:00Z"))
    expect(computeExperienceLabel("2026-01-01", "en")).toBe("< 1 month")
    expect(computeExperienceLabel("2026-01-01", "es")).toBe("< 1 mes")
  })

  it("pluralizes singular month correctly", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-02-15T00:00:00Z"))
    expect(computeExperienceLabel("2026-01-01", "en")).toBe("1 month")
    expect(computeExperienceLabel("2026-01-01", "es")).toBe("1 mes")
  })

  it("pluralizes multiple months correctly", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-06-15T00:00:00Z"))
    expect(computeExperienceLabel("2026-01-01", "en")).toBe("5 months")
    expect(computeExperienceLabel("2026-01-01", "es")).toBe("5 meses")
  })

  it("returns whole years with no remaining months", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2028-01-15T00:00:00Z"))
    expect(computeExperienceLabel("2026-01-01", "en")).toBe("2 years")
    expect(computeExperienceLabel("2026-01-01", "es")).toBe("2 años")
  })

  it("returns singular year with no remaining months", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2027-01-15T00:00:00Z"))
    expect(computeExperienceLabel("2026-01-01", "en")).toBe("1 year")
  })

  it("combines years and months with the locale's conjunction", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2028-04-15T00:00:00Z"))
    expect(computeExperienceLabel("2026-01-01", "en")).toBe("2 years and 3 months")
    expect(computeExperienceLabel("2026-01-01", "es")).toBe("2 años y 3 meses")
  })

  it("combines singular year and singular month", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2027-02-15T00:00:00Z"))
    expect(computeExperienceLabel("2026-01-01", "en")).toBe("1 year and 1 month")
  })

  it("clamps negative durations (future start date) to zero", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
    expect(computeExperienceLabel("2030-01-01", "en")).toBe("< 1 month")
  })
})
