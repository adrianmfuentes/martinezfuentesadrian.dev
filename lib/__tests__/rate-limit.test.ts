import { describe, it, expect, vi, afterEach } from "vitest"
import { rateLimit } from "@/lib/rate-limit"

describe("rateLimit", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("allows requests under the limit", async () => {
    const limiter = rateLimit({ interval: 1000, limit: 5, uniqueTokenPerInterval: 10 })
    await expect(limiter.check(3, "token-a")).resolves.toBeUndefined()
    await expect(limiter.check(3, "token-a")).resolves.toBeUndefined()
  })

  it("rejects once the token exceeds maxTokens", async () => {
    const limiter = rateLimit({ interval: 1000, limit: 5, uniqueTokenPerInterval: 10 })
    await limiter.check(2, "token-b")
    await limiter.check(2, "token-b")
    await expect(limiter.check(2, "token-b")).rejects.toThrow("Rate limit exceeded")
  })

  it("tracks separate tokens independently", async () => {
    const limiter = rateLimit({ interval: 1000, limit: 5, uniqueTokenPerInterval: 10 })
    await limiter.check(1, "token-c")
    await expect(limiter.check(1, "token-c")).rejects.toThrow("Rate limit exceeded")
    await expect(limiter.check(1, "token-d")).resolves.toBeUndefined()
  })

  it("resets the count once the interval elapses", async () => {
    vi.useFakeTimers()
    const limiter = rateLimit({ interval: 1000, limit: 5, uniqueTokenPerInterval: 10 })
    await limiter.check(1, "token-e")
    await expect(limiter.check(1, "token-e")).rejects.toThrow("Rate limit exceeded")

    vi.advanceTimersByTime(1001)

    await expect(limiter.check(1, "token-e")).resolves.toBeUndefined()
  })

  it("evicts the oldest token once uniqueTokenPerInterval is exceeded", async () => {
    const limiter = rateLimit({ interval: 1000, limit: 5, uniqueTokenPerInterval: 2 })
    await limiter.check(5, "first")
    await limiter.check(5, "second")
    await limiter.check(5, "third")

    // "first" should have been evicted, freeing up its quota entirely again
    await expect(limiter.check(5, "first")).resolves.toBeUndefined()
  })
})
