import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getGithubActivity } from "@/lib/github-activity"

const originalFetch = global.fetch

describe("getGithubActivity", () => {
  beforeEach(() => {
    delete process.env.GITHUB_TOKEN
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it("filters to supported event types and maps fields", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          type: "PushEvent",
          created_at: "2026-01-01T00:00:00Z",
          repo: { name: "adrianmfuentes/SVAES" },
          payload: { commits: [{}, {}] },
        },
        {
          id: "2",
          type: "SomeUnsupportedEvent",
          created_at: "2026-01-01T00:00:00Z",
          repo: { name: "adrianmfuentes/foo" },
          payload: {},
        },
        {
          id: "3",
          type: "WatchEvent",
          created_at: "2026-01-02T00:00:00Z",
          repo: { name: "someone/bar" },
          payload: {},
        },
      ],
    }) as unknown as typeof fetch

    const result = await getGithubActivity()

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      id: "1",
      type: "PushEvent",
      repo: "adrianmfuentes/SVAES",
      repoUrl: "https://github.com/adrianmfuentes/SVAES",
      commitCount: 2,
    })
    expect(result[1]).toMatchObject({ id: "3", type: "WatchEvent" })
  })

  it("returns an empty array when the GitHub API responds with an error status", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch

    const result = await getGithubActivity()

    expect(result).toEqual([])
  })

  it("returns an empty array when the fetch call throws", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch

    const result = await getGithubActivity()

    expect(result).toEqual([])
  })
})
