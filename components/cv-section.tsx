"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, GraduationCap, Award } from "lucide-react"

interface CVSectionProps {
  dictionary: {
    title: string
    subtitle: string
    download: string
  }
  lang: string
}

export function CVSection({ dictionary, lang }: Readonly<CVSectionProps>) {
  const handleDownload = () => {
    // Download the CV in the selected language
    const cvPath = `${window.location.origin}${lang === "en" ? "/cv/cv_en.pdf" : "/cv/cv_es.pdf"}`
    window.open(cvPath, "_blank")
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

      <Tabs defaultValue="education" className="max-w-3xl mx-auto">
        <TabsList className="grid grid-cols-2 mb-8">
          {/*<TabsTrigger value="experience" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Experience</span>
          </TabsTrigger>*/}
          <TabsTrigger value="education" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Education</span>
          </TabsTrigger>
          <TabsTrigger value="certifications" className="gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Certifications</span>
          </TabsTrigger>
        </TabsList>

        {/*<TabsContent value="experience">
          <div className="space-y-6">
            <TimelineItem
              title=""
              organization=""
              period=""
              description=""
            />
            <TimelineItem
              title=""
              organization=""
              period=""
              description=""
            />
          </div>
        </TabsContent>*/}

        <TabsContent value="education">
          <div className="space-y-6">
            <TimelineItem
              title="Bachelor's in Software Engineering (Bilingual Program)"
              organization="University of Oviedo"
              period="2022 - Present"
              description="Enrolled in the bilingual program, focusing on software development, algorithms, and system architecture. Participating in various coding competitions and hackathons."
            />
            <TimelineItem
              title="Social Sciences High School Diploma"
              organization="IES Aramo, Oviedo"
              period="2020 - 2022"
              description="Specialized in Social Sciences."
            />
            <TimelineItem
              title="Compulsory Secondary Education (ESO)"
              organization="Colegio La Milagrosa, Oviedo"
              period="2016 - 2020"
              description="Completed secondary education with focus on academic excellence."
            />
          </div>
        </TabsContent>

        <TabsContent value="certifications">
          <div className="space-y-6">
            <TimelineItem
              title="Web Development Certification"
              organization="University of Oviedo"
              period="2024"
              description="Learned HTML, CSS and JS, as well as creating websites with React, Node, and MariaDB."
            />
            <TimelineItem
              title="Cambridge English B2 Certificate"
              organization="Cambridge"
              period="2021"
              description="Cambridge qualification demonstrating upper-intermediate proficiency in English."
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

function TimelineItem({ title, organization, period, description }: Readonly<TimelineItemProps>) {
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
