// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

vi.mock("@/lib/admin-auth", () => ({
  ADMIN_COOKIE: "admin_session",
  verifySessionToken: vi.fn(),
}))

vi.mock("@/lib/blog", () => ({
  getPostDraft: vi.fn(),
}))

function makeRequest(url: string) {
  return new Request(url)
}

async function mockAuthorized(authorized: boolean, tokenValue = "valid-token") {
  const { cookies } = await import("next/headers")
  const { verifySessionToken } = await import("@/lib/admin-auth")
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name === "admin_session" ? { value: tokenValue } : undefined),
  } as never)
  vi.mocked(verifySessionToken).mockResolvedValue(authorized)
}

describe("GET /api/admin/blog/[slug]", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when unauthenticated", async () => {
    await mockAuthorized(false)
    const { GET } = await import("@/app/api/admin/blog/[slug]/route")

    const response = await GET(makeRequest("http://localhost/api/admin/blog/my-post?lang=en"), {
      params: Promise.resolve({ slug: "my-post" }),
    })
    expect(response.status).toBe(401)
  })

  it("returns 400 for an unsupported lang", async () => {
    await mockAuthorized(true)
    const { GET } = await import("@/app/api/admin/blog/[slug]/route")

    const response = await GET(makeRequest("http://localhost/api/admin/blog/my-post?lang=fr"), {
      params: Promise.resolve({ slug: "my-post" }),
    })
    expect(response.status).toBe(400)
  })

  it("returns 404 when the post has no draft", async () => {
    await mockAuthorized(true)
    const { getPostDraft } = await import("@/lib/blog")
    vi.mocked(getPostDraft).mockResolvedValue(null)
    const { GET } = await import("@/app/api/admin/blog/[slug]/route")

    const response = await GET(makeRequest("http://localhost/api/admin/blog/missing?lang=en"), {
      params: Promise.resolve({ slug: "missing" }),
    })
    expect(response.status).toBe(404)
  })

  it("returns the draft with its slug", async () => {
    await mockAuthorized(true)
    const { getPostDraft } = await import("@/lib/blog")
    vi.mocked(getPostDraft).mockResolvedValue({
      title: "T",
      description: "d",
      date: "2026-01-01",
      tags: ["x"],
      content: "body",
    })
    const { GET } = await import("@/app/api/admin/blog/[slug]/route")

    const response = await GET(makeRequest("http://localhost/api/admin/blog/my-post?lang=en"), {
      params: Promise.resolve({ slug: "my-post" }),
    })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ slug: "my-post", title: "T", description: "d", date: "2026-01-01", tags: ["x"], content: "body" })
    expect(getPostDraft).toHaveBeenCalledWith("en", "my-post")
  })
})
