// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

// get-client-ip.ts imports "server-only", which throws when resolved outside
// of the "react-server" export condition. Vitest doesn't set that condition,
// so we stub the marker package to a no-op.
vi.mock("server-only", () => ({}))

const { checkMock, createMock, headersGetMock } = vi.hoisted(() => ({
  checkMock: vi.fn().mockResolvedValue(undefined),
  createMock: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Hello there!" } }],
  }),
  headersGetMock: vi.fn((name: string) => (name === "x-forwarded-for" ? "1.2.3.4" : null)), // NOSONAR test fixture IP, not a real host
}))

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({ check: checkMock })),
}))

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({ get: headersGetMock }),
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

  it("checks the rate limiter with the caller's IP, not a shared token", async () => {
    await sendChatMessage("Hello, how are you?", [])

    expect(checkMock).toHaveBeenCalledWith("1.2.3.4") // NOSONAR test fixture IP, not a real host
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

  it.each([
    ["¿Cómo estás?", "Responde en español"],
    ["I have a question for you", "Responde en español"],
    ["What is your favorite book?", "Respond in English"],
  ])("picks the system prompt language for %s", async (message, expectedPrompt) => {
    await sendChatMessage(message, [])

    const callArgs = createMock.mock.calls[0][0]
    expect(callArgs.messages[0].content).toContain(expectedPrompt)
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
