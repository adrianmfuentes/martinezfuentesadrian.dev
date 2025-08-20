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
      technicalSkills: {
        java: string
        python: string
        cpp: string
        webDevelopment: string
        databases: string
        linuxDocker: string
        llm: string
        cybersecurity: string
      }
      softSkills: {
        teamwork: string
        problemSolving: string
        communication: string
        timeManagement: string
        adaptability: string
        goalOriented: string
        leadership: string
      }
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
    tabs: {
      education: string
      certifications: string
      experience: string
    }
    education: {
      items: {
        title: string
        organization: string
        period: string
        description: string
      }[]
    }
    certifications: {
      items: {
        title: string
        organization: string
        period: string
        description: string
      }[]
    }
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
    subject: string
    message: string
    send: string
    success: string
    error: string
    priority: string
    priorityLow: string
    priorityMedium: string
    priorityHigh: string
    placeholders: {
      name: string
      email: string
      subject: string
      message: string
    }
    validation: {
      nameRequired: string
      emailRequired: string
      messageRequired: string
    }
    confirmation: {
      title: string
      message: string
      response: string
      close: string
    }
  }
  footer: {
    rights: string
  }
  chat: {
    title: string
    placeholder: string
    send: string
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
