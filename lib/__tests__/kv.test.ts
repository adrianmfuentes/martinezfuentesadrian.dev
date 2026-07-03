// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("@upstash/redis", () => {
  const get = vi.fn()
  const set = vi.fn()
  class Redis {
    url: string
    token: string
    get = get
    set = set
    constructor(opts: { url: string; token: string }) {
      this.url = opts.url
      this.token = opts.token
    }
  }
  return { Redis, __get: get, __set: set }
})

async function importKv() {
  return await import("@/lib/kv")
}

async function importRedisMock() {
  return (await import("@upstash/redis")) as unknown as {
    __get: ReturnType<typeof vi.fn>
    __set: ReturnType<typeof vi.fn>
  }
}

describe("lib/kv", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("re-exports computeExperienceLabel", async () => {
    const kv = await importKv()
    expect(typeof kv.computeExperienceLabel).toBe("function")
  })

  describe("without redis credentials configured", () => {
    beforeEach(() => {
      vi.stubEnv("UPSTASH_REDIS_REST_URL", "")
      vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "")
    })

    it("getExperienceCounter returns the default counter", async () => {
      const kv = await importKv()
      const counter = await kv.getExperienceCounter()
      expect(counter).toEqual({ startDate: "2026-01-29", autoIncrement: true })
    })

    it("setExperienceCounter throws", async () => {
      const kv = await importKv()
      await expect(kv.setExperienceCounter({ startDate: "2026-01-01", autoIncrement: false })).rejects.toThrow(
        "Redis not configured"
      )
    })

    it("getContentOverride returns null", async () => {
      const kv = await importKv()
      await expect(kv.getContentOverride("en", "experience")).resolves.toBeNull()
    })

    it("setContentOverride throws", async () => {
      const kv = await importKv()
      await expect(kv.setContentOverride("en", "experience", {})).rejects.toThrow("Redis not configured")
    })
  })

  describe("with redis credentials configured", () => {
    beforeEach(() => {
      vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example")
      vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token-123")
    })

    it("getExperienceCounter returns the stored value when present", async () => {
      const kv = await importKv()
      const { __get } = await importRedisMock()
      const stored = { startDate: "2020-01-01", autoIncrement: false }
      __get.mockResolvedValueOnce(stored)

      await expect(kv.getExperienceCounter()).resolves.toEqual(stored)
    })

    it("getExperienceCounter falls back to default when redis returns null", async () => {
      const kv = await importKv()
      const { __get } = await importRedisMock()
      __get.mockResolvedValueOnce(null)

      await expect(kv.getExperienceCounter()).resolves.toEqual({
        startDate: "2026-01-29",
        autoIncrement: true,
      })
    })

    it("getExperienceCounter falls back to default on redis error", async () => {
      const kv = await importKv()
      const { __get } = await importRedisMock()
      __get.mockRejectedValueOnce(new Error("boom"))

      await expect(kv.getExperienceCounter()).resolves.toEqual({
        startDate: "2026-01-29",
        autoIncrement: true,
      })
    })

    it("setExperienceCounter calls redis.set with the right key", async () => {
      const kv = await importKv()
      const { __set } = await importRedisMock()
      const data = { startDate: "2020-01-01", autoIncrement: false }

      await kv.setExperienceCounter(data)
      expect(__set).toHaveBeenCalledWith("experience:counter", data)
    })

    it("getContentOverride reads the namespaced key", async () => {
      const kv = await importKv()
      const { __get } = await importRedisMock()

      await kv.getContentOverride("en", "education")
      expect(__get).toHaveBeenCalledWith("content:en:cv:education")
    })

    it("getContentOverride returns null on redis error", async () => {
      const kv = await importKv()
      const { __get } = await importRedisMock()
      __get.mockRejectedValueOnce(new Error("boom"))

      await expect(kv.getContentOverride("en", "education")).resolves.toBeNull()
    })

    it("setContentOverride writes the namespaced key", async () => {
      const kv = await importKv()
      const { __set } = await importRedisMock()

      await kv.setContentOverride("es", "certifications", { foo: "bar" })
      expect(__set).toHaveBeenCalledWith("content:es:cv:certifications", { foo: "bar" })
    })
  })
})
