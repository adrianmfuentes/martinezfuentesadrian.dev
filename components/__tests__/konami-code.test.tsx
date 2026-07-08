import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { KonamiCode } from "@/components/konami-code"

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
  title: "Developer mode unlocked",
  lines: ["Achievement unlocked: Konami Code.", "Thanks for exploring."],
  closeHint: "Press Esc or click anywhere to close",
}

const KONAMI_KEYS = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
]

function pressKonamiCode() {
  for (const key of KONAMI_KEYS) {
    fireEvent.keyDown(document, { key })
  }
}

describe("KonamiCode", () => {
  it("is not shown by default", () => {
    render(<KonamiCode dictionary={dictionary} />)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("shows the overlay after the Konami sequence is entered", () => {
    render(<KonamiCode dictionary={dictionary} />)
    pressKonamiCode()

    expect(screen.getByRole("dialog", { name: dictionary.title })).toBeInTheDocument()
    expect(screen.getByText("Achievement unlocked: Konami Code.")).toBeInTheDocument()
  })

  it("does not show the overlay for an incomplete or wrong sequence", () => {
    render(<KonamiCode dictionary={dictionary} />)
    fireEvent.keyDown(document, { key: "ArrowUp" })
    fireEvent.keyDown(document, { key: "ArrowUp" })
    fireEvent.keyDown(document, { key: "ArrowUp" })

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("closes when Escape is pressed", () => {
    render(<KonamiCode dictionary={dictionary} />)
    pressKonamiCode()
    expect(screen.getByRole("dialog")).toBeInTheDocument()

    fireEvent.keyDown(document, { key: "Escape" })

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("closes when the close button is clicked", () => {
    render(<KonamiCode dictionary={dictionary} />)
    pressKonamiCode()

    fireEvent.click(screen.getByRole("button", { name: dictionary.closeHint }))

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})
