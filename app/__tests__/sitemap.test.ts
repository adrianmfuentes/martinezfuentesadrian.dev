// @vitest-environment node
import { describe, it, expect } from "vitest"
import sitemap from "@/app/sitemap"

describe("app/sitemap", () => {
  it("returns 22 entries (12 pages + 10 tool routes across es/en)", () => {
    const routes = sitemap()
    expect(routes).toHaveLength(22)
  })

  it("includes the expected root and localized page URLs", () => {
    const routes = sitemap()
    const urls = routes.map((r) => r.url)

    expect(urls).toContain("https://amf.amfserver.duckdns.org/es")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/en")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/es/about")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/en/about")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/es/cv")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/en/cv")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/es/portfolio")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/en/portfolio")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/es/contact")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/en/contact")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/es/tools")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/en/tools")
  })

  it("includes the expected tool routes for both locales", () => {
    const routes = sitemap()
    const urls = routes.map((r) => r.url)

    expect(urls).toContain("https://amf.amfserver.duckdns.org/es/tools/password-checker")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/en/tools/password-checker")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/es/tools/port-scanner")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/en/tools/port-scanner")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/es/tools/http-headers-validator")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/en/tools/http-headers-validator")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/es/tools/password-generator")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/en/tools/password-generator")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/es/tools/certificates-checker")
    expect(urls).toContain("https://amf.amfserver.duckdns.org/en/tools/certificates-checker")
  })

  it("gives every entry a valid priority between 0 and 1 and a defined lastModified", () => {
    const routes = sitemap()

    for (const route of routes) {
      expect(route.priority).toBeGreaterThanOrEqual(0)
      expect(route.priority).toBeLessThanOrEqual(1)
      expect(route.lastModified).toBeDefined()
      expect(route.lastModified).toBeInstanceOf(Date)
      expect(route.changeFrequency).toBeTruthy()
    }
  })

  it("has no duplicate URLs", () => {
    const routes = sitemap()
    const urls = routes.map((r) => r.url)
    expect(new Set(urls).size).toBe(urls.length)
  })
})
