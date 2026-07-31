import { PortfolioSection } from "@components/portfolio-section"
import { getDictionary } from "../dictionaries"
import { getProjectStatuses } from "@/lib/project-status"
import { PROJECT_METADATA } from "@/lib/portfolio-data"
import { pageMetadata } from "@/lib/seo"

export const revalidate = 900

const DESCRIPTIONS = {
  es: "Explora los proyectos, aplicaciones y herramientas de desarrollo web creados por Adrián Martínez Fuentes con Next.js, React y Node.js.",
  en: "Explore the web apps, projects and development tools built by Adrián Martínez Fuentes with Next.js, React and Node.js.",
} as const

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as "en" | "es")
  return pageMetadata({
    lang: lang as "en" | "es",
    path: "/portfolio",
    title: dict.portfolio.title,
    description: DESCRIPTIONS[lang as "en" | "es"],
  })
}

export default async function PortfolioPage({
  params,
}: {
  readonly params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as "en" | "es");

  if (!dict) {
    throw new Error("Dictionary not found");
  }

  const demoUrls = PROJECT_METADATA.map((project) => project.projectUrl).filter(Boolean)
  const statuses = await getProjectStatuses(demoUrls)

  return (
    <div className="container mx-auto px-4 py-12">
      <PortfolioSection dictionary={dict.portfolio} statuses={statuses} />
    </div>
  )
}
