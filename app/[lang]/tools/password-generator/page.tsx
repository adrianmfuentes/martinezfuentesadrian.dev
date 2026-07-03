import { PasswordGenerator } from "../../../../components/password-generator"
import { getDictionary } from "../../dictionaries"

export default async function PasswordGeneratorPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")

  return <PasswordGenerator dictionary={dictionary.passwordGenerator} />
}
