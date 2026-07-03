import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeToggle } from "@/components/theme-toggle"

const mockSetTheme = vi.fn()

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: mockSetTheme }),
}))

const dictionary = { darkMode: "Dark mode", lightMode: "Light mode" }

beforeEach(() => {
  mockSetTheme.mockClear()
  // Radix dropdown/popover primitives rely on pointer capture APIs
  // that jsdom does not implement.
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {}
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
  }
})

describe("ThemeToggle", () => {
  it("renders a trigger button with a toggle theme label", () => {
    render(<ThemeToggle dictionary={dictionary} />)
    expect(screen.getByRole("button")).toBeInTheDocument()
    expect(screen.getByText("Toggle theme")).toBeInTheDocument()
  })

  it("calls setTheme('light') when the light mode item is clicked", async () => {
    const user = userEvent.setup()
    render(<ThemeToggle dictionary={dictionary} />)

    await user.click(screen.getByRole("button"))
    const lightItem = await screen.findByText("Light mode")
    await user.click(lightItem)

    expect(mockSetTheme).toHaveBeenCalledWith("light")
  })

  it("calls setTheme('dark') when the dark mode item is clicked", async () => {
    const user = userEvent.setup()
    render(<ThemeToggle dictionary={dictionary} />)

    await user.click(screen.getByRole("button"))
    const darkItem = await screen.findByText("Dark mode")
    await user.click(darkItem)

    expect(mockSetTheme).toHaveBeenCalledWith("dark")
  })
})
