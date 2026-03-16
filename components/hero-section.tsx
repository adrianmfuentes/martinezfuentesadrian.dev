"use client"

import Link from "next/link"
import { Button } from "@components/ui/button"
import { ArrowRight, Code2, Zap, BookOpen, Target } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface HeroSectionProps {
  readonly dictionary: {
    readonly greeting: string
    readonly title: string
    readonly subtitle: string
    readonly cta: string
  }
  readonly stats: {
    readonly yearsStudying: string
    readonly projectsCompleted: string
    readonly certifications: string
    readonly yearsExperience: string
  }
  readonly lang: string
  readonly contactLabel: string
  readonly cvLabel: string
}

const FloatingShape = ({ delay, duration, x, y, size }: { delay: number; duration: number; x: number; y: number; size: string }) => (
  <motion.div
    className={`absolute ${size} rounded-full blur-3xl opacity-20 pointer-events-none`}
    style={{
      background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
    }}
    animate={{
      x: [0, x, 0],
      y: [0, y, 0],
    }}
    transition={{
      delay,
      duration,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    }}
  />
)

const StatCard = ({ label, value, icon: Icon, delay }: { label: string; value: string; icon: React.ReactNode; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="group hover:bg-primary/10 transition-all duration-300 px-3 sm:px-6 py-3 sm:py-5 rounded-lg border border-primary/30 backdrop-blur-sm min-h-fit"
  >
    <div className="flex flex-col items-center gap-1.5 mb-1.5">
      <div className="text-primary text-xs sm:text-base">{Icon}</div>
      <p className="text-[0.65rem] sm:text-sm text-foreground/70 text-center leading-tight line-clamp-2">{label}</p>
    </div>
    <p className="text-sm sm:text-2xl font-bold text-primary text-center break-words leading-tight">{value}</p>
  </motion.div>
)

const CursorGlow = ({ mousePosition }: { mousePosition: { x: number; y: number } }) => (
  <motion.div
    className="pointer-events-none fixed h-96 w-96 rounded-full bg-primary/5 blur-3xl"
    animate={{
      x: mousePosition.x - 192,
      y: mousePosition.y - 192,
    }}
    transition={{ type: "spring", damping: 40, stiffness: 300 }}
  />
)

export function HeroSection({ dictionary, stats, lang, contactLabel, cvLabel }: HeroSectionProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Cursor glow effect */}
      <CursorGlow mousePosition={mousePosition} />

      {/* Animated floating shapes background */}
      <FloatingShape delay={0} duration={20} x={100} y={100} size="w-96 h-96" />
      <FloatingShape delay={2} duration={25} x={-150} y={150} size="w-72 h-72" />
      <FloatingShape delay={4} duration={30} x={200} y={-100} size="w-80 h-80" />

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-background to-primary/20" />
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(120,119,198,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(120,119,198,0.1) 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
        }} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Main text content */}
          <motion.div
            variants={itemVariants}
            className="max-w-3xl"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-lg font-medium text-primary mb-4 inline-block"
            >
              {dictionary.greeting}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold mb-4 font-poppins bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60"
            >
              {dictionary.title}
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-2xl md:text-3xl font-medium mb-8 text-foreground/80"
            >
              {dictionary.subtitle}
            </motion.h2>
          </motion.div>

          {/* Statistics cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
          >
            <StatCard
              label={lang === "es" ? "Años estudiando" : "Years studying"}
              value={stats.yearsStudying}
              icon={<BookOpen className="h-5 w-5" />}
              delay={1}
            />
            <StatCard
              label={lang === "es" ? "Proyectos" : "Projects"}
              value={stats.projectsCompleted}
              icon={<Code2 className="h-5 w-5" />}
              delay={1.1}
            />
            <StatCard
              label={lang === "es" ? "Certificaciones" : "Certifications"}
              value={stats.certifications}
              icon={<Target className="h-5 w-5" />}
              delay={1.2}
            />
            <StatCard
              label={lang === "es" ? "Experiencia" : "Experience"}
              value={stats.yearsExperience}
              icon={<Zap className="h-5 w-5" />}
              delay={1.3}
            />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Link href={`/${lang}/portfolio`}>
              <Button
                size="lg"
                className="group w-full sm:w-auto bg-primary hover:bg-primary/90"
                aria-label={`${dictionary.cta} - ${dictionary.subtitle}`}
              >
                {dictionary.cta}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href={`/${lang}/contact`}>
              <Button
                variant="outline"
                size="lg"
                className="group w-full sm:w-auto"
              >
                {contactLabel}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href={`/${lang}/cv`}>
              <Button
                variant="ghost"
                size="lg"
                className="group w-full sm:w-auto"
              >
                {cvLabel}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative scroll indicator */}
      <div className="absolute bottom-2 left-0 right-0 z-0 flex justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{
            delay: 1.5,
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
