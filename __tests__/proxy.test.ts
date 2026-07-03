// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

async function importProxy() {
  return await import("@/proxy")
}

async function importAdminAuth() {
  return await import("@/lib/admin-auth")
}

function makeRequest(
  path: string,
  opts: { ip?: string; cookie?: string } = {}
) {
  const headers: Record<string, string> = {}
  if (opts.ip) headers["x-forwarded-for"] = opts.ip
  if (opts.cookie) headers["cookie"] = opts.cookie

  return new NextRequest(`http://localhost${path}`, { headers })
}

describe("proxy", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe("without an IP allowlist configured", () => {
    beforeEach(() => {
      vi.stubEnv("ADMIN_ALLOWED_IPS", "")
    })

    it("redirects to /admin/login when there is no session cookie", async () => {
      vi.stubEnv("ADMIN_SECRET", "top-secret")
      const { proxy } = await importProxy()

      const response = await proxy(makeRequest("/admin"))

      expect(response.status).toBe(307)
      expect(response.headers.get("location")).toBe("http://localhost/admin/login")
    })

    it("always allows /admin/login through, regardless of cookie", async () => {
      vi.stubEnv("ADMIN_SECRET", "top-secret")
      const { proxy } = await importProxy()

      const response = await proxy(makeRequest("/admin/login"))

      // NextResponse.next() has no redirect / block status
      expect(response.headers.get("location")).toBeNull()
      expect(response.status).toBe(200)
    })

    it("calls next() for a request bearing a valid session cookie", async () => {
      vi.stubEnv("ADMIN_SECRET", "top-secret")
      const { createSessionToken } = await importAdminAuth()
      const token = await createSessionToken()

      const { proxy } = await importProxy()
      const response = await proxy(makeRequest("/admin", { cookie: `admin_session=${token}` }))

      expect(response.headers.get("location")).toBeNull()
      expect(response.status).toBe(200)
    })

    it("redirects when the session cookie is expired", async () => {
      vi.stubEnv("ADMIN_SECRET", "top-secret")
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))

      const { createSessionToken } = await importAdminAuth()
      const token = await createSessionToken()

      vi.setSystemTime(new Date("2026-01-01T09:00:00Z")) // session lasts 8h

      const { proxy } = await importProxy()
      const response = await proxy(makeRequest("/admin", { cookie: `admin_session=${token}` }))

      expect(response.status).toBe(307)
      expect(response.headers.get("location")).toBe("http://localhost/admin/login")

      vi.useRealTimers()
    })

    it("redirects when the session cookie is tampered with", async () => {
      vi.stubEnv("ADMIN_SECRET", "top-secret")
      const { createSessionToken } = await importAdminAuth()
      const token = await createSessionToken()
      const [, sig] = token.split(".")
      const tamperedPayload = btoa(JSON.stringify({ iat: 0, exp: Date.now() + 100000 }))
      const tampered = `${tamperedPayload}.${sig}`

      const { proxy } = await importProxy()
      const response = await proxy(makeRequest("/admin", { cookie: `admin_session=${tampered}` }))

      expect(response.status).toBe(307)
    })

    it("redirects when ADMIN_SECRET is missing at verification time", async () => {
      vi.stubEnv("ADMIN_SECRET", "")
      const { proxy } = await importProxy()

      const response = await proxy(makeRequest("/admin", { cookie: "admin_session=whatever.sig" }))

      expect(response.status).toBe(307)
      expect(response.headers.get("location")).toBe("http://localhost/admin/login")
    })

    it("redirects when the session cookie is missing entirely", async () => {
      vi.stubEnv("ADMIN_SECRET", "top-secret")
      const { proxy } = await importProxy()

      const response = await proxy(makeRequest("/admin"))

      expect(response.status).toBe(307)
    })
  })

  describe("with an IP allowlist configured", () => {
    // The IP literals below are arbitrary test fixture values used only to exercise
    // the allowlist comparison logic — they don't identify any real host. NOSONAR
    // suppresses typescript:S1313 ("hardcoded IP address"), which doesn't apply here.
    it("blocks a request from an IP outside the allowlist with a 403", async () => {
      vi.stubEnv("ADMIN_ALLOWED_IPS", "9.9.9.9,8.8.8.8") // NOSONAR
      vi.stubEnv("ADMIN_SECRET", "top-secret")
      const { proxy } = await importProxy()

      const response = await proxy(makeRequest("/admin", { ip: "1.2.3.4" })) // NOSONAR

      expect(response.status).toBe(403)
    })

    it("allows a request from an allowlisted IP with a valid session cookie through", async () => {
      vi.stubEnv("ADMIN_ALLOWED_IPS", "1.2.3.4,8.8.8.8") // NOSONAR
      vi.stubEnv("ADMIN_SECRET", "top-secret")

      const { createSessionToken } = await importAdminAuth()
      const token = await createSessionToken()

      const { proxy } = await importProxy()
      const response = await proxy(
        makeRequest("/admin", { ip: "1.2.3.4", cookie: `admin_session=${token}` }) // NOSONAR
      )

      expect(response.headers.get("location")).toBeNull()
      expect(response.status).toBe(200)
    })

    it("blocks /admin/login too when the IP is not allowlisted", async () => {
      vi.stubEnv("ADMIN_ALLOWED_IPS", "9.9.9.9") // NOSONAR
      vi.stubEnv("ADMIN_SECRET", "top-secret")
      const { proxy } = await importProxy()

      const response = await proxy(makeRequest("/admin/login", { ip: "1.2.3.4" })) // NOSONAR

      expect(response.status).toBe(403)
    })
  })
})
