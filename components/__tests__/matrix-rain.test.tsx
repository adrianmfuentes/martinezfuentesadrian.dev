import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render } from "@testing-library/react"
import { MatrixRain } from "@/components/matrix-rain"

let mockRandomValue = 0.5
vi.mock("@/lib/secure-random", () => ({
  secureRandom: () => mockRandomValue,
}))

function createFakeContext() {
  return {
    fillStyle: "",
    font: "",
    fillRect: vi.fn(),
    fillText: vi.fn(),
  }
}

describe("MatrixRain", () => {
  let rafCallbacks: FrameRequestCallback[]
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext
  let cancelSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockRandomValue = 0.5
    rafCallbacks = []
    let nextId = 1
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((cb: FrameRequestCallback) => {
        rafCallbacks.push(cb)
        return nextId++
      })
    )
    cancelSpy = vi.fn()
    vi.stubGlobal("cancelAnimationFrame", cancelSpy)
    originalGetContext = HTMLCanvasElement.prototype.getContext
     
    HTMLCanvasElement.prototype.getContext = vi.fn(() => createFakeContext()) as any
  })

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext
    vi.unstubAllGlobals()
  })

  function flushFrames(count: number) {
    for (let i = 0; i < count; i++) {
      const cb = rafCallbacks.shift()
      cb?.(0)
    }
  }

  it("renders a hidden, non-focusable decorative canvas", () => {
    const { container } = render(<MatrixRain />)
    const canvas = container.querySelector("canvas")
    expect(canvas).toBeTruthy()
    expect(canvas).toHaveAttribute("aria-hidden", "true")
    expect(canvas).toHaveAttribute("tabindex", "-1")
  })

  it("does nothing when the canvas context is unavailable", () => {
     
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as any
    expect(() => render(<MatrixRain />)).not.toThrow()
    expect(rafCallbacks).toHaveLength(0)
  })

  it("skips the animation loop when the user prefers reduced motion", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    )
    render(<MatrixRain />)
    expect(rafCallbacks).toHaveLength(0)
  })

  it("draws frames and reschedules itself", () => {
    render(<MatrixRain />)
    expect(rafCallbacks).toHaveLength(1)
    flushFrames(2)
    expect(rafCallbacks).toHaveLength(1)
  })

  it("draws every frame and resets a drop past the bottom in intense mode", () => {
    mockRandomValue = 0.99
    render(<MatrixRain intense />)
    flushFrames(60)
    expect(rafCallbacks).toHaveLength(1)
  })

  it("recalculates columns and drops on window resize", () => {
    render(<MatrixRain />)
    expect(() => window.dispatchEvent(new Event("resize"))).not.toThrow()
  })

  it("cleans up listeners and cancels the animation frame on unmount", () => {
    const { unmount } = render(<MatrixRain />)
    unmount()
    expect(cancelSpy).toHaveBeenCalled()
  })
})
