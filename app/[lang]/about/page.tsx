import { AboutSection } from "@/components/about-section"
import { SkillsSection } from "@/components/skills-section"
import { getDictionary } from "../dictionaries"

export default async function AboutPage({ params }: { params: { lang: string } }) {
  const dict = await getDictionary(params.lang as "en" | "es")

  return (
    <div className="container mx-auto px-4 py-12">
      <AboutSection dictionary={dict.about} />
      <SkillsSection dictionary={dict.about.skills} />
    </div>
  )
}
