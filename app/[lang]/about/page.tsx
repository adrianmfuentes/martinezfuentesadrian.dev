import { AboutSection } from "@components/about-section"
import { SkillsSection } from "@components/skills-section"
import { getDictionary } from "../dictionaries"

export default async function AboutPage({
  params,
}: {
  readonly params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as "en" | "es");

  if (!dict) {
    throw new Error("Dictionary not found");
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <AboutSection dictionary={dict.about} />
      <SkillsSection dictionary={dict.about.skills} />
    </div>
  )
}
