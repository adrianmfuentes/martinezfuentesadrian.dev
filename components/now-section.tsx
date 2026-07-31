import { Card, CardContent } from "@components/ui/card"
import { Hammer, Newspaper } from "lucide-react"

interface NowSectionProps {
  readonly dictionary: {
    readonly title: string
    readonly building: string
    readonly latestPost: string
  }
  readonly building?: { readonly title: string; readonly href: string }
  readonly latestPost?: { readonly title: string; readonly href: string }
}

// A compact, honest "what's current" widget built entirely from data that
// already exists elsewhere on the site (the featured project, the latest
// blog post) — no separate "now" content to keep in sync by hand.
export function NowSection({ dictionary, building, latestPost }: NowSectionProps) {
  if (!building && !latestPost) return null

  return (
    <section className="py-8" aria-label={dictionary.title}>
      <h2 className="text-xl font-semibold mb-4 text-center">{dictionary.title}</h2>
      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {building && (
          <Card className="border-primary/20">
            <CardContent className="p-4 flex items-start gap-3">
              <Hammer className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs text-foreground/60">{dictionary.building}</p>
                <a href={building.href} className="text-sm font-medium hover:text-primary hover:underline">
                  {building.title}
                </a>
              </div>
            </CardContent>
          </Card>
        )}
        {latestPost && (
          <Card className="border-primary/20">
            <CardContent className="p-4 flex items-start gap-3">
              <Newspaper className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs text-foreground/60">{dictionary.latestPost}</p>
                <a href={latestPost.href} className="text-sm font-medium hover:text-primary hover:underline">
                  {latestPost.title}
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
