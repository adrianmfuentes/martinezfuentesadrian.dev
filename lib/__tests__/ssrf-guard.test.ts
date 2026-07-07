import { describe, it, expect, vi } from "vitest"

const { lookupMock } = vi.hoisted(() => ({ lookupMock: vi.fn() }))

vi.mock("node:dns/promises", () => ({
  default: { lookup: lookupMock },
  lookup: lookupMock,
}))

import { isBlockedHost } from "@/lib/ssrf-guard"

describe("isBlockedHost", () => {
  it("blocks loopback IPv4 literals", async () => {
    expect(await isBlockedHost("127.0.0.1")).toBe(true)
  })

  it("blocks private IPv4 ranges", async () => {
    expect(await isBlockedHost("10.1.2.3")).toBe(true)
    expect(await isBlockedHost("172.16.0.5")).toBe(true)
    expect(await isBlockedHost("192.168.1.1")).toBe(true)
  })

  it("blocks the cloud metadata / link-local address", async () => {
    expect(await isBlockedHost("169.254.169.254")).toBe(true)
  })

  it("blocks IPv6 loopback and unique-local addresses", async () => {
    expect(await isBlockedHost("::1")).toBe(true)
    expect(await isBlockedHost("fd00::1")).toBe(true)
  })

  it("blocks the literal hostname 'localhost'", async () => {
    expect(await isBlockedHost("localhost")).toBe(true)
  })

  it("allows a public IPv4 literal", async () => {
    expect(await isBlockedHost("93.184.216.34")).toBe(false) // NOSONAR test fixture IP, not a real host
  })

  it("resolves a hostname and blocks it if DNS points at a private address", async () => {
    lookupMock.mockResolvedValue([{ address: "10.0.0.5", family: 4 }])
    expect(await isBlockedHost("internal.example.com")).toBe(true)
  })

  it("resolves a hostname and allows it if DNS points at a public address", async () => {
    lookupMock.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]) // NOSONAR test fixture IP, not a real host
    expect(await isBlockedHost("example.com")).toBe(false)
  })

  it("blocks a hostname that fails to resolve", async () => {
    lookupMock.mockRejectedValue(new Error("ENOTFOUND"))
    expect(await isBlockedHost("does-not-exist.invalid")).toBe(true)
  })
})
