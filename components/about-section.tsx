"use client"

import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { motion, useInView } from "framer-motion"

interface AboutSectionProps {
  dictionary: {
    title: string
    subtitle: string
    bio: string[]
    education: {
      title: string
      degree: string
      university: string
      period: string
    }
  }
}

const MotionCard = motion(Card)

export function AboutSection({ dictionary }: AboutSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2 font-poppins">{dictionary.title}</h2>
        <p className="text-lg text-foreground/70">{dictionary.subtitle}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="relative h-[400px] rounded-lg overflow-hidden">
          <div className="parallax-section h-full">
            <div className="parallax-bg" style={{ backgroundImage: "url('/placeholder.svg?height=800&width=600')" }} />
          </div>
        </div>

        <div ref={ref}>
          <div className="space-y-6">
            {dictionary.bio.map((paragraph, index) => (
              <motion.p
                key={index}
                className="text-foreground/80"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          <MotionCard
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">{dictionary.education.title}</h3>
              <div>
                <p className="font-medium">{dictionary.education.degree}</p>
                <p className="text-foreground/70">{dictionary.education.university}</p>
                <p className="text-sm text-foreground/60">{dictionary.education.period}</p>
              </div>
            </CardContent>
          </MotionCard>
        </div>
      </div>
    </section>
  )
}
