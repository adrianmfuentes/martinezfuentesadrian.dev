import { HeroSection } from "@/components/hero-section"
import { getDictionary } from "./dictionaries"

export default async function Home({ params }: { params: { lang: string } }) {
  const dict = await getDictionary(params.lang as "en" | "es")

  return (
    <div>
      <HeroSection dictionary={dict.home} lang={params.lang} />
    </div>
  )
}
