import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AIChatWidget } from "@/components/ai-chat-widget"

const mockSendChatMessage = vi.fn()

vi.mock("@/app/actions/chat", () => ({
  sendChatMessage: (...args: unknown[]) => mockSendChatMessage(...args),
}))

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light" }),
}))

describe("AIChatWidget", () => {
  beforeEach(() => {
    mockSendChatMessage.mockReset()
  })

  it("is closed by default and shows the greeting message once opened", async () => {
    const user = userEvent.setup()
    render(<AIChatWidget />)

    expect(screen.getByRole("button", { name: "Abrir chat con asistente virtual" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Abrir chat con asistente virtual" }))

    expect(
      screen.getByText("¡Hola! Soy el asistente virtual de Adrián. ¿En qué puedo ayudarte hoy?")
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cerrar chat" })).toBeInTheDocument()
  })

  it("sends a message and renders the assistant's successful reply", async () => {
    mockSendChatMessage.mockResolvedValue({ success: true, message: "Respuesta del asistente" })
    const user = userEvent.setup()
    render(<AIChatWidget />)

    await user.click(screen.getByRole("button", { name: "Abrir chat con asistente virtual" }))

    const input = screen.getByPlaceholderText("Escribe un mensaje...")
    await user.type(input, "Hola asistente")
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    expect(screen.getByText("Hola asistente")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("Respuesta del asistente")).toBeInTheDocument()
    })
    expect(mockSendChatMessage).toHaveBeenCalledWith("Hola asistente", expect.any(Array))
  })

  it("shows a fallback error message when the action returns success: false", async () => {
    mockSendChatMessage.mockResolvedValue({ success: false, message: "" })
    const user = userEvent.setup()
    render(<AIChatWidget />)

    await user.click(screen.getByRole("button", { name: "Abrir chat con asistente virtual" }))

    const input = screen.getByPlaceholderText("Escribe un mensaje...")
    await user.type(input, "Mensaje que falla")
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    await waitFor(() => {
      expect(
        screen.getByText("Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.")
      ).toBeInTheDocument()
    })
  })

  it("shows a fallback error message when the action throws", async () => {
    mockSendChatMessage.mockRejectedValue(new Error("network down"))
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const user = userEvent.setup()
    render(<AIChatWidget />)

    await user.click(screen.getByRole("button", { name: "Abrir chat con asistente virtual" }))

    const input = screen.getByPlaceholderText("Escribe un mensaje...")
    await user.type(input, "Mensaje con error de red")
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    await waitFor(() => {
      expect(
        screen.getByText("Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.")
      ).toBeInTheDocument()
    })

    consoleErrorSpy.mockRestore()
  })

  it("does not send empty or whitespace-only messages", async () => {
    const user = userEvent.setup()
    render(<AIChatWidget />)

    await user.click(screen.getByRole("button", { name: "Abrir chat con asistente virtual" }))

    const input = screen.getByPlaceholderText("Escribe un mensaje...")
    await user.type(input, "   ")
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    expect(mockSendChatMessage).not.toHaveBeenCalled()
  })
})
