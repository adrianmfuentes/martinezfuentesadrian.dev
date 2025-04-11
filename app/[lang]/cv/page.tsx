import { CVSection } from "@/components/cv-section"
import { getDictionary } from "../dictionaries"

export default async function CVPage({ params }: { params: { lang: string } }) {
  // Await the dictionary to ensure all async operations are complete
  const dict = await getDictionary(params.lang as "en" | "es")

  // Now we can safely use params.lang after the async operation
  const lang = params.lang

  return (
    <div className="container mx-auto px-4 py-12">
      <CVSection dictionary={dict.cv} lang={lang} />
    </div>
  )
}
