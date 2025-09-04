import HttpHeadersValidator from "@components/http-headers-validator"
import { getDictionary } from "../../dictionaries"

export default async function HeadersValidatorPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as "en" | "es")

  return <HttpHeadersValidator dictionary={dictionary.headersValidator} />
}
