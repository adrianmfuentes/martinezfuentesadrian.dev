"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Home, User, GraduationCap, Briefcase, Wrench, Mail, Newspaper } from "lucide-react"
import { Button } from "@components/ui/button"
import { LanguageSwitcher } from "./language-switcher"
import { CommandPalette } from "./command-palette"

interface NavbarProps {
  lang: string
  dictionary: {
    home: string
    about: string
    cv: string
    portfolio: string
    contact: string
    tools: string
    blog: string
  }
  commandDictionary: {
    title: string
    description: string
    placeholder: string
    noResults: string
    groupNavigation: string
    groupLanguage: string
    switchToEnglish: string
    switchToSpanish: string
  }
}

export function Navbar({ lang, dictionary, commandDictionary }: Readonly<NavbarProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(globalThis.scrollY > 10)
    }

    globalThis.addEventListener("scroll", handleScroll)
    return () => globalThis.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { href: `/${lang}`, label: dictionary.home, icon: Home },
    { href: `/${lang}/about`, label: dictionary.about, icon: User },
    { href: `/${lang}/cv`, label: dictionary.cv, icon: GraduationCap },
    { href: `/${lang}/portfolio`, label: dictionary.portfolio, icon: Briefcase },
    { href: `/${lang}/blog`, label: dictionary.blog, icon: Newspaper },
    { href: `/${lang}/tools`, label: dictionary.tools, icon: Wrench },
    { href: `/${lang}/contact`, label: dictionary.contact, icon: Mail },
  ]

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent"}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href={`/${lang}`} className="font-bold text-xl font-poppins">
            <span className="text-primary">Adrián</span> Martínez
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === item.href ? "text-primary" : "text-foreground/80"}`}
                aria-label={`Ir a ${item.label}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-2">
            <CommandPalette lang={lang} dictionary={dictionary} commandDictionary={commandDictionary} />
            <LanguageSwitcher currentLang={lang} />
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
          >
            <Menu className={`h-6 w-6 ${isOpen ? "hidden" : "block"}`} />
            <X className={`h-6 w-6 ${isOpen ? "block" : "hidden"}`} />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors active:scale-[0.98] ${pathname === item.href ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-foreground/5 hover:text-primary"}`}
                onClick={() => setIsOpen(false)}
                aria-label={`Ir a ${item.label}`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            ))}
            <div className="flex items-center space-x-4 pt-3 mt-2 border-t">
              <LanguageSwitcher currentLang={lang} />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
