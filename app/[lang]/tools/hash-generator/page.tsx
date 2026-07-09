import { HashGenerator } from "../../../../components/hash-generator"
import { getDictionary } from "../../dictionaries"

export default async function HashGeneratorPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")

  return <HashGenerator dictionary={dictionary.hashGenerator} />
}
