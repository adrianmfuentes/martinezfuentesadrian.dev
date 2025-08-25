"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, X, Send, Loader2, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { sendChatMessage } from "@/app/actions/chat"
import { type FC } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AIChatWidgetProps {
  dictionary?: {
    chatTitle?: string
    chatPlaceholder?: string
    chatSend?: string
  }
}
export const AIChatWidget: FC<Readonly<AIChatWidgetProps>> = ({ dictionary }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy el asistente virtual de Adrián. ¿En qué puedo ayudarte hoy?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { theme } = useTheme()

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])

    try {
      // Send message to AI and get response
      const response = await sendChatMessage(userMessage, messages)

      if (response.success) {
        // Add AI response to chat
        setMessages((prev) => [...prev, { role: "assistant", content: response.message }])
      } else {
        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.",
          },
        ])
      }
    } catch (error) {
      console.error("Chat error:", error)
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat toggle button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50"
        aria-label={isOpen ? "Cerrar chat" : "Abrir chat con asistente virtual"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>

      {/* Chat widget */}
      <div
        className={cn(
          "fixed bottom-20 right-4 w-80 md:w-96 z-50 transition-all duration-300 ease-in-out transform",
          isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none",
        )}
      >
        <Card className="border shadow-lg">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b">
            <CardTitle className="text-sm font-medium flex items-center">
              <Bot className="h-4 w-4 mr-2" />
              {dictionary?.chatTitle || "Asistente Virtual"}
            </CardTitle>
          </CardHeader>
          <ScrollArea ref={scrollAreaRef} className="h-[350px] px-4 py-4" type="always">
            <div className="space-y-4">
              {messages.map((message, index) => {
                const key = `${message.role}-${message.content}-${index}`;
                return (
                  <div key={key} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 max-w-[80%] text-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground ml-auto" 
                          : "bg-muted" 
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[80%]",
                      theme === "dark" ? "bg-muted" : "bg-muted/50 border",
                    )}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <CardFooter className="p-3 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex w-full items-center space-x-2"
            >
              <Input
                ref={inputRef}
                placeholder={dictionary?.chatPlaceholder ?? "Escribe un mensaje..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading ?? !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">{dictionary?.chatSend ?? "Enviar"}</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
