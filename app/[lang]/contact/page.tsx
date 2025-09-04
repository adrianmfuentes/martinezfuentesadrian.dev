import { ContactForm } from "@components/contact-form"
import { getDictionary } from "../dictionaries"

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
