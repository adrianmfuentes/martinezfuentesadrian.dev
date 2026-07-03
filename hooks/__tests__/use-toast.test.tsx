import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useToast, toast } from "@/hooks/use-toast"

describe("useToast / toast", () => {
  beforeEach(() => {
    // Drain any toasts left over from a previous test via the public API.
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.dismiss()
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("adds a toast to state when toast() is called", () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      toast({ title: "Hello" })
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe("Hello")
    expect(result.current.toasts[0].open).toBe(true)
  })

  it("respects the toast limit when adding more toasts than allowed", () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      toast({ title: "First" })
      toast({ title: "Second" })
      toast({ title: "Third" })
    })

    // TOAST_LIMIT is 1, so only the most recently added toast is kept.
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe("Third")
  })

  it("marks a toast as closed (open: false) when dismissed by id", () => {
    const { result } = renderHook(() => useToast())

    let created: ReturnType<typeof toast>
    act(() => {
      created = toast({ title: "Dismiss me" })
    })

    act(() => {
      result.current.dismiss(created.id)
    })

    expect(result.current.toasts[0].open).toBe(false)
  })

  it("updates a toast's fields via the update() function returned by toast()", () => {
    const { result } = renderHook(() => useToast())

    let created: ReturnType<typeof toast>
    act(() => {
      created = toast({ title: "Original" })
    })

    act(() => {
      created.update({ id: created.id, title: "Updated", open: true } as never)
    })

    expect(result.current.toasts[0].title).toBe("Updated")
  })

  it("removes the toast from state after the removal delay elapses", () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useToast())

    let created: ReturnType<typeof toast>
    act(() => {
      created = toast({ title: "Temporary" })
    })
    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      result.current.dismiss(created.id)
    })
    expect(result.current.toasts[0].open).toBe(false)

    act(() => {
      vi.runAllTimers()
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it("dismisses all toasts when dismiss() is called without an id", () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      toast({ title: "Only one due to TOAST_LIMIT" })
    })

    act(() => {
      result.current.dismiss()
    })

    expect(result.current.toasts.every((t) => t.open === false)).toBe(true)
  })
})
