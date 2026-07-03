import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import HttpHeadersValidator from "@components/http-headers-validator"

const dictionary = {
  title: "HTTP Headers Validator",
  description: "Validate the security headers of a website",
  urlLabel: "URL",
  urlPlaceholder: "https://example.com",
  validateButton: "Validate",
  validating: "Validating...",
  results: {
    title: "Validation results",
    url: "URL",
    status: "Header status",
    secure: "Secure",
    insecure: "Insecure",
    missing: "Missing",
    present: "Present",
  },
  headers: {
    CORS: "CORS",
    CSP: "Content Security Policy",
    HSTS: "Strict Transport Security",
    "X-Frame-Options": "X-Frame-Options",
    "X-Content-Type-Options": "X-Content-Type-Options",
    "Referrer-Policy": "Referrer-Policy",
    "Permissions-Policy": "Permissions-Policy",
  },
  descriptions: {
    CORS: "Controls which origins can access the resource",
    CSP: "Mitigates XSS and injection attacks",
    HSTS: "Forces HTTPS connections",
    "X-Frame-Options": "Prevents clickjacking",
    "X-Content-Type-Options": "Prevents MIME sniffing",
    "Referrer-Policy": "Controls referrer information",
    "Permissions-Policy": "Controls browser feature access",
  },
  errors: {
    invalidUrl: "Please enter a valid URL",
    networkError: "Network error, please try again",
  },
  resetButton: "Reset",
}

function fillUrl(url: string) {
  fireEvent.change(screen.getByPlaceholderText(dictionary.urlPlaceholder), {
    target: { value: url },
  })
}

describe("HttpHeadersValidator", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("renders the title/description and disables the validate button when the URL is empty", () => {
    render(<HttpHeadersValidator dictionary={dictionary} />)
    expect(screen.getAllByText(dictionary.title)[0]).toBeInTheDocument()
    expect(screen.getAllByText(dictionary.description)[0]).toBeInTheDocument()
    expect(screen.getByRole("button", { name: dictionary.validateButton })).toBeDisabled()
  })

  it("shows an invalid URL error and does not call fetch for a malformed URL", () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    render(<HttpHeadersValidator dictionary={dictionary} />)
    fillUrl("not-a-url")
    fireEvent.click(screen.getByRole("button", { name: dictionary.validateButton }))

    expect(screen.getByText(dictionary.errors.invalidUrl)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("shows an invalid URL error for a non-http(s) protocol", () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    render(<HttpHeadersValidator dictionary={dictionary} />)
    fillUrl("ftp://example.com")
    fireEvent.click(screen.getByRole("button", { name: dictionary.validateButton }))

    expect(screen.getByText(dictionary.errors.invalidUrl)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("calls the validate-headers API with the expected URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, headers: {} }),
    })
    vi.stubGlobal("fetch", fetchMock)

    render(<HttpHeadersValidator dictionary={dictionary} />)
    fillUrl("https://example.com")
    fireEvent.click(screen.getByRole("button", { name: dictionary.validateButton }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/validate-headers?url=${encodeURIComponent("https://example.com")}`
      )
    })
  })

  it("shows a loading state while the request is pending", async () => {
    let resolveFetch: (value: unknown) => void = () => {}
    const pending = new Promise((resolve) => {
      resolveFetch = resolve
    })
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending))

    render(<HttpHeadersValidator dictionary={dictionary} />)
    fillUrl("https://example.com")
    fireEvent.click(screen.getByRole("button", { name: dictionary.validateButton }))

    expect(await screen.findByText(dictionary.validating)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: dictionary.validating })).toBeDisabled()

    resolveFetch({ ok: true, json: async () => ({ success: true, headers: {} }) })

    await waitFor(() => {
      expect(screen.getByText(dictionary.validateButton)).toBeInTheDocument()
    })
  })

  it("renders secure/insecure/present/missing headers with correct summary counts", async () => {
    const headers = {
      "Access-Control-Allow-Origin": "*", // CORS -> insecure
      "Content-Security-Policy": "default-src 'self'", // CSP -> present (no secure fn)
      "Strict-Transport-Security": "max-age=31536000", // HSTS -> secure
      "X-Content-Type-Options": "nosniff", // secure
      "Referrer-Policy": "unsafe-url", // insecure
      // X-Frame-Options and Permissions-Policy intentionally missing
    }
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, headers }),
      })
    )

    render(<HttpHeadersValidator dictionary={dictionary} />)
    fillUrl("https://example.com")
    fireEvent.click(screen.getByRole("button", { name: dictionary.validateButton }))

    await screen.findByText(dictionary.results.title)

    // total=7, present=5 (all but the 2 missing), secure=2, insecure=2, missing=2
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(2) // secure & insecure counts
    expect(screen.getByText("5")).toBeInTheDocument() // present count

    expect(screen.getAllByText(dictionary.results.secure).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(dictionary.results.insecure).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(dictionary.results.missing).length).toBeGreaterThanOrEqual(1)

    expect(screen.getByText("nosniff")).toBeInTheDocument()
    expect(screen.getByText("max-age=31536000")).toBeInTheDocument()
  })

  it("renders a Content-Security-Policy-Report-Only header with the (Report-Only) suffix", async () => {
    const headers = {
      "Content-Security-Policy-Report-Only": "default-src 'self'",
    }
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, headers }),
      })
    )

    render(<HttpHeadersValidator dictionary={dictionary} />)
    fillUrl("https://example.com")
    fireEvent.click(screen.getByRole("button", { name: dictionary.validateButton }))

    await screen.findByText(dictionary.results.title)

    expect(screen.getByText("default-src 'self' (Report-Only)")).toBeInTheDocument()
  })

  it("shows an error state when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    )

    render(<HttpHeadersValidator dictionary={dictionary} />)
    fillUrl("https://example.com")
    fireEvent.click(screen.getByRole("button", { name: dictionary.validateButton }))

    await waitFor(() => {
      expect(
        screen.getByText("No se pudieron obtener las cabeceras del sitio web")
      ).toBeInTheDocument()
    })
  })

  it("shows an error state when the API responds with success: false", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, error: "boom" }),
      })
    )

    render(<HttpHeadersValidator dictionary={dictionary} />)
    fillUrl("https://example.com")
    fireEvent.click(screen.getByRole("button", { name: dictionary.validateButton }))

    await waitFor(() => {
      expect(
        screen.getByText("No se pudieron obtener las cabeceras del sitio web")
      ).toBeInTheDocument()
    })
  })

  it("shows an error state when the fetch call rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))

    render(<HttpHeadersValidator dictionary={dictionary} />)
    fillUrl("https://example.com")
    fireEvent.click(screen.getByRole("button", { name: dictionary.validateButton }))

    await waitFor(() => {
      expect(
        screen.getByText("No se pudieron obtener las cabeceras del sitio web")
      ).toBeInTheDocument()
    })
  })

  it("resets the form after a completed validation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, headers: {} }),
      })
    )

    render(<HttpHeadersValidator dictionary={dictionary} />)
    fillUrl("https://example.com")
    fireEvent.click(screen.getByRole("button", { name: dictionary.validateButton }))

    await screen.findByText(dictionary.results.title)
    fireEvent.click(screen.getByRole("button", { name: dictionary.resetButton }))

    expect(screen.queryByText(dictionary.results.title)).not.toBeInTheDocument()
    expect(
      (screen.getByPlaceholderText(dictionary.urlPlaceholder) as HTMLInputElement).value
    ).toBe("")
  })
})
