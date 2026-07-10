import { describe, it, expect, vi, afterEach } from "vitest"
import { getProjectStatuses } from "@/lib/project-status"

const originalFetch = global.fetch

describe("getProjectStatuses", () => {
  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it("returns online for a URL that resolves with an ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch

    const result = await getProjectStatuses(["https://a.example.com"])

    expect(result).toEqual({ "https://a.example.com": "online" })
  })

  it("returns offline for a URL that resolves with a non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch

    const result = await getProjectStatuses(["https://a.example.com"])

    expect(result).toEqual({ "https://a.example.com": "offline" })
  })

  it("returns offline when fetch rejects", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch

    const result = await getProjectStatuses(["https://a.example.com"])

    expect(result).toEqual({ "https://a.example.com": "offline" })
  })

  it("dedupes duplicate URLs and drops falsy entries, calling fetch only once", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch
    global.fetch = fetchMock

    const result = await getProjectStatuses(["https://a.example.com", "https://a.example.com", ""])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ "https://a.example.com": "online" })
  })

  it("checks multiple URLs independently", async () => {
    global.fetch = vi
      .fn()
      .mockImplementation(async (url: string) => ({ ok: url.includes("up") })) as unknown as typeof fetch

    const result = await getProjectStatuses(["https://up.example.com", "https://down.example.com"])

    expect(result).toEqual({
      "https://up.example.com": "online",
      "https://down.example.com": "offline",
    })
  })

  it("aborts and reports offline when the request exceeds the timeout", async () => {
    vi.useFakeTimers()
    global.fetch = vi.fn().mockImplementation((_url: string, options: RequestInit) => {
      return new Promise((_resolve, reject) => {
        options.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))
      })
    }) as unknown as typeof fetch

    const promise = getProjectStatuses(["https://slow.example.com"])
    await vi.advanceTimersByTimeAsync(4000)
    const result = await promise

    expect(result).toEqual({ "https://slow.example.com": "offline" })
  })
})
