import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { usePdfViewerLogic } from "@/app/actions/pdfViewerLogic"

describe("usePdfViewerLogic", () => {
  it("initializes with default page, scale and no numPages", () => {
    const { result } = renderHook(() => usePdfViewerLogic())

    expect(result.current.pageNumber).toBe(1)
    expect(result.current.scale).toBe(0.8)
    expect(result.current.numPages).toBeNull()
  })

  it("sets numPages and resets pageNumber to 1 on document load success", () => {
    const { result } = renderHook(() => usePdfViewerLogic())

    act(() => {
      result.current.onDocumentLoadSuccess({ numPages: 5 })
    })

    expect(result.current.numPages).toBe(5)
    expect(result.current.pageNumber).toBe(1)
  })

  it("goToNextPage advances the page number up to numPages", () => {
    const { result } = renderHook(() => usePdfViewerLogic())

    act(() => {
      result.current.onDocumentLoadSuccess({ numPages: 3 })
    })

    act(() => {
      result.current.goToNextPage()
    })
    expect(result.current.pageNumber).toBe(2)

    act(() => {
      result.current.goToNextPage()
    })
    expect(result.current.pageNumber).toBe(3)
  })

  it("goToNextPage does not exceed numPages", () => {
    const { result } = renderHook(() => usePdfViewerLogic())

    act(() => {
      result.current.onDocumentLoadSuccess({ numPages: 2 })
    })

    act(() => {
      result.current.goToNextPage()
      result.current.goToNextPage()
      result.current.goToNextPage()
      result.current.goToNextPage()
    })

    expect(result.current.pageNumber).toBe(2)
  })

  it("goToPrevPage does not go below 1", () => {
    const { result } = renderHook(() => usePdfViewerLogic())

    act(() => {
      result.current.goToPrevPage()
      result.current.goToPrevPage()
    })

    expect(result.current.pageNumber).toBe(1)
  })

  it("goToPrevPage decrements the page number", () => {
    const { result } = renderHook(() => usePdfViewerLogic())

    act(() => {
      result.current.onDocumentLoadSuccess({ numPages: 5 })
    })
    act(() => {
      result.current.goToNextPage()
      result.current.goToNextPage()
      result.current.goToNextPage()
    })
    expect(result.current.pageNumber).toBe(4)

    act(() => {
      result.current.goToPrevPage()
    })
    expect(result.current.pageNumber).toBe(3)
  })

  it("zoomIn increases scale in steps of 0.2 up to a maximum of 3", () => {
    const { result } = renderHook(() => usePdfViewerLogic())

    act(() => {
      result.current.zoomIn()
    })
    expect(result.current.scale).toBeCloseTo(1)

    act(() => {
      for (let i = 0; i < 20; i++) {
        result.current.zoomIn()
      }
    })
    expect(result.current.scale).toBe(3)
  })

  it("zoomOut decreases scale in steps of 0.2 down to a minimum of 0.3", () => {
    const { result } = renderHook(() => usePdfViewerLogic())

    act(() => {
      result.current.zoomOut()
    })
    expect(result.current.scale).toBeCloseTo(0.6)

    act(() => {
      for (let i = 0; i < 20; i++) {
        result.current.zoomOut()
      }
    })
    expect(result.current.scale).toBe(0.3)
  })
})
