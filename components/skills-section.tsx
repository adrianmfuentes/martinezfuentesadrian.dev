"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Code,
  Database,
  Globe,
  Server,
  Smartphone,
  Braces,
  Users,
  Brain,
  Clock,
  MessageSquare,
  Lightbulb,
  Target,
} from "lucide-react"

interface SkillsSectionProps {
  dictionary: {
    title: string
    technical: string
    soft: string
  }
}

interface Skill {
  name: string
  level: number
  icon: React.ReactNode
}

export function SkillsSection({ dictionary }: SkillsSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const technicalSkills: Skill[] = [
    { name: "JavaScript/TypeScript", level: 90, icon: <Code className="h-5 w-5" /> },
    { name: "React/Next.js", level: 85, icon: <Globe className="h-5 w-5" /> },
    { name: "Node.js", level: 80, icon: <Server className="h-5 w-5" /> },
    { name: "SQL/NoSQL", level: 75, icon: <Database className="h-5 w-5" /> },
    { name: "Mobile Development", level: 65, icon: <Smartphone className="h-5 w-5" /> },
    { name: "Python", level: 70, icon: <Braces className="h-5 w-5" /> },
  ]

  const softSkills: Skill[] = [
    { name: "Teamwork", level: 95, icon: <Users className="h-5 w-5" /> },
    { name: "Problem Solving", level: 90, icon: <Brain className="h-5 w-5" /> },
    { name: "Time Management", level: 85, icon: <Clock className="h-5 w-5" /> },
    { name: "Communication", level: 90, icon: <MessageSquare className="h-5 w-5" /> },
    { name: "Creativity", level: 80, icon: <Lightbulb className="h-5 w-5" /> },
    { name: "Goal Oriented", level: 85, icon: <Target className="h-5 w-5" /> },
  ]

  return (
    <section className="py-16" ref={ref}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2 font-poppins">{dictionary.title}</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6">{dictionary.technical}</h3>
            <div className="space-y-6">
              {technicalSkills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-center mb-2">
                    <span className="mr-2 text-primary">{skill.icon}</span>
                    <span className="font-medium">{skill.name}</span>
                    <span className="ml-auto text-sm text-foreground/70">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="h-2" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6">{dictionary.soft}</h3>
            <div className="space-y-6">
              {softSkills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-center mb-2">
                    <span className="mr-2 text-primary">{skill.icon}</span>
                    <span className="font-medium">{skill.name}</span>
                    <span className="ml-auto text-sm text-foreground/70">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="h-2" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
