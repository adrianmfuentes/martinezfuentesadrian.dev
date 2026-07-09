// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/admin-auth", () => ({
  ADMIN_COOKIE: "admin_session",
  verifySessionToken: vi.fn(),
}))

vi.mock("@/lib/kv", () => ({
  upsertBlogPost: vi.fn(),
  deleteBlogPost: vi.fn(),
  renameBlogPost: vi.fn(),
}))

vi.mock("@/lib/blog", () => ({
  getAllPosts: vi.fn(),
}))

function makeRequest(url: string, init?: RequestInit) {
  return new Request(url, init)
}

async function mockAuthorized(authorized: boolean, tokenValue = "valid-token") {
  const { cookies } = await import("next/headers")
  const { verifySessionToken } = await import("@/lib/admin-auth")
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name === "admin_session" ? { value: tokenValue } : undefined),
  } as never)
  vi.mocked(verifySessionToken).mockResolvedValue(authorized)
}

describe("GET /api/admin/blog", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when unauthenticated", async () => {
    await mockAuthorized(false)
    const { GET } = await import("@/app/api/admin/blog/route")

    const response = await GET(makeRequest("http://localhost/api/admin/blog?lang=en"))
    expect(response.status).toBe(401)
  })

  it("returns 400 for an unsupported lang", async () => {
    await mockAuthorized(true)
    const { GET } = await import("@/app/api/admin/blog/route")

    const response = await GET(makeRequest("http://localhost/api/admin/blog?lang=fr"))
    expect(response.status).toBe(400)
  })

  it("returns the merged post list for a valid lang", async () => {
    await mockAuthorized(true)
    const { getAllPosts } = await import("@/lib/blog")
    vi.mocked(getAllPosts).mockResolvedValue([
      { slug: "a", title: "A", description: "", date: "2026-01-01", tags: [], readingMinutes: 1 },
    ])
    const { GET } = await import("@/app/api/admin/blog/route")

    const response = await GET(makeRequest("http://localhost/api/admin/blog?lang=en"))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.posts).toHaveLength(1)
    expect(getAllPosts).toHaveBeenCalledWith("en")
  })
})

describe("POST /api/admin/blog", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when unauthenticated", async () => {
    await mockAuthorized(false)
    const { POST } = await import("@/app/api/admin/blog/route")

    const response = await POST(
      makeRequest("http://localhost/api/admin/blog", { method: "POST", body: JSON.stringify({}) })
    )
    expect(response.status).toBe(401)
  })

  it("rejects an invalid slug", async () => {
    await mockAuthorized(true)
    const { POST } = await import("@/app/api/admin/blog/route")

    const response = await POST(
      makeRequest("http://localhost/api/admin/blog", {
        method: "POST",
        body: JSON.stringify({ lang: "en", slug: "Not A Slug!", title: "T", content: "" }),
      })
    )
    expect(response.status).toBe(400)
  })

  it("rejects a missing title", async () => {
    await mockAuthorized(true)
    const { POST } = await import("@/app/api/admin/blog/route")

    const response = await POST(
      makeRequest("http://localhost/api/admin/blog", {
        method: "POST",
        body: JSON.stringify({ lang: "en", slug: "my-post", title: "  ", content: "" }),
      })
    )
    expect(response.status).toBe(400)
  })

  it("upserts a new post and revalidates its blog paths", async () => {
    await mockAuthorized(true)
    const { upsertBlogPost } = await import("@/lib/kv")
    const { revalidatePath } = await import("next/cache")
    const { POST } = await import("@/app/api/admin/blog/route")

    const response = await POST(
      makeRequest("http://localhost/api/admin/blog", {
        method: "POST",
        body: JSON.stringify({
          lang: "en",
          slug: "my-post",
          title: "My Post",
          description: "d",
          date: "2026-01-01",
          tags: ["x"],
          content: "body",
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(upsertBlogPost).toHaveBeenCalledWith("en", "my-post", {
      title: "My Post",
      description: "d",
      date: "2026-01-01",
      tags: ["x"],
      content: "body",
    })
    expect(revalidatePath).toHaveBeenCalledWith("/en/blog", "page")
    expect(revalidatePath).toHaveBeenCalledWith("/en/blog/my-post", "page")
  })

  it("renames via renameBlogPost when originalSlug differs from slug, revalidating both", async () => {
    await mockAuthorized(true)
    const { renameBlogPost, upsertBlogPost } = await import("@/lib/kv")
    const { revalidatePath } = await import("next/cache")
    const { POST } = await import("@/app/api/admin/blog/route")

    const response = await POST(
      makeRequest("http://localhost/api/admin/blog", {
        method: "POST",
        body: JSON.stringify({
          lang: "en",
          slug: "new-slug",
          originalSlug: "old-slug",
          title: "T",
          description: "",
          date: "",
          tags: [],
          content: "",
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(renameBlogPost).toHaveBeenCalledWith("en", "old-slug", "new-slug", {
      title: "T",
      description: "",
      date: "",
      tags: [],
      content: "",
    })
    expect(upsertBlogPost).not.toHaveBeenCalled()
    expect(revalidatePath).toHaveBeenCalledWith("/en/blog/old-slug", "page")
    expect(revalidatePath).toHaveBeenCalledWith("/en/blog/new-slug", "page")
  })

  it("returns 500 when the store throws", async () => {
    await mockAuthorized(true)
    const { upsertBlogPost } = await import("@/lib/kv")
    vi.mocked(upsertBlogPost).mockRejectedValue(new Error("kv down"))
    const { POST } = await import("@/app/api/admin/blog/route")

    const response = await POST(
      makeRequest("http://localhost/api/admin/blog", {
        method: "POST",
        body: JSON.stringify({ lang: "en", slug: "my-post", title: "T", content: "" }),
      })
    )
    expect(response.status).toBe(500)
  })
})

describe("DELETE /api/admin/blog", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when unauthenticated", async () => {
    await mockAuthorized(false)
    const { DELETE } = await import("@/app/api/admin/blog/route")

    const response = await DELETE(
      makeRequest("http://localhost/api/admin/blog", { method: "DELETE", body: JSON.stringify({}) })
    )
    expect(response.status).toBe(401)
  })

  it("deletes the post and revalidates its blog paths", async () => {
    await mockAuthorized(true)
    const { deleteBlogPost } = await import("@/lib/kv")
    const { revalidatePath } = await import("next/cache")
    const { DELETE } = await import("@/app/api/admin/blog/route")

    const response = await DELETE(
      makeRequest("http://localhost/api/admin/blog", {
        method: "DELETE",
        body: JSON.stringify({ lang: "en", slug: "my-post" }),
      })
    )

    expect(response.status).toBe(200)
    expect(deleteBlogPost).toHaveBeenCalledWith("en", "my-post")
    expect(revalidatePath).toHaveBeenCalledWith("/en/blog", "page")
    expect(revalidatePath).toHaveBeenCalledWith("/en/blog/my-post", "page")
  })

  it("returns 500 when the store throws", async () => {
    await mockAuthorized(true)
    const { deleteBlogPost } = await import("@/lib/kv")
    vi.mocked(deleteBlogPost).mockRejectedValue(new Error("kv down"))
    const { DELETE } = await import("@/app/api/admin/blog/route")

    const response = await DELETE(
      makeRequest("http://localhost/api/admin/blog", {
        method: "DELETE",
        body: JSON.stringify({ lang: "en", slug: "my-post" }),
      })
    )
    expect(response.status).toBe(500)
  })
})
