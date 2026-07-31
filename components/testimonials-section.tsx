import { Card, CardContent } from "@components/ui/card"
import { Quote } from "lucide-react"

interface Testimonial {
  readonly quote: string
  readonly name: string
  readonly role: string
}

interface TestimonialsSectionProps {
  readonly dictionary: {
    readonly title: string
    readonly subtitle: string
    readonly items: readonly Testimonial[]
  }
}

// Renders nothing until real quotes are added to the dictionary — see
// `testimonials.items` in app/[lang]/dictionaries/{en,es}.json.
export function TestimonialsSection({ dictionary }: TestimonialsSectionProps) {
  if (dictionary.items.length === 0) return null

  return (
    <section className="py-16" aria-label={dictionary.title}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2 font-poppins">{dictionary.title}</h2>
        <p className="text-lg text-foreground/70">{dictionary.subtitle}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dictionary.items.map((testimonial) => (
          <Card key={testimonial.name} className="h-full border-primary/20">
            <CardContent className="p-6 flex flex-col h-full">
              <Quote className="h-6 w-6 text-primary/40 mb-3" aria-hidden="true" />
              <p className="text-foreground/80 flex-grow">{testimonial.quote}</p>
              <div className="mt-4">
                <p className="font-medium text-sm">{testimonial.name}</p>
                <p className="text-xs text-foreground/60">{testimonial.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
