import { HashGenerator } from "../../../../components/hash-generator"
import { getDictionary } from "../../dictionaries"
import { pageMetadata } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")
  return pageMetadata({
    lang: lang as "en" | "es",
    path: "/tools/hash-generator",
    title: dictionary.hashGenerator.title,
    description: dictionary.hashGenerator.description,
  })
}

export default async function HashGeneratorPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")

  return <HashGenerator dictionary={dictionary.hashGenerator} />
}
