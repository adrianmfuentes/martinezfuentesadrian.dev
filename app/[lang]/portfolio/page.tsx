import { PortfolioSection } from "@/components/portfolio-section"
import { getDictionary } from "../dictionaries"

export default async function PortfolioPage({ params }: { params: { lang: string } }) {
  // Await the dictionary to ensure all async operations are complete
  const dict = await getDictionary(params.lang as "en" | "es")

  // Now we can safely use params.lang if needed
  const lang = params.lang

  return (
    <div className="container mx-auto px-4 py-12">
      <PortfolioSection dictionary={dict.portfolio} />
    </div>
  )
}
