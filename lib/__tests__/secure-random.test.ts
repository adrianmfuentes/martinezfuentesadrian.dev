import { describe, it, expect } from "vitest"
import { secureRandom } from "@/lib/secure-random"

describe("secureRandom", () => {
  it("returns a number between 0 (inclusive) and 1 (exclusive)", () => {
    for (let i = 0; i < 20; i++) {
      const value = secureRandom()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it("produces varying values across calls", () => {
    const values = new Set(Array.from({ length: 10 }, () => secureRandom()))
    expect(values.size).toBeGreaterThan(1)
  })
})
