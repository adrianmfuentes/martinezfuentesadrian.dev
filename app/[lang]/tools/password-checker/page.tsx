import { PasswordChecker } from "../../../../components/password-checker"
import { getDictionary } from "../../dictionaries"

export default async function PasswordCheckerPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")

  return <PasswordChecker dictionary={dictionary.passwordChecker} />
}
