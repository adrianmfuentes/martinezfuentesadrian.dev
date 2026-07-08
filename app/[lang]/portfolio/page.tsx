import { PortfolioSection } from "@components/portfolio-section"
import { getDictionary } from "../dictionaries"
import { getProjectStatuses } from "@/lib/project-status"
import { PROJECT_METADATA } from "@/lib/portfolio-data"

export const revalidate = 900

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
