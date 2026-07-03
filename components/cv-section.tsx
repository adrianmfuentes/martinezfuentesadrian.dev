"use client"

import { useState, useEffect } from "react"
import { Button } from "@components/ui/button"
import { Card, CardContent } from "@components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { Download, GraduationCap, Award, Eye, ExternalLink, Briefcase } from "lucide-react"
import dynamic from "next/dynamic"
const CertificateViewer = dynamic(() => import("@components/certificate-viewer.client"), { ssr: false })

interface CVSectionProps {
  dictionary: {
    title: string
    subtitle: string
    download: string
    view_online: string
    involvement: string
    about_grade: string
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
        gpa: string
        honours: string
        description: string
      }>
    }
    certifications: {
      items: Array<{
        title: string
        organization: string
        period: string
        description: string
        pdfUrl?: string // Optional URL to the PDF certificate
      }>
    }
    experience: {
      items: Array<{
        title: string
        organization: string
        location: string
        period: string
        department: string
        description: string | string[]
      }>
    }
  }
  lang: string
}

export function CVSection({ dictionary, lang }: Readonly<CVSectionProps>) {
  // Estado para controlar el modal
  const [viewingCertificate, setViewingCertificate] = useState<{ url: string; title: string } | null>(null)

  const handleDownload = () => {
    // Download the CV in the selected language
    const cvPath = `${globalThis.location.origin}${lang === "en" ? "/cv/cv_en.pdf" : "/cv/cv_es.pdf"}`
    globalThis.open(cvPath, "_blank")
  }

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2 font-poppins">{dictionary.title}</h2>
        <p className="text-lg text-foreground/70">{dictionary.subtitle}</p>
      </div>

      <div className="flex justify-center gap-3 mb-8">
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          {dictionary.download}
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <a href="https://adrianmfuentes.github.io/cv" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            {dictionary.view_online}
          </a>
        </Button>
      </div>

      <Tabs defaultValue="education" className="max-w-6xl mx-auto">
        <TabsList className="grid grid-cols-3 mb-8">
          {<TabsTrigger value="experience" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">{dictionary.tabs.experience}</span>
          </TabsTrigger>}
          <TabsTrigger value="education" className="gap-2" aria-label={dictionary.tabs.education}>
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">{dictionary.tabs.education}</span>
          </TabsTrigger>
          <TabsTrigger value="certifications" className="gap-2" aria-label={dictionary.tabs.certifications}>
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">{dictionary.tabs.certifications}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="experience">
          <div className="space-y-6">
            {dictionary.experience.items.map((item) => (
              <TimelineItem
                key={`${item.title}-${item.organization}`}
                title={item.title}
                organization={item.organization}
                location={item.location}
                period={item.period}
                department={item.department}
                description={item.description}
                involvementLabel={dictionary.involvement}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="education">
          <div className="space-y-6">
            {dictionary.education.items.map((item) => (
              <TimelineItem
                key={`${item.title}-${item.organization}`}
                title={item.title}
                organization={item.organization}
                period={item.period}
                gpa={item.gpa}
                honours={item.honours}
                description={item.description}
                aboutGradeLabel={dictionary.about_grade}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certifications">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Renderiza el modal para ver el certificado */}
      {viewingCertificate && (
        <CertificateViewer
          pdfUrl={viewingCertificate.url}
          title={viewingCertificate.title}
          isOpen={!!viewingCertificate}
          onClose={() => setViewingCertificate(null)}
        />
      )}
    </section>
  )
}

interface TimelineItemProps {
  title: string
  organization: string
  period: string
  description?: string | string[]
  pdfUrl?: string // Optional URL to the PDF certificate
  onViewCertificate?: (pdfUrl: string) => void
  location?: string
  department?: string
  gpa?: string
  honours?: string
  involvementLabel?: string
  aboutGradeLabel?: string
}

function TimelineItem({ title, organization, period, description, pdfUrl, onViewCertificate, location, department, gpa, honours, involvementLabel, aboutGradeLabel }: Readonly<TimelineItemProps>) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleCertificateAction = () => {
    if (pdfUrl) {
      if (isMobile) {
        // En móviles, abrir directamente en nueva pestaña
        window.open(pdfUrl, '_blank')
      } else {
        // En desktop, usar el modal
        onViewCertificate?.(pdfUrl)
      }
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-primary font-medium mb-2">{organization}</p>
            {(location || department) && (
              <div className="flex flex-col gap-1 mb-3">
                {location && <p className="text-xs text-foreground/60 font-medium uppercase tracking-wide">{location}</p>}
                {department && <p className="text-xs text-foreground/60 font-medium uppercase tracking-wide">{department}</p>}
              </div>
            )}
          </div>
          <span className="text-sm text-foreground/70 mt-2 sm:mt-0">{period}</span>
          {pdfUrl && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCertificateAction}
              className="ml-2"
              aria-label={`${isMobile ? 'Abrir' : 'Ver'} certificado de ${title}`}
            >
              {isMobile ? <ExternalLink className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          )}
        </div>
        {gpa && <p className="text-sm text-foreground/70 mb-1">GPA: {gpa}</p>}
        {honours && <p className="text-sm text-foreground/70 mb-6">{honours}</p>}
        {description && (
          <div className="text-foreground/80">
            {Array.isArray(description) ? (
              <>
                {(involvementLabel || aboutGradeLabel) && <h4 className="font-semibold text-sm mb-3">{involvementLabel || aboutGradeLabel}</h4>}
                <ul className="space-y-2 pl-4">
                  {description.map((item, idx) => (
                    <li key={idx} className="text-sm list-disc marker:text-foreground/50">{item}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}