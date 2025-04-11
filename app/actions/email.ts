"use server"

import { z } from "zod"
import nodemailer from "nodemailer"
import { DOMPurify } from "isomorphic-dompurify"
import { rateLimit } from "@/lib/rate-limit"

// Email validation schema
const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
})

// Type for the return value
type SendEmailResult = {
  success: boolean
  error?: string
}

// Create a rate limiter that allows 5 requests per hour per IP
const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500, // Max 500 users per interval
  limit: 5, // 5 requests per interval
})

export async function sendContactEmail(formData: {
  name: string
  email: string
  message: string
}): Promise<SendEmailResult> {
  try {
    // Rate limiting check
    try {
      await limiter.check(10, "contact_email") // 10 requests per hour
    } catch {
      return {
        success: false,
        error: "Too many requests. Please try again later.",
      }
    }

    // Validate form data
    const validatedData = contactFormSchema.parse(formData)

    // Sanitize inputs to prevent XSS
    const sanitizedName = DOMPurify.sanitize(validatedData.name)
    const sanitizedEmail = DOMPurify.sanitize(validatedData.email)
    const sanitizedMessage = DOMPurify.sanitize(validatedData.message)

    // Check for spam patterns
    if (containsSpamPatterns(sanitizedMessage)) {
      return {
        success: false,
        error: "Message detected as spam.",
      }
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_PORT === "465",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO || process.env.EMAIL_FROM, // Default to sender if recipient not specified
      replyTo: sanitizedEmail,
      subject: `Contact Form: Message from ${sanitizedName}`,
      text: `Name: ${sanitizedName}\nEmail: ${sanitizedEmail}\n\nMessage:\n${sanitizedMessage}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${sanitizedEmail}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px;">
            <h3 style="margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap;">${sanitizedMessage}</p>
          </div>
        </div>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    }
  }
}

// Helper function to check for common spam patterns
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
