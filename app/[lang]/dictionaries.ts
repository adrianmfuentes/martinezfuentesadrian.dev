import "server-only"
import { cache } from "react"
import { getCachedCmsOverrides, computeExperienceLabel } from "@/lib/kv"
import { computeYearsStudyingLabel, computeEducationPeriod, computeDegreeStatusLabel } from "@/lib/academic"

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
    blog: string
  }
  commandPalette: {
    title: string
    description: string
    placeholder: string
    noResults: string
    groupNavigation: string
    groupLanguage: string
    switchToEnglish: string
    switchToSpanish: string
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
    birthDate: string
    bio: string[]
    stats: {
      yearsStudying: string
      projectsCompleted: string
      certifications: string
      yearsExperience: string
      techstack: string
    }
    skills: {
      title: string
      technical: string
      soft: string
      technicalSkills: {
        languages: string
        technologies: string
        frameworks: string
        versionControl: string
        cloud: string
        databases: string
        interests: string
      }
      softSkills: {
        teamwork: string
        problemSolving: string
        communication: string
        timeManagement: string
        adaptability: string
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
    view_online: string
    involvement: string
    about_grade: string
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
        gpa?: string
        honours?: string
        description: string | string[]
      }[]
    }
    certifications: {
      items: {
        title: string
        organization: string
        period: string
        description: string
        pdfUrl?: string
      }[]
    }
    experience: {
      items: {
        title: string
        organization: string
        location: string
        period: string
        department: string
        description: string | string[]
      }[]
    }
  }
  portfolio: {
    title: string
    subtitle: string
    viewProject: string
    viewCode: string
    featured: string
    status: {
      online: string
      offline: string
    }
    projects: {
      [key: string]: {
        title: string
        description: string
      }
    }
  }
  githubActivity: {
    title: string
    subtitle: string
    viewProfile: string
    empty: string
    opened: string
    closed: string
    events: {
      push: string
      createRepo: string
      createRef: string
      pullRequest: string
      issue: string
      watch: string
      fork: string
      release: string
      default: string
    }
  }
  konami: {
    title: string
    bootLines?: string[]
    lines: string[]
    closeHint: string
    prompt?: string
    inputPlaceholder?: string
    muteHint?: string
    unmuteHint?: string
    commands?: {
      help: string
      whoami: string
      about: string
      skills: string
      ls: string
      sudo: string
      navigating: string
      notFound: string
      themeUsage: string
      themeSet: string
      matrixOn: string
      matrixOff: string
      exit: string
    }
  }
  blog: {
    title: string
    subtitle: string
    empty: string
    minRead: string
    backToBlog: string
  }
  contact: {
    title: string
    description: string
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
    contactMethods: {
      title: string
      email: {
        label: string
        value: string
        responseTime: string
      }
      linkedin: {
        label: string
        contact_title: string
        value: string
        responseTime: string
      }
      github: {
        label: string
        contact_title: string
        value: string
        responseTime: string
      }
    }
    formInfo: {
      responseTime: string
      available: string
      availability: string[]
    }
  }
  footer: {
    rights: string
    visits: string
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
  headersValidator: {
    title: string
    description: string
    urlLabel: string
    urlPlaceholder: string
    validateButton: string
    validating: string
    resetButton: string
    results: {
      title: string
      url: string
      status: string
      secure: string
      insecure: string
      missing: string
      present: string
    }
    headers: {
      CORS: string
      CSP: string
      HSTS: string
      "X-Frame-Options": string
      "X-Content-Type-Options": string
      "Referrer-Policy": string
      "Permissions-Policy": string
    }
    descriptions: {
      CORS: string
      CSP: string
      HSTS: string
      "X-Frame-Options": string
      "X-Content-Type-Options": string
      "Referrer-Policy": string
      "Permissions-Policy": string
    }
    errors: {
      invalidUrl: string
      networkError: string
    }
  }
  passwordChecker: {
    title: string
    description: string
    passwordLabel: string
    passwordPlaceholder: string
    analyzeButton: string
    showPassword: string
    hidePassword: string
    minLengthWarning: string
    resetButton: string
    analysis: {
      title: string
      length: string
      lowercase: string
      uppercase: string
      digits: string
      special: string
      whitespace: string
      entropy: string
      strength: string
      remarks: string
      pwned: string
      pwnedStatus: {
        checking: string
        notFound: string
        found: string
        error: string
      }
    }
    strengthLevels: {
      veryWeak: string
      weak: string
      moderate: string
      strong: string
      veryStrong: string
    }
    strengthRemarks: {
      veryWeak: string
      weak: string
      moderate: string
      strong: string
      veryStrong: string
    }
  }
  certificatesChecker: {
    title: string
    description: string
    hostLabel: string
    hostPlaceholder: string
    portLabel: string
    portPlaceholder: string
    portHelp: string
    checkButton: string
    checking: string
    results: {
      title: string
      host: string
      resolvedIp: string
      subject: string
      issuer: string
      validFrom: string
      validUntil: string
      algorithm: string
      isCA: string
      daysLeft: string
      status: string
      sans: string
    }
    status: {
      valid: string
      expired: string
      expiringSoon: string
    }
    errors: {
      invalidHost: string
      invalidPort: string
      connectionError: string
      certificateError: string
    }
    resetButton: string
  }
  portScanner: {
    title: string
    description: string
    hostLabel: string
    hostPlaceholder: string
    portsLabel: string
    portsPlaceholder: string
    portsHelp: string
    scanButton: string
    stopButton: string
    scanning: string
    results: {
      title: string
      host: string
      resolvedIp: string
      totalPorts: string
      openPorts: string
      closedPorts: string
      progress: string
      status: string
    }
    portStatus: {
      open: string
      closed: string
      scanning: string
    }
    errors: {
      invalidHost: string
      invalidPorts: string
      scanError: string
      networkError: string
    }
    resetButton: string
  }
  webDiscovery: {
    title: string
    description: string
    urlLabel: string
    urlPlaceholder: string
    wordlistLabel: string
    wordlistPlaceholder: string
    threadsLabel: string
    threadsHelp: string
    scanButton: string
    stopButton: string
    randomAgent: string
    userAgentLabel: string
    refererLabel: string
    delayLabel: string
    debugLabel: string
    scanning: string
    results: {
      title: string
      url: string
      status: string
      total: string
    }
    errors: {
      invalidUrl: string
      wordlistMissing: string
      scanError: string
    }
    resetButton: string
  }
  passwordGenerator: {
    title: string
    description: string
    length: string
    minLength: string
    includeGreek: string
    includeSpecial: string
    generate: string
    copy: string
    copied: string
    strength: string
    weak: string
    medium: string
    strong: string
    veryStrong: string
    show: string
    hide: string
  }
  jwtDecoder: {
    title: string
    description: string
    tokenLabel: string
    tokenPlaceholder: string
    decodeButton: string
    resetButton: string
    secretLabel: string
    secretPlaceholder: string
    verifyButton: string
    header: string
    payload: string
    copy: string
    copied: string
    expiryStatus: {
      valid: string
      expired: string
      notYetValid: string
      noExpiry: string
    }
    signatureStatus: {
      valid: string
      invalid: string
      unsupported: string
    }
    errors: {
      invalidToken: string
      emptyToken: string
    }
  }
  dnsLookup: {
    title: string
    description: string
    domainLabel: string
    domainPlaceholder: string
    lookupButton: string
    lookingUp: string
    resetButton: string
    recordTypes: {
      A: string
      AAAA: string
      MX: string
      TXT: string
      NS: string
      CNAME: string
    }
    noRecords: string
    errors: {
      invalidDomain: string
      lookupError: string
      rateLimited: string
    }
  }
  hashGenerator: {
    title: string
    description: string
    textTab: string
    fileTab: string
    textLabel: string
    textPlaceholder: string
    fileLabel: string
    filePlaceholder: string
    generateButton: string
    generating: string
    resetButton: string
    copy: string
    copied: string
    errors: {
      empty: string
      fileTooLarge: string
    }
  }
}

const dictionaries: Record<string, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((module) => module.default as unknown as Dictionary),
  es: () => import("./dictionaries/es.json").then((module) => module.default as unknown as Dictionary),
}

export const getDictionary = cache(async (locale: "en" | "es"): Promise<Dictionary> => {
  const base = await dictionaries[locale]()

  base.home.subtitle = computeDegreeStatusLabel(locale)
  base.about.stats.yearsStudying = computeYearsStudyingLabel(locale)
  base.about.education.period = computeEducationPeriod(locale)

  try {
    const { expOverride, eduOverride, certOverride, counter } = await getCachedCmsOverrides(locale)

    if (expOverride) base.cv.experience = expOverride as Dictionary["cv"]["experience"]
    if (eduOverride) {
      base.cv.education = eduOverride as Dictionary["cv"]["education"]
    } else if (base.cv.education.items[0]) {
      base.cv.education.items[0].period = computeEducationPeriod(locale)
    }
    if (certOverride) base.cv.certifications = certOverride as Dictionary["cv"]["certifications"]

    if (counter.autoIncrement && counter.startDate) {
      base.about.stats.yearsExperience = computeExperienceLabel(counter.startDate, locale)
    }
  } catch {
    // KV unavailable — return static JSON as-is
  }

  return base
})
