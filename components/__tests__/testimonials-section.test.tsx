import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { TestimonialsSection } from "@components/testimonials-section"

describe("TestimonialsSection", () => {
  it("renders nothing when there are no testimonials yet", () => {
    const { container } = render(
      <TestimonialsSection dictionary={{ title: "What people say", subtitle: "Feedback", items: [] }} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("renders each testimonial's quote, name and role once content is added", () => {
    render(
      <TestimonialsSection
        dictionary={{
          title: "What people say",
          subtitle: "Feedback",
          items: [
            { quote: "Great to work with.", name: "Jane Doe", role: "Engineering Manager" },
            { quote: "Sharp and thorough.", name: "John Smith", role: "Thesis advisor" },
          ],
        }}
      />
    )

    expect(screen.getByText("What people say")).toBeInTheDocument()
    expect(screen.getByText("Great to work with.")).toBeInTheDocument()
    expect(screen.getByText("Jane Doe")).toBeInTheDocument()
    expect(screen.getByText("Engineering Manager")).toBeInTheDocument()
    expect(screen.getByText("Sharp and thorough.")).toBeInTheDocument()
    expect(screen.getByText("John Smith")).toBeInTheDocument()
  })
})
