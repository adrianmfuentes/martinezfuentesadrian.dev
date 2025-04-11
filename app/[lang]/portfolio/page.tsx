import { PortfolioSection } from "@/components/portfolio-section"
import { getDictionary } from "../dictionaries"

export default async function PortfolioPage({ params }: { params: { lang: string } }) {
  const dict = await getDictionary(params.lang as "en" | "es")

  return (
    <div className="container mx-auto px-4 py-12">
      <PortfolioSection dictionary={dict.portfolio} />
    </div>
  )
}
