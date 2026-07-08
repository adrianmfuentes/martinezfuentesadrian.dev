import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { GithubActivity } from "@/components/github-activity"
import type { GithubActivityItem } from "@/lib/github-activity"

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
  title: "Recent GitHub Activity",
  subtitle: "What I've been building lately",
  viewProfile: "View GitHub profile",
  empty: "No recent public activity.",
  opened: "opened",
  closed: "closed",
  events: {
    push: "Pushed {count} commit(s) to {repo}",
    createRepo: "Created repository {repo}",
    createRef: "Created a branch in {repo}",
    pullRequest: "{action} a pull request in {repo}",
    issue: "{action} an issue in {repo}",
    watch: "Starred {repo}",
    fork: "Forked {repo}",
    release: "Published a release in {repo}",
    default: "Activity in {repo}",
  },
}

const baseItem: GithubActivityItem = {
  id: "1",
  type: "PushEvent",
  repo: "adrianmfuentes/SVAES",
  repoUrl: "https://github.com/adrianmfuentes/SVAES",
  createdAt: new Date().toISOString(),
  commitCount: 3,
}

describe("GithubActivity", () => {
  it("renders nothing when there is no activity", () => {
    const { container } = render(<GithubActivity lang="en" items={[]} dictionary={dictionary} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("describes a push event with the commit count and repo", () => {
    render(<GithubActivity lang="en" items={[baseItem]} dictionary={dictionary} />)
    expect(screen.getByText("Pushed 3 commit(s) to adrianmfuentes/SVAES")).toBeInTheDocument()
  })

  it("describes a pull request event using the action label", () => {
    const item: GithubActivityItem = {
      ...baseItem,
      id: "2",
      type: "PullRequestEvent",
      action: "closed",
    }
    render(<GithubActivity lang="en" items={[item]} dictionary={dictionary} />)
    expect(screen.getByText("closed a pull request in adrianmfuentes/SVAES")).toBeInTheDocument()
  })

  it("links each item to its repository", () => {
    render(<GithubActivity lang="en" items={[baseItem]} dictionary={dictionary} />)
    expect(screen.getByRole("link", { name: /Pushed 3 commit/ })).toHaveAttribute(
      "href",
      "https://github.com/adrianmfuentes/SVAES"
    )
  })
})
