import { AboutSection } from "@components/about-section"
import { GithubActivity } from "@components/github-activity"
import { getDictionary } from "../dictionaries"
import { getGithubActivity } from "@/lib/github-activity"

export const revalidate = 60

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

  const activity = await getGithubActivity()

  return (
    <div className="container mx-auto px-4 py-12">
      <AboutSection dictionary={dict.about} />
      <GithubActivity lang={lang} items={activity} dictionary={dict.githubActivity} />
    </div>
  )
}
