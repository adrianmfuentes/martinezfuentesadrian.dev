import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { WebDiscovery } from "@components/web-discovery"

const dictionary = {
  title: "Web Content Discovery",
  description: "Discover hidden paths on a target site",
  urlLabel: "Target URL",
  urlPlaceholder: "https://example.com",
  scanButton: "Start Discovery",
  scanning: "Scanning...",
  resetButton: "New Discovery",
}

describe("WebDiscovery", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("renders the title and description from the dictionary", () => {
    render(<WebDiscovery dictionary={dictionary} />)
    expect(screen.getByText(dictionary.title)).toBeInTheDocument()
    expect(screen.getByText(dictionary.description)).toBeInTheDocument()
  })

  it("shows the empty-URL warning and does not call fetch when starting with a blank URL", () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    render(<WebDiscovery dictionary={dictionary} />)
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    expect(screen.getByText("URL requerida")).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("calls the API with baseUrl and path derived from the entered URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    })
    vi.stubGlobal("fetch", fetchMock)

    render(<WebDiscovery dictionary={dictionary} />)
    fireEvent.change(screen.getByLabelText(dictionary.urlLabel), {
      target: { value: "https://example.com/some/path?x=1" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/web-discovery?baseUrl=${encodeURIComponent("https://example.com")}&path=${encodeURIComponent("/some/path?x=1")}`
      )
    })
  })

  it("prefixes a bare host with https:// when no protocol is given", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    })
    vi.stubGlobal("fetch", fetchMock)

    render(<WebDiscovery dictionary={dictionary} />)
    fireEvent.change(screen.getByLabelText(dictionary.urlLabel), {
      target: { value: "example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/web-discovery?baseUrl=${encodeURIComponent("https://example.com")}&path=${encodeURIComponent("/")}`
      )
    })
  })

  it("shows a scanning/loading state while the request is pending", async () => {
    let resolveFetch: (value: unknown) => void = () => {}
    const pending = new Promise((resolve) => {
      resolveFetch = resolve
    })
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending))

    render(<WebDiscovery dictionary={dictionary} />)
    fireEvent.change(screen.getByLabelText(dictionary.urlLabel), {
      target: { value: "https://example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    expect(await screen.findByText(dictionary.scanning)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: dictionary.scanning })).toBeDisabled()

    resolveFetch({ ok: true, json: async () => ({ results: [] }) })

    await waitFor(
      () => {
        expect(screen.queryByText(dictionary.scanning)).not.toBeInTheDocument()
      },
      { timeout: 2000 }
    )
  })

  it("renders discovered paths converted from full result URLs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            "https://example.com/admin",
            "https://example.com/login?next=/dashboard",
          ],
        }),
      })
    )

    render(<WebDiscovery dictionary={dictionary} />)
    fireEvent.change(screen.getByLabelText(dictionary.urlLabel), {
      target: { value: "https://example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    await waitFor(() => {
      expect(screen.getByText("/admin")).toBeInTheDocument()
      expect(screen.getByText("/login?next=/dashboard")).toBeInTheDocument()
    })

    // links resolve against the discovered baseUrl
    expect(screen.getByText("/admin").closest("a")).toHaveAttribute(
      "href",
      "https://example.com/admin"
    )

    await waitFor(
      () => {
        expect(screen.getByText("¡Escaneo completado exitosamente!")).toBeInTheDocument()
      },
      { timeout: 2000 }
    )
    expect(screen.getByText("Se encontraron 2 resultados")).toBeInTheDocument()
  })

  it("ignores non-URL entries returned by the API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: ["not-a-valid-url", "https://example.com/ok"] }),
      })
    )

    render(<WebDiscovery dictionary={dictionary} />)
    fireEvent.change(screen.getByLabelText(dictionary.urlLabel), {
      target: { value: "https://example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    await waitFor(() => {
      expect(screen.getByText("/ok")).toBeInTheDocument()
    })
    await waitFor(
      () => {
        expect(screen.getByText("Se encontraron 1 resultados")).toBeInTheDocument()
      },
      { timeout: 2000 }
    )
  })

  it("shows an error state when the API responds with a non-ok status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    )

    render(<WebDiscovery dictionary={dictionary} />)
    fireEvent.change(screen.getByLabelText(dictionary.urlLabel), {
      target: { value: "https://example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    await waitFor(() => {
      expect(screen.getByText("Error en el escaneo")).toBeInTheDocument()
      expect(screen.getByText("API responded with 500")).toBeInTheDocument()
    })
  })

  it("shows an error state when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))

    render(<WebDiscovery dictionary={dictionary} />)
    fireEvent.change(screen.getByLabelText(dictionary.urlLabel), {
      target: { value: "https://example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    await waitFor(() => {
      expect(screen.getByText("Error en el escaneo")).toBeInTheDocument()
      expect(screen.getByText("network down")).toBeInTheDocument()
    })
  })

  it("resets the URL, results, and status when the reset button is clicked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: ["https://example.com/admin"] }),
      })
    )

    render(<WebDiscovery dictionary={dictionary} />)
    const urlInput = screen.getByLabelText(dictionary.urlLabel) as HTMLInputElement
    fireEvent.change(urlInput, { target: { value: "https://example.com" } })
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    await waitFor(
      () => {
        expect(screen.getByText("¡Escaneo completado exitosamente!")).toBeInTheDocument()
      },
      { timeout: 2000 }
    )
    expect(screen.getByText("/admin")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: dictionary.resetButton }))

    expect(urlInput.value).toBe("")
    expect(screen.queryByText("/admin")).not.toBeInTheDocument()
  })

  it("falls back to default Spanish copy when no dictionary is provided", () => {
    render(<WebDiscovery />)
    expect(screen.getByText("Web Content Discovery")).toBeInTheDocument()
    expect(screen.getByText("Iniciar Descubrimiento")).toBeInTheDocument()
  })
})
