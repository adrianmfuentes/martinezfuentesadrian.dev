"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Github } from "lucide-react"

interface PortfolioSectionProps {
  dictionary: {
    title: string
    subtitle: string
    viewProject: string
    viewCode: string
  }
}

interface Project {
  id: string
  title: string
  description: string
  image: string
  tags: string[]
  category: string
  projectUrl: string
  codeUrl: string
}

export function PortfolioSection({ dictionary }: PortfolioSectionProps) {
  const [activeCategory, setActiveCategory] = useState("all")

  const projects: Project[] = [
    {
      id: "1",
      title: "E-commerce Platform",
      description: "A full-stack e-commerce platform built with Next.js, Prisma, and Stripe integration.",
      image: "/placeholder.svg?height=600&width=800",
      tags: ["Next.js", "Prisma", "Stripe", "Tailwind CSS"],
      category: "web",
      projectUrl: "#",
      codeUrl: "#",
    },
    {
      id: "2",
      title: "Task Management App",
      description: "A collaborative task management application with real-time updates using WebSockets.",
      image: "/placeholder.svg?height=600&width=800",
      tags: ["React", "Node.js", "Socket.io", "MongoDB"],
      category: "web",
      projectUrl: "#",
      codeUrl: "#",
    },
    {
      id: "3",
      title: "Weather Forecast App",
      description: "A mobile application that provides weather forecasts using geolocation and weather APIs.",
      image: "/placeholder.svg?height=600&width=800",
      tags: ["React Native", "Expo", "API Integration"],
      category: "mobile",
      projectUrl: "#",
      codeUrl: "#",
    },
    {
      id: "4",
      title: "Data Visualization Dashboard",
      description: "An interactive dashboard for visualizing complex datasets with customizable charts.",
      image: "/placeholder.svg?height=600&width=800",
      tags: ["D3.js", "React", "TypeScript", "REST API"],
      category: "data",
      projectUrl: "#",
      codeUrl: "#",
    },
    {
      id: "5",
      title: "Personal Finance Tracker",
      description: "A web application for tracking personal finances with budget planning and expense analysis.",
      image: "/placeholder.svg?height=600&width=800",
      tags: ["Vue.js", "Firebase", "Chart.js"],
      category: "web",
      projectUrl: "#",
      codeUrl: "#",
    },
    {
      id: "6",
      title: "Augmented Reality Game",
      description: "A mobile AR game that uses the device camera to create an immersive gaming experience.",
      image: "/placeholder.svg?height=600&width=800",
      tags: ["Unity", "AR Foundation", "C#"],
      category: "game",
      projectUrl: "#",
      codeUrl: "#",
    },
  ]

  const filteredProjects =
    activeCategory === "all" ? projects : projects.filter((project) => project.category === activeCategory)

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2 font-poppins">{dictionary.title}</h2>
        <p className="text-lg text-foreground/70">{dictionary.subtitle}</p>
      </div>

      <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveCategory}>
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="web">Web</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="game">Games</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <ProjectCard project={project} viewProject={dictionary.viewProject} viewCode={dictionary.viewCode} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

interface ProjectCardProps {
  project: Project
  viewProject: string
  viewCode: string
}

function ProjectCard({ project, viewProject, viewCode }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48">
        <Image src={project.image || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
      </div>
      <CardContent className="p-6 flex-grow">
        <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
        <p className="text-foreground/80 mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button variant="default" size="sm" className="gap-2" asChild>
          <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            {viewProject}
          </a>
        </Button>
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <a href={project.codeUrl} target="_blank" rel="noopener noreferrer">
            <Github className="h-4 w-4" />
            {viewCode}
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
