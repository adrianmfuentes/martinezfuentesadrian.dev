// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

const { checkMock, createMock } = vi.hoisted(() => ({
  checkMock: vi.fn().mockResolvedValue(undefined),
  createMock: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Hello there!" } }],
  }),
}))

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({ check: checkMock })),
}))

vi.mock("groq-sdk", () => ({
  Groq: vi.fn().mockImplementation(function GroqMock() {
    return { chat: { completions: { create: createMock } } }
  }),
}))

import { sendChatMessage } from "@/app/actions/chat"

describe("sendChatMessage", () => {
  beforeEach(() => {
    checkMock.mockReset().mockResolvedValue(undefined)
    createMock.mockReset().mockResolvedValue({
      choices: [{ message: { content: "Hello there!" } }],
    })
    vi.stubEnv("GROQ_API_KEY", "test-key")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("returns the AI response on success", async () => {
    const result = await sendChatMessage("Hello, how are you?", [])

    expect(result).toEqual({ success: true, message: "Hello there!" })
    expect(createMock).toHaveBeenCalledTimes(1)
  })

  it("checks the rate limiter with the shared 'chat_message' token", async () => {
    await sendChatMessage("Hello, how are you?", [])

    expect(checkMock).toHaveBeenCalledWith(20, "chat_message")
  })

  it("includes previous messages and the new user message in the conversation history", async () => {
    const previousMessages = [
      { role: "user" as const, content: "Hi" },
      { role: "assistant" as const, content: "Hello!" },
    ]

    await sendChatMessage("What else?", previousMessages)

    const callArgs = createMock.mock.calls[0][0]
    expect(callArgs.messages[0].role).toBe("system")
    expect(callArgs.messages).toContainEqual({ role: "user", content: "Hi" })
    expect(callArgs.messages).toContainEqual({ role: "assistant", content: "Hello!" })
    expect(callArgs.messages.at(-1)).toEqual({ role: "user", content: "What else?" })
  })

  it("rejects an empty message without calling Groq", async () => {
    const result = await sendChatMessage("", [])

    expect(result).toEqual({ success: false, message: "El mensaje no puede estar vacío." })
    expect(createMock).not.toHaveBeenCalled()
  })

  it("rejects a whitespace-only message without calling Groq", async () => {
    const result = await sendChatMessage("   ", [])

    expect(result).toEqual({ success: false, message: "El mensaje no puede estar vacío." })
    expect(createMock).not.toHaveBeenCalled()
  })

  it("uses a Spanish system prompt when the message contains Spanish accents", async () => {
    await sendChatMessage("¿Cómo estás?", [])

    const callArgs = createMock.mock.calls[0][0]
    expect(callArgs.messages[0].content).toContain("Responde en español")
  })

  it("uses a Spanish system prompt when the message contains 'que'", async () => {
    await sendChatMessage("I have a question for you", [])

    const callArgs = createMock.mock.calls[0][0]
    expect(callArgs.messages[0].content).toContain("Responde en español")
  })

  it("uses an English system prompt for messages without Spanish markers", async () => {
    await sendChatMessage("What is your favorite book?", [])

    const callArgs = createMock.mock.calls[0][0]
    expect(callArgs.messages[0].content).toContain("Respond in English")
  })

  it("falls back to a default message when Groq returns no content", async () => {
    createMock.mockResolvedValueOnce({ choices: [{ message: { content: null } }] })

    const result = await sendChatMessage("Hello", [])

    expect(result).toEqual({
      success: true,
      message: "Lo siento, no pude generar una respuesta.",
    })
  })

  it("catches errors thrown by the Groq SDK", async () => {
    createMock.mockRejectedValueOnce(new Error("Groq is down"))

    const result = await sendChatMessage("Hello", [])

    expect(result.success).toBe(false)
    expect(result.message).toBe("Ha ocurrido un error al procesar tu mensaje.")
    expect(result.error).toBe("Groq is down")
  })

  it("returns a rate-limit message when the limiter rejects", async () => {
    checkMock.mockRejectedValueOnce(new Error("Rate limit exceeded"))

    const result = await sendChatMessage("Hello", [])

    expect(result).toEqual({
      success: false,
      message: "Has enviado demasiados mensajes. Por favor, inténtalo de nuevo más tarde.",
    })
    expect(createMock).not.toHaveBeenCalled()
  })
})
