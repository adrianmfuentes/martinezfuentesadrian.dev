// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest"
import { GET } from "@/app/api/github-stats/route"

describe("GET /api/github-stats", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it("returns repos and commits from the GitHub API", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ json: async () => ({ public_repos: 42 }) })
      .mockResolvedValueOnce({ json: async () => ({ total_count: 1234 }) })
    vi.stubGlobal("fetch", fetchMock)

    const response = await GET()
    const body = await response.json()

    expect(body).toEqual({ repos: 42, commits: 1234 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("falls back to zeros when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))

    const response = await GET()
    const body = await response.json()

    expect(body).toEqual({ repos: 0, commits: 0 })
  })
})
