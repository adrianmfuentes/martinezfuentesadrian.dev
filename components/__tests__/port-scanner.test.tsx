import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { PortScanner } from "@components/port-scanner"

const dictionary = {
  title: "Port Scanner",
  description: "Scan open ports on a host",
  hostLabel: "Host",
  hostPlaceholder: "example.com or 192.168.1.1",
  portsLabel: "Ports",
  portsPlaceholder: "80, 443, 8000-8100",
  portsHelp: "Enter a single port, a comma-separated list, or a range",
  scanButton: "Start scan",
  stopButton: "Stop",
  scanning: "Scanning...",
  results: {
    title: "Scan results",
    host: "Host",
    resolvedIp: "Resolved IP",
    totalPorts: "Total ports",
    openPorts: "Open ports",
    closedPorts: "Closed ports",
    progress: "Progress",
    status: "Status",
  },
  portStatus: {
    open: "Open",
    closed: "Closed",
    scanning: "Scanning",
  },
  errors: {
    invalidHost: "Invalid host",
    invalidPorts: "Invalid ports",
    scanError: "Scan failed",
    networkError: "Network error",
  },
  resetButton: "Reset",
}

function createFetchMock(scanResponder: (url: string) => Promise<unknown>) {
  return vi.fn((url: string) => {
    if (typeof url === "string" && url.includes("dns.google")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ Answer: [{ data: "93.184.216.34" }] }), // NOSONAR test fixture IP, not a real host
      })
    }
    return scanResponder(url)
  })
}

function fillHostAndPorts(host: string, ports: string) {
  fireEvent.change(screen.getByPlaceholderText(dictionary.hostPlaceholder), {
    target: { value: host },
  })
  fireEvent.change(screen.getByPlaceholderText(dictionary.portsPlaceholder), {
    target: { value: ports },
  })
}

