// @vitest-environment node
import { describe, it, expect, afterEach, vi } from "vitest"
import { testEmailJSConfiguration } from "@/lib/test-emailjs"

describe("testEmailJSConfiguration", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("reports errors for every missing required variable", async () => {
    vi.stubEnv("EMAILJS_SERVICE_ID", "")
    vi.stubEnv("EMAILJS_PUBLIC_KEY", "")
    vi.stubEnv("EMAILJS_CONTACT_TEMPLATE_ID", "")
    vi.stubEnv("EMAILJS_TEMPLATE_ID", "")

    const result = await testEmailJSConfiguration()
    expect(result.success).toBe(false)
    expect(result.errors).toEqual([
      "EMAILJS_SERVICE_ID no está configurado",
      "EMAILJS_PUBLIC_KEY no está configurado",
      "EMAILJS_TEMPLATE_ID o EMAILJS_CONTACT_TEMPLATE_ID debe estar configurado",
    ])
  })

  it("accepts EMAILJS_TEMPLATE_ID as a fallback for the contact template", async () => {
    delete process.env.EMAILJS_CONTACT_TEMPLATE_ID
    vi.stubEnv("EMAILJS_SERVICE_ID", "service")
    vi.stubEnv("EMAILJS_PUBLIC_KEY", "key")
    vi.stubEnv("EMAILJS_TEMPLATE_ID", "template")
    vi.stubEnv("SITE_URL", "https://site.example")

    const result = await testEmailJSConfiguration()
    expect(result.success).toBe(true)
    expect(result.errors).toEqual([])
  })

  it("warns when SITE_URL is not configured but still succeeds", async () => {
    vi.stubEnv("EMAILJS_SERVICE_ID", "service")
    vi.stubEnv("EMAILJS_PUBLIC_KEY", "key")
    vi.stubEnv("EMAILJS_CONTACT_TEMPLATE_ID", "template")
    vi.stubEnv("SITE_URL", "")

    const result = await testEmailJSConfiguration()
    expect(result.success).toBe(true)
    expect(result.warnings).toEqual(["SITE_URL no está configurado, usando localhost por defecto"])
  })

  it("does not warn when SITE_URL is configured", async () => {
    vi.stubEnv("EMAILJS_SERVICE_ID", "service")
    vi.stubEnv("EMAILJS_PUBLIC_KEY", "key")
    vi.stubEnv("EMAILJS_CONTACT_TEMPLATE_ID", "template")
    vi.stubEnv("SITE_URL", "https://site.example")

    const result = await testEmailJSConfiguration()
    expect(result.warnings).toEqual([])
  })
})
