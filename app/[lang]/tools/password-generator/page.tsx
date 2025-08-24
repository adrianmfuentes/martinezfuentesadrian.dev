import { PasswordGenerator } from "../../../../components/password-generator"

const spanishDict = {
  title: "Generador de Contraseñas",
  description: "Genera contraseñas seguras con opciones personalizables",
  length: "Longitud de la contraseña",
  minLength: "Mínimo",
  includeGreek: "Incluir caracteres griegos (αβγ...)",
  includeSpecial: "Incluir símbolos (!@#...)",
  generate: "Generar Contraseña",
  copy: "Haz clic para copiar",
  copied: "¡Copiado al portapapeles!",
  strength: "Fortaleza de la contraseña",
  weak: "Débil",
  medium: "Media",
  strong: "Fuerte",
  veryStrong: "Muy Fuerte",
  show: "Mostrar",
  hide: "Ocultar",
}

const englishDict = {
  title: "Password Generator",
  description: "Generate secure passwords with customizable options",
  length: "Password length",
  minLength: "Minimum",
  includeGreek: "Include Greek characters (αβγ...)",
  includeSpecial: "Include symbols (!@#...)",
  generate: "Generate Password",
  copy: "Click to copy",
  copied: "Copied to clipboard!",
  strength: "Password strength",
  weak: "Weak",
  medium: "Medium",
  strong: "Strong",
  veryStrong: "Very Strong",
  show: "Show",
  hide: "Hide",
}

export default async function PasswordGeneratorPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = lang === "es" ? spanishDict : englishDict
  return <PasswordGenerator dictionary={dictionary} />
}