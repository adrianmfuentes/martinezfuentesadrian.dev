import { WebDiscovery } from "../../../../components/web-discovery"

const spanishDict = {
  title: "Descubrimiento de Contenido Web",
  description: "Explora rutas y recursos de un sitio web. Útil para auditorías y pruebas de reconocimiento.",
  urlLabel: "URL objetivo",
  urlPlaceholder: "https://ejemplo.com",
  wordlistLabel: "Wordlist",
  wordlistPlaceholder: "Selecciona o pega rutas separadas por líneas",
  threadsLabel: "Hilos",
  threadsHelp: "Número de hilos concurrentes para el escaneo",
  scanButton: "Iniciar Búsqueda",
  stopButton: "Detener",
  randomAgent: "User-Agent aleatorio",
  userAgentLabel: "User-Agent personalizado",
  refererLabel: "Referer (opcional)",
  delayLabel: "Retardo (seg)",
  debugLabel: "Mostrar cabeceras en 403 (debug)",
  scanning: "Escaneando...",
  results: {
    title: "Resultados",
    url: "URL",
    status: "Código",
    total: "Total encontrados"
  },
  errors: {
    invalidUrl: "URL inválida. Incluye http:// o https://",
    wordlistMissing: "Wordlist vacía. Añade rutas para escanear.",
    scanError: "Error durante el escaneo. Revisa los parámetros."
  },
  resetButton: "Nuevo Escaneo"
} as const

const englishDict = {
  title: "Web Content Discovery",
  description: "Enumerate paths and resources on a website. Useful for reconnaissance and audits.",
  urlLabel: "Target URL",
  urlPlaceholder: "https://example.com",
  wordlistLabel: "Wordlist",
  wordlistPlaceholder: "Select or paste newline-separated paths",
  threadsLabel: "Threads",
  threadsHelp: "Number of concurrent worker threads for scanning",
  scanButton: "Start Discovery",
  stopButton: "Stop",
  randomAgent: "Random User-Agent",
  userAgentLabel: "Custom User-Agent",
  refererLabel: "Referer (optional)",
  delayLabel: "Delay (sec)",
  debugLabel: "Show headers on 403 (debug)",
  scanning: "Scanning...",
  results: {
    title: "Results",
    url: "URL",
    status: "Status code",
    total: "Total found"
  },
  errors: {
    invalidUrl: "Invalid URL. Include http:// or https://",
    wordlistMissing: "Empty wordlist. Add paths to scan.",
    scanError: "Error during discovery. Check parameters."
  },
  resetButton: "New Discovery"
} as const

export default async function WebDiscoveryPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = lang === "es" ? spanishDict : englishDict
  return <WebDiscovery dictionary={dictionary} />
}
