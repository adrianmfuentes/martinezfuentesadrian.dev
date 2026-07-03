import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { SkillsSection } from "@components/skills-section"

vi.mock("framer-motion", () => {
  const React = require("react")
  // Cache the generated component per tag so `motion.div` (etc.) resolves to a
  // stable component identity across renders. Without this, a Proxy `get`
  // trap that mints a brand-new component on every property access would
  // force React to unmount/remount the subtree on every re-render.
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
    useInView: () => true,
  }
})

const dictionary = {
  title: "Skills",
  technical: "Technical Skills",
  soft: "Soft Skills",
  technicalSkills: {
    languages: "JavaScript, TypeScript, Python",
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
}

describe("SkillsSection", () => {
  it("renders the section title and column headers", () => {
    render(<SkillsSection dictionary={dictionary} />)
    expect(screen.getByText(dictionary.title)).toBeInTheDocument()
    expect(screen.getByText(dictionary.technical)).toBeInTheDocument()
    expect(screen.getByText(dictionary.soft)).toBeInTheDocument()
  })

  it("renders all six technical skills", () => {
    render(<SkillsSection dictionary={dictionary} />)
    expect(screen.getByText(dictionary.technicalSkills.languages)).toBeInTheDocument()
    expect(screen.getByText(dictionary.technicalSkills.cloud)).toBeInTheDocument()
    expect(screen.getByText(dictionary.technicalSkills.frameworks)).toBeInTheDocument()
    expect(screen.getByText(dictionary.technicalSkills.databases)).toBeInTheDocument()
    expect(screen.getByText(dictionary.technicalSkills.versionControl)).toBeInTheDocument()
    expect(screen.getByText(dictionary.technicalSkills.interests)).toBeInTheDocument()
  })

  it("renders all six soft skills", () => {
    render(<SkillsSection dictionary={dictionary} />)
    expect(screen.getByText(dictionary.softSkills.teamwork)).toBeInTheDocument()
    expect(screen.getByText(dictionary.softSkills.problemSolving)).toBeInTheDocument()
    expect(screen.getByText(dictionary.softSkills.communication)).toBeInTheDocument()
    expect(screen.getByText(dictionary.softSkills.timeManagement)).toBeInTheDocument()
    expect(screen.getByText(dictionary.softSkills.adaptability)).toBeInTheDocument()
    expect(screen.getByText(dictionary.softSkills.leadership)).toBeInTheDocument()
  })
})
