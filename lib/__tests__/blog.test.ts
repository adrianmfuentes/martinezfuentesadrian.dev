// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"

// blog.ts imports "server-only", which throws when resolved outside of the
// "react-server" export condition. Vitest doesn't set that condition, so we
// stub the marker package to a no-op.
vi.mock("server-only", () => ({}))

const getBlogOverrides = vi.fn()
vi.mock("@/lib/kv", () => ({ getBlogOverrides }))

const { getAllPosts, getPostBySlug, getPostDraft } = await import("@/lib/blog")

describe("lib/blog", () => {
  beforeEach(() => {
    getBlogOverrides.mockReset()
    getBlogOverrides.mockResolvedValue({})
  })

  describe("getAllPosts", () => {
    it("returns the seeded posts for a supported locale, sorted newest first", async () => {
      const posts = await getAllPosts("en")

      expect(posts.length).toBeGreaterThanOrEqual(2)
      for (let i = 1; i < posts.length; i++) {
        expect(posts[i - 1].date >= posts[i].date).toBe(true)
      }

      const post = posts.find((p) => p.slug === "building-svaes-my-thesis-project")
      expect(post).toBeDefined()
      expect(post?.title).toContain("SVAES")
      expect(post?.tags).toContain("Rust")
      expect(post?.readingMinutes).toBeGreaterThan(0)
    })

    it("returns an empty array for a locale with no content directory and no overrides", async () => {
      const posts = await getAllPosts("fr")
      expect(posts).toEqual([])
    })

    it("adds a redis-only post that has no filesystem file", async () => {
      getBlogOverrides.mockResolvedValue({
        "admin-post": { slug: "admin-post", title: "From admin", description: "d", date: "2099-01-01", tags: [], content: "hello" },
      })

      const posts = await getAllPosts("en")
      const post = posts.find((p) => p.slug === "admin-post")
      expect(post).toMatchObject({ title: "From admin", date: "2099-01-01" })
    })

    it("overrides a filesystem post's metadata when a redis entry shares its slug", async () => {
      getBlogOverrides.mockResolvedValue({
        "why-i-built-security-tools-into-my-portfolio": {
          slug: "why-i-built-security-tools-into-my-portfolio",
          title: "Edited title",
          description: "edited",
          date: "2099-01-01",
          tags: ["edited"],
          content: "edited body",
        },
      })

      const posts = await getAllPosts("en")
      const post = posts.find((p) => p.slug === "why-i-built-security-tools-into-my-portfolio")
      expect(post?.title).toBe("Edited title")
    })

    it("excludes a filesystem post marked deleted in redis", async () => {
      getBlogOverrides.mockResolvedValue({
        "why-i-built-security-tools-into-my-portfolio": { deleted: true },
      })

      const posts = await getAllPosts("en")
      expect(posts.find((p) => p.slug === "why-i-built-security-tools-into-my-portfolio")).toBeUndefined()
    })
  })

  describe("getPostBySlug", () => {
    it("returns rendered, sanitized HTML for an existing post", async () => {
      const post = await getPostBySlug("en", "why-i-built-security-tools-into-my-portfolio")

      expect(post).not.toBeNull()
      expect(post?.contentHtml).toContain("<h2")
      expect(post?.contentHtml).not.toContain("<script")
    })

    it("returns null for a missing slug", async () => {
      const post = await getPostBySlug("en", "this-post-does-not-exist")
      expect(post).toBeNull()
    })

    it("returns null for a slug marked deleted in redis, even if the file still exists", async () => {
      getBlogOverrides.mockResolvedValue({
        "why-i-built-security-tools-into-my-portfolio": { deleted: true },
      })

      const post = await getPostBySlug("en", "why-i-built-security-tools-into-my-portfolio")
      expect(post).toBeNull()
    })

    it("renders a redis-only post's markdown content", async () => {
      getBlogOverrides.mockResolvedValue({
        "admin-post": { slug: "admin-post", title: "From admin", description: "d", date: "2099-01-01", tags: [], content: "## Hi" },
      })

      const post = await getPostBySlug("en", "admin-post")
      expect(post?.contentHtml).toContain("<h2")
    })
  })

  describe("getPostDraft", () => {
    it("returns the raw markdown source for a filesystem-backed post", async () => {
      const draft = await getPostDraft("en", "why-i-built-security-tools-into-my-portfolio")
      expect(draft).not.toBeNull()
      expect(draft?.content).not.toContain("<h2")
    })

    it("returns the stored content for a redis-backed post", async () => {
      getBlogOverrides.mockResolvedValue({
        "admin-post": { slug: "admin-post", title: "From admin", description: "d", date: "2099-01-01", tags: ["x"], content: "raw md" },
      })

      const draft = await getPostDraft("en", "admin-post")
      expect(draft).toEqual({ title: "From admin", description: "d", date: "2099-01-01", tags: ["x"], content: "raw md" })
    })

    it("returns null for a slug marked deleted in redis", async () => {
      getBlogOverrides.mockResolvedValue({
        "why-i-built-security-tools-into-my-portfolio": { deleted: true },
      })

      const draft = await getPostDraft("en", "why-i-built-security-tools-into-my-portfolio")
      expect(draft).toBeNull()
    })

    it("returns null for a missing slug", async () => {
      const draft = await getPostDraft("en", "this-post-does-not-exist")
      expect(draft).toBeNull()
    })
  })
})
