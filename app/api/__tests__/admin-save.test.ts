// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

vi.mock("@/lib/admin-auth", () => ({
  ADMIN_COOKIE: "admin_session",
  verifySessionToken: vi.fn(),
}))

vi.mock("@/lib/kv", () => ({
  setContentOverride: vi.fn(),
  setExperienceCounter: vi.fn(),
  CMS_CONTENT_TAG: "cms-content",
}))

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/admin/save", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  })
}

async function mockAuthorized(authorized: boolean, tokenValue = "valid-token") {
  const { cookies } = await import("next/headers")
  const { verifySessionToken } = await import("@/lib/admin-auth")
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name === "admin_session" ? { value: tokenValue } : undefined),
  } as never)
  vi.mocked(verifySessionToken).mockResolvedValue(authorized)
}

describe("POST /api/admin/save", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when there is no session cookie", async () => {
    const { POST } = await import("@/app/api/admin/save/route")
    const { cookies } = await import("next/headers")
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as never)

    const response = await POST(makeRequest({ type: "counter", data: {} }))
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toEqual({ error: "Unauthorized" })
  })

  it("returns 401 when verifySessionToken returns false", async () => {
    await mockAuthorized(false)
    const { POST } = await import("@/app/api/admin/save/route")

    const response = await POST(makeRequest({ type: "counter", data: {} }))
    expect(response.status).toBe(401)
  })

  it("handles type 'counter': calls setExperienceCounter and revalidates both locales", async () => {
    await mockAuthorized(true)
    const { POST } = await import("@/app/api/admin/save/route")
    const { setExperienceCounter } = await import("@/lib/kv")
    const { revalidatePath, revalidateTag } = await import("next/cache")

    const data = { startDate: "2020-01-01", autoIncrement: false }
    const response = await POST(makeRequest({ type: "counter", data }))

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ ok: true })
    expect(setExperienceCounter).toHaveBeenCalledWith(data)
    expect(revalidateTag).toHaveBeenCalledWith("cms-content", { expire: 0 })
    expect(revalidatePath).toHaveBeenCalledWith("/es/about", "page")
    expect(revalidatePath).toHaveBeenCalledWith("/en/about", "page")
    expect(revalidatePath).toHaveBeenCalledTimes(2)
  })

  it("handles type 'content': calls setContentOverride and revalidates cv+about", async () => {
    await mockAuthorized(true)
    const { POST } = await import("@/app/api/admin/save/route")
    const { setContentOverride } = await import("@/lib/kv")
    const { revalidatePath, revalidateTag } = await import("next/cache")

    const data = { title: "hello" }
    const response = await POST(
      makeRequest({ type: "content", lang: "en", section: "experience", data })
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ ok: true })
    expect(setContentOverride).toHaveBeenCalledWith("en", "experience", data)
    expect(revalidateTag).toHaveBeenCalledWith("cms-content", { expire: 0 })
    expect(revalidatePath).toHaveBeenCalledWith("/en/cv", "page")
    expect(revalidatePath).toHaveBeenCalledWith("/en/about", "page")
    expect(revalidatePath).toHaveBeenCalledTimes(2)
  })

  it("returns 400 for an unknown type", async () => {
    await mockAuthorized(true)
    const { POST } = await import("@/app/api/admin/save/route")

    const response = await POST(makeRequest({ type: "bogus" }))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ error: "Unknown type" })
  })

  it("returns 500 when setExperienceCounter throws", async () => {
    await mockAuthorized(true)
    const { POST } = await import("@/app/api/admin/save/route")
    const { setExperienceCounter } = await import("@/lib/kv")
    vi.mocked(setExperienceCounter).mockRejectedValue(new Error("kv down"))

    const response = await POST(makeRequest({ type: "counter", data: {} }))
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body).toEqual({ error: "Save failed" })
  })
})
