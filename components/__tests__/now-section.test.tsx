import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { NowSection } from "@components/now-section"

const dictionary = {
  title: "Right now",
  building: "Currently building",
  latestPost: "Latest post",
}

describe("NowSection", () => {
  it("renders nothing when there is neither a featured project nor a latest post", () => {
    const { container } = render(<NowSection dictionary={dictionary} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders the featured project card with a link to the portfolio", () => {
    render(<NowSection dictionary={dictionary} building={{ title: "SVAES", href: "/en/portfolio" }} />)

    expect(screen.getByText(dictionary.building)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "SVAES" })).toHaveAttribute("href", "/en/portfolio")
    expect(screen.queryByText(dictionary.latestPost)).not.toBeInTheDocument()
  })

  it("renders the latest post card with a link to the post", () => {
    render(
      <NowSection
        dictionary={dictionary}
        latestPost={{ title: "Building SVAES", href: "/en/blog/building-svaes-my-thesis-project" }}
      />
    )

    expect(screen.getByText(dictionary.latestPost)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Building SVAES" })).toHaveAttribute(
      "href",
      "/en/blog/building-svaes-my-thesis-project"
    )
  })
})
