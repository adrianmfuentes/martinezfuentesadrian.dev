"use client"

import Link from "next/link"
import { Button } from "@components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

interface HeroSectionProps {
  readonly dictionary: {
    readonly greeting: string
    readonly title: string
    readonly subtitle: string
    readonly cta: string
  }
  readonly lang: string
}

export function HeroSection({ dictionary, lang }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl backdrop-blur-md bg-background/30 p-8 rounded-lg border border-primary/20 shadow-lg"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg font-medium text-primary mb-2"
          >
            {dictionary.greeting}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-4 font-poppins"
          >
            {dictionary.title}
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-2xl md:text-3xl font-medium mb-6 text-foreground/80"
          >
            {dictionary.subtitle}
          </motion.h2>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.5 }}>
            <Link href={`/${lang}/portfolio`}>
              <Button // NOSONAR
                size="lg" 
                className="group"
                aria-label={`${dictionary.cta} - ${dictionary.subtitle}`}
                role="button"
              >
                {dictionary.cta}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-10 left-0 right-0 z-10 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{
            delay: 1.2,
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="w-6 h-10 rounded-full border-2 border-foreground/30 flex justify-center"
        >
          <motion.div
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="w-1.5 h-3 bg-foreground/50 rounded-full mt-2"
          />
        </motion.div>
      </div>
    </section>
  )
}
