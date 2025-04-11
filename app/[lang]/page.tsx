import { HeroSection } from "@/components/hero-section"
import { getDictionary } from "./dictionaries"

export default async function Home({ params }: { params: { lang: string } }) {
  // Await the dictionary to ensure all async operations are complete
  const dict = await getDictionary(params.lang as "en" | "es")

  // Now we can safely use params.lang after the async operation
  const lang = params.lang

  return (
    <div>
      <HeroSection dictionary={dict.home} lang={lang} />
    </div>
  )
}
