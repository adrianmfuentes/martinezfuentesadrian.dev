// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

const { checkMock } = vi.hoisted(() => ({ checkMock: vi.fn().mockResolvedValue(undefined) }))

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({ check: checkMock })),
}))

import { sendContactEmail } from "@/app/actions/email"

const validFormData = {
  name: "Jane Doe",
  email: "jane@example.com",
  message: "This is a perfectly valid, non-spammy message body.",
}

function mockFetchOnce(response: { ok: boolean; status?: number; text?: () => Promise<string> }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? (response.ok ? 200 : 500),
    text: response.text ?? (async () => "error body"),
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

describe("sendContactEmail", () => {
  beforeEach(() => {
    checkMock.mockReset().mockResolvedValue(undefined)
    vi.stubEnv("EMAILJS_SERVICE_ID", "service_id")
    vi.stubEnv("EMAILJS_PUBLIC_KEY", "public_key")
    vi.stubEnv("EMAILJS_TEMPLATE_ID", "template_id")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("succeeds for a valid submission and calls EmailJS with sanitized fields", async () => {
    const fetchMock = mockFetchOnce({ ok: true })

    const result = await sendContactEmail(validFormData)

    expect(result).toEqual({ success: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe("https://api.emailjs.com/api/v1.0/email/send")
    const body = JSON.parse(options.body)
    expect(body.service_id).toBe("service_id")
    expect(body.template_id).toBe("template_id")
    expect(body.user_id).toBe("public_key")
    expect(body.template_params).toEqual({
      from_name: "Jane Doe",
      from_email: "jane@example.com",
      message: validFormData.message,
    })
  })

  it("always checks the rate limiter with the shared 'contact_email' token", async () => {
    mockFetchOnce({ ok: true })

    await sendContactEmail(validFormData)

    expect(checkMock).toHaveBeenCalledWith(10, "contact_email")
  })

  it("returns an 'Unknown error' style message when validation fails", async () => {
    mockFetchOnce({ ok: true })

    const result = await sendContactEmail({ ...validFormData, name: "A" })

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it("rejects an invalid email address", async () => {
    mockFetchOnce({ ok: true })

    const result = await sendContactEmail({ ...validFormData, email: "not-an-email" })

    expect(result.success).toBe(false)
  })

  it("rejects a message that is too short", async () => {
    mockFetchOnce({ ok: true })

    const result = await sendContactEmail({ ...validFormData, message: "short" })

    expect(result.success).toBe(false)
  })

  it.each([
    ["buy viagra now", "buy viagra"],
    ["visit the casino tonight", "casino"],
    ["click javascript:doEvil() for a surprise", "javascript:"],
  ])("rejects a spam message: %s", async (message) => {
    mockFetchOnce({ ok: true })

    const result = await sendContactEmail({ ...validFormData, message })

    expect(result).toEqual({ success: false, error: "Message detected as spam." })
  })

  // NOTE: DOMPurify.sanitize() runs before containsSpamPatterns() and strips
  // <script> tags entirely, so the /<script>/i pattern can never actually match.
  it("does NOT flag as spam once DOMPurify has stripped the <script> tag", async () => {
    mockFetchOnce({ ok: true })

    const result = await sendContactEmail({
      ...validFormData,
      message: "<script>alert(1)</script> please read",
    })

    expect(result).toEqual({ success: true })
  })

  it("returns a failure result when the EmailJS response is not ok", async () => {
    mockFetchOnce({ ok: false, status: 500, text: async () => "boom" })

    const result = await sendContactEmail(validFormData)

    expect(result).toEqual({ success: false, error: "Failed to send email via EmailJS" })
  })

  it("returns a rate-limit failure when the limiter rejects", async () => {
    checkMock.mockRejectedValueOnce(new Error("Rate limit exceeded"))
    mockFetchOnce({ ok: true })

    const result = await sendContactEmail(validFormData)

    expect(result).toEqual({ success: false, error: "Rate limit exceeded" })
  })

  it("returns a failure result when fetch itself throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))

    const result = await sendContactEmail(validFormData)

    expect(result).toEqual({ success: false, error: "network down" })
  })
})
