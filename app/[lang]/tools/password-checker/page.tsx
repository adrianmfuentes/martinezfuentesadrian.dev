import { PasswordChecker } from "../../../../components/password-checker"

const spanishDict = {
  title: "Verificador de Contraseñas",
  description: "Analiza la fortaleza de tus contraseñas calculando la entropía y verificando la diversidad de caracteres para mejorar tu seguridad digital.",
  passwordLabel: "Ingresa tu contraseña",
  passwordPlaceholder: "Escribe tu contraseña aquí...",
  analyzeButton: "Analizar Contraseña",
  showPassword: "Mostrar contraseña",
  hidePassword: "Ocultar contraseña",
  minLengthWarning: "Tu contraseña es muy corta! Debe tener al menos {min} caracteres.",
  resetButton: "Analizar Nueva Contraseña",
  analysis: {
    title: "Análisis de Contraseña",
    length: "Longitud",
    lowercase: "Minúsculas",
    uppercase: "Mayúsculas",
    digits: "Dígitos",
    special: "Caracteres especiales",
    whitespace: "Espacios en blanco",
    entropy: "Entropía",
    strength: "Fortaleza",
    remarks: "Observaciones",
    pwned: "Estado de Filtración",
    pwnedStatus: {
      checking: "Verificando...",
      notFound: "✅ No filtrada",
      found: "⚠️ Filtrada {count} veces",
      error: "Error en verificación"
    }
  },
  strengthLevels: {
    veryWeak: "Muy Débil",
    weak: "Débil",
    moderate: "Moderada",
    strong: "Fuerte",
    veryStrong: "Muy Fuerte"
  },
  strengthRemarks: {
    veryWeak: "⚠️ Muy Débil: ¡Fácilmente adivinable! Cámbiala inmediatamente.",
    weak: "⚠️ Débil: Puede ser crackeada rápidamente. Usa una contraseña más fuerte.",
    moderate: "✅ Moderada: Contraseña decente, pero puede mejorarse.",
    strong: "✅ Fuerte: Difícil de adivinar, pero considera hacerla más larga.",
    veryStrong: "✅ Muy Fuerte: ¡Excelente contraseña! Altamente segura."
  }
} as const

const englishDict = {
  title: "Password Checker",
  description: "Analyze the strength of your passwords by calculating entropy and checking character diversity to improve your digital security.",
  passwordLabel: "Enter your password",
  passwordPlaceholder: "Type your password here...",
  analyzeButton: "Analyze Password",
  showPassword: "Show password",
  hidePassword: "Hide password",
  minLengthWarning: "Your password is too short! It must be at least {min} characters.",
  resetButton: "Analyze New Password",
  analysis: {
    title: "Password Analysis",
    length: "Length",
    lowercase: "Lowercase letters",
    uppercase: "Uppercase letters",
    digits: "Digits",
    special: "Special characters",
    whitespace: "Whitespace characters",
    entropy: "Entropy Score",
    strength: "Strength",
    remarks: "Remarks",
    pwned: "Breach Status",
    pwnedStatus: {
      checking: "Checking...",
      notFound: "✅ Not breached",
      found: "⚠️ Breached {count} times",
      error: "Verification error"
    }
  },
  strengthLevels: {
    veryWeak: "Very Weak",
    weak: "Weak",
    moderate: "Moderate",
    strong: "Strong",
    veryStrong: "Very Strong"
  },
  strengthRemarks: {
    veryWeak: "⚠️ Very Weak: Easily guessable! Change it immediately.",
    weak: "⚠️ Weak: Can be cracked quickly. Use a stronger password.",
    moderate: "✅ Moderate: Decent password, but can still be improved.",
    strong: "✅ Strong: Hard to guess, but consider making it longer.",
    veryStrong: "✅ Very Strong: Excellent password! Highly secure."
  }
} as const

export default async function PasswordCheckerPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = lang === "es" ? spanishDict : englishDict
  return <PasswordChecker dictionary={dictionary} />
}
