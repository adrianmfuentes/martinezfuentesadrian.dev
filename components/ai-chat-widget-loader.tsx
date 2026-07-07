"use client"

import dynamic from "next/dynamic"

const AIChatWidget = dynamic(
  () => import("@components/ai-chat-widget").then((mod) => mod.AIChatWidget),
  { ssr: false }
)

interface AIChatWidgetLoaderProps {
  readonly dictionary?: {
    chatTitle?: string
    chatPlaceholder?: string
    chatSend?: string
  }
}

export function AIChatWidgetLoader({ dictionary }: AIChatWidgetLoaderProps) {
  return <AIChatWidget dictionary={dictionary} />
}
