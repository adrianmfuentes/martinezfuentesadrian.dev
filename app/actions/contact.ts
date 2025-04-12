"use server"

import { z } from "zod"
import DOMPurify from "isomorphic-dompurify"
import { rateLimit } from "@/lib/rate-limit"

// Contact form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
  subject: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  contactMethod: z.enum(["message", "meeting", "call"]),
  meetingDetails: z
    .object({
      type: z.enum(["video", "phone", "inperson"]),
      date: z.string(),
      time: z.string(),
    })
    .optional(),
})

// Type for the return value
type ContactResult = {
  success: boolean
  error?: string
}

// Create a rate limiter that allows 5 requests per hour per IP
const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500, // Max 500 users per interval
  limit: 5, // 5 requests per interval
})

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

export async function submitContactRequest(formData: any): Promise<ContactResult> {
  try {
    // Rate limiting check
    try {
      await limiter.check(10, formData.ip || formData.email || "anonymous_user") // 10 requests per interval
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
    const sanitizedSubject = validatedData.subject ? DOMPurify.sanitize(validatedData.subject) : ""
    const contactMethod = validatedData.contactMethod
    const meetingDetails = validatedData.meetingDetails
    const priority = validatedData.priority ?? "medium"

    // Check for spam patterns
    if (containsSpamPatterns(sanitizedMessage)) {
      return { success: false, error: "Message detected as spam." }
    }

    // Determine template parameters based on contact method
    let templateParams: any = {
      from_name: sanitizedName,
      from_email: sanitizedEmail,
      message: sanitizedMessage,
      contact_method: contactMethod,
      priority: priority
    }
    
    // Add subject if provided
    if (sanitizedSubject) {
      templateParams.subject = sanitizedSubject
    }
    
    // Add meeting details if applicable
    if (contactMethod === "meeting" && meetingDetails) {
      templateParams.meeting_type = meetingDetails.type
      templateParams.meeting_date = meetingDetails.date
      templateParams.meeting_time = meetingDetails.time
    }

    // Send email via EmailJS
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "origin": process.env.SITE_URL ?? "http://localhost",
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_CONTACT_TEMPLATE_ID ?? process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: templateParams,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("EmailJS error:", err)
      return { success: false, error: "Failed to send contact request" }
    }

    // If this is a meeting request, also add to calendar system or CRM
    if (contactMethod === "meeting" && meetingDetails) {
      // In a real implementation, you would integrate with a calendar API or CRM
      // For example, using Google Calendar API or Microsoft Graph API
      console.log("Meeting request would be added to calendar:", meetingDetails)
    }

    return { success: true }
  } catch (error) {
    console.error("Error processing contact request:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process contact request",
    }
  }
}