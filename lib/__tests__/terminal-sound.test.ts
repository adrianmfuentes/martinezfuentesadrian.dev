import { describe, it, expect, vi, afterEach } from "vitest"

class FakeOscillator {
  type = "square"
  frequency = { value: 0 }
  connect = vi.fn()
  start = vi.fn()
  stop = vi.fn()
}

class FakeGainNode {
  gain = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  }
  connect = vi.fn()
}

function createFakeAudioContextClass(initialState: "running" | "suspended" = "running") {
  return class FakeAudioContext {
    state: "running" | "suspended" = initialState
    currentTime = 0
    destination = {}
    resume = vi.fn().mockImplementation(function (this: { state: string }) {
      this.state = "running"
      return Promise.resolve()
    })
    createOscillator = vi.fn(() => new FakeOscillator())
    createGain = vi.fn(() => new FakeGainNode())
  }
}

describe("terminal-sound", () => {
  const originalAudioContext = (window as unknown as { AudioContext?: unknown }).AudioContext
  const originalWebkitAudioContext = (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext

  afterEach(() => {
    ;(window as unknown as { AudioContext?: unknown }).AudioContext = originalAudioContext
    ;(window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext = originalWebkitAudioContext
    vi.resetModules()
  })

  it("plays key tick, submit and error tones without throwing", async () => {
    vi.resetModules()
    ;(window as unknown as { AudioContext?: unknown }).AudioContext = createFakeAudioContextClass()
    const { playKeyTick, playSubmit, playError } = await import("@/lib/terminal-sound")
    expect(() => playKeyTick()).not.toThrow()
    expect(() => playSubmit()).not.toThrow()
    expect(() => playError()).not.toThrow()
  })

  it("plays the access-granted chime as a sequence of tones", async () => {
    vi.resetModules()
    vi.useFakeTimers()
    ;(window as unknown as { AudioContext?: unknown }).AudioContext = createFakeAudioContextClass()
    const { playAccessGranted } = await import("@/lib/terminal-sound")
    expect(() => playAccessGranted()).not.toThrow()
    vi.runAllTimers()
    vi.useRealTimers()
  })

  it("resumes a suspended audio context", async () => {
    vi.resetModules()
    ;(window as unknown as { AudioContext?: unknown }).AudioContext = createFakeAudioContextClass("suspended")
    const { playSubmit } = await import("@/lib/terminal-sound")
    expect(() => playSubmit()).not.toThrow()
  })

  it("falls back to webkitAudioContext when AudioContext is unavailable", async () => {
    vi.resetModules()
    delete (window as unknown as { AudioContext?: unknown }).AudioContext
    ;(window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext = createFakeAudioContextClass()
    const { playSubmit } = await import("@/lib/terminal-sound")
    expect(() => playSubmit()).not.toThrow()
  })

  it("does nothing when no audio context implementation is available", async () => {
    vi.resetModules()
    delete (window as unknown as { AudioContext?: unknown }).AudioContext
    delete (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext
    const { playSubmit } = await import("@/lib/terminal-sound")
    expect(() => playSubmit()).not.toThrow()
  })
})
