import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { CertificatesChecker } from "@components/certificates-checker"

const dictionary = {
  title: "SSL Certificate Checker",
  description: "Check SSL certificates for any host",
  hostLabel: "Host",
  hostPlaceholder: "example.com",
  portLabel: "Port",
  portPlaceholder: "443",
  portHelp: "Enter the port number",
  checkButton: "Check Certificate",
  checking: "Checking...",
  results: {
    title: "Certificate Results",
    host: "Host",
    resolvedIp: "Resolved IP",
    subject: "Subject",
    issuer: "Issuer",
    validFrom: "Valid From",
    validUntil: "Valid Until",
    algorithm: "Algorithm",
    isCA: "Is CA",
    daysLeft: "Days Left",
    status: "Status",
    sans: "Subject Alternative Names",
  },
  status: {
    valid: "Valid",
    expired: "Expired",
    expiringSoon: "Expiring Soon",
  },
  errors: {
    invalidHost: "Invalid host",
    invalidPort: "Invalid port",
    connectionError: "Connection error",
    certificateError: "Certificate check failed",
  },
  resetButton: "Reset",
}

const validCertificate = {
  subject: "CN=example.com",
  issuer: "CN=Example CA",
  notBefore: "2025-01-01T00:00:00.000Z",
  notAfter: "2026-01-01T00:00:00.000Z",
  algorithm: "RSA-SHA256",
  isCA: false,
  daysLeft: 120,
  isExpired: false,
  sans: ["example.com", "www.example.com"],
  hostIp: "93.184.216.34", // NOSONAR test fixture IP, not a real host
}

describe("CertificatesChecker", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("renders the title and description", () => {
    render(<CertificatesChecker dictionary={dictionary} />)
    expect(screen.getByText(dictionary.title)).toBeInTheDocument()
    expect(screen.getByText(dictionary.description)).toBeInTheDocument()
  })

  it("disables the check button until a host is entered", () => {
    render(<CertificatesChecker dictionary={dictionary} />)
    expect(screen.getByRole("button", { name: dictionary.checkButton })).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText(dictionary.hostPlaceholder), {
      target: { value: "example.com" },
    })
    expect(screen.getByRole("button", { name: dictionary.checkButton })).not.toBeDisabled()
  })

  it("shows an invalid host error and does not call fetch for a malformed host", () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    render(<CertificatesChecker dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.hostPlaceholder), {
      target: { value: "not a valid host!!" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.checkButton }))

    expect(screen.getByText(dictionary.errors.invalidHost)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("shows an invalid port error and does not call fetch for an out-of-range port", () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    render(<CertificatesChecker dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.hostPlaceholder), {
      target: { value: "example.com" },
    })
    fireEvent.change(screen.getByPlaceholderText(dictionary.portPlaceholder), {
      target: { value: "99999999" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.checkButton }))

    expect(screen.getByText(dictionary.errors.invalidPort)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("sets the port field when a common SSL port shortcut is clicked", () => {
    render(<CertificatesChecker dictionary={dictionary} />)
    fireEvent.click(screen.getByRole("button", { name: "993" }))
    expect(screen.getByPlaceholderText(dictionary.portPlaceholder)).toHaveValue(993)
  })

  it("calls the API with the expected shape, shows a loading state, then renders the result", async () => {
    let resolveFetch: (value: unknown) => void = () => {}
    const pending = new Promise((resolve) => {
      resolveFetch = resolve
    })
    const fetchMock = vi.fn().mockReturnValue(pending)
    vi.stubGlobal("fetch", fetchMock)

    render(<CertificatesChecker dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.hostPlaceholder), {
      target: { value: "example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.checkButton }))

    expect(await screen.findByText(dictionary.checking)).toBeInTheDocument()

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/certificate-check",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host: "example.com", port: 443 }),
      })
    )

    resolveFetch({
      ok: true,
      json: async () => ({ success: true, certificate: validCertificate }),
    })

    await screen.findByText(dictionary.results.title)

    expect(screen.getByText("example.com:443")).toBeInTheDocument()
    expect(screen.getByText(validCertificate.hostIp)).toBeInTheDocument()
    expect(screen.getByText(validCertificate.subject)).toBeInTheDocument()
    expect(screen.getByText(validCertificate.issuer)).toBeInTheDocument()
    expect(screen.getByText(validCertificate.notBefore)).toBeInTheDocument()
    expect(screen.getByText(validCertificate.notAfter)).toBeInTheDocument()
    expect(screen.getByText("120 días")).toBeInTheDocument()
    expect(screen.getAllByText(dictionary.status.valid)[0]).toBeInTheDocument()
    expect(screen.getByText("example.com")).toBeInTheDocument()
    expect(screen.getByText("www.example.com")).toBeInTheDocument()
  })

  it("shows the expired status badge and the expired message when the certificate is expired", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          certificate: { ...validCertificate, isExpired: true, daysLeft: -5 },
        }),
      })
    )

    render(<CertificatesChecker dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.hostPlaceholder), {
      target: { value: "example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.checkButton }))

    await screen.findByText(dictionary.results.title)

    expect(screen.getByText(dictionary.status.expired)).toBeInTheDocument()
    expect(screen.getByText("¡Certificado vencido!")).toBeInTheDocument()
  })

  it("shows the expiring-soon status badge when daysLeft is 30 or fewer", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          certificate: { ...validCertificate, isExpired: false, daysLeft: 10 },
        }),
      })
    )

    render(<CertificatesChecker dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.hostPlaceholder), {
      target: { value: "example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.checkButton }))

    await screen.findByText(dictionary.results.title)

    expect(screen.getByText(dictionary.status.expiringSoon)).toBeInTheDocument()
  })

  it("shows the generic certificate error when the API responds with success: false", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, error: "host unreachable" }),
      })
    )

    render(<CertificatesChecker dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.hostPlaceholder), {
      target: { value: "example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.checkButton }))

    await waitFor(() => {
      expect(screen.getByText(dictionary.errors.certificateError)).toBeInTheDocument()
    })
    expect(screen.queryByText(dictionary.results.title)).not.toBeInTheDocument()
  })

  it("shows the generic certificate error when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))

    render(<CertificatesChecker dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.hostPlaceholder), {
      target: { value: "example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.checkButton }))

    await waitFor(() => {
      expect(screen.getByText(dictionary.errors.certificateError)).toBeInTheDocument()
    })
  })

  it("resets the host, port, and result when the reset button is clicked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, certificate: validCertificate }),
      })
    )

    render(<CertificatesChecker dictionary={dictionary} />)
    const hostInput = screen.getByPlaceholderText(dictionary.hostPlaceholder) as HTMLInputElement
    fireEvent.change(hostInput, { target: { value: "example.com" } })
    fireEvent.click(screen.getByRole("button", { name: dictionary.checkButton }))

    await screen.findByText(dictionary.results.title)

    fireEvent.click(screen.getByRole("button", { name: dictionary.resetButton }))

    expect(hostInput.value).toBe("")
    expect(screen.getByPlaceholderText(dictionary.portPlaceholder)).toHaveValue(443)
    expect(screen.queryByText(dictionary.results.title)).not.toBeInTheDocument()
  })
})
