// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

// get-client-ip.ts imports "server-only", which throws when resolved outside
// of the "react-server" export condition. Vitest doesn't set that condition,
// so we stub the marker package to a no-op.
vi.mock("server-only", () => ({}))

const { checkMock, headersGetMock } = vi.hoisted(() => ({
  checkMock: vi.fn().mockResolvedValue(undefined),
  headersGetMock: vi.fn().mockReturnValue(null),
}))

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({ check: checkMock })),
}))

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({ get: headersGetMock }),
}))

import { submitContactRequest } from "@/app/actions/contact"

const validFormData = {
  name: "John Doe",
  email: "john@example.com",
  message: "This is a perfectly valid, non-spammy message body.",
  contactMethod: "message",
}

function mockFetchOnce(response: Partial<Response> & { ok: boolean; status?: number; text?: () => Promise<string> }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? (response.ok ? 200 : 500),
    text: response.text ?? (async () => "error body"),
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

describe("submitContactRequest", () => {
  beforeEach(() => {
    checkMock.mockReset().mockResolvedValue(undefined)
    headersGetMock.mockReset().mockReturnValue(null)
    vi.stubEnv("EMAILJS_SERVICE_ID", "service_id")
    vi.stubEnv("EMAILJS_PUBLIC_KEY", "public_key")
    vi.stubEnv("EMAILJS_CONTACT_TEMPLATE_ID", "template_id")
    vi.stubEnv("SITE_URL", "https://site.example")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("succeeds for a valid submission and calls EmailJS", async () => {
    const fetchMock = mockFetchOnce({ ok: true })

    const result = await submitContactRequest(validFormData)

    expect(result).toEqual({ success: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe("https://api.emailjs.com/api/v1.0/email/send")
    const body = JSON.parse(options.body)
    expect(body.service_id).toBe("service_id")
    expect(body.template_id).toBe("template_id")
    expect(body.user_id).toBe("public_key")
    expect(body.template_params.from_name).toBe("John Doe")
    expect(body.template_params.from_email).toBe("john@example.com")
    expect(body.template_params.priority).toBe("medium")
  })

  it("includes subject in template params when provided", async () => {
    const fetchMock = mockFetchOnce({ ok: true })

    await submitContactRequest({ ...validFormData, subject: "Hello there", priority: "high" })

    const [, options] = fetchMock.mock.calls[0]
    const body = JSON.parse(options.body)
    expect(body.template_params.subject).toBe("Hello there")
    expect(body.template_params.priority).toBe("high")
  })

  it("returns a generic error when validation fails (name too short)", async () => {
    mockFetchOnce({ ok: true })

    const result = await submitContactRequest({ ...validFormData, name: "A" })

    expect(result.success).toBe(false)
    expect(result.error).toBe("Invalid form data. Please check your inputs and try again.")
  })

  it("returns a generic error when the email is invalid", async () => {
    mockFetchOnce({ ok: true })

    const result = await submitContactRequest({ ...validFormData, email: "not-an-email" })

    expect(result.success).toBe(false)
    expect(result.error).toBe("Invalid form data. Please check your inputs and try again.")
  })

  it("returns a generic error when the message is too short", async () => {
    mockFetchOnce({ ok: true })

    const result = await submitContactRequest({ ...validFormData, message: "short" })

    expect(result.success).toBe(false)
    expect(result.error).toBe("Invalid form data. Please check your inputs and try again.")
  })

  it("returns a generic error when contactMethod is not 'message'", async () => {
    mockFetchOnce({ ok: true })

    const result = await submitContactRequest({ ...validFormData, contactMethod: "phone" })

    expect(result.success).toBe(false)
    expect(result.error).toBe("Invalid form data. Please check your inputs and try again.")
  })

  it.each([
    ["buy viagra now", "buy viagra"],
    ["check out this casino tonight", "casino"],
    ["click javascript:doEvil() for a surprise", "javascript:"],
  ])("rejects a spam message: %s", async (message) => {
    mockFetchOnce({ ok: true })

    const result = await submitContactRequest({ ...validFormData, message })

    expect(result).toEqual({ success: false, error: "Message detected as spam." })
  })

  // NOTE: DOMPurify.sanitize() runs before containsSpamPatterns(), and it strips
  // <script> tags and the onerror= attribute entirely. As a result the /<script>/i
  // and /onerror=/i spam patterns can never actually match — they are dead code.
  // These cases document the (surprising) real behavior: the message is treated
  // as clean and the email is sent.
  it.each([
    ["<script>alert(1)</script> please read"],
    ["<img src=x onerror=alert(1)> look at this"],
  ])("does NOT flag as spam once DOMPurify has stripped the dangerous markup: %s", async (message) => {
    mockFetchOnce({ ok: true })

    const result = await submitContactRequest({ ...validFormData, message })

    expect(result).toEqual({ success: true })
  })

  it.each([
    ["EMAILJS_SERVICE_ID", "SERVICE_ID"],
    ["EMAILJS_PUBLIC_KEY", "PUBLIC_KEY"],
    ["EMAILJS_CONTACT_TEMPLATE_ID", "TEMPLATE_ID"],
  ])("returns %s missing error when %s is unset", async (envVar, label) => {
    vi.stubEnv(envVar, "")
    mockFetchOnce({ ok: true })

    const result = await submitContactRequest(validFormData)

    expect(result).toEqual({
      success: false,
      error: `Email service not properly configured - ${label} missing`,
    })
  })

  it("falls back to EMAILJS_TEMPLATE_ID when EMAILJS_CONTACT_TEMPLATE_ID is unset", async () => {
    // NOTE: the source uses `??` (nullish coalescing), not `||`, so stubbing
    // EMAILJS_CONTACT_TEMPLATE_ID to an empty string would NOT trigger the
    // fallback (empty string is not null/undefined). It must be actually deleted.
    delete process.env.EMAILJS_CONTACT_TEMPLATE_ID
    vi.stubEnv("EMAILJS_TEMPLATE_ID", "fallback_template")
    const fetchMock = mockFetchOnce({ ok: true })

    const result = await submitContactRequest(validFormData)

    expect(result).toEqual({ success: true })
    const [, options] = fetchMock.mock.calls[0]
    const body = JSON.parse(options.body)
    expect(body.template_id).toBe("fallback_template")
  })

  it.each([
    [400, "Invalid email configuration. Please contact the administrator."],
    [401, "Email service authentication failed. Please contact the administrator."],
    [402, "Email service quota exceeded. Please try again later."],
    [412, "Email service authentication error. Please reconnect your email account."],
    [500, "Email service temporarily unavailable. Please try again later."],
    [503, "Email service temporarily unavailable. Please try again later."],
  ])("maps EmailJS status %i to the correct error message", async (status, expectedError) => {
    mockFetchOnce({ ok: false, status })

    const result = await submitContactRequest(validFormData)

    expect(result).toEqual({ success: false, error: expectedError })
  })

  it("returns a fallback error for an unmapped non-ok status", async () => {
    mockFetchOnce({ ok: false, status: 404 })

    const result = await submitContactRequest(validFormData)

    expect(result).toEqual({ success: false, error: "Failed to send contact request. Please try again." })
  })

  it("returns a rate-limit error when the limiter rejects", async () => {
    checkMock.mockRejectedValueOnce(new Error("Rate limit exceeded"))
    mockFetchOnce({ ok: true })

    const result = await submitContactRequest(validFormData)

    expect(result).toEqual({
      success: false,
      error: "Too many requests. Please try again later.",
    })
  })

  it("rate-limits using the server-derived x-forwarded-for IP, ignoring any client-supplied ip field", async () => {
    headersGetMock.mockImplementation((name: string) =>
      name === "x-forwarded-for" ? "1.2.3.4, 10.0.0.1" : null
    )
    mockFetchOnce({ ok: true })

    // A client-supplied "ip" field must never be trusted (trivially spoofable) —
    // the real IP always comes from the reverse proxy's x-forwarded-for header.
    await submitContactRequest({ ...validFormData, ip: "9.9.9.9" }) // NOSONAR test fixture IP, not a real host
    expect(checkMock).toHaveBeenCalledWith("1.2.3.4") // NOSONAR test fixture IP, not a real host
  })

  it("falls back to x-real-ip, then 'unknown', when x-forwarded-for is absent", async () => {
    mockFetchOnce({ ok: true })

    headersGetMock.mockImplementation((name: string) => (name === "x-real-ip" ? "5.6.7.8" : null)) // NOSONAR test fixture IP
    await submitContactRequest(validFormData)
    expect(checkMock).toHaveBeenCalledWith("5.6.7.8") // NOSONAR test fixture IP, not a real host

    checkMock.mockClear()
    headersGetMock.mockReturnValue(null)
    await submitContactRequest(validFormData)
    expect(checkMock).toHaveBeenCalledWith("unknown")
  })
})
