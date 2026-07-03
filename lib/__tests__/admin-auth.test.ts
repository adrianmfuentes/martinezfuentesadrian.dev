// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest"
import {
  ADMIN_COOKIE,
  createSessionToken,
  verifySessionToken,
  verifyAdminPassword,
} from "@/lib/admin-auth"

describe("lib/admin-auth", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.useRealTimers()
  })

  it("exposes the admin cookie name", () => {
    expect(ADMIN_COOKIE).toBe("admin_session")
  })

  describe("verifyAdminPassword", () => {
    it("returns false when ADMIN_PASSWORD is not configured", () => {
      vi.stubEnv("ADMIN_PASSWORD", "")
      expect(verifyAdminPassword("anything")).toBe(false)
    })

    it("returns true for a matching password", () => {
      vi.stubEnv("ADMIN_PASSWORD", "correct-horse-battery-staple")
      expect(verifyAdminPassword("correct-horse-battery-staple")).toBe(true)
    })

    it("returns false for a non-matching password of the same length", () => {
      vi.stubEnv("ADMIN_PASSWORD", "aaaaaaaa")
      expect(verifyAdminPassword("bbbbbbbb")).toBe(false)
    })

    it("returns false for a password of different length", () => {
      vi.stubEnv("ADMIN_PASSWORD", "short")
      expect(verifyAdminPassword("a-much-longer-guess")).toBe(false)
    })
  })

  describe("createSessionToken / verifySessionToken", () => {
    it("throws when ADMIN_SECRET is not configured", async () => {
      vi.stubEnv("ADMIN_SECRET", "")
      await expect(createSessionToken()).rejects.toThrow("ADMIN_SECRET is not configured")
    })

    it("creates a token that verifies successfully", async () => {
      vi.stubEnv("ADMIN_SECRET", "top-secret")
      const token = await createSessionToken()
      expect(token).toContain(".")
      await expect(verifySessionToken(token)).resolves.toBe(true)
    })

    it("rejects a token signed with a different secret", async () => {
      vi.stubEnv("ADMIN_SECRET", "secret-one")
      const token = await createSessionToken()

      vi.stubEnv("ADMIN_SECRET", "secret-two")
      await expect(verifySessionToken(token)).resolves.toBe(false)
    })

    it("rejects malformed tokens without a dot separator", async () => {
      vi.stubEnv("ADMIN_SECRET", "top-secret")
      await expect(verifySessionToken("not-a-real-token")).resolves.toBe(false)
    })

    it("rejects when ADMIN_SECRET is missing at verification time", async () => {
      vi.stubEnv("ADMIN_SECRET", "")
      await expect(verifySessionToken("a.b")).resolves.toBe(false)
    })

    it("rejects an expired token", async () => {
      vi.stubEnv("ADMIN_SECRET", "top-secret")
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
      const token = await createSessionToken()

      vi.setSystemTime(new Date("2026-01-01T09:00:00Z")) // 9h later, session lasts 8h
      await expect(verifySessionToken(token)).resolves.toBe(false)
    })

    it("rejects a tampered payload", async () => {
      vi.stubEnv("ADMIN_SECRET", "top-secret")
      const token = await createSessionToken()
      const [, sig] = token.split(".")
      const tampered = `${btoa(JSON.stringify({ iat: 0, exp: Date.now() + 100000 }))}.${sig}`
      await expect(verifySessionToken(tampered)).resolves.toBe(false)
    })
  })
})
