import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

afterEach(() => {
  cleanup()
})

if (typeof globalThis.matchMedia !== "function") {
  globalThis.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

if (typeof globalThis.ResizeObserver !== "function") {
  globalThis.ResizeObserver = class {
    observe() {
      // no-op: jsdom has no layout engine to observe
    }
    unobserve() {
      // no-op: jsdom has no layout engine to observe
    }
    disconnect() {
      // no-op: jsdom has no layout engine to observe
    }
  }
}

if (typeof globalThis.IntersectionObserver !== "function") {
  // @ts-expect-error minimal test stub
  globalThis.IntersectionObserver = class {
    observe() {
      // no-op: jsdom has no layout engine to observe
    }
    unobserve() {
      // no-op: jsdom has no layout engine to observe
    }
    disconnect() {
      // no-op: jsdom has no layout engine to observe
    }
  }
}

if (typeof globalThis.scrollTo !== "function") {
  globalThis.scrollTo = vi.fn()
}
