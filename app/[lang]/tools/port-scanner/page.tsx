import { PortScanner } from "../../../../components/port-scanner"

const spanishDict = {
  title: "Escáner de Puertos",
  description: "Analiza la accesibilidad de puertos TCP en hosts remotos para verificar servicios disponibles y realizar auditorías de seguridad básicas.",
  hostLabel: "Host a escanear",
  hostPlaceholder: "ejemplo.com o 192.168.1.1",
  portsLabel: "Puertos a escanear",
  portsPlaceholder: "80, 22-25, 443",
  portsHelp: "Ingresa puertos individuales (80), rangos (22-25) o listas separadas por comas (80,443,22-25)",
  scanButton: "Iniciar Escaneo",
  stopButton: "Detener",
  scanning: "Escaneando...",
  results: {
    title: "Resultados del Escaneo",
    host: "Host",
    resolvedIp: "IP Resuelta",
    totalPorts: "Puertos Totales",
    openPorts: "Puertos Abiertos",
    closedPorts: "Puertos Cerrados",
    progress: "Progreso del Escaneo",
    status: "Estado"
  },
  portStatus: {
    open: "Abierto",
    closed: "Cerrado",
    scanning: "Escaneando"
  },
  errors: {
    invalidHost: "Host inválido. Ingresa una dirección IP válida o nombre de dominio.",
    invalidPorts: "Puertos inválidos. Usa formato: 80, 22-25, o 80,443",
    scanError: "Error durante el escaneo. Verifica la conectividad.",
    networkError: "Error de red. Verifica tu conexión a internet."
  },
  resetButton: "Nuevo Escaneo"
} as const

const englishDict = {
  title: "Port Scanner",
  description: "Analyze TCP port accessibility on remote hosts to verify available services and perform basic security audits.",
  hostLabel: "Host to scan",
  hostPlaceholder: "example.com or 192.168.1.1",
  portsLabel: "Ports to scan",
  portsPlaceholder: "80, 22-25, 443",
  portsHelp: "Enter individual ports (80), ranges (22-25), or comma-separated lists (80,443,22-25)",
  scanButton: "Start Scan",
  stopButton: "Stop",
  scanning: "Scanning...",
  results: {
    title: "Scan Results",
    host: "Host",
    resolvedIp: "Resolved IP",
    totalPorts: "Total Ports",
    openPorts: "Open Ports",
    closedPorts: "Closed Ports",
    progress: "Scan Progress",
    status: "Status"
  },
  portStatus: {
    open: "Open",
    closed: "Closed",
    scanning: "Scanning"
  },
  errors: {
    invalidHost: "Invalid host. Enter a valid IP address or domain name.",
    invalidPorts: "Invalid ports. Use format: 80, 22-25, or 80,443",
    scanError: "Error during scan. Check connectivity.",
    networkError: "Network error. Check your internet connection."
  },
  resetButton: "New Scan"
} as const

export default async function PortScannerPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = lang === "es" ? spanishDict : englishDict

  return <PortScanner dictionary={dictionary} />
}