// @vitest-environment node
import { describe, it, expect } from "vitest"
import { POST } from "@/app/api/admin/logout/route"

describe("POST /api/admin/logout", () => {
  it("returns ok:true and clears the admin cookie", async () => {
    const response = await POST()
    const body = await response.json()

    expect(body).toEqual({ ok: true })

    const cookie = response.cookies.get("admin_session")
    expect(cookie).toBeDefined()
    expect(cookie?.value).toBe("")
    expect(cookie?.maxAge).toBe(0)
  })
})
