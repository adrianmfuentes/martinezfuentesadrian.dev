// @vitest-environment node
import { describe, it, expect } from "vitest"

import { vi } from "vitest"
vi.mock("server-only", () => ({}))

const { GET } = await import("@/app/[lang]/feed.json/route")

function makeRequest(lang: string) {
  return GET(new Request("https://example.test"), { params: Promise.resolve({ lang }) })
}

describe("app/[lang]/feed.json", () => {
  it("returns a valid JSON Feed 1.1 document with the correct content type", async () => {
    const res = await makeRequest("en")
    expect(res.headers.get("Content-Type")).toContain("application/feed+json")

    const feed = await res.json()
    expect(feed.version).toBe("https://jsonfeed.org/version/1.1")
    expect(feed.feed_url).toBe("https://amf.amfserver.duckdns.org/en/feed.json")
  })

  it("includes an item for each published post, linking to the localized blog URL", async () => {
    const res = await makeRequest("en")
    const feed = await res.json()

    expect(Array.isArray(feed.items)).toBe(true)
    expect(feed.items.length).toBeGreaterThan(0)
    for (const item of feed.items) {
      expect(item.url).toContain("https://amf.amfserver.duckdns.org/en/blog/")
    }
  })

  it("defaults to the Spanish feed for an unrecognized locale", async () => {
    const res = await makeRequest("fr")
    const feed = await res.json()

    expect(feed.language).toBe("es")
  })
})
