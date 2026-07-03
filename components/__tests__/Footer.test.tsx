import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Footer } from "@/components/Footer"

const dictionary = { rights: "All rights reserved" }

describe("Footer", () => {
  it("renders the brand link pointing to the locale home", () => {
    render(<Footer lang="en" dictionary={dictionary} />)
    const brandLink = screen.getByRole("link", { name: /Adrián Martínez/i })
    expect(brandLink).toHaveAttribute("href", "/en")
  })

  it("renders the current year and rights text in the copyright line", () => {
    render(<Footer lang="es" dictionary={dictionary} />)
    const currentYear = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument()
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument()
  })

  it("renders social links with correct hrefs and accessible labels", () => {
    render(<Footer lang="en" dictionary={dictionary} />)

    const github = screen.getByRole("link", { name: /GitHub/i })
    expect(github).toHaveAttribute("href", "https://github.com/adrianmfuentes")
    expect(github).toHaveAttribute("target", "_blank")
    expect(github).toHaveAttribute("rel", "noopener noreferrer")

    const linkedin = screen.getByRole("link", { name: /LinkedIn/i })
    expect(linkedin).toHaveAttribute("href", "https://linkedin.com/in/adrianmfuentes")

    const email = screen.getByRole("link", { name: /Email/i })
    expect(email).toHaveAttribute("href", "mailto:amf13azul@gmail.com")
  })
})
