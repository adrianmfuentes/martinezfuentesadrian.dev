import { describe, it, expect, vi, afterEach } from "vitest"
import { computeExperienceLabel } from "@/lib/experience"

describe("computeExperienceLabel", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it.each([
    ["less than a month when started this month", "2026-01-15", "2026-01-01", "en", "< 1 month"],
    ["less than a month when started this month", "2026-01-15", "2026-01-01", "es", "< 1 mes"],
    ["singular month", "2026-02-15", "2026-01-01", "en", "1 month"],
    ["singular month", "2026-02-15", "2026-01-01", "es", "1 mes"],
    ["plural months", "2026-06-15", "2026-01-01", "en", "5 months"],
    ["plural months", "2026-06-15", "2026-01-01", "es", "5 meses"],
    ["whole years, no remaining months", "2028-01-15", "2026-01-01", "en", "2 years"],
    ["whole years, no remaining months", "2028-01-15", "2026-01-01", "es", "2 años"],
    ["singular year, no remaining months", "2027-01-15", "2026-01-01", "en", "1 year"],
    ["years and months with locale conjunction", "2028-04-15", "2026-01-01", "en", "2 years and 3 months"],
    ["years and months with locale conjunction", "2028-04-15", "2026-01-01", "es", "2 años y 3 meses"],
    ["singular year and singular month", "2027-02-15", "2026-01-01", "en", "1 year and 1 month"],
    ["clamps negative durations (future start date) to zero", "2026-01-01", "2030-01-01", "en", "< 1 month"],
  ] as const)("%s (%s, start %s, %s)", (_label, now, startDate, lang, expected) => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(`${now}T00:00:00Z`))
    expect(computeExperienceLabel(startDate, lang)).toBe(expected)
  })
})
