"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Github } from "lucide-react" /* NOSONAR */

interface PortfolioSectionProps {
  dictionary: {
    title: string
    subtitle: string
    viewProject: string
    viewCode: string
    categories: {
      all: string
      web: string
      system: string
      data: string
      game: string
    }
    projects: {
      [key: string]: {
        title: string
        description: string
      }
    }
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

export function PortfolioSection({ dictionary }: Readonly<PortfolioSectionProps>) {
  const [activeCategory, setActiveCategory] = useState("all")

  const projects: Project[] = [
    {
      id: "1",
      title: dictionary.projects["1"].title,
      description: dictionary.projects["1"].description,
      image: "/images/wichat.png",
      tags: ["React", "Node.js", "Express", "Oracle", "Docker", "GitHub", "Socket.io"],
      category: "web",
      projectUrl: "https://wichat.ddns.net/",
      codeUrl: "https://github.com/Arquisoft/wichat_en2b",
    },
    {
      id: "2",
      title: dictionary.projects["2"].title,
      description: dictionary.projects["2"].description,
      image: "/images/SGDB.webp",
      tags: ["C++"],
      category: "data",
      projectUrl: "",
      codeUrl: "https://github.com/adrianmfuentes/SGDB",
    },
    {
      id: "3",
      title: dictionary.projects["3"].title,
      description: dictionary.projects["3"].description,
      image: "/images/Shell.webp",
      tags: ["C"],
      category: "system",
      projectUrl: "",
      codeUrl: "https://github.com/adrianmfuentes/Shell",
    },
    {
      id: "4",
      title: dictionary.projects["4"].title,
      description: dictionary.projects["4"].description,
      image: "/images/Task-Manager.webp",
      tags: ["React", "Node.js", "MariaDB"],
      category: "web",
      projectUrl: "",
      codeUrl: "https://github.com/adrianmfuentes/Task-Manager",
    },
    {
      id: "5",
      title: dictionary.projects["5"].title,
      description: dictionary.projects["5"].description,
      image: "/images/Information-Retrieval.webp",
      tags: ["Python"],
      category: "data",
      projectUrl: "",
      codeUrl: "https://github.com/adrianmfuentes/Information-Retrieval",
    },
    {
      id: "6",
      title: dictionary.projects["6"].title,
      description: dictionary.projects["6"].description,
      image: "/images/f1-desktop.png",
      tags: ["Java", "JavaFX", "XML"],
      category: "web",
      projectUrl: "https://university-of-oviedo-projects.github.io/SEW-F1Desktop/",
      codeUrl: "https://github.com/University-of-Oviedo-Projects/SEW-F1Desktop",
    },
    {
      id: "7",
      title: dictionary.projects["7"].title,
      description: dictionary.projects["7"].description,
      image: "/images/unreal.png",
      tags: ["Unreal Engine", "C++", "Blueprint"],
      category: "game",
      projectUrl: "",
      codeUrl: "https://github.com/University-of-Oviedo-Projects/SEV-Unreal",
    },
    {
      id: "8",
      title: dictionary.projects["8"].title,
      description: dictionary.projects["8"].description,
      image: "/images/Server-HTTP.png",
      tags: ["C++", "Networking", "HTTP"],
      category: "system",
      projectUrl: "",
      codeUrl: "https://github.com/adrianmfuentes/HTTP-server",
    },
    {
      id: "9",
      title: dictionary.projects["9"].title,
      description: dictionary.projects["9"].description,
      image: "/images/bot-twitter.png",
      tags: ["Python", "Twitter API", "Automation"],
      category: "data",
      projectUrl: "",
      codeUrl: "https://github.com/adrianmfuentes/Twitter-Bot",
    }
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
            <TabsTrigger value="all">{dictionary.categories.all}</TabsTrigger>
            <TabsTrigger value="web">{dictionary.categories.web}</TabsTrigger>
            <TabsTrigger value="system">{dictionary.categories.system}</TabsTrigger>
            <TabsTrigger value="data">{dictionary.categories.data}</TabsTrigger>
            <TabsTrigger value="game">{dictionary.categories.game}</TabsTrigger>
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

function ProjectCard({ project, viewProject, viewCode }: Readonly<ProjectCardProps>) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48">
        <Image
          src={project.image || "/placeholder.svg"}
          alt={project.title}
          fill
          className="object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement
            target.src = "/placeholder.svg?height=600&width=800"
          }}
        />
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
        {project.projectUrl && (
          <Button variant="default" size="sm" className="gap-2" asChild>
            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              {viewProject}
            </a>
          </Button>
        )}
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <a href={project.codeUrl} target="_blank" rel="noopener noreferrer">
            <Github className="h-4 w-4" /> {/* NOSONAR */}
            {viewCode}
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
