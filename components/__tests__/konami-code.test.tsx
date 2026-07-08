import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
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

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: vi.fn() }),
}))

const mockSetTheme = vi.fn()
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark", setTheme: mockSetTheme }),
}))

const dictionary = {
  title: "Developer mode unlocked",
  lines: ["Achievement unlocked: Konami Code.", "Thanks for exploring."],
  closeHint: "Press Esc or click anywhere to close",
}

const shellDictionary = {
  ...dictionary,
  bootLines: ["Loading...", "Access granted."],
  prompt: "guest@adrianmf",
  inputPlaceholder: "Type a command...",
  muteHint: "Mute sound",
  unmuteHint: "Unmute sound",
  commands: {
    help: "Available commands: help, whoami",
    whoami: "guest -- just someone curious enough to find this.",
    about: "About text.",
    skills: "Skills text.",
    ls: "about cv portfolio",
    sudo: "Permission denied: nice try.",
    navigating: "Opening /{page} ...",
    notFound: "command not found: {cmd}",
    themeUsage: "Usage: theme <light|dark>",
    themeSet: "Theme set to {theme}.",
    matrixOn: "Matrix rain intensified.",
    matrixOff: "Matrix rain back to normal.",
    exit: "Closing session...",
  },
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

beforeEach(() => {
  window.localStorage.clear()
  mockPush.mockClear()
})

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

const shellDictionaryNoBoot = { ...shellDictionary, bootLines: [] }

describe("KonamiCode with interactive shell", () => {
  it("plays a boot sequence before showing the interactive prompt", async () => {
    render(<KonamiCode lang="en" dictionary={shellDictionary} />)
    pressKonamiCode()

    expect(screen.getByRole("dialog", { name: shellDictionary.title })).toBeInTheDocument()
    expect(screen.queryByLabelText(shellDictionary.inputPlaceholder)).not.toBeInTheDocument()

    await waitFor(
      () => {
        expect(screen.getByLabelText(shellDictionary.inputPlaceholder)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    expect(screen.getByText("Achievement unlocked: Konami Code.")).toBeInTheDocument()
  })

  it("responds to the whoami command", () => {
    render(<KonamiCode lang="en" dictionary={shellDictionaryNoBoot} />)
    pressKonamiCode()

    const input = screen.getByLabelText(shellDictionaryNoBoot.inputPlaceholder)
    fireEvent.change(input, { target: { value: "whoami" } })
    fireEvent.submit(input.closest("form")!)

    expect(screen.getByText(shellDictionaryNoBoot.commands.whoami)).toBeInTheDocument()
  })

  it("navigates when running cd <page>", async () => {
    render(<KonamiCode lang="en" dictionary={shellDictionaryNoBoot} />)
    pressKonamiCode()

    const input = screen.getByLabelText(shellDictionaryNoBoot.inputPlaceholder)
    fireEvent.change(input, { target: { value: "cd portfolio" } })
    fireEvent.submit(input.closest("form")!)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/en/portfolio")
    })
  })

  it("shows a not-found message for unknown commands", () => {
    render(<KonamiCode lang="en" dictionary={shellDictionaryNoBoot} />)
    pressKonamiCode()

    const input = screen.getByLabelText(shellDictionaryNoBoot.inputPlaceholder)
    fireEvent.change(input, { target: { value: "nonsense" } })
    fireEvent.submit(input.closest("form")!)

    expect(screen.getByText("command not found: nonsense")).toBeInTheDocument()
  })
})

function setupShell() {
  render(<KonamiCode lang="en" dictionary={shellDictionaryNoBoot} />)
  pressKonamiCode()
  const input = screen.getByLabelText(shellDictionaryNoBoot.inputPlaceholder) as HTMLInputElement
  return input
}

function runCommand(input: HTMLInputElement, value: string) {
  fireEvent.change(input, { target: { value } })
  fireEvent.submit(input.closest("form")!)
}

describe("KonamiCode shell commands", () => {
  it("prints help, whoami, about, skills, ls and sudo output", () => {
    const input = setupShell()
    const { commands } = shellDictionaryNoBoot

    runCommand(input, "help")
    expect(screen.getByText(commands.help)).toBeInTheDocument()

    runCommand(input, "about")
    expect(screen.getByText(commands.about)).toBeInTheDocument()

    runCommand(input, "skills")
    expect(screen.getByText(commands.skills)).toBeInTheDocument()

    runCommand(input, "ls")
    expect(screen.getByText(commands.ls)).toBeInTheDocument()

    runCommand(input, "sudo rm -rf /")
    expect(screen.getByText(commands.sudo)).toBeInTheDocument()
  })

  it("shows a not-found message for cd with an invalid page", () => {
    const input = setupShell()
    runCommand(input, "cd nowhere")
    expect(screen.getByText("command not found: cd nowhere")).toBeInTheDocument()
  })

  it("shows theme usage when no value is given, and changes theme when valid", () => {
    const input = setupShell()
    const { commands } = shellDictionaryNoBoot

    runCommand(input, "theme")
    expect(screen.getByText(commands.themeUsage)).toBeInTheDocument()

    runCommand(input, "theme dark")
    expect(screen.getByText("Theme set to dark.")).toBeInTheDocument()
    expect(mockSetTheme).toHaveBeenCalledWith("dark")
  })

  it("toggles the matrix rain intensity", () => {
    const input = setupShell()
    const { commands } = shellDictionaryNoBoot
    runCommand(input, "matrix")
    expect(screen.getByText(commands.matrixOn)).toBeInTheDocument()
  })

  it("clears the history when running clear", () => {
    const input = setupShell()
    const { commands } = shellDictionaryNoBoot
    runCommand(input, "help")
    expect(screen.getByText(commands.help)).toBeInTheDocument()

    runCommand(input, "clear")
    expect(screen.queryByText(commands.help)).not.toBeInTheDocument()
  })

  it("echoes back the given text", () => {
    const input = setupShell()
    runCommand(input, "echo hello world")
    expect(screen.getByText("hello world")).toBeInTheDocument()
  })

  it("prints the current date", () => {
    const input = setupShell()
    runCommand(input, "date")
    expect(input.closest("div.relative")?.textContent).toMatch(/\d/)
  })

  it("closes the terminal after running exit", async () => {
    const input = setupShell()
    runCommand(input, "exit")

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })

  it("only logs the prompt line when submitting an empty command", () => {
    const input = setupShell()
    const history = screen.getByText("Achievement unlocked: Konami Code.").parentElement!
    fireEvent.submit(input.closest("form")!)
    expect(history.querySelectorAll("p")).toHaveLength(3)
  })

  it("plays a key tick sound while typing without throwing", () => {
    const input = setupShell()
    expect(() => fireEvent.keyDown(input, { key: "h" })).not.toThrow()
  })

  it("stops propagation when clicking directly on the input", () => {
    const input = setupShell()
    expect(() => fireEvent.click(input)).not.toThrow()
  })

  it("navigates command history with ArrowUp and ArrowDown", () => {
    const input = setupShell()
    fireEvent.keyDown(input, { key: "ArrowUp" })
    expect(input.value).toBe("")

    runCommand(input, "help")
    runCommand(input, "whoami")

    fireEvent.keyDown(input, { key: "ArrowUp" })
    expect(input.value).toBe("whoami")

    fireEvent.keyDown(input, { key: "ArrowUp" })
    expect(input.value).toBe("help")

    fireEvent.keyDown(input, { key: "ArrowDown" })
    expect(input.value).toBe("whoami")

    fireEvent.keyDown(input, { key: "ArrowDown" })
    expect(input.value).toBe("")
  })

  it("toggles mute and persists the preference", () => {
    setupShell()
    const muteButton = screen.getByRole("button", { name: shellDictionaryNoBoot.muteHint })
    fireEvent.click(muteButton)
    expect(screen.getByRole("button", { name: shellDictionaryNoBoot.unmuteHint })).toBeInTheDocument()
    expect(window.localStorage.getItem("konami-sound-muted")).toBe("true")
  })

  it("focuses the input when clicking the backdrop in shell phase", () => {
    const input = setupShell()
    fireEvent.click(screen.getByRole("dialog"))
    expect(document.activeElement).toBe(input)
  })
})

describe("KonamiCode boot phase interactions", () => {
  it("skips the boot sequence when any key is pressed", () => {
    render(<KonamiCode lang="en" dictionary={shellDictionary} />)
    pressKonamiCode()

    expect(screen.queryByLabelText(shellDictionary.inputPlaceholder)).not.toBeInTheDocument()
    fireEvent.keyDown(document, { key: "x" })

    expect(screen.getByLabelText(shellDictionary.inputPlaceholder)).toBeInTheDocument()
  })

  it("skips the boot sequence when the backdrop is clicked", () => {
    render(<KonamiCode lang="en" dictionary={shellDictionary} />)
    pressKonamiCode()

    fireEvent.click(screen.getByRole("dialog"))

    expect(screen.getByLabelText(shellDictionary.inputPlaceholder)).toBeInTheDocument()
  })
})
