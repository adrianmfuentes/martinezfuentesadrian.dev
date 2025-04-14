"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "./language-switcher"
import { ThemeToggle } from "./theme-toggle"

interface NavbarProps {
  lang: string
  dictionary: {
    home: string
    about: string
    cv: string
    portfolio: string
    contact: string
    darkMode: string
    lightMode: string
  }
}

export function Navbar({ lang, dictionary }: Readonly<NavbarProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { href: `/${lang}`, label: dictionary.home },
    { href: `/${lang}/about`, label: dictionary.about },
    { href: `/${lang}/cv`, label: dictionary.cv },
    { href: `/${lang}/portfolio`, label: dictionary.portfolio },
    { href: `/${lang}/contact`, label: dictionary.contact },
  ]

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
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-2">
            <LanguageSwitcher currentLang={lang} />
            <ThemeToggle dictionary={dictionary} />
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <Menu className={`h-6 w-6 ${isOpen ? "hidden" : "block"}`} />
            <X className={`h-6 w-6 ${isOpen ? "block" : "hidden"}`} />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 text-base font-medium transition-colors hover:text-primary ${pathname === item.href ? "text-primary" : "text-foreground/80"}`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center space-x-4 pt-4 border-t">
              <LanguageSwitcher currentLang={lang} />
              <ThemeToggle dictionary={dictionary} />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
