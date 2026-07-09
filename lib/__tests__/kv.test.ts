// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("@upstash/redis", () => {
  const get = vi.fn()
  const set = vi.fn()
  const incr = vi.fn()
  class Redis {
    url: string
    token: string
    get = get
    set = set
    incr = incr
    constructor(opts: { url: string; token: string }) {
      this.url = opts.url
      this.token = opts.token
    }
  }
  return { Redis, __get: get, __set: set, __incr: incr }
})

async function importKv() {
  return await import("@/lib/kv")
}

async function importRedisMock() {
  return (await import("@upstash/redis")) as unknown as {
    __get: ReturnType<typeof vi.fn>
    __set: ReturnType<typeof vi.fn>
    __incr: ReturnType<typeof vi.fn>
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

    it("incrementVisitCount returns null", async () => {
      const kv = await importKv()
      await expect(kv.incrementVisitCount()).resolves.toBeNull()
    })

    it("getBlogOverrides returns an empty object", async () => {
      const kv = await importKv()
      await expect(kv.getBlogOverrides("en")).resolves.toEqual({})
    })

    it("upsertBlogPost throws", async () => {
      const kv = await importKv()
      await expect(
        kv.upsertBlogPost("en", "slug", { title: "T", description: "", date: "", tags: [], content: "" })
      ).rejects.toThrow("Redis not configured")
    })

    it("deleteBlogPost throws", async () => {
      const kv = await importKv()
      await expect(kv.deleteBlogPost("en", "slug")).rejects.toThrow("Redis not configured")
    })

    it("renameBlogPost throws", async () => {
      const kv = await importKv()
      await expect(
        kv.renameBlogPost("en", "old", "new", { title: "T", description: "", date: "", tags: [], content: "" })
      ).rejects.toThrow("Redis not configured")
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

    it("incrementVisitCount increments and returns the new total", async () => {
      const kv = await importKv()
      const { __incr } = await importRedisMock()
      __incr.mockResolvedValueOnce(43)

      await expect(kv.incrementVisitCount()).resolves.toBe(43)
      expect(__incr).toHaveBeenCalledWith("visits:total")
    })

    it("incrementVisitCount returns null on redis error", async () => {
      const kv = await importKv()
      const { __incr } = await importRedisMock()
      __incr.mockRejectedValueOnce(new Error("boom"))

      await expect(kv.incrementVisitCount()).resolves.toBeNull()
    })

    it("getBlogOverrides reads the namespaced key", async () => {
      const kv = await importKv()
      const { __get } = await importRedisMock()
      __get.mockResolvedValueOnce({ "my-post": { slug: "my-post", title: "T", description: "", date: "", tags: [], content: "" } })

      const overrides = await kv.getBlogOverrides("en")
      expect(__get).toHaveBeenCalledWith("blog:posts:en")
      expect(overrides["my-post"]).toMatchObject({ title: "T" })
    })

    it("getBlogOverrides returns an empty object when nothing is stored", async () => {
      const kv = await importKv()
      const { __get } = await importRedisMock()
      __get.mockResolvedValueOnce(null)

      await expect(kv.getBlogOverrides("en")).resolves.toEqual({})
    })

    it("getBlogOverrides returns an empty object on redis error", async () => {
      const kv = await importKv()
      const { __get } = await importRedisMock()
      __get.mockRejectedValueOnce(new Error("boom"))

      await expect(kv.getBlogOverrides("en")).resolves.toEqual({})
    })

    it("upsertBlogPost merges the new post into the existing map and writes it back", async () => {
      const kv = await importKv()
      const { __get, __set } = await importRedisMock()
      __get.mockResolvedValueOnce({ existing: { slug: "existing", title: "Old", description: "", date: "", tags: [], content: "" } })

      const data = { title: "New", description: "d", date: "2026-01-01", tags: ["a"], content: "body" }
      await kv.upsertBlogPost("es", "new-post", data)

      expect(__set).toHaveBeenCalledWith("blog:posts:es", {
        existing: { slug: "existing", title: "Old", description: "", date: "", tags: [], content: "" },
        "new-post": { slug: "new-post", ...data },
      })
    })

    it("deleteBlogPost marks the slug as deleted without removing other entries", async () => {
      const kv = await importKv()
      const { __get, __set } = await importRedisMock()
      __get.mockResolvedValueOnce({ keep: { slug: "keep", title: "Keep", description: "", date: "", tags: [], content: "" } })

      await kv.deleteBlogPost("en", "gone")

      expect(__set).toHaveBeenCalledWith("blog:posts:en", {
        keep: { slug: "keep", title: "Keep", description: "", date: "", tags: [], content: "" },
        gone: { deleted: true },
      })
    })

    it("renameBlogPost marks the old slug deleted and writes the new one", async () => {
      const kv = await importKv()
      const { __get, __set } = await importRedisMock()
      __get.mockResolvedValueOnce({})

      const data = { title: "Renamed", description: "", date: "", tags: [], content: "body" }
      await kv.renameBlogPost("en", "old-slug", "new-slug", data)

      expect(__set).toHaveBeenCalledWith("blog:posts:en", {
        "old-slug": { deleted: true },
        "new-slug": { slug: "new-slug", ...data },
      })
    })

    it("renameBlogPost skips marking the old slug deleted when the slug is unchanged", async () => {
      const kv = await importKv()
      const { __get, __set } = await importRedisMock()
      __get.mockResolvedValueOnce({})

      const data = { title: "Same", description: "", date: "", tags: [], content: "body" }
      await kv.renameBlogPost("en", "same-slug", "same-slug", data)

      expect(__set).toHaveBeenCalledWith("blog:posts:en", {
        "same-slug": { slug: "same-slug", ...data },
      })
    })
  })
})
