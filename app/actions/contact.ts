"use server"

import { z } from "zod"
import nodemailer from "nodemailer"
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

export async function submitContactRequest(formData: any): Promise<ContactResult> {
  try {
    // Rate limiting check
    try {
      await limiter.check(10, "contact_request") // 10 requests per hour
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

    // Determine subject based on contact method
    let emailSubject = ""
    if (contactMethod === "message") {
      emailSubject = sanitizedSubject || `Contact Form: Message from ${sanitizedName}`
    } else if (contactMethod === "meeting") {
      emailSubject = `Meeting Request: ${meetingDetails?.type} meeting on ${meetingDetails?.date} at ${meetingDetails?.time}`
    } else {
      emailSubject = `Call Request from ${sanitizedName}`
    }

    // Create HTML content based on contact method
    let htmlContent = ""

    if (contactMethod === "message") {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${sanitizedEmail}</p>
          <p><strong>Priority:</strong> ${validatedData.priority ?? "medium"}</p>
          ${sanitizedSubject ? `<p><strong>Subject:</strong> ${sanitizedSubject}</p>` : ""}
          <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px;">
            <h3 style="margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap;">${sanitizedMessage}</p>
          </div>
        </div>
      `
    } else if (contactMethod === "meeting") {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Meeting Request</h2>
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${sanitizedEmail}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px;">
            <h3 style="margin-top: 0;">Meeting Details:</h3>
            <p><strong>Type:</strong> ${meetingDetails?.type}</p>
            <p><strong>Date:</strong> ${meetingDetails?.date}</p>
            <p><strong>Time:</strong> ${meetingDetails?.time}</p>
            <p><strong>Agenda:</strong></p>
            <p style="white-space: pre-wrap;">${sanitizedMessage}</p>
          </div>
        </div>
      `
    } else {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Call Request</h2>
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${sanitizedEmail}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px;">
            <h3 style="margin-top: 0;">Call Details:</h3>
            <p style="white-space: pre-wrap;">${sanitizedMessage}</p>
          </div>
        </div>
      `
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO ?? process.env.EMAIL_FROM, // Default to sender if recipient not specified
      replyTo: sanitizedEmail,
      subject: emailSubject,
      text: `Name: ${sanitizedName}\nEmail: ${sanitizedEmail}\n\nMessage:\n${sanitizedMessage}`,
      html: htmlContent,
    }

    // Send email
    await transporter.sendMail(mailOptions)

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
