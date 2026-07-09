"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Home, User, GraduationCap, Briefcase, Wrench, Mail, Newspaper, Globe, Search } from "lucide-react"
import { Button } from "@components/ui/button"
import { DialogTitle, DialogDescription } from "@components/ui/dialog"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@components/ui/command"

interface CommandPaletteProps {
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

export function CommandPalette({ lang, dictionary, commandDictionary }: Readonly<CommandPaletteProps>) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const go = useCallback(
    (path: string) => {
      setOpen(false)
      router.push(path)
    },
    [router]
  )

  const switchLanguage = useCallback(
    (locale: string) => {
      setOpen(false)
      const pathWithoutLocale = pathname.replace(/^\/(en|es)/, "") || "/"
      router.push(`/${locale}${pathWithoutLocale}`)
    },
    [pathname, router]
  )

  const navItems = [
    { href: `/${lang}`, label: dictionary.home, icon: Home },
    { href: `/${lang}/about`, label: dictionary.about, icon: User },
    { href: `/${lang}/cv`, label: dictionary.cv, icon: GraduationCap },
    { href: `/${lang}/portfolio`, label: dictionary.portfolio, icon: Briefcase },
    { href: `/${lang}/tools`, label: dictionary.tools, icon: Wrench },
    { href: `/${lang}/blog`, label: dictionary.blog, icon: Newspaper },
    { href: `/${lang}/contact`, label: dictionary.contact, icon: Mail },
  ]

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden md:inline-flex items-center gap-2 text-foreground/60 font-normal"
        onClick={() => setOpen(true)}
        aria-label={commandDictionary.placeholder}
      >
        <Search className="h-4 w-4" />
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px]">
          <span>⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">{commandDictionary.title}</DialogTitle>
        <DialogDescription className="sr-only">{commandDictionary.description}</DialogDescription>
        <CommandInput placeholder={commandDictionary.placeholder} />
        <CommandList>
          <CommandEmpty>{commandDictionary.noResults}</CommandEmpty>
          <CommandGroup heading={commandDictionary.groupNavigation}>
            {navItems.map((item) => (
              <CommandItem key={item.href} onSelect={() => go(item.href)}>
                <item.icon />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={commandDictionary.groupLanguage}>
            <CommandItem onSelect={() => switchLanguage("en")}>
              <Globe />
              {commandDictionary.switchToEnglish}
            </CommandItem>
            <CommandItem onSelect={() => switchLanguage("es")}>
              <Globe />
              {commandDictionary.switchToSpanish}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