describe("PortScanner", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("renders the title/description and disables the scan button when inputs are empty", () => {
    render(<PortScanner dictionary={dictionary} />)
    expect(screen.getAllByText(dictionary.title)[0]).toBeInTheDocument()
    expect(screen.getAllByText(dictionary.description)[0]).toBeInTheDocument()
    expect(screen.getByRole("button", { name: dictionary.scanButton })).toBeDisabled()
  })

  it("shows an invalid host error and does not call fetch for a malformed host", () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    render(<PortScanner dictionary={dictionary} />)
    fillHostAndPorts("invalid host", "80")
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    expect(screen.getByText(dictionary.errors.invalidHost)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("shows an invalid ports error and does not call fetch for a malformed port string", () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    render(<PortScanner dictionary={dictionary} />)
    fillHostAndPorts("example.com", "not-a-port")
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    expect(screen.getByText(dictionary.errors.invalidPorts)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("rejects port ranges larger than 100 ports before calling fetch", () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    render(<PortScanner dictionary={dictionary} />)
    fillHostAndPorts("example.com", "1-200")
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    expect(
      screen.getByText("Maximum 100 ports allowed for browser scanning")
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("calls the scan API with the expected method/body and resolves the hostname", async () => {
    const fetchMock = createFetchMock(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        results: [{ port: 80, isOpen: true, status: "open" }],
      }),
    }))
    vi.stubGlobal("fetch", fetchMock)

    render(<PortScanner dictionary={dictionary} />)
    fillHostAndPorts("example.com", "80")
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/port-scan",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ host: "example.com", ports: [80] }),
        })
      )
    })

    expect(fetchMock).toHaveBeenCalledWith(
      "https://dns.google/resolve?name=example.com&type=A"
    )

    await waitFor(() => {
      expect(screen.getByText("93.184.216.34")).toBeInTheDocument() // NOSONAR test fixture IP, not a real host
    })
  })

  it("shows a loading state while the scan request is pending", async () => {
    let resolveScan: (value: unknown) => void = () => {}
    const pending = new Promise((resolve) => {
      resolveScan = resolve
    })
    const fetchMock = createFetchMock(() => pending as Promise<unknown>)
    vi.stubGlobal("fetch", fetchMock)

    render(<PortScanner dictionary={dictionary} />)
    fillHostAndPorts("example.com", "80")
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    expect(await screen.findByText(dictionary.scanning)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: dictionary.stopButton })).toBeInTheDocument()
    expect(screen.getByText(dictionary.results.progress)).toBeInTheDocument()

    resolveScan({
      ok: true,
      json: async () => ({
        success: true,
        results: [{ port: 80, isOpen: true, status: "open" }],
      }),
    })

    await waitFor(() => {
      expect(screen.getByText(dictionary.scanButton)).toBeInTheDocument()
    })
  })

  it("renders open and closed ports with correct summary counts on success", async () => {
    const fetchMock = createFetchMock(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        results: [
          { port: 80, isOpen: true, status: "open" },
          { port: 443, isOpen: true, status: "open" },
          { port: 22, isOpen: false, status: "closed" },
        ],
      }),
    }))
    vi.stubGlobal("fetch", fetchMock)

    render(<PortScanner dictionary={dictionary} />)
    fillHostAndPorts("example.com", "22,80,443")
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    await screen.findByText(dictionary.results.title)

    expect(screen.getByText("Puerto 80")).toBeInTheDocument()
    expect(screen.getByText("Puerto 443")).toBeInTheDocument()
    expect(screen.getByText("Puerto 22")).toBeInTheDocument()
    expect(screen.getAllByText(dictionary.portStatus.open)).toHaveLength(2)
    expect(screen.getAllByText(dictionary.portStatus.closed)).toHaveLength(1)

    // Summary counts: total=3, open=2, closed=1
    const summaryValues = screen.getAllByText("3")
    expect(summaryValues.length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("2")[0]).toBeInTheDocument()
    expect(screen.getAllByText("1")[0]).toBeInTheDocument()
  })

  it("shows the scan error when the API responds with success: false", async () => {
    const fetchMock = createFetchMock(async () => ({
      ok: true,
      json: async () => ({ success: false, error: "boom" }),
    }))
    vi.stubGlobal("fetch", fetchMock)

    render(<PortScanner dictionary={dictionary} />)
    fillHostAndPorts("example.com", "80")
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    await waitFor(() => {
      expect(screen.getByText(dictionary.errors.scanError)).toBeInTheDocument()
    })
  })

  it("shows the scan error when the fetch call rejects", async () => {
    const fetchMock = createFetchMock(() => Promise.reject(new Error("network down")))
    vi.stubGlobal("fetch", fetchMock)

    render(<PortScanner dictionary={dictionary} />)
    fillHostAndPorts("example.com", "80")
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    await waitFor(() => {
      expect(screen.getByText(dictionary.errors.scanError)).toBeInTheDocument()
    })
  })

  it("stops the scan when the stop button is clicked", async () => {
    const pending = new Promise(() => {}) // never resolves
    const fetchMock = createFetchMock(() => pending as Promise<unknown>)
    vi.stubGlobal("fetch", fetchMock)

    render(<PortScanner dictionary={dictionary} />)
    fillHostAndPorts("example.com", "80")
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    const stopButton = await screen.findByRole("button", { name: dictionary.stopButton })
    fireEvent.click(stopButton)

    expect(screen.getByRole("button", { name: dictionary.scanButton })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: dictionary.stopButton })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: dictionary.resetButton })).toBeInTheDocument()
  })

  it("resets the form after a completed scan", async () => {
    const fetchMock = createFetchMock(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        results: [{ port: 80, isOpen: true, status: "open" }],
      }),
    }))
    vi.stubGlobal("fetch", fetchMock)

    render(<PortScanner dictionary={dictionary} />)
    fillHostAndPorts("example.com", "80")
    fireEvent.click(screen.getByRole("button", { name: dictionary.scanButton }))

    await screen.findByText(dictionary.results.title)
    fireEvent.click(screen.getByRole("button", { name: dictionary.resetButton }))

    expect(screen.queryByText(dictionary.results.title)).not.toBeInTheDocument()
    expect(
      (screen.getByPlaceholderText(dictionary.hostPlaceholder) as HTMLInputElement).value
    ).toBe("")
    expect(
      (screen.getByPlaceholderText(dictionary.portsPlaceholder) as HTMLInputElement).value
    ).toBe("")
  })
})
