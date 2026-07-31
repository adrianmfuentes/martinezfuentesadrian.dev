import { JwtDecoder } from "../../../../components/jwt-decoder"
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
    path: "/tools/jwt-decoder",
    title: dictionary.jwtDecoder.title,
    description: dictionary.jwtDecoder.description,
  })
}

export default async function JwtDecoderPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")

  return <JwtDecoder dictionary={dictionary.jwtDecoder} />
}
