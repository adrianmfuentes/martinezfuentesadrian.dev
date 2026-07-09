import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CommandPalette } from "@/components/command-palette"

const mockPush = vi.fn()
let mockPathname = "/en"

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: vi.fn() }),
}))

const dictionary = {
  home: "Home",
  about: "About",
  cv: "CV",
  portfolio: "Portfolio",
  contact: "Contact",
  tools: "Tools",
  blog: "Blog",
}

const commandDictionary = {
  title: "Command Menu",
  description: "Search for a page or run a command.",
  placeholder: "Type a command or search...",
  noResults: "No results found.",
  groupNavigation: "Navigation",
  groupLanguage: "Language",
  switchToEnglish: "English",
  switchToSpanish: "Español",
}

describe("CommandPalette", () => {
  beforeEach(() => {
    mockPathname = "/en"
    mockPush.mockClear()
    // Radix dialog/cmdk primitives rely on pointer capture and scroll APIs
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

  it("is closed by default and opens when the trigger button is clicked", () => {
    render(<CommandPalette lang="en" dictionary={dictionary} commandDictionary={commandDictionary} />)

    expect(screen.queryByPlaceholderText(commandDictionary.placeholder)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: commandDictionary.placeholder }))

    expect(screen.getByPlaceholderText(commandDictionary.placeholder)).toBeInTheDocument()
  })

  it("opens with the Ctrl+K keyboard shortcut", () => {
    render(<CommandPalette lang="en" dictionary={dictionary} commandDictionary={commandDictionary} />)

    fireEvent.keyDown(document, { key: "k", ctrlKey: true })

    expect(screen.getByPlaceholderText(commandDictionary.placeholder)).toBeInTheDocument()
  })

  it("navigates to a page and closes when a navigation item is selected", () => {
    render(<CommandPalette lang="en" dictionary={dictionary} commandDictionary={commandDictionary} />)
    fireEvent.keyDown(document, { key: "k", ctrlKey: true })

    fireEvent.click(screen.getByText(dictionary.portfolio))

    expect(mockPush).toHaveBeenCalledWith("/en/portfolio")
    expect(screen.queryByPlaceholderText(commandDictionary.placeholder)).not.toBeInTheDocument()
  })

  it("switches language while preserving the current path", () => {
    mockPathname = "/en/portfolio"
    render(<CommandPalette lang="en" dictionary={dictionary} commandDictionary={commandDictionary} />)
    fireEvent.keyDown(document, { key: "k", ctrlKey: true })

    fireEvent.click(screen.getByText(commandDictionary.switchToSpanish))

    expect(mockPush).toHaveBeenCalledWith("/es/portfolio")
  })
})
