"use server"

import { rateLimit } from "@/lib/rate-limit"
import { Groq } from "groq-sdk"

// Type for chat messages
type Message = {
  role: "user" | "assistant"
  content: string
}

// Type for the return value
type ChatResponse = {
  success: boolean
  message: string
  error?: string
}

// Create a rate limiter that allows 20 requests per hour per IP
const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500, // Max 500 users per interval
  limit: 20, // 20 requests per interval
})

export async function sendChatMessage(message: string, previousMessages: Message[]): Promise<ChatResponse> {
  try {
    // Rate limiting check
    try {
      await limiter.check(20, "chat_message") // 20 requests per hour
    } catch {
      return {
        success: false,
        message: "Has enviado demasiados mensajes. Por favor, inténtalo de nuevo más tarde.",
      }
    }

    // Validate message
    if (!message.trim()) {
      return {
        success: false,
        message: "El mensaje no puede estar vacío.",
      }
    }

    // Initialize Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })

    // Prepare conversation history
    const conversationHistory = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Add the new user message
    conversationHistory.push({
      role: "user",
      content: message,
    })

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: conversationHistory,
      model: "llama3-8b-8192", // Using Llama 3 8B model
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    })

    // Extract the response
    const aiResponse = completion.choices[0]?.message?.content ?? "Lo siento, no pude generar una respuesta."

    return {
      success: true,
      message: aiResponse,
    }
  } catch (error) {
    console.error("Error in chat:", error)
    return {
      success: false,
      message: "Ha ocurrido un error al procesar tu mensaje.",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
