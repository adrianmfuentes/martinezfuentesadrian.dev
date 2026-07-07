// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// dictionaries.ts imports "server-only", which throws when resolved outside
// of the "react-server" export condition. Vitest doesn't set that condition,
// so we stub the marker package to a no-op.
vi.mock("server-only", () => ({}))

vi.mock("@/lib/kv", () => {
  const getCachedCmsOverrides = vi.fn()
  const computeExperienceLabel = vi.fn()
  return { getCachedCmsOverrides, computeExperienceLabel, CMS_CONTENT_TAG: "cms-content" }
})

async function importDictionaries() {
  return await import("@/app/[lang]/dictionaries")
}

async function importKvMock() {
  return (await import("@/lib/kv")) as unknown as {
    getCachedCmsOverrides: ReturnType<typeof vi.fn>
    computeExperienceLabel: ReturnType<typeof vi.fn>
  }
}

function overrides(partial: {
  expOverride?: unknown
  eduOverride?: unknown
  certOverride?: unknown
  counter: { startDate: string; autoIncrement: boolean }
}) {
  return {
    expOverride: partial.expOverride ?? null,
    eduOverride: partial.eduOverride ?? null,
    certOverride: partial.certOverride ?? null,
    counter: partial.counter,
  }
}

describe("app/[lang]/dictionaries", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("loads the static english dictionary when KV has no overrides", async () => {
    const kv = await importKvMock()
    kv.getCachedCmsOverrides.mockResolvedValue(
      overrides({ counter: { startDate: "2026-01-29", autoIncrement: false } })
    )

    const { getDictionary } = await importDictionaries()
    const dict = await getDictionary("en")

    expect(dict.metadata.title).toContain("Adrián Martínez")
    expect(dict.about.stats.yearsExperience).toBe("2 months")
    expect(Array.isArray(dict.cv.experience.items)).toBe(true)
  })

  it("loads the static spanish dictionary when KV has no overrides", async () => {
    const kv = await importKvMock()
    kv.getCachedCmsOverrides.mockResolvedValue(
      overrides({ counter: { startDate: "2026-01-29", autoIncrement: false } })
    )

    const { getDictionary } = await importDictionaries()
    const dict = await getDictionary("es")

    expect(dict.metadata.title).toBeTruthy()
    expect(Array.isArray(dict.cv.education.items)).toBe(true)
  })

  it("merges experience, education and certification overrides when present", async () => {
    const kv = await importKvMock()
    const expOverride = { items: [{ title: "Override Exp" }] }
    const eduOverride = { items: [{ title: "Override Edu" }] }
    const certOverride = { items: [{ title: "Override Cert" }] }

    kv.getCachedCmsOverrides.mockResolvedValue(
      overrides({
        expOverride,
        eduOverride,
        certOverride,
        counter: { startDate: "2026-01-29", autoIncrement: false },
      })
    )

    const { getDictionary } = await importDictionaries()
    const dict = await getDictionary("en")

    expect(dict.cv.experience).toEqual(expOverride)
    expect(dict.cv.education).toEqual(eduOverride)
    expect(dict.cv.certifications).toEqual(certOverride)
  })

  it("leaves a section untouched when its override is null", async () => {
    const kv = await importKvMock()
    kv.getCachedCmsOverrides.mockResolvedValue(
      overrides({
        expOverride: { items: [{ title: "Only Exp Overridden" }] },
        counter: { startDate: "2026-01-29", autoIncrement: false },
      })
    )

    const { getDictionary } = await importDictionaries()
    const dict = await getDictionary("en")

    expect(dict.cv.experience).toEqual({ items: [{ title: "Only Exp Overridden" }] })
    // education/certifications should remain the static JSON (arrays with real seed data)
    expect(dict.cv.education.items.length).toBeGreaterThan(0)
    expect(dict.cv.education.items[0].title).not.toBe("Only Exp Overridden")
  })

  it("recomputes yearsExperience when the counter has autoIncrement enabled", async () => {
    const kv = await importKvMock()
    kv.getCachedCmsOverrides.mockResolvedValue(
      overrides({ counter: { startDate: "2020-01-01", autoIncrement: true } })
    )
    kv.computeExperienceLabel.mockReturnValue("computed-label")

    const { getDictionary } = await importDictionaries()
    const dict = await getDictionary("en")

    expect(kv.computeExperienceLabel).toHaveBeenCalledWith("2020-01-01", "en")
    expect(dict.about.stats.yearsExperience).toBe("computed-label")
  })

  it("does NOT recompute yearsExperience when autoIncrement is false", async () => {
    const kv = await importKvMock()
    kv.getCachedCmsOverrides.mockResolvedValue(
      overrides({ counter: { startDate: "2020-01-01", autoIncrement: false } })
    )

    const { getDictionary } = await importDictionaries()
    const dict = await getDictionary("en")

    expect(kv.computeExperienceLabel).not.toHaveBeenCalled()
    expect(dict.about.stats.yearsExperience).toBe("2 months")
  })

  it("does NOT recompute yearsExperience when startDate is empty", async () => {
    const kv = await importKvMock()
    kv.getCachedCmsOverrides.mockResolvedValue(overrides({ counter: { startDate: "", autoIncrement: true } }))

    const { getDictionary } = await importDictionaries()
    const dict = await getDictionary("en")

    expect(kv.computeExperienceLabel).not.toHaveBeenCalled()
    expect(dict.about.stats.yearsExperience).toBe("2 months")
  })

  it("swallows a KV error and returns the static JSON unchanged", async () => {
    const kv = await importKvMock()
    kv.getCachedCmsOverrides.mockRejectedValue(new Error("KV down"))

    const { getDictionary } = await importDictionaries()
    const dict = await getDictionary("en")

    expect(dict.about.stats.yearsExperience).toBe("2 months")
    expect(dict.metadata.title).toContain("Adrián Martínez")
  })
})
