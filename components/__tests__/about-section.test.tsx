import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { AboutSection } from "@components/about-section"

vi.mock("framer-motion", () => {
  const React = require("react")
  // Cache the generated component per tag/component so `motion.div` (etc.)
  // and `motion.create(Component)` resolve to a stable component identity
  // across renders. Without this, a fresh component minted on every property
  // access would force React to unmount/remount the subtree on every
  // re-render, silently dropping state.
  const cache = new Map<unknown, ReturnType<typeof React.forwardRef>>()
  const makePassthrough = (Tag: unknown) => {
    if (!cache.has(Tag)) {
      const Component = React.forwardRef((props: any, ref: any) => {
        const { children, ...rest } = props
        const { initial, animate, exit, transition, whileHover, whileTap, whileInView, viewport, variants, ...domProps } = rest
        return React.createElement(Tag as any, { ...domProps, ref }, children)
      })
      Component.displayName = `motion.${String(Tag)}`
      cache.set(Tag, Component)
    }
    return cache.get(Tag)
  }
  return {
    motion: new Proxy(
      { create: (Component: unknown) => makePassthrough(Component) },
      { get: (target: any, tag: string) => (tag in target ? target[tag] : makePassthrough(tag)) }
    ),
    AnimatePresence: ({ children }: any) => children,
    useInView: () => true,
  }
})

// next/image with a static import (`backgroundImage`) receives an object,
// not a string, as `src` in real usage. Mock it as a plain <img> passthrough
// so jsdom doesn't choke on the Next.js image loader.
vi.mock("next/image", () => ({
  default: ({ src, alt, ...rest }: any) => {
    const resolvedSrc = typeof src === "string" ? src : src?.src ?? ""
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={resolvedSrc} alt={alt} {...rest} />
  },
}))

function makeDictionary(overrides: Partial<Parameters<typeof AboutSection>[0]["dictionary"]> = {}) {
  return {
    title: "About Me",
    subtitle: "Get to know me",
    birthDate: "2000-01-15",
    bio: [
      "I am {age} years old and I love building things.",
      "This is a second paragraph without the placeholder.",
    ],
    stats: {
      yearsStudying: "4+",
      projectsCompleted: "15+",
      certifications: "8+",
      yearsExperience: "2+",
    },
    education: {
      title: "Education",
      degree: "BSc Software Engineering",
      university: "University of Oviedo",
      period: "2020 - 2024",
    },
    skills: {
      title: "Skills",
      technical: "Technical",
      soft: "Soft",
      technicalSkills: {
        languages: "JavaScript, TypeScript, Python, Java, C++, Go",
        technologies: "Docker, Git",
        frameworks: "React, Next.js",
        versionControl: "Git, GitHub",
        cloud: "AWS, Oracle Cloud",
        databases: "PostgreSQL, MongoDB",
        interests: "Security, AI",
      },
      softSkills: {
        teamwork: "Teamwork",
        problemSolving: "Problem Solving",
        communication: "Communication",
        timeManagement: "Time Management",
        adaptability: "Adaptability",
        leadership: "Leadership",
      },
    },
    ...overrides,
  }
}

describe("AboutSection", () => {
  it("renders the title, subtitle and computed age injected into bio paragraphs", () => {
    const dictionary = makeDictionary({ birthDate: "2000-01-15" })
    render(<AboutSection dictionary={dictionary} />)

    expect(screen.getByText(dictionary.title)).toBeInTheDocument()
    expect(screen.getByText(dictionary.subtitle)).toBeInTheDocument()

    // Compute expected age the same way the component does.
    const today = new Date()
    const birth = new Date("2000-01-15")
    let expectedAge = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      expectedAge--
    }

    expect(
      screen.getByText(`I am ${expectedAge} years old and I love building things.`)
    ).toBeInTheDocument()
    expect(
      screen.getByText("This is a second paragraph without the placeholder.")
    ).toBeInTheDocument()
  })

  it("renders 'N/A' in place of the age when birthDate is missing", () => {
    const dictionary = makeDictionary({ birthDate: "" })
    render(<AboutSection dictionary={dictionary} />)

    expect(
      screen.getByText("I am N/A years old and I love building things.")
    ).toBeInTheDocument()
  })

  it("renders the four stat cards", () => {
    const dictionary = makeDictionary()
    render(<AboutSection dictionary={dictionary} />)

    expect(screen.getByText(dictionary.stats.yearsStudying)).toBeInTheDocument()
    expect(screen.getByText(dictionary.stats.projectsCompleted)).toBeInTheDocument()
    expect(screen.getByText(dictionary.stats.certifications)).toBeInTheDocument()
    expect(screen.getByText(dictionary.stats.yearsExperience)).toBeInTheDocument()
  })

  it("renders only the first five technical (language) skills", () => {
    const dictionary = makeDictionary()
    render(<AboutSection dictionary={dictionary} />)

    // languages: JavaScript, TypeScript, Python, Java, C++, Go (6 entries)
    expect(screen.getByText("JavaScript")).toBeInTheDocument()
    expect(screen.getByText("TypeScript")).toBeInTheDocument()
    expect(screen.getByText("Python")).toBeInTheDocument()
    expect(screen.getByText("Java")).toBeInTheDocument()
    expect(screen.getByText("C++")).toBeInTheDocument()
    // The 6th language should not be rendered (only slice(0, 5) is shown).
    expect(screen.queryByText("Go")).not.toBeInTheDocument()
  })

  it("renders all soft skills from the dictionary", () => {
    const dictionary = makeDictionary()
    render(<AboutSection dictionary={dictionary} />)

    for (const skill of Object.values(dictionary.skills.softSkills)) {
      expect(screen.getByText(skill)).toBeInTheDocument()
    }
  })

  it("renders the education card details", () => {
    const dictionary = makeDictionary()
    render(<AboutSection dictionary={dictionary} />)

    expect(screen.getAllByText(dictionary.education.title).length).toBeGreaterThan(0)
    expect(screen.getByText(dictionary.education.degree)).toBeInTheDocument()
    expect(screen.getByText(dictionary.education.university)).toBeInTheDocument()
    expect(screen.getByText(dictionary.education.period)).toBeInTheDocument()
  })
})
