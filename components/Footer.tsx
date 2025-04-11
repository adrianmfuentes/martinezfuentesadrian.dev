import type React from "react"
import Link from "next/link"
import { Github, Linkedin, Twitter, Mail } from "lucide-react"

interface FooterProps {
  lang: string
  dictionary: {
    rights: string
    madeWith: string
  }
}

export function Footer({ lang, dictionary }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href={`/${lang}`} className="font-bold text-xl font-poppins">
              <span className="text-primary">John</span> Doe
            </Link>
          </div>

          <div className="flex space-x-4 mb-4 md:mb-0">
            <SocialLink href="https://github.com" icon={<Github className="h-5 w-5" />} />
            <SocialLink href="https://linkedin.com" icon={<Linkedin className="h-5 w-5" />} />
            <SocialLink href="https://twitter.com" icon={<Twitter className="h-5 w-5" />} />
            <SocialLink href="mailto:contact@example.com" icon={<Mail className="h-5 w-5" />} />
          </div>
        </div>

        <div className="border-t mt-6 pt-6 text-center text-sm text-foreground/70">
          <p>
            &copy; {currentYear} Adrián Martínez. {dictionary.rights}.
          </p>
        </div>
      </div>
    </footer>
  )
}

interface SocialLinkProps {
  href: string
  icon: React.ReactNode
}

function SocialLink({ href, icon }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
    >
      {icon}
    </a>
  )
}
