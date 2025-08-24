import { CertificatesChecker } from "../../../../components/certificates-checker"

const spanishDict = {
  title: "Verificador de Certificados SSL/TLS",
  description: "Analiza certificados SSL/TLS de sitios web para verificar su validez, emisor, fechas de expiración y configuración de seguridad.",
  hostLabel: "Host a verificar",
  hostPlaceholder: "ejemplo.com o 192.168.1.1",
  portLabel: "Puerto SSL/TLS",
  portPlaceholder: "443",
  portHelp: "Puerto donde se ejecuta el servicio SSL/TLS. Puertos comunes:",
  checkButton: "Verificar Certificado",
  checking: "Verificando...",
  results: {
    title: "Información del Certificado",
    host: "Host",
    resolvedIp: "IP Resuelta",
    subject: "Sujeto",
    issuer: "Emisor",
    validFrom: "Válido desde",
    validUntil: "Válido hasta",
    algorithm: "Algoritmo",
    isCA: "Es CA",
    daysLeft: "Días restantes",
    status: "Estado",
    sans: "Nombres alternativos (SANs)"
  },
  status: {
    valid: "Válido",
    expired: "Vencido",
    expiringSoon: "Expira pronto"
  },
  errors: {
    invalidHost: "Host inválido. Ingresa una dirección IP válida o nombre de dominio.",
    invalidPort: "Puerto inválido. Debe estar entre 1 y 65535.",
    connectionError: "Error de conexión. Verifica el host y puerto.",
    certificateError: "Error al obtener el certificado. Verifica que el servicio SSL/TLS esté disponible."
  },
  resetButton: "Nueva Verificación"
} as const

const englishDict = {
  title: "SSL/TLS Certificate Checker",
  description: "Analyze SSL/TLS certificates from websites to verify their validity, issuer, expiration dates, and security configuration.",
  hostLabel: "Host to check",
  hostPlaceholder: "example.com or 192.168.1.1",
  portLabel: "SSL/TLS Port",
  portPlaceholder: "443",
  portHelp: "Port where the SSL/TLS service is running. Common ports:",
  checkButton: "Check Certificate",
  checking: "Checking...",
  results: {
    title: "Certificate Information",
    host: "Host",
    resolvedIp: "Resolved IP",
    subject: "Subject",
    issuer: "Issuer",
    validFrom: "Valid from",
    validUntil: "Valid until",
    algorithm: "Algorithm",
    isCA: "Is CA",
    daysLeft: "Days left",
    status: "Status",
    sans: "Subject Alternative Names (SANs)"
  },
  status: {
    valid: "Valid",
    expired: "Expired",
    expiringSoon: "Expiring soon"
  },
  errors: {
    invalidHost: "Invalid host. Enter a valid IP address or domain name.",
    invalidPort: "Invalid port. Must be between 1 and 65535.",
    connectionError: "Connection error. Check the host and port.",
    certificateError: "Error getting certificate. Verify that the SSL/TLS service is available."
  },
  resetButton: "New Check"
} as const

export default async function CertificatesCheckerPage({
  params,
}: {
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const dictionary = lang === "es" ? spanishDict : englishDict

  return <CertificatesChecker dictionary={dictionary} />
}
