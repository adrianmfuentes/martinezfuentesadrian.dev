import { CVSection } from "@components/cv-section"
import { getDictionary } from "../dictionaries"

export const revalidate = 60

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
