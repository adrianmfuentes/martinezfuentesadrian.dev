import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { PortfolioSection } from "@components/portfolio-section"

vi.mock("framer-motion", () => {
  const React = require("react")
  const cache = new Map<string, ReturnType<typeof React.forwardRef>>()
  const passthrough = (Tag: string) => {
    if (!cache.has(Tag)) {
      const Component = React.forwardRef((props: any, ref: any) => {
        const { children, ...rest } = props
        const { initial, animate, exit, transition, whileHover, whileTap, whileInView, viewport, variants, ...domProps } = rest
        return React.createElement(Tag, { ...domProps, ref }, children)
      })
      Component.displayName = `motion.${Tag}`
      cache.set(Tag, Component)
    }
    return cache.get(Tag)
  }
  return {
    motion: new Proxy({}, { get: (_, tag: string) => passthrough(tag) }),
    AnimatePresence: ({ children }: any) => children,
  }
})

const dictionary = {
  title: "Portfolio",
  subtitle: "My projects",
  viewProject: "View project",
  viewCode: "View code",
  categories: {
    all: "All",
    design: "Design",
    web: "Web",
    system: "System",
    data: "Data",
    game: "Game",
  },
  projects: {
    "1": { title: "WiChat", description: "A quiz game app" },
    "2": { title: "DLP Compiler", description: "A design language processor" },
    "3": { title: "SGDB", description: "A database engine" },
    "6": { title: "SVAES", description: "A software delivery verification system" },
    "8": { title: "HTTP Server", description: "A C++ HTTP server" },
    "10": { title: "NutritionAI", description: "An AI nutrition app" },
  },
}

describe("PortfolioSection", () => {
  it("renders the section title, subtitle and all project titles by default", () => {
    render(<PortfolioSection dictionary={dictionary} />)
    expect(screen.getByText(dictionary.title)).toBeInTheDocument()
    expect(screen.getByText(dictionary.subtitle)).toBeInTheDocument()

    expect(screen.getByText("WiChat")).toBeInTheDocument()
    expect(screen.getByText("DLP Compiler")).toBeInTheDocument()
    expect(screen.getByText("SGDB")).toBeInTheDocument()
    expect(screen.getByText("SVAES")).toBeInTheDocument()
    expect(screen.getByText("HTTP Server")).toBeInTheDocument()
    expect(screen.getByText("NutritionAI")).toBeInTheDocument()
  })

  it("renders the category tabs with 'all' selected by default", () => {
    render(<PortfolioSection dictionary={dictionary} />)
    const tabs = screen.getAllByRole("tab")
    expect(tabs).toHaveLength(4)

    const allTab = screen.getByRole("tab", { name: dictionary.categories.all })
    expect(allTab).toHaveAttribute("aria-selected", "true")

    const designTab = screen.getByRole("tab", { name: dictionary.categories.design })
    expect(designTab).toHaveAttribute("aria-selected", "false")
  })

  it("filters projects to only the selected category when a tab is clicked", () => {
    render(<PortfolioSection dictionary={dictionary} />)

    const designTab = screen.getByRole("tab", { name: dictionary.categories.design })
    fireEvent.click(designTab)

    expect(designTab).toHaveAttribute("aria-selected", "true")
    const allTab = screen.getByRole("tab", { name: dictionary.categories.all })
    expect(allTab).toHaveAttribute("aria-selected", "false")

    // Only the "design" category project (DLP Compiler, id "2") should remain.
    expect(screen.getByText("DLP Compiler")).toBeInTheDocument()
    // "WiChat" (web) and "SGDB" (data) should have been filtered out.
    expect(screen.queryByText("WiChat")).not.toBeInTheDocument()
    expect(screen.queryByText("SGDB")).not.toBeInTheDocument()
  })

  it("filters projects to the data category", () => {
    render(<PortfolioSection dictionary={dictionary} />)

    fireEvent.click(screen.getByRole("tab", { name: dictionary.categories.data }))

    expect(screen.getByText("SGDB")).toBeInTheDocument()
    expect(screen.queryByText("SVAES")).not.toBeInTheDocument()
    expect(screen.queryByText("WiChat")).not.toBeInTheDocument()
    expect(screen.queryByText("DLP Compiler")).not.toBeInTheDocument()
  })

  it("renders a 'view project' link only for projects that have a projectUrl", () => {
    render(<PortfolioSection dictionary={dictionary} />)

    // DLP Compiler (id "2") has a projectUrl set.
    expect(
      screen.getByRole("link", { name: `${dictionary.viewProject}: DLP Compiler` })
    ).toHaveAttribute("href", "https://novacode.amfserver.duckdns.org/")

    // WiChat (id "1") has an empty projectUrl, so no "view project" link.
    expect(
      screen.queryByRole("link", { name: `${dictionary.viewProject}: WiChat` })
    ).not.toBeInTheDocument()

    // Every project should still have a "view code" link.
    expect(
      screen.getByRole("link", { name: `${dictionary.viewCode}: WiChat` })
    ).toHaveAttribute("href", "https://github.com/Arquisoft/wichat_en2b")
  })
})
