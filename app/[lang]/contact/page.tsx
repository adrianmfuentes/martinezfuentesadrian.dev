import { ContactForm } from "@components/contact-form"
import { getDictionary } from "../dictionaries"
import { pageMetadata } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as "en" | "es")
  return pageMetadata({
    lang: lang as "en" | "es",
    path: "/contact",
    title: dict.contact.title,
    description: dict.contact.description,
  })
}

export default async function ContactPage({
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
      <ContactForm dictionary={dict.contact} />
    </div>
  )
}
