import { AboutSection } from "@components/about-section"
import { GithubActivity } from "@components/github-activity"
import { TestimonialsSection } from "@components/testimonials-section"
import { NowSection } from "@components/now-section"
import { getDictionary } from "../dictionaries"
import { getGithubActivity } from "@/lib/github-activity"
import { getAllPosts } from "@/lib/blog"
import { PROJECT_METADATA } from "@/lib/portfolio-data"
import { pageMetadata } from "@/lib/seo"

export const revalidate = 60

const DESCRIPTIONS = {
  es: "Conoce a Adrián Martínez Fuentes, Ingeniero de Software graduado con un 10/10 en su TFG. Formación académica, habilidades técnicas y trayectoria en desarrollo web.",
  en: "Meet Adrián Martínez Fuentes, a Software Engineer who graduated with a perfect 10/10 thesis grade. Academic background, technical skills and web development experience.",
} as const

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as "en" | "es")
  return pageMetadata({
    lang: lang as "en" | "es",
    path: "/about",
    title: dict.about.title,
    description: DESCRIPTIONS[lang as "en" | "es"],
  })
}

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

  const featuredProject = PROJECT_METADATA.find((project) => project.featured)
  const latestPost = (await getAllPosts(lang))[0]

  return (
    <div className="container mx-auto px-4 py-12">
      <AboutSection lang={lang} dictionary={dict.about} />
      <NowSection
        dictionary={dict.now}
        building={
          featuredProject
            ? { title: dict.portfolio.projects[featuredProject.id].title, href: `/${lang}/portfolio` }
            : undefined
        }
        latestPost={latestPost ? { title: latestPost.title, href: `/${lang}/blog/${latestPost.slug}` } : undefined}
      />
      <TestimonialsSection dictionary={dict.testimonials} />
      <GithubActivity lang={lang} items={activity} dictionary={dict.githubActivity} />
    </div>
  )
}
