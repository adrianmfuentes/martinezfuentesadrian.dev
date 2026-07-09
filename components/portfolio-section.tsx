"use client"

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { ExternalLink, Github, Sparkles } from "lucide-react" /* NOSONAR */
import { PROJECT_METADATA } from "@/lib/portfolio-data"
import { FloatingShape, CursorGlow } from "@components/decorative-fx"

export type ProjectStatus = "online" | "offline"

interface PortfolioSectionProps {
  dictionary: {
    title: string
    subtitle: string
    viewProject: string
    viewCode: string
    featured: string
    status: {
      online: string
      offline: string
    }
    projects: {
      [key: string]: {
        title: string
        description: string
      }
    }
  }
  statuses?: Record<string, ProjectStatus>
}

interface Project {
  id: string
  title: string
  description: string
  image: string
  tags: string[]
  projectUrl: string
  codeUrl: string
  imageFit?: "cover" | "contain"
  featured?: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const featuredVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.97, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function PortfolioSection({ dictionary, statuses }: Readonly<PortfolioSectionProps>) {
  const projects: Project[] = PROJECT_METADATA.map((meta) => ({
    ...meta,
    title: dictionary.projects[meta.id].title,
    description: dictionary.projects[meta.id].description,
  }))

  const featuredProject = projects.find((p) => p.featured)
  const gridProjects = projects.filter((p) => p !== featuredProject)

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY })
    globalThis.addEventListener("mousemove", handleMouseMove)
    return () => globalThis.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative overflow-hidden py-16" aria-label={dictionary.title}>
      <CursorGlow mousePosition={mousePosition} />

      <FloatingShape delay={0} duration={22} x={80} y={80} size="w-72 h-72" className="-top-16 -left-16" />
      <FloatingShape delay={3} duration={26} x={-100} y={120} size="w-64 h-64" className="top-1/2 -right-24" />

      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(120,119,198,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(120,119,198,0.1) 1px, transparent 1px)",
            backgroundSize: "4rem 4rem",
          }}
        />
      </div>

      <div className="relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-2 font-poppins">{dictionary.title}</h2>
          <p className="text-lg text-foreground/70">{dictionary.subtitle}</p>
        </motion.div>

        {featuredProject && (
          <motion.div
            className="mb-8"
            variants={featuredVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            <ProjectCard
              project={featuredProject}
              variant="featured"
              viewProject={dictionary.viewProject}
              viewCode={dictionary.viewCode}
              featuredLabel={dictionary.featured}
              status={featuredProject.projectUrl ? statuses?.[featuredProject.projectUrl] : undefined}
              statusLabels={dictionary.status}
              index={0}
            />
          </motion.div>
        )}

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {gridProjects.map((project, i) => (
            <motion.div key={project.id} variants={itemVariants}>
              <ProjectCard
                project={project}
                variant="default"
                viewProject={dictionary.viewProject}
                viewCode={dictionary.viewCode}
                featuredLabel={dictionary.featured}
                status={project.projectUrl ? statuses?.[project.projectUrl] : undefined}
                statusLabels={dictionary.status}
                index={featuredProject ? i + 1 : i}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

interface ProjectCardProps {
  project: Project
  variant?: "default" | "featured"
  viewProject: string
  viewCode: string
  featuredLabel: string
  status?: ProjectStatus
  statusLabels: { online: string; offline: string }
  index?: number
}

function ProjectCard({
  project,
  variant = "default",
  viewProject,
  viewCode,
  featuredLabel,
  status,
  statusLabels,
  index,
}: Readonly<ProjectCardProps>) {
  const eager = typeof index === "number" && index < 3 // Eager load images for the first three cards shown
  const isContain = project.imageFit === "contain"
  const isFeatured = variant === "featured"

  const cardRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      card.style.transition = "none"
      const rotateY = (px - 0.5) * 10
      const rotateX = (0.5 - py) * 10
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
      card.style.setProperty("--spot-x", `${px * 100}%`)
      card.style.setProperty("--spot-y", `${py * 100}%`)
    })
  }

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const card = cardRef.current
    if (!card) return
    card.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)"
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)"
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group h-full will-change-transform ${prefersReducedMotion ? "transition-transform duration-300 hover:-translate-y-1" : ""}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <Card
        className={`relative overflow-hidden h-full flex transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 ${isFeatured ? "flex-col lg:flex-row" : "flex-col"}`}
      >
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(400px circle at var(--spot-x, 50%) var(--spot-y, 50%), hsl(var(--primary) / 0.15), transparent 70%)",
          }}
        />

        <div
          className={`relative overflow-hidden ${isFeatured ? "h-64 lg:h-auto lg:w-3/5" : "h-64"} ${isContain ? "bg-muted/30 p-8" : ""}`}
          suppressHydrationWarning
        >
          <Image
            src={project.image || "/placeholder.svg"}
            alt={project.title}
            fill
            sizes={
              isFeatured
                ? "(max-width: 1024px) 100vw, 60vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            priority={eager}
            loading={eager ? "eager" : "lazy"}
            className={`transition-transform duration-700 ease-out group-hover:scale-105 ${isContain ? "object-contain" : "object-cover"}`}
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=600&width=800"
            }}
          />
          {project.featured && (
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-primary border border-primary/30">
              <Sparkles className="h-3.5 w-3.5" />
              {featuredLabel}
            </div>
          )}
        </div>

        <div className={`flex flex-col flex-grow ${isFeatured ? "lg:w-2/5" : ""}`}>
          <CardContent className="p-6 flex-grow">
            <h3 className={`font-semibold mb-2 ${project.featured ? "text-2xl" : "text-xl"} ${isFeatured ? "lg:text-3xl" : ""}`}>
              {project.title}
            </h3>
            <p className="text-foreground/80 mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <motion.span
                  key={tag}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.08 }}
                  className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full transition-colors duration-300 group-hover:bg-primary/20"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0 flex gap-2">
            {project.projectUrl && (
              <Button variant="default" size="sm" className="gap-2" asChild>
                <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" aria-label={`${viewProject}: ${project.title}`}>
                  <ExternalLink className="h-4 w-4" />
                  {viewProject}
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href={project.codeUrl} target="_blank" rel="noopener noreferrer" aria-label={`${viewCode}: ${project.title}`}>
                <Github className="h-4 w-4" /> {/* NOSONAR */}
                {viewCode}
              </a>
            </Button>
            {status && (
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-foreground/60">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${status === "online" ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/50"}`}
                  aria-hidden="true"
                />
                {status === "online" ? statusLabels.online : statusLabels.offline}
              </span>
            )}
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}
