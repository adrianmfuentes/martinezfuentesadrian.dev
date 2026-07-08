import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { VisitCounter } from "@/components/visit-counter"

describe("VisitCounter", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("renders nothing while loading and nothing if the count is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => ({ count: null }) }))
    const { container } = render(<VisitCounter label="{count} visits since launch" />)

    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/visit-count"))
    expect(container).toBeEmptyDOMElement()
  })

  it("renders the count once loaded, substituted into the label", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => ({ count: 42 }) }))
    render(<VisitCounter label="{count} visits since launch" />)

    expect(await screen.findByText("42 visits since launch")).toBeInTheDocument()
  })

  it("renders nothing if the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))
    const { container } = render(<VisitCounter label="{count} visits since launch" />)

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })
})
