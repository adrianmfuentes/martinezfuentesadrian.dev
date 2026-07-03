// @vitest-environment jsdom
import { describe, it, expect } from "vitest"
import { getBaseUrl } from "@/lib/env"

describe("getBaseUrl (browser)", () => {
  it("uses window.location.origin when running in the browser", () => {
    expect(getBaseUrl()).toBe(globalThis.location.origin)
  })
})
