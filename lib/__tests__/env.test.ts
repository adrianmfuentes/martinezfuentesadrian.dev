// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  getBaseUrl,
  getApiUrl,
  isProduction,
  isDevelopment,
  getCorsOrigins,
  buildApiUrl,
  buildPageUrl,
} from "@/lib/env"

const originalEnv = { ...process.env }

describe("lib/env (server)", () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.NEXT_PUBLIC_APP_URL
    delete process.env.SITE_URL
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  describe("getBaseUrl", () => {
    it("uses NEXT_PUBLIC_APP_URL when set on the server", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://app.example"
      expect(getBaseUrl()).toBe("https://app.example")
    })

    it("falls back to SITE_URL when NEXT_PUBLIC_APP_URL is missing", () => {
      process.env.SITE_URL = "https://site.example"
      expect(getBaseUrl()).toBe("https://site.example")
    })

    it("defaults to localhost when nothing is configured", () => {
      expect(getBaseUrl()).toBe("http://localhost:3000")
    })

    it("prefers NEXT_PUBLIC_APP_URL over SITE_URL", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://app.example"
      process.env.SITE_URL = "https://site.example"
      expect(getBaseUrl()).toBe("https://app.example")
    })
  })

  describe("getApiUrl", () => {
    it("appends /api to the base url", () => {
      process.env.SITE_URL = "https://site.example"
      expect(getApiUrl()).toBe("https://site.example/api")
    })
  })

  describe("isProduction / isDevelopment", () => {
    it("detects production", () => {
      vi.stubEnv("NODE_ENV", "production")
      expect(isProduction()).toBe(true)
      expect(isDevelopment()).toBe(false)
      vi.unstubAllEnvs()
    })

    it("detects development", () => {
      vi.stubEnv("NODE_ENV", "development")
      expect(isDevelopment()).toBe(true)
      expect(isProduction()).toBe(false)
      vi.unstubAllEnvs()
    })
  })

  describe("getCorsOrigins", () => {
    it("returns the production origin in production", () => {
      vi.stubEnv("NODE_ENV", "production")
      expect(getCorsOrigins()).toEqual(["https://amf.amfserver.duckdns.org"])
      vi.unstubAllEnvs()
    })

    it("returns local origins outside production", () => {
      vi.stubEnv("NODE_ENV", "development")
      expect(getCorsOrigins()).toEqual([
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ])
      vi.unstubAllEnvs()
    })
  })

  describe("buildApiUrl", () => {
    it("normalizes endpoints without a leading slash", () => {
      process.env.SITE_URL = "https://site.example"
      expect(buildApiUrl("contact")).toBe("https://site.example/api/contact")
    })

    it("preserves endpoints that already start with a slash", () => {
      process.env.SITE_URL = "https://site.example"
      expect(buildApiUrl("/contact")).toBe("https://site.example/api/contact")
    })
  })

  describe("buildPageUrl", () => {
    it("normalizes paths without a leading slash", () => {
      process.env.SITE_URL = "https://site.example"
      expect(buildPageUrl("about")).toBe("https://site.example/about")
    })

    it("preserves paths that already start with a slash", () => {
      process.env.SITE_URL = "https://site.example"
      expect(buildPageUrl("/about")).toBe("https://site.example/about")
    })
  })
})
