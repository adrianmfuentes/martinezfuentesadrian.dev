import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
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
    useReducedMotion: () => false,
  }
})

const dictionary = {
  title: "Portfolio",
  subtitle: "My projects",
  viewProject: "View project",
  viewCode: "View code",
  featured: "Featured Project",
  status: {
    online: "Live",
    offline: "Demo offline",
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
  it("renders the section title, subtitle and every project without tabs", () => {
    render(<PortfolioSection dictionary={dictionary} />)
    expect(screen.getByText(dictionary.title)).toBeInTheDocument()
    expect(screen.getByText(dictionary.subtitle)).toBeInTheDocument()

    expect(screen.getByText("WiChat")).toBeInTheDocument()
    expect(screen.getByText("DLP Compiler")).toBeInTheDocument()
    expect(screen.getByText("SGDB")).toBeInTheDocument()
    expect(screen.getByText("SVAES")).toBeInTheDocument()
    expect(screen.getByText("HTTP Server")).toBeInTheDocument()
    expect(screen.getByText("NutritionAI")).toBeInTheDocument()

    expect(screen.queryAllByRole("tab")).toHaveLength(0)
  })

  it("marks the flagship project as featured", () => {
    render(<PortfolioSection dictionary={dictionary} />)

    expect(screen.getByText(dictionary.featured)).toBeInTheDocument()
    expect(screen.getByText("SVAES")).toBeInTheDocument()
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

  it("shows a live-status badge only for projects with a known demo status", () => {
    render(
      <PortfolioSection
        dictionary={dictionary}
        statuses={{
          "https://svaes.amfserver.duckdns.org/": "online",
          "https://novacode.amfserver.duckdns.org/": "offline",
        }}
      />
    )

    expect(screen.getByText(dictionary.status.online)).toBeInTheDocument()
    expect(screen.getByText(dictionary.status.offline)).toBeInTheDocument()
  })

  it("hides the status badge when no status data is available for a project", () => {
    render(<PortfolioSection dictionary={dictionary} />)

    expect(screen.queryByText(dictionary.status.online)).not.toBeInTheDocument()
    expect(screen.queryByText(dictionary.status.offline)).not.toBeInTheDocument()
  })
})
