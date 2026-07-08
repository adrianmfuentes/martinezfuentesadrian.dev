// @vitest-environment node
import { describe, it, expect, vi } from "vitest"

// blog.ts imports "server-only", which throws when resolved outside of the
// "react-server" export condition. Vitest doesn't set that condition, so we
// stub the marker package to a no-op.
vi.mock("server-only", () => ({}))

const { getAllPosts, getPostBySlug } = await import("@/lib/blog")

describe("lib/blog", () => {
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

    it("returns an empty array for a locale with no content directory", async () => {
      const posts = await getAllPosts("fr")
      expect(posts).toEqual([])
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
  })
})
