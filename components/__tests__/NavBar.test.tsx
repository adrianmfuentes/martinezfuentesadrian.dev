import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Navbar } from "@/components/NavBar"

const mockPush = vi.fn()
let mockPathname = "/en"

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: vi.fn() }),
  useParams: () => ({ lang: "en" }),
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

describe("Navbar", () => {
  beforeEach(() => {
    mockPathname = "/en"
    mockPush.mockClear()
  })

  it("renders all navigation links with the correct locale-prefixed hrefs", () => {
    render(<Navbar lang="en" dictionary={dictionary} commandDictionary={commandDictionary} />)

    expect(screen.getAllByRole("link", { name: "Ir a Home" })[0]).toHaveAttribute("href", "/en")
    expect(screen.getAllByRole("link", { name: "Ir a About" })[0]).toHaveAttribute("href", "/en/about")
    expect(screen.getAllByRole("link", { name: "Ir a CV" })[0]).toHaveAttribute("href", "/en/cv")
    expect(screen.getAllByRole("link", { name: "Ir a Portfolio" })[0]).toHaveAttribute("href", "/en/portfolio")
    expect(screen.getAllByRole("link", { name: "Ir a Blog" })[0]).toHaveAttribute("href", "/en/blog")
    expect(screen.getAllByRole("link", { name: "Ir a Contact" })[0]).toHaveAttribute("href", "/en/contact")
    expect(screen.getAllByRole("link", { name: "Ir a Tools" })[0]).toHaveAttribute("href", "/en/tools")
  })

  it("highlights the active link based on the current pathname", () => {
    mockPathname = "/en/about"
    render(<Navbar lang="en" dictionary={dictionary} commandDictionary={commandDictionary} />)

    const aboutLinks = screen.getAllByRole("link", { name: "Ir a About" })
    expect(aboutLinks[0]).toHaveClass("text-primary")

    const homeLinks = screen.getAllByRole("link", { name: "Ir a Home" })
    expect(homeLinks[0]).toHaveClass("text-foreground/80")
  })

  it("toggles the mobile menu when the menu button is clicked", () => {
    render(<Navbar lang="en" dictionary={dictionary} commandDictionary={commandDictionary} />)

    const toggleButton = screen.getByRole("button", { name: "Abrir menú de navegación" })
    expect(screen.getAllByRole("link", { name: "Ir a About" })).toHaveLength(1)

    fireEvent.click(toggleButton)

    expect(screen.getByRole("button", { name: "Cerrar menú de navegación" })).toBeInTheDocument()
    expect(screen.getAllByRole("link", { name: "Ir a About" })).toHaveLength(2)
  })

  it("closes the mobile menu when a nav link is clicked", () => {
    render(<Navbar lang="en" dictionary={dictionary} commandDictionary={commandDictionary} />)

    fireEvent.click(screen.getByRole("button", { name: "Abrir menú de navegación" }))
    expect(screen.getAllByRole("link", { name: "Ir a About" })).toHaveLength(2)

    const mobileAboutLink = screen.getAllByRole("link", { name: "Ir a About" })[1]
    fireEvent.click(mobileAboutLink)

    expect(screen.getByRole("button", { name: "Abrir menú de navegación" })).toBeInTheDocument()
    expect(screen.getAllByRole("link", { name: "Ir a About" })).toHaveLength(1)
  })
})
