"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import {
  Code,
  Database,
  Globe,
  Server,
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
    technicalSkills: {
      java: string
      python: string
      cpp: string
      webDevelopment: string
      databases: string
      linuxDocker: string
      llm: string
      cybersecurity: string
    }
    softSkills: {
      teamwork: string
      problemSolving: string
      communication: string
      timeManagement: string
      adaptability: string
      goalOriented: string
      leadership: string
    }
  }
}

interface Skill {
  name: string
  icon: React.ReactNode
}

export function SkillsSection({ dictionary }: Readonly<SkillsSectionProps>) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const technicalSkills: Skill[] = [
    { name: dictionary.technicalSkills.java, icon: <Code className="h-5 w-5" /> },
    { name: dictionary.technicalSkills.python, icon: <Braces className="h-5 w-5" /> },
    { name: dictionary.technicalSkills.cpp, icon: <Braces className="h-5 w-5" /> },
    { name: dictionary.technicalSkills.webDevelopment, icon: <Globe className="h-5 w-5" /> },
    { name: dictionary.technicalSkills.databases, icon: <Database className="h-5 w-5" /> },
    { name: dictionary.technicalSkills.linuxDocker, icon: <Server className="h-5 w-5" /> },
    { name: dictionary.technicalSkills.llm, icon: <Brain className="h-5 w-5" /> },
    { name: dictionary.technicalSkills.cybersecurity, icon: <Braces className="h-5 w-5" /> }
  ]

  const softSkills: Skill[] = [
    { name: dictionary.softSkills.teamwork, icon: <Users className="h-5 w-5" /> },
    { name: dictionary.softSkills.problemSolving, icon: <Brain className="h-5 w-5" /> },
    { name: dictionary.softSkills.communication, icon: <MessageSquare className="h-5 w-5" /> },
    { name: dictionary.softSkills.timeManagement, icon: <Clock className="h-5 w-5" /> },
    { name: dictionary.softSkills.adaptability, icon: <Lightbulb className="h-5 w-5" /> },
    { name: dictionary.softSkills.goalOriented, icon: <Target className="h-5 w-5" /> },
    { name: dictionary.softSkills.leadership, icon: <Users className="h-5 w-5" /> }
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
            <div className="grid grid-cols-1 gap-4">
              {technicalSkills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                >
                  <span className="mr-3 text-primary">{skill.icon}</span>
                  <span className="font-medium">{skill.name}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6">{dictionary.soft}</h3>
            <div className="grid grid-cols-1 gap-4">
              {softSkills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                >
                  <span className="mr-3 text-primary">{skill.icon}</span>
                  <span className="font-medium">{skill.name}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
