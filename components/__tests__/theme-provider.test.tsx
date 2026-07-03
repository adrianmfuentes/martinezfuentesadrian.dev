import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ThemeProvider } from "@/components/theme-provider"

describe("ThemeProvider", () => {
  it("renders its children through next-themes' provider", () => {
    render(
      <ThemeProvider attribute="class">
        <span>child content</span>
      </ThemeProvider>
    )
    expect(screen.getByText("child content")).toBeInTheDocument()
  })
})
