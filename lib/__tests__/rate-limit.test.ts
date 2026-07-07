import { describe, it, expect, vi, afterEach } from "vitest"
import { rateLimit } from "@/lib/rate-limit"

describe("rateLimit", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("allows requests under the limit", async () => {
    const limiter = rateLimit({ interval: 1000, limit: 5, uniqueTokenPerInterval: 10 })
    await expect(limiter.check("token-a", 3)).resolves.toBeUndefined()
    await expect(limiter.check("token-a", 3)).resolves.toBeUndefined()
  })

  it("rejects once the token exceeds maxTokens", async () => {
    const limiter = rateLimit({ interval: 1000, limit: 5, uniqueTokenPerInterval: 10 })
    await limiter.check("token-b", 2)
    await limiter.check("token-b", 2)
    await expect(limiter.check("token-b", 2)).rejects.toThrow("Rate limit exceeded")
  })

  it("tracks separate tokens independently", async () => {
    const limiter = rateLimit({ interval: 1000, limit: 5, uniqueTokenPerInterval: 10 })
    await limiter.check("token-c", 1)
    await expect(limiter.check("token-c", 1)).rejects.toThrow("Rate limit exceeded")
    await expect(limiter.check("token-d", 1)).resolves.toBeUndefined()
  })

  it("resets the count once the interval elapses", async () => {
    vi.useFakeTimers()
    const limiter = rateLimit({ interval: 1000, limit: 5, uniqueTokenPerInterval: 10 })
    await limiter.check("token-e", 1)
    await expect(limiter.check("token-e", 1)).rejects.toThrow("Rate limit exceeded")

    vi.advanceTimersByTime(1001)

    await expect(limiter.check("token-e", 1)).resolves.toBeUndefined()
  })

  it("evicts the oldest token once uniqueTokenPerInterval is exceeded", async () => {
    const limiter = rateLimit({ interval: 1000, limit: 5, uniqueTokenPerInterval: 2 })
    await limiter.check("first", 5)
    await limiter.check("second", 5)
    await limiter.check("third", 5)

    // "first" should have been evicted, freeing up its quota entirely again
    await expect(limiter.check("first", 5)).resolves.toBeUndefined()
  })

  it("uses the configured limit as the default cap when maxTokens is omitted", async () => {
    const limiter = rateLimit({ interval: 1000, limit: 2, uniqueTokenPerInterval: 10 })
    await limiter.check("token-f")
    await limiter.check("token-f")
    await expect(limiter.check("token-f")).rejects.toThrow("Rate limit exceeded")
  })
})
