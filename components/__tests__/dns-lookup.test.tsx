import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { DnsLookup } from "@components/dns-lookup"

const dictionary = {
  title: "DNS Lookup",
  description: "Query DNS records for any domain",
  domainLabel: "Domain",
  domainPlaceholder: "example.com",
  lookupButton: "Lookup",
  lookingUp: "Looking up...",
  resetButton: "Reset",
  recordTypes: {
    A: "A",
    AAAA: "AAAA",
    MX: "MX",
    TXT: "TXT",
    NS: "NS",
    CNAME: "CNAME",
  },
  noRecords: "No records found",
  errors: {
    invalidDomain: "Invalid domain",
    lookupError: "Lookup failed",
    rateLimited: "Too many requests",
  },
}

const emptyRecords = { A: [], AAAA: [], MX: [], TXT: [], NS: [], CNAME: [] }

describe("DnsLookup", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("renders the title and description", () => {
    render(<DnsLookup dictionary={dictionary} />)
    expect(screen.getByText(dictionary.title)).toBeInTheDocument()
    expect(screen.getByText(dictionary.description)).toBeInTheDocument()
  })

  it("disables the lookup button until a domain is entered", () => {
    render(<DnsLookup dictionary={dictionary} />)
    expect(screen.getByRole("button", { name: dictionary.lookupButton })).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText(dictionary.domainPlaceholder), {
      target: { value: "example.com" },
    })
    expect(screen.getByRole("button", { name: dictionary.lookupButton })).not.toBeDisabled()
  })

  it("shows an invalid domain error and does not call fetch for a malformed domain", () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    render(<DnsLookup dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.domainPlaceholder), {
      target: { value: "not a domain!!" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.lookupButton }))

    expect(screen.getByText(dictionary.errors.invalidDomain)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("triggers a lookup when Enter is pressed in the domain field", () => {
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}))
    vi.stubGlobal("fetch", fetchMock)

    render(<DnsLookup dictionary={dictionary} />)
    const input = screen.getByPlaceholderText(dictionary.domainPlaceholder)
    fireEvent.change(input, { target: { value: "example.com" } })
    fireEvent.keyDown(input, { key: "Enter" })

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/dns-lookup",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: "example.com" }),
      })
    )
  })

  it("shows a loading state, then renders results grouped by record type", async () => {
    let resolveFetch: (value: unknown) => void = () => {}
    const pending = new Promise((resolve) => {
      resolveFetch = resolve
    })
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending))

    render(<DnsLookup dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.domainPlaceholder), {
      target: { value: "example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.lookupButton }))

    expect(await screen.findByText(dictionary.lookingUp)).toBeInTheDocument()

    resolveFetch({
      status: 200,
      json: async () => ({
        success: true,
        records: {
          ...emptyRecords,
          A: ["93.184.216.34"],
          MX: [{ exchange: "mail.example.com", priority: 10 }],
        },
      }),
    })

    await screen.findByText("93.184.216.34")

    expect(screen.getByText("mail.example.com (priority 10)")).toBeInTheDocument()
    // AAAA has no records
    expect(screen.getAllByText(dictionary.noRecords).length).toBeGreaterThan(0)
  })

  it("shows the rate-limited error when the API responds with 429", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 429, json: async () => ({}) }))

    render(<DnsLookup dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.domainPlaceholder), {
      target: { value: "example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.lookupButton }))

    await waitFor(() => {
      expect(screen.getByText(dictionary.errors.rateLimited)).toBeInTheDocument()
    })
  })

  it("shows the lookup error when the API responds with success: false", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ status: 200, json: async () => ({ success: false }) })
    )

    render(<DnsLookup dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.domainPlaceholder), {
      target: { value: "example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.lookupButton }))

    await waitFor(() => {
      expect(screen.getByText(dictionary.errors.lookupError)).toBeInTheDocument()
    })
  })

  it("shows the lookup error when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))

    render(<DnsLookup dictionary={dictionary} />)
    fireEvent.change(screen.getByPlaceholderText(dictionary.domainPlaceholder), {
      target: { value: "example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: dictionary.lookupButton }))

    await waitFor(() => {
      expect(screen.getByText(dictionary.errors.lookupError)).toBeInTheDocument()
    })
  })

  it("resets the domain, records, and error when the reset button is clicked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        json: async () => ({ success: true, records: emptyRecords }),
      })
    )

    render(<DnsLookup dictionary={dictionary} />)
    const input = screen.getByPlaceholderText(dictionary.domainPlaceholder) as HTMLInputElement
    fireEvent.change(input, { target: { value: "example.com" } })
    fireEvent.click(screen.getByRole("button", { name: dictionary.lookupButton }))

    await screen.findAllByText(dictionary.noRecords)

    fireEvent.click(screen.getByRole("button", { name: dictionary.resetButton }))

    expect(input.value).toBe("")
    expect(screen.queryByText(dictionary.noRecords)).not.toBeInTheDocument()
  })
})
