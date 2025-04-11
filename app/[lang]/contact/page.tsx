import { ContactForm } from "@/components/contact-form"
import { getDictionary } from "../dictionaries"

export default async function ContactPage({ params }: { params: { lang: string } }) {
  const dict = await getDictionary(params.lang as "en" | "es")

  return (
    <div className="container mx-auto px-4 py-12">
      <ContactForm dictionary={dict.contact} />
    </div>
  )
}
