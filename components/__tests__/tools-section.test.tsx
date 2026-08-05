import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ToolsSection } from "@components/tools-section"

vi.mock("next/navigation", () => ({
  useParams: () => ({ lang: "en" }),
}))

const dictionary = {
  title: "Tools",
  subtitle: "Security & dev utilities",
  description: "A collection of tools I built.",
  comingSoon: "Coming soon",
  launchTool: "Launch tool",
  stats: "Usage stats",
  api: "API docs",
  categories: {
    security: "Security",
    development: "Development",
    networking: "Networking",
    analysis: "Analysis",
  },
  items: [
    {
      id: "password-checker",
      name: "Password Checker",
      description: "Checks password strength.",
      category: "security",
      status: "active",
    },
    {
      id: "port-scanner",
      name: "Port Scanner",
      description: "Scans open ports.",
      category: "networking",
      status: "coming-soon",
    },
    {
      id: "web-discovery",
      name: "Web Discovery",
      description: "Discovers web assets.",
      category: "analysis",
      status: "active",
    },
  ],
}

describe("ToolsSection", () => {
  it("renders the header content", () => {
    render(<ToolsSection dictionary={dictionary} />)
    expect(screen.getByText(dictionary.title)).toBeInTheDocument()
    expect(screen.getByText(dictionary.subtitle)).toBeInTheDocument()
    expect(screen.getByText(dictionary.description)).toBeInTheDocument()
  })

  it("renders every tool's name, description and category badge", () => {
    render(<ToolsSection dictionary={dictionary} />)

    // Each tool renders twice: once in the compact mobile list, once in the
    // desktop card grid — both live in the DOM simultaneously and are toggled
    // with responsive CSS (jsdom doesn't evaluate media queries).
    for (const tool of dictionary.items) {
      expect(screen.getAllByText(tool.name)).toHaveLength(2)
      expect(screen.getAllByText(tool.description)).toHaveLength(2)
    }

    expect(screen.getByText(dictionary.categories.security)).toBeInTheDocument()
    expect(screen.getByText(dictionary.categories.networking)).toBeInTheDocument()
    expect(screen.getByText(dictionary.categories.analysis)).toBeInTheDocument()
  })

  it("renders a disabled 'coming soon' button with no link for coming-soon tools", () => {
    render(<ToolsSection dictionary={dictionary} />)

    const comingSoonButtons = screen.getAllByRole("button", { name: new RegExp(dictionary.comingSoon) })
    expect(comingSoonButtons).toHaveLength(1)
    expect(comingSoonButtons[0]).toBeDisabled()

    // Port Scanner is coming-soon: it must not be wrapped in a link.
    expect(screen.queryByRole("link", { name: /Port Scanner/ })).not.toBeInTheDocument()
  })

  it("renders a launch link with the correct href for active tools", () => {
    render(<ToolsSection dictionary={dictionary} />)

    const launchLinks = screen.getAllByRole("link", { name: new RegExp(dictionary.launchTool) })
    expect(launchLinks).toHaveLength(2)

    const hrefs = launchLinks.map((link) => link.getAttribute("href"))
    expect(hrefs).toContain("/en/tools/password-checker")
    expect(hrefs).toContain("/en/tools/web-discovery")
  })
})
