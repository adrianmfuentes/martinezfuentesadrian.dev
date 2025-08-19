import "server-only"

interface Dictionary {
  metadata: {
    title: string
    description: string
    keywords: string
  }
  navigation: {
    home: string
    about: string
    cv: string
    portfolio: string
    contact: string
    tools: string
    darkMode: string
    lightMode: string
  }
  home: {
    greeting: string
    title: string
    subtitle: string
    cta: string
  }
  about: {
    title: string
    subtitle: string
    bio: string[]
    skills: {
      title: string
      technical: string
      soft: string
    }
    education: {
      title: string
      degree: string
      university: string
      period: string
    }
  }
  cv: {
    title: string
    subtitle: string
    download: string
  }
  portfolio: {
    title: string
    subtitle: string
    viewProject: string
    viewCode: string
    categories: {
      all: string
      design: string
      web: string
      system: string
      data: string
      game: string
    }
    projects: {
      [key: string]: {
        title: string
        description: string
      }
    }
  }
  contact: {
    title: string
    subtitle: string
    name: string
    email: string
    message: string
    send: string
    success: string
    error: string
  }
  footer: {
    rights: string
  }
  tools: {
    title: string
    subtitle: string
    description: string
    comingSoon: string
    launchTool: string
    categories: {
      security: string
      development: string
      networking: string
      analysis: string
    }
    items: {
      id: string
      name: string
      description: string
      category: string
      status: string
    }[]
  }
}

const dictionaries: Record<string, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  es: () => import("./dictionaries/es.json").then((module) => module.default),
}

export const getDictionary = async (locale: "en" | "es") => {
  return dictionaries[locale]()
}
