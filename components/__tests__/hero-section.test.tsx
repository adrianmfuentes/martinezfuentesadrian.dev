import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { HeroSection } from "@components/hero-section"

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
  greeting: "Hi, I'm",
  title: "Adrian Martinez",
  subtitle: "Software Engineer",
  cta: "View my work",
}

const stats = {
  yearsStudying: "4+",
  projectsCompleted: "15+",
  certifications: "8+",
  yearsExperience: "2+",
  techstack: "React / Node",
}

function renderHero(overrides: Partial<Parameters<typeof HeroSection>[0]> = {}) {
  return render(
    <HeroSection
      dictionary={dictionary}
      stats={stats}
      lang="en"
      contactLabel="Contact me"
      cvLabel="View CV"
      {...overrides}
    />
  )
}

describe("HeroSection", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("renders greeting, title and subtitle", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => ({ commits: 0, repos: 0 }) }))
    renderHero()

    expect(screen.getByText(dictionary.greeting)).toBeInTheDocument()
    expect(screen.getByText(dictionary.title)).toBeInTheDocument()
    expect(screen.getByText(dictionary.subtitle)).toBeInTheDocument()
  })

  it("renders the techstack, projects and certifications stat cards", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => ({ commits: 0, repos: 0 }) }))
    renderHero()

    expect(screen.getByText(stats.techstack)).toBeInTheDocument()
    expect(screen.getByText(stats.projectsCompleted)).toBeInTheDocument()
    expect(screen.getByText(stats.certifications)).toBeInTheDocument()
  })

  it("shows a '...' placeholder for the github stat before the fetch resolves", () => {
    let resolveFetch: (value: unknown) => void = () => {}
    const pending = new Promise((resolve) => {
      resolveFetch = resolve
    })
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending))

    renderHero()

    expect(screen.getByText("...")).toBeInTheDocument()

    resolveFetch({ json: async () => ({ commits: 1234, repos: 42 }) })
  })

  it("renders the formatted github commit count once the fetch resolves", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => ({ commits: 1234, repos: 42 }) })
    )

    renderHero()

    await waitFor(() => {
      expect(screen.getByText(`+${(1234).toLocaleString()} commits`)).toBeInTheDocument()
    })
  })

  it("leaves the github stat as '...' when the fetch rejects, without crashing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))

    renderHero()

    // Give the rejected promise's .catch(() => {}) a tick to run.
    await waitFor(() => {
      expect(screen.getByText(dictionary.title)).toBeInTheDocument()
    })
    expect(screen.getByText("...")).toBeInTheDocument()
  })

  it("renders three CTA links pointing to portfolio, contact and cv routes", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => ({ commits: 0, repos: 0 }) }))
    renderHero({ lang: "es" })

    expect(screen.getByRole("link", { name: new RegExp(dictionary.cta) })).toHaveAttribute(
      "href",
      "/es/portfolio"
    )
    expect(screen.getByRole("link", { name: /Contact me/ })).toHaveAttribute("href", "/es/contact")
    expect(screen.getByRole("link", { name: /View CV/ })).toHaveAttribute("href", "/es/cv")
  })
})
