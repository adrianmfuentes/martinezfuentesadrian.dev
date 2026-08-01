"use client"

import { useRef } from "react"
import { Card, CardContent } from "@components/ui/card"
import { motion, useInView } from "framer-motion"
import Image from 'next/image';
import backgroundImage from '../public/images/me.jpeg';
import { Rocket, Lightbulb, Users, Zap, BookOpen, Award, GraduationCap, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@components/ui/button"
import { getAge } from "@/lib/academic"
import { SkillsSection } from "@components/skills-section"

interface AboutSectionProps {
  readonly lang: string
  readonly dictionary: {
    readonly title: string
    readonly subtitle: string
    readonly birthDate: string
    readonly bio: readonly string[]
    readonly stats: {
      readonly projectsCompleted: string
      readonly certifications: string
      readonly thesisGrade: string
    }
    readonly education: {
      readonly title: string
      readonly degree: string
      readonly university: string
      readonly period: string
    }
    readonly skills: {
      readonly title: string
      readonly technical: string
      readonly soft: string
      readonly technicalSkills: {
        readonly languages: string
        readonly technologies: string
        readonly frameworks: string
        readonly versionControl: string
        readonly cloud: string
        readonly databases: string
        readonly interests: string
      }
      readonly softSkills: {
        readonly teamwork: string
        readonly problemSolving: string
        readonly communication: string
        readonly timeManagement: string
        readonly adaptability: string
        readonly leadership: string
      }
    }
  }
}

const MotionCard = motion.create(Card)

const bioIcons = [Rocket, Lightbulb, Users, Zap];

export function AboutSection({ lang, dictionary }: AboutSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const age = dictionary.birthDate ? getAge(dictionary.birthDate) : null;

  const bioParagraphs = dictionary.bio.map(paragraph =>
    paragraph.replace('{age}', age === null ? 'N/A' : age.toString())
  );

  const stats = [
    { label: lang === "es" ? "Proyectos" : "Projects", value: dictionary.stats.projectsCompleted, icon: Zap },
    { label: lang === "es" ? "Certificaciones" : "Certifications", value: dictionary.stats.certifications, icon: Award },
    { label: lang === "es" ? "Nota TFG" : "Thesis Grade", value: dictionary.stats.thesisGrade, icon: GraduationCap }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl sm:text-5xl font-bold mb-3 font-poppins">{dictionary.title}</h2>
        <p className="text-lg text-foreground/70">{dictionary.subtitle}</p>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-3 gap-4 mb-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="h-full bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 transition-all duration-300">
                <CardContent className="p-3 sm:p-6 text-center flex flex-col items-center justify-center gap-1.5 min-h-fit">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <p className="text-sm sm:text-3xl font-bold text-primary break-words leading-tight">{stat.value}</p>
                  <p className="text-[0.65rem] sm:text-sm text-foreground/70 leading-tight line-clamp-2">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start mb-16">
        {/* Image - First on mobile */}
        <motion.div
          className="order-first md:order-last relative rounded-xl overflow-hidden flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative w-full max-w-md">
            <Image
              src={backgroundImage}
              alt="About me"
              width={400}
              height={400}
              className="rounded-xl h-auto w-full"
              style={{ objectFit: 'cover' }}
              priority
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
          </div>
        </motion.div>

        {/* Bio Content */}
        <motion.div
          ref={ref}
          className="order-last md:order-first"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="space-y-6">
            {bioParagraphs.map((paragraph, index) => {
              const Icon = bioIcons[index % bioIcons.length];
              return (
                <motion.div
                  key={paragraph}
                  className="flex gap-4"
                  variants={itemVariants}
                >
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary mt-1" />
                  </div>
                  <p className="text-foreground/80 leading-relaxed">
                    {paragraph}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Education Card */}
          <MotionCard
            className="mt-10 border-primary/20 hover:border-primary/40 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <BookOpen className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{dictionary.education.title}</h3>
                  <p className="font-medium text-sm text-primary mb-1">{dictionary.education.degree}</p>
                  <p className="text-foreground/70 text-sm">{dictionary.education.university}</p>
                  <p className="text-xs text-foreground/60 mt-2">{dictionary.education.period}</p>
                </div>
              </div>
            </CardContent>
          </MotionCard>

          {/* CTA Button */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <Link href={`/${lang}/cv`}>
              <Button className="w-full gap-2 group" size="lg">
                {dictionary.education.title}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <SkillsSection dictionary={dictionary.skills} />
    </section>
  )
}
