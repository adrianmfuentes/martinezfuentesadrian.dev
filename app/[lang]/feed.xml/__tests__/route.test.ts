// @vitest-environment node
import { describe, it, expect } from "vitest"

// blog.ts pulls in "server-only", which throws when resolved outside the
// "react-server" export condition. Vitest doesn't set that condition, so we
// stub the marker package to a no-op (same pattern as sitemap.test.ts).
import { vi } from "vitest"
vi.mock("server-only", () => ({}))

const { GET } = await import("@/app/[lang]/feed.xml/route")

function makeRequest(lang: string) {
  return GET(new Request("https://example.test"), { params: Promise.resolve({ lang }) })
}

describe("app/[lang]/feed.xml", () => {
  it("returns a valid RSS 2.0 document with the correct content type", async () => {
    const res = await makeRequest("en")
    expect(res.headers.get("Content-Type")).toContain("application/rss+xml")

    const xml = await res.text()
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain("<rss version=\"2.0\"")
    expect(xml).toContain("<channel>")
  })

  it("includes an item for each published post, linking to the localized blog URL", async () => {
    const res = await makeRequest("en")
    const xml = await res.text()

    expect(xml).toContain("https://amf.amfserver.duckdns.org/en/blog/")
    expect((xml.match(/<item>/g) ?? []).length).toBeGreaterThan(0)
  })

  it("escapes XML-sensitive characters so the feed stays well-formed", async () => {
    const res = await makeRequest("es")
    const xml = await res.text()

    // Every literal `&` in a well-formed XML document must start a valid entity reference.
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/)
  })

  it("defaults to the Spanish feed for an unrecognized locale", async () => {
    const res = await makeRequest("fr")
    const xml = await res.text()

    expect(xml).toContain("<language>es</language>")
  })
})
