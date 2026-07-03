"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Badge } from "@components/ui/badge"
import { 
  Globe, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from "lucide-react"

interface HeaderValidation {
  name: string
  key: string
  value: string | null
  status: "present" | "missing" | "secure" | "insecure"
  isSecure?: boolean
}

interface HeadersValidatorProps {
  dictionary: {
    title: string
    description: string
    urlLabel: string
    urlPlaceholder: string
    validateButton: string
    validating: string
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
    resetButton: string
  }
}

interface HeaderConfig {
  key: string
  secure?: (value: string) => boolean
  allowReportOnly?: boolean
}

// Configuración de cabeceras esperadas (adaptado del código Python)
const expectedHeaders: Record<string, HeaderConfig> = {
  CORS: {
    key: "Access-Control-Allow-Origin",
    secure: (value: string) => value !== "*" // Inseguro: permite cualquier origen
  },
  CSP: {
    key: "Content-Security-Policy",
    allowReportOnly: true // Permite el uso de una política solo de reporte
  },
  HSTS: {
    key: "Strict-Transport-Security",
    secure: (value: string) => {
      // Verificar que tenga max-age y sea al menos 1 año (31536000 segundos)
      const maxAgeRegex = /max-age=(\d+)/
      const maxAgeMatch = maxAgeRegex.exec(value)
      if (!maxAgeMatch) return false
      const maxAge = Number.parseInt(maxAgeMatch[1])
      return maxAge >= 31536000 // 1 año mínimo
    }
  },
  "X-Frame-Options": {
    key: "X-Frame-Options",
    secure: (value: string) => ["DENY", "SAMEORIGIN"].includes(value.toUpperCase()) // Valores seguros
  },
  "X-Content-Type-Options": {
    key: "X-Content-Type-Options",
    secure: (value: string) => { // Protección contra MIME sniffing
      return value.toLowerCase() === "nosniff" || value.toLowerCase() === "nosniff, nosniff" 
    },
  },
  "Referrer-Policy": {
    key: "Referrer-Policy",
    secure: (value: string) => {
      const secureValues = ["no-referrer", "strict-origin", "strict-origin-when-cross-origin"]
      return secureValues.includes(value.toLowerCase())
    }
  },
  "Permissions-Policy": {
    key: "Permissions-Policy" // Controla qué características se pueden usar en el navegador
  }
}

function validateUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

function validateHeader(name: string, info: HeaderConfig, headers: Record<string, string>): HeaderValidation {
  const key = info.key
  let value: string | null = null
  let isReportOnly = false

  if (headers[key]) {
    value = headers[key]
  } else if (name === "CSP" && info.allowReportOnly && headers["Content-Security-Policy-Report-Only"]) {
    value = headers["Content-Security-Policy-Report-Only"]
    isReportOnly = true
  }

  let status: "present" | "missing" | "secure" | "insecure" = "missing"
  let isSecure: boolean | undefined = undefined

  if (value) {
    status = "present"
    const secureFunction = info.secure
    if (secureFunction) {
      isSecure = secureFunction(value)
      status = isSecure ? "secure" : "insecure"
    }
  }

  const finalValue = value && isReportOnly ? `${value} (Report-Only)` : value

  return {
    name,
    key,
    value: finalValue,
    status,
    isSecure
  }
}

// Función para realizar la validación de cabeceras usando un proxy
async function analyzeHeaders(url: string): Promise<Record<string, string>> {
  try {
    const response = await fetch(`/api/validate-headers?url=${encodeURIComponent(url)}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to validate headers')
    }
    
    return data.headers || {}
  } catch (error) {
    console.error('Error analyzing headers:', error)
    throw new Error('No se pudieron obtener las cabeceras del sitio web')
  }
}

export default function HttpHeadersValidator({ dictionary }: Readonly<HeadersValidatorProps>) {
  const [url, setUrl] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [results, setResults] = useState<{
    url: string
    validations: HeaderValidation[]
    summary: {
      total: number
      present: number
      secure: number
      insecure: number
      missing: number
    }
  } | null>(null)
  const [error, setError] = useState("")

  const handleValidate = async () => {
    if (!url.trim()) {
      setError(dictionary.errors.invalidUrl)
      return
    }

    if (!validateUrl(url)) {
      setError(dictionary.errors.invalidUrl)
      return
    }

    setIsValidating(true)
    setError("")
    setResults(null)

    try {
      const headers = await analyzeHeaders(url)
      
      const validationResults = Object.entries(expectedHeaders).map(([name, info]) => 
        validateHeader(name, info, headers)
      )

      setResults({
        url,
        validations: validationResults,
        summary: {
          total: validationResults.length,
          present: validationResults.filter(v => v.status !== "missing").length,
          secure: validationResults.filter(v => v.status === "secure").length,
          insecure: validationResults.filter(v => v.status === "insecure").length,
          missing: validationResults.filter(v => v.status === "missing").length
        }
      })
    } catch (err) {
      console.error('Validation error:', err)
      setError(err instanceof Error ? err.message : dictionary.errors.networkError)
    } finally {
      setIsValidating(false)
    }
  }

  const handleReset = () => {
    setUrl("")
    setResults(null)
    setError("")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "secure":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "insecure":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "present":
        return <Eye className="h-4 w-4 text-green-500" />
      case "missing":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "secure":
        return <Badge variant="default" className="bg-green-500">{dictionary.results.secure}</Badge>
      case "insecure":
        return <Badge variant="destructive">{dictionary.results.insecure}</Badge>
      case "present":
        return <Badge variant="default" className="bg-green-600">{dictionary.results.present}</Badge>
      case "missing":
        return <Badge variant="outline">{dictionary.results.missing}</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 p-3 sm:p-6">
      <div className="container mx-auto max-w-4xl pt-32 sm:pt-28 md:pt-20">
        <div className="space-y-6">
          <Card className="bg-black/70 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-300 font-mono">
                <Shield className="h-5 w-5 text-green-400" />
                {dictionary.title}
              </CardTitle>
              <p className="text-sm text-gray-300">
                {dictionary.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium text-green-300">
                  {dictionary.urlLabel}
                </label>
                <Input
                  id="url"
                  type="url"
                  placeholder={dictionary.urlPlaceholder}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isValidating}
                  className="bg-gray-900/50 border-green-500/30 text-green-300 font-mono focus:border-green-400"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-900/30 border border-red-500/30 p-3 rounded-md">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleValidate} 
                  disabled={isValidating || !url.trim()}
                  className="flex items-center gap-2 w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-semibold"
                >
                  {isValidating ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      {dictionary.validating}
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4" />
                      {dictionary.validateButton}
                    </>
                  )}
                </Button>

                {results && (
                  <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto border-green-500/30 text-green-400 hover:bg-green-500/10">
                    {dictionary.resetButton}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {results && (
            <Card className="bg-black/70 border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-300 font-mono">
                  <Shield className="h-5 w-5 text-green-400" />
                  {dictionary.results.title}
                </CardTitle>
                <div className="text-sm text-gray-300">
                  <p className="break-all"><strong>{dictionary.results.url}:</strong> {results.url}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resumen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{results.summary.secure}</div>
                    <div className="text-sm text-green-300">{dictionary.results.secure}</div>
                  </div>
                  <div className="text-center p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">{results.summary.insecure}</div>
                    <div className="text-sm text-red-300">{dictionary.results.insecure}</div>
                  </div>
                  <div className="text-center p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{results.summary.present}</div>
                    <div className="text-sm text-green-300">{dictionary.results.present}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-900/30 border border-gray-500/30 rounded-lg">
                    <div className="text-2xl font-bold text-gray-400">{results.summary.missing}</div>
                    <div className="text-sm text-gray-300">{dictionary.results.missing}</div>
                  </div>
                </div>

                {/* Detalles de cada cabecera */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-green-300 font-mono">{dictionary.results.status}</h3>
                  <div className="space-y-3">
                    {results.validations.map((validation) => (
                      <div key={validation.name} className="border border-green-500/30 rounded-lg p-4 space-y-2 bg-gray-900/30">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(validation.status)}
                            <span className="font-medium text-gray-200">
                              {dictionary.headers[validation.name as keyof typeof dictionary.headers] || validation.name}
                            </span>
                          </div>
                          {getStatusBadge(validation.status)}
                        </div>
                        
                        <div className="text-sm text-gray-300">
                          <p><strong>Header:</strong> {validation.key}</p>
                          {validation.value && (
                            <p className="break-all"><strong>Value:</strong> <code className="bg-green-900/30 border border-green-500/30 px-1 rounded text-xs text-green-300 font-mono">{validation.value}</code></p>
                          )}
                          {dictionary.descriptions?.[validation.name as keyof typeof dictionary.descriptions] && (
                            <p className="mt-2">{dictionary.descriptions[validation.name as keyof typeof dictionary.descriptions]}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Terminal-style footer */}
        <div className="mt-6 mb-6 sm:mt-8 bg-black/70 border border-green-500/30 rounded-lg p-3 sm:p-4 md:p-6 font-mono mx-auto max-w-4xl">
          <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
            <div className="flex space-x-1 mr-2 sm:mr-3 md:mr-4">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-green-400 text-xs sm:text-sm break-all font-medium">adrianmartinez@headers-validator:~$</span>
          </div>
          <div className="text-green-300 text-xs sm:text-sm space-y-1 sm:space-y-1.5">
            <p><span className="text-green-400">&gt;</span> <span className="text-green-300">./validate_security_headers --best-practices</span></p>
            <p><span className="text-green-400">&gt;</span> Always implement HTTPS with HSTS headers</p>
            <p><span className="text-green-400">&gt;</span> Use CSP to prevent XSS and injection attacks</p>
            <p className="hidden sm:block"><span className="text-green-400">&gt;</span> Set X-Frame-Options to prevent clickjacking</p>
            <p><span className="text-green-400">&gt;</span> Regular security audits are essential for web safety</p>
            <div className="flex items-center mt-2 sm:mt-3">
              <span className="text-green-400 mr-2">&gt;</span>
              <div className="w-1 h-3 sm:w-1.5 sm:h-3.5 md:w-2 md:h-4 bg-green-400 animate-pulse rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
