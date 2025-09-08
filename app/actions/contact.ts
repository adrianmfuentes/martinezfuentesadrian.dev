"use server"

import { z } from "zod"
import DOMPurify from "isomorphic-dompurify"
import { rateLimit } from "@/lib/rate-limit"

// Contact form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().min(5).max(255).refine(
    (val) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    { message: "Invalid email address" }
  ),
  message: z.string().min(10).max(5000),
  subject: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  contactMethod: z.enum(["message"]),
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

function checkRateLimit(formData: any): Promise<ContactResult | null> {
  return limiter.check(10, formData.ip || formData.email || "anonymous_user")
    .then(() => null)
    .catch(() => {
      return {
        success: false,
        error: "Too many requests. Please try again later.",
      };
    });
}

function validateEmailEnv(): { valid: boolean; error?: string; templateId?: string } {
  if (!process.env.EMAILJS_SERVICE_ID) {
    console.error("❌ EMAILJS_SERVICE_ID no está configurado");
    return { valid: false, error: "Email service not properly configured - SERVICE_ID missing" };
  }
  if (!process.env.EMAILJS_PUBLIC_KEY) {
    console.error("❌ EMAILJS_PUBLIC_KEY no está configurado");
    return { valid: false, error: "Email service not properly configured - PUBLIC_KEY missing" };
  }
  const templateId = process.env.EMAILJS_CONTACT_TEMPLATE_ID ?? process.env.EMAILJS_TEMPLATE_ID;
  if (!templateId) {
    console.error("❌ EMAILJS_TEMPLATE_ID no está configurado");
    return { valid: false, error: "Email service not properly configured - TEMPLATE_ID missing" };
  }
  return { valid: true, templateId };
}

function handleEmailJSError(res: Response, err: string): ContactResult {
  console.error("❌ Error de EmailJS:", err);
  if (res.status === 400) {
    return { success: false, error: "Invalid email configuration. Please contact the administrator." };
  }
  if (res.status === 401) {
    return { success: false, error: "Email service authentication failed. Please contact the administrator." };
  }
  if (res.status === 402) {
    return { success: false, error: "Email service quota exceeded. Please try again later." };
  }
  if (res.status === 412) {
    return { success: false, error: "Email service authentication error. Please reconnect your email account." };
  }
  if (res.status >= 500) {
    return { success: false, error: "Email service temporarily unavailable. Please try again later." };
  }
  return { success: false, error: "Failed to send contact request. Please try again." };
}

export async function submitContactRequest(formData: any): Promise<ContactResult> {
  try {
    // Rate limiting check
    const rateLimitResult = await checkRateLimit(formData);
    if (rateLimitResult) return rateLimitResult;

    // Validate form data
    const validatedData = contactFormSchema.parse(formData);

    // Sanitize inputs to prevent XSS
    const sanitizedName = DOMPurify.sanitize(validatedData.name);
    const sanitizedEmail = DOMPurify.sanitize(validatedData.email);
    const sanitizedMessage = DOMPurify.sanitize(validatedData.message);
    const sanitizedSubject = validatedData.subject ? DOMPurify.sanitize(validatedData.subject) : "";
    const contactMethod = validatedData.contactMethod;
    const priority = validatedData.priority ?? "medium";

    // Check for spam patterns
    if (containsSpamPatterns(sanitizedMessage)) {
      return { success: false, error: "Message detected as spam." };
    }

    // Verificar variables de entorno
    const envCheck = validateEmailEnv();
    if (!envCheck.valid) return { success: false, error: envCheck.error! };
    const templateId = envCheck.templateId!;

    // Determine template parameters for the message
    const templateParams: {
      from_name: string;
      from_email: string;
      message: string;
      contact_method: "message";
      priority: "low" | "medium" | "high";
      subject?: string;
    } = {
      from_name: sanitizedName,
      from_email: sanitizedEmail,
      message: sanitizedMessage,
      contact_method: contactMethod,
      priority: priority,
    };

    // Add subject if provided
    if (sanitizedSubject) {
      templateParams.subject = sanitizedSubject;
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
        template_id: templateId,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: templateParams,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return handleEmailJSError(res, err);
    }

    return { success: true };
  } catch (error) {
    console.error("💥 Error general procesando solicitud de contacto:", error);

    // Manejar errores específicos de validación
    if (error instanceof z.ZodError) {
      console.error("❌ Error de validación:", error.issues);
      return {
        success: false,
        error: "Invalid form data. Please check your inputs and try again.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process contact request. Please try again later.",
    };
  }
}