import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { AIChatWidgetLoader } from "@components/ai-chat-widget-loader"

// AIChatWidgetLoader lazily loads AIChatWidget via next/dynamic. We don't need
// to test the widget itself here (see ai-chat-widget.test.tsx), so stub the
// dynamic import target directly rather than mocking next/dynamic's machinery.
vi.mock("@components/ai-chat-widget", () => ({
  AIChatWidget: ({ dictionary }: { dictionary?: { chatTitle?: string } }) => (
    <div data-testid="ai-chat-widget">{dictionary?.chatTitle ?? "no-dictionary"}</div>
  ),
}))

describe("AIChatWidgetLoader", () => {
  it("lazily renders the AIChatWidget and forwards the dictionary prop", async () => {
    render(<AIChatWidgetLoader dictionary={{ chatTitle: "Chat with me" }} />)
    expect(await screen.findByTestId("ai-chat-widget")).toHaveTextContent("Chat with me")
  })

  it("renders without a dictionary prop", async () => {
    render(<AIChatWidgetLoader />)
    expect(await screen.findByTestId("ai-chat-widget")).toHaveTextContent("no-dictionary")
  })
})
