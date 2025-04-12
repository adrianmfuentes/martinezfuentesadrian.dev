"use server"

import { z } from "zod"
import DOMPurify from "isomorphic-dompurify"
import { rateLimit } from "@/lib/rate-limit"

const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
})

type SendEmailResult = {
  success: boolean
  error?: string
}

const limiter = rateLimit({
  interval: 60 * 60 * 1000,
  uniqueTokenPerInterval: 500,
  limit: 5,
})

export async function sendContactEmail(formData: {
  name: string
  email: string
  message: string
}): Promise<SendEmailResult> {
  try {
    await limiter.check(10, "contact_email")

    const validatedData = contactFormSchema.parse(formData)

    const sanitizedName = DOMPurify.sanitize(validatedData.name)
    const sanitizedEmail = DOMPurify.sanitize(validatedData.email)
    const sanitizedMessage = DOMPurify.sanitize(validatedData.message)

    if (containsSpamPatterns(sanitizedMessage)) {
      return { success: false, error: "Message detected as spam." }
    }

    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "origin": "http://localhost", // Cambia esto si tienes un dominio
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY, // También puede ser "publicKey"
        template_params: {
          from_name: sanitizedName,
          from_email: sanitizedEmail,
          message: sanitizedMessage,
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("EmailJS error:", err)
      return { success: false, error: "Failed to send email via EmailJS" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

function containsSpamPatterns(message: string): boolean {
  const spamPatterns = [
    /buy viagra/i,
    /\bloan\b.*\boffer\b/i,
    /\bcasino\b/i,
    /\bbet\b.*\bonline\b/i,
    /\bporn\b/i,
    /\bfree\s+money\b/i,
    /\bweight\s+loss\b.*\bpill\b/i,
    /<script>/i,
    /javascript:/i,
    /onerror=/i,
  ]

  return spamPatterns.some((pattern) => pattern.test(message))
}
