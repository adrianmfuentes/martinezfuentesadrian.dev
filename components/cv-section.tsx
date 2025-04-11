"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Briefcase, GraduationCap, Award } from "lucide-react"

interface CVSectionProps {
  dictionary: {
    title: string
    subtitle: string
    download: string
  }
  lang: string
}

export function CVSection({ dictionary, lang }: CVSectionProps) {
  const [activeTab, setActiveTab] = useState("experience")

  const handleDownload = () => {
    // In a real implementation, this would download the CV in the selected language
    alert(`Downloading CV in ${lang === "en" ? "English" : "Spanish"}`)
  }

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2 font-poppins">{dictionary.title}</h2>
        <p className="text-lg text-foreground/70">{dictionary.subtitle}</p>
      </div>

      <div className="flex justify-center mb-8">
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          {dictionary.download}
        </Button>
      </div>

      <Tabs defaultValue="experience" className="max-w-3xl mx-auto">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="experience" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Experience</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Education</span>
          </TabsTrigger>
          <TabsTrigger value="certifications" className="gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Certifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="experience">
          <div className="space-y-6">
            <TimelineItem
              title="Junior Web Developer"
              organization="Tech Startup"
              period="2023 - Present"
              description="Developed and maintained web applications using React and Next.js. Collaborated with the design team to implement responsive UI components."
            />
            <TimelineItem
              title="Web Development Intern"
              organization="Digital Agency"
              period="Summer 2022"
              description="Assisted in the development of client websites. Gained experience with modern frontend frameworks and version control systems."
            />
          </div>
        </TabsContent>

        <TabsContent value="education">
          <div className="space-y-6">
            <TimelineItem
              title="Bachelor's in Software Engineering"
              organization="Technical University of Madrid"
              period="2021 - Present"
              description="Focusing on software development, algorithms, and system architecture. Participating in various coding competitions and hackathons."
            />
            <TimelineItem
              title="High School Diploma"
              organization="International School of Madrid"
              period="2017 - 2021"
              description="Specialized in Mathematics and Computer Science. Graduated with honors."
            />
          </div>
        </TabsContent>

        <TabsContent value="certifications">
          <div className="space-y-6">
            <TimelineItem
              title="AWS Certified Developer"
              organization="Amazon Web Services"
              period="2023"
              description="Validated expertise in developing, deploying, and debugging cloud-based applications using AWS."
            />
            <TimelineItem
              title="React Developer Certification"
              organization="Meta"
              period="2022"
              description="Comprehensive certification covering React fundamentals, hooks, state management, and performance optimization."
            />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}

interface TimelineItemProps {
  title: string
  organization: string
  period: string
  description: string
}

function TimelineItem({ title, organization, period, description }: TimelineItemProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <span className="text-sm text-foreground/70">{period}</span>
        </div>
        <p className="text-primary font-medium mb-2">{organization}</p>
        <p className="text-foreground/80">{description}</p>
      </CardContent>
    </Card>
  )
}
