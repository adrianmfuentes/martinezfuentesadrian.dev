import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { BlogSection } from "@/components/blog-section"
import type { BlogPostMeta } from "@/lib/blog"

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
  title: "Blog",
  subtitle: "Thoughts on code, security, and things I'm building",
  empty: "No posts yet — check back soon.",
  minRead: "min read",
}

const posts: BlogPostMeta[] = [
  {
    slug: "building-svaes-my-thesis-project",
    title: "Building SVAES",
    description: "How I designed a multi-tenant verification platform.",
    date: "2026-06-01",
    tags: ["FastAPI", "Rust"],
    readingMinutes: 4,
  },
  {
    slug: "why-i-built-security-tools-into-my-portfolio",
    title: "Why my portfolio has a security tools section",
    description: "Password checkers and port scanners aren't the usual portfolio fare.",
    date: "2026-06-20",
    tags: ["Security"],
    readingMinutes: 3,
  },
]

describe("BlogSection", () => {
  it("renders the title, subtitle, and every post", () => {
    render(<BlogSection lang="en" posts={posts} dictionary={dictionary} />)

    expect(screen.getByText(dictionary.title)).toBeInTheDocument()
    expect(screen.getByText(dictionary.subtitle)).toBeInTheDocument()
    expect(screen.getByText("Building SVAES")).toBeInTheDocument()
    expect(screen.getByText("Why my portfolio has a security tools section")).toBeInTheDocument()
  })

  it("links each post to its detail page", () => {
    render(<BlogSection lang="en" posts={posts} dictionary={dictionary} />)

    expect(screen.getByRole("link", { name: /Building SVAES/ })).toHaveAttribute(
      "href",
      "/en/blog/building-svaes-my-thesis-project"
    )
  })

  it("shows the empty state when there are no posts", () => {
    render(<BlogSection lang="en" posts={[]} dictionary={dictionary} />)
    expect(screen.getByText(dictionary.empty)).toBeInTheDocument()
  })

  it("renders tags for each post", () => {
    render(<BlogSection lang="en" posts={posts} dictionary={dictionary} />)
    expect(screen.getByText("FastAPI")).toBeInTheDocument()
    expect(screen.getByText("Security")).toBeInTheDocument()
  })
})
