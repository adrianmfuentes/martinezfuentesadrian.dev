import { CVSection } from "@/components/cv-section"
import { getDictionary } from "../dictionaries"

export default async function CVPage({ params }: { params: { lang: string } }) {
  const dict = await getDictionary(params.lang as "en" | "es")

  return (
    <div className="container mx-auto px-4 py-12">
      <CVSection dictionary={dict.cv} lang={params.lang} />
    </div>
  )
}
