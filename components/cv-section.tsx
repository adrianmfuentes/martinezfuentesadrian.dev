"use client"

import { Button } from "@components/ui/button"
import { Card, CardContent } from "@components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { Download, GraduationCap, Award } from "lucide-react"

interface CVSectionProps {
  dictionary: {
    title: string
    subtitle: string
    download: string
    tabs: {
      education: string
      certifications: string
      experience: string
    }
    education: {
      items: Array<{
        title: string
        organization: string
        period: string
        description: string
      }>
    }
    certifications: {
      items: Array<{
        title: string
        organization: string
        period: string
        description: string
      }>
    }
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
            <span className="hidden sm:inline">{dictionary.tabs.experience}</span>
          </TabsTrigger>*/}
          <TabsTrigger value="education" className="gap-2" aria-label={dictionary.tabs.education}>
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">{dictionary.tabs.education}</span>
          </TabsTrigger>
          <TabsTrigger value="certifications" className="gap-2" aria-label={dictionary.tabs.certifications}>
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">{dictionary.tabs.certifications}</span>
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
            {dictionary.education.items.map((item) => (
              <TimelineItem
                key={`${item.title}-${item.organization}`}
                title={item.title}
                organization={item.organization}
                period={item.period}
                description={item.description}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certifications">
          <div className="space-y-6">
            {dictionary.certifications.items.map((item) => (
              <TimelineItem
                key={`${item.title}-${item.organization}`}
                title={item.title}
                organization={item.organization}
                period={item.period}
                description={item.description}
              />
            ))}
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
