"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { ExternalLink, Github, Sparkles } from "lucide-react" /* NOSONAR */
import { PROJECT_METADATA } from "@/lib/portfolio-data"

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
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function PortfolioSection({ dictionary, statuses }: Readonly<PortfolioSectionProps>) {
  const projects: Project[] = PROJECT_METADATA.map((meta) => ({
    ...meta,
    title: dictionary.projects[meta.id].title,
    description: dictionary.projects[meta.id].description,
  }))

  return (
    <section className="py-16" aria-label={dictionary.title}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2 font-poppins">{dictionary.title}</h2>
        <p className="text-lg text-foreground/70">{dictionary.subtitle}</p>
      </div>

      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            variants={itemVariants}
            className={project.featured ? "sm:col-span-2" : ""}
          >
            <ProjectCard
              project={project}
              viewProject={dictionary.viewProject}
              viewCode={dictionary.viewCode}
              featuredLabel={dictionary.featured}
              status={project.projectUrl ? statuses?.[project.projectUrl] : undefined}
              statusLabels={dictionary.status}
              index={index}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

interface ProjectCardProps {
  project: Project
  viewProject: string
  viewCode: string
  featuredLabel: string
  status?: ProjectStatus
  statusLabels: { online: string; offline: string }
  index?: number
}

function ProjectCard({ project, viewProject, viewCode, featuredLabel, status, statusLabels, index }: Readonly<ProjectCardProps>) {
  const eager = typeof index === "number" && index < 3 // Eager load images for the first three projects

  const isContain = project.imageFit === "contain"

  return (
    <Card className="group overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40">
      <div
        className={`relative overflow-hidden ${project.featured ? "h-72 lg:h-80" : "h-64"} ${isContain ? "bg-muted/30 p-8" : ""}`}
        suppressHydrationWarning
      >
        <Image
          src={project.image || "/placeholder.svg"}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
      <CardContent className="p-6 flex-grow">
        <h3 className={`font-semibold mb-2 ${project.featured ? "text-2xl" : "text-xl"}`}>{project.title}</h3>
        <p className="text-foreground/80 mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full transition-colors duration-300 group-hover:bg-primary/20"
            >
              {tag}
            </span>
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
    </Card>
  )
}
