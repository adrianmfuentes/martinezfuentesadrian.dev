"use server"

import { rateLimit } from "@/lib/rate-limit"
import { Groq } from "groq-sdk"

// Type for chat messages
type Message = {
  role: "user" | "assistant" | "system"
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

    // Detectar el idioma del mensaje
    const isSpanish = /[áéíóúñ¿¡]/i.test(message) || message.includes("que") || message.includes("el ")
    const languagePrompt = isSpanish
      ? "Responde en español de forma clara, cercana y amigable."
      : "Respond in English in a friendly and clear way."

    // Initialize Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const systemMessage = {
      role: "system",
      content: `
        Actúas como un asistente de IA en la página personal de un estudiante de 20 años de Ingeniería de Software 
        en Oviedo, España. Es bilingüe (inglés/español), le apasiona la programación, la IA y el desarrollo web. 
        Puedes responder preguntas generales o personales relacionadas con su perfil. 
        ${languagePrompt}
      `,
    }

    // Prepare conversation history
    const conversationHistory = [
      systemMessage as any,
      ...previousMessages as any[],
      {
        role: "user",
        content: message,
      } as any,
    ]

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: conversationHistory,
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    })

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
