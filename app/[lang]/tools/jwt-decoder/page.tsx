import { JwtDecoder } from "../../../../components/jwt-decoder"
import { getDictionary } from "../../dictionaries"

export default async function JwtDecoderPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")

  return <JwtDecoder dictionary={dictionary.jwtDecoder} />
}
