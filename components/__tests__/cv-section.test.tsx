import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CVSection } from "@components/cv-section"

// CVSection lazily loads the certificate viewer via next/dynamic. We don't
// need to test the viewer itself here, so stub the dynamic import target
// directly rather than mocking next/dynamic's loader machinery.
vi.mock("@components/certificate-viewer.client", () => ({
  default: () => null,
}))

const dictionary = {
  title: "Curriculum",
  subtitle: "My experience",
  download: "Download CV",
  view_online: "View online",
  involvement: "Involvement",
  about_grade: "About my grade",
  tabs: {
    education: "Education",
    certifications: "Certifications",
    experience: "Experience",
  },
  education: {
    items: [
      {
        title: "BSc Software Engineering",
        organization: "University of Oviedo",
        period: "2020 - 2024",
        gpa: "8.5",
        honours: "Cum Laude",
        description: "Focused on distributed systems and security.",
      },
    ],
  },
  certifications: {
    items: [
      {
        title: "AWS Certified Developer",
        organization: "Amazon",
        period: "2023",
        description: "Cloud development certification.",
      },
    ],
  },
  experience: {
    items: [
      {
        title: "Software Engineer Intern",
        organization: "Acme Corp",
        location: "Remote",
        period: "2023 - 2024",
        department: "Engineering",
        description: ["Built internal tools", "Improved test coverage"],
      },
    ],
  },
}

describe("CVSection", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders the section title and subtitle", () => {
    render(<CVSection dictionary={dictionary} lang="en" />)
    expect(screen.getByText(dictionary.title)).toBeInTheDocument()
    expect(screen.getByText(dictionary.subtitle)).toBeInTheDocument()
  })

  it("opens the English CV pdf in a new tab when the download button is clicked", () => {
    const openSpy = vi.spyOn(globalThis, "open").mockImplementation(() => null)
    render(<CVSection dictionary={dictionary} lang="en" />)

    fireEvent.click(screen.getByRole("button", { name: new RegExp(dictionary.download) }))

    expect(openSpy).toHaveBeenCalledWith(`${globalThis.location.origin}/cv/cv_en.pdf`, "_blank")
  })

  it("opens the Spanish CV pdf in a new tab when lang is 'es'", () => {
    const openSpy = vi.spyOn(globalThis, "open").mockImplementation(() => null)
    render(<CVSection dictionary={dictionary} lang="es" />)

    fireEvent.click(screen.getByRole("button", { name: new RegExp(dictionary.download) }))

    expect(openSpy).toHaveBeenCalledWith(`${globalThis.location.origin}/cv/cv_es.pdf`, "_blank")
  })

  it("shows the education tab content by default", () => {
    render(<CVSection dictionary={dictionary} lang="en" />)
    expect(screen.getByText("BSc Software Engineering")).toBeInTheDocument()
    expect(screen.getByText("University of Oviedo")).toBeInTheDocument()
    expect(screen.getByText(/GPA: 8.5/)).toBeInTheDocument()
    expect(screen.getByText("Cum Laude")).toBeInTheDocument()
  })

  it("renders a string description as a paragraph on the certifications tab", async () => {
    const user = userEvent.setup()
    render(<CVSection dictionary={dictionary} lang="en" />)

    await user.click(screen.getByRole("tab", { name: dictionary.tabs.certifications }))

    const description = screen.getByText("Cloud development certification.")
    expect(description).toBeInTheDocument()
    expect(description.tagName).toBe("P")
    expect(screen.getByText("AWS Certified Developer")).toBeInTheDocument()
  })

  it("renders an array description as a list on the experience tab", async () => {
    const user = userEvent.setup()
    render(<CVSection dictionary={dictionary} lang="en" />)

    await user.click(screen.getByRole("tab", { name: dictionary.tabs.experience }))

    expect(screen.getByText("Software Engineer Intern")).toBeInTheDocument()
    expect(screen.getByText("Acme Corp")).toBeInTheDocument()
    expect(screen.getByText("Remote")).toBeInTheDocument()
    expect(screen.getByText("Engineering")).toBeInTheDocument()

    const item1 = screen.getByText("Built internal tools")
    const item2 = screen.getByText("Improved test coverage")
    expect(item1.tagName).toBe("LI")
    expect(item2.tagName).toBe("LI")
    expect(screen.getByText(dictionary.involvement)).toBeInTheDocument()
  })

  it("switches visible content when navigating between tabs", async () => {
    const user = userEvent.setup()
    render(<CVSection dictionary={dictionary} lang="en" />)

    // Education content visible by default.
    expect(screen.getByText("BSc Software Engineering")).toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: dictionary.tabs.experience }))
    expect(screen.getByText("Software Engineer Intern")).toBeInTheDocument()
  })
})
