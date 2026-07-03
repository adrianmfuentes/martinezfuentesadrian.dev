import { describe, it, expect, vi, afterEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useIsMobile } from "@/hooks/use-mobile"

function setViewport(width: number, matches: boolean) {
  Object.defineProperty(globalThis, "innerWidth", { writable: true, configurable: true, value: width })
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  )
}

describe("useIsMobile", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns true when the viewport is narrower than the mobile breakpoint", () => {
    setViewport(500, true)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it("returns false when the viewport is at or above the mobile breakpoint", () => {
    setViewport(1024, false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it("returns false right at the breakpoint boundary (768px)", () => {
    setViewport(768, false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it("returns true just below the breakpoint boundary (767px)", () => {
    setViewport(767, true)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })
})
