import { CVSection } from "@components/cv-section"
import { getDictionary } from "../dictionaries"
import { pageMetadata } from "@/lib/seo"

export const revalidate = 60

const DESCRIPTIONS = {
  es: "Consulta y descarga el currículum de Adrián Martínez Fuentes: formación académica, certificaciones y experiencia profesional en desarrollo de software.",
  en: "View and download Adrián Martínez Fuentes' résumé: academic background, certifications and professional experience in software development.",
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
    path: "/cv",
    title: dict.cv.title,
    description: DESCRIPTIONS[lang as "en" | "es"],
  })
}

export default async function CVPage({
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
      <CVSection dictionary={dict.cv} lang={lang} />
    </div>
  )
}
