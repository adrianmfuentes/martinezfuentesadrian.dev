import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LanguageSwitcher } from "@/components/language-switcher"

const mockPush = vi.fn()
let mockPathname = "/en/about"

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: vi.fn() }),
  useParams: () => ({ lang: "en" }),
}))

beforeEach(() => {
  mockPush.mockClear()
  mockPathname = "/en/about"
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

describe("LanguageSwitcher", () => {
  it("renders both locale options once opened", async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher currentLang="en" />)

    await user.click(screen.getByRole("button"))

    expect(await screen.findByText("English")).toBeInTheDocument()
    expect(screen.getByText("Español")).toBeInTheDocument()
  })

  it("navigates to the equivalent /es path when Español is clicked from /en/about", async () => {
    mockPathname = "/en/about"
    const user = userEvent.setup()
    render(<LanguageSwitcher currentLang="en" />)

    await user.click(screen.getByRole("button"))
    await user.click(await screen.findByText("Español"))

    expect(mockPush).toHaveBeenCalledWith("/es/about")
  })

  it("navigates to the equivalent /en path when English is clicked from /es/portfolio", async () => {
    mockPathname = "/es/portfolio"
    const user = userEvent.setup()
    render(<LanguageSwitcher currentLang="es" />)

    await user.click(screen.getByRole("button"))
    await user.click(await screen.findByText("English"))

    expect(mockPush).toHaveBeenCalledWith("/en/portfolio")
  })

  it("navigates to the bare locale root when current path has no sub-path", async () => {
    mockPathname = "/en"
    const user = userEvent.setup()
    render(<LanguageSwitcher currentLang="en" />)

    await user.click(screen.getByRole("button"))
    await user.click(await screen.findByText("Español"))

    expect(mockPush).toHaveBeenCalledWith("/es/")
  })

  it("applies the highlighted class to the currently active locale item", async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher currentLang="es" />)

    await user.click(screen.getByRole("button"))

    const spanishItem = (await screen.findByText("Español")).closest('[role="menuitem"]')
    const englishItem = screen.getByText("English").closest('[role="menuitem"]')

    expect(spanishItem).toHaveClass("bg-muted")
    expect(englishItem).not.toHaveClass("bg-muted")
  })
})
