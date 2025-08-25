"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import { 
  Globe, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Building,
  FileText,
  Link,
  Server
} from "lucide-react"

interface CertificateInfo {
  subject: string
  issuer: string
  notBefore: string
  notAfter: string
  algorithm: string
  isCA: boolean
  daysLeft: number
  isExpired: boolean
  sans: string[]
  hostIp: string
}

interface CertificatesCheckerProps {
  dictionary: {
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
}

const SSL_COMMON_PORTS = [443, 993, 995, 465, 587, 636, 989, 990]

function isValidHost(host: string): boolean {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (ipRegex.test(host)) return true
  
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return hostnameRegex.test(host) && host.length <= 253
}

function isValidPort(port: string): boolean {
  const portNum = parseInt(port)
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535
}

async function checkCertificate(host: string, port: number): Promise<CertificateInfo> {
  const response = await fetch('/api/certificate-check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ host, port }),
  })
  
  const data = await response.json()
  
  if (data.success) {
    return data.certificate
  } else {
    throw new Error(data.error || 'Certificate check failed')
  }
}

export function CertificatesChecker({ dictionary }: Readonly<CertificatesCheckerProps>) {
  const [host, setHost] = useState("")
  const [port, setPort] = useState("443")
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<CertificateInfo | null>(null)
  const [error, setError] = useState("")

  const handleCheck = async () => {
    setError("")
    
    if (!host.trim()) {
      setError(dictionary.errors.invalidHost)
      return
    }
    
    if (!isValidHost(host.trim())) {
      setError(dictionary.errors.invalidHost)
      return
    }
    
    if (!port.trim() || !isValidPort(port.trim())) {
      setError(dictionary.errors.invalidPort)
      return
    }
    
    setIsChecking(true)
    setResult(null)
    
    try {
      const certInfo = await checkCertificate(host.trim(), parseInt(port.trim()))
      setResult(certInfo)
    } catch (err) {
      console.error("Error checking certificate:", err)
      setError(dictionary.errors.certificateError)
    } finally {
      setIsChecking(false)
    }
  }

  const handleReset = () => {
    setHost("")
    setPort("443")
    setResult(null)
    setError("")
  }

  const getStatusInfo = (cert: CertificateInfo) => {
    if (cert.isExpired) {
      return {
        status: dictionary.status.expired,
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        badgeClass: "bg-red-500/20 text-red-400 border-red-500/30"
      }
    } else if (cert.daysLeft <= 30) {
      return {
        status: dictionary.status.expiringSoon,
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        badgeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      }
    } else {
      return {
        status: dictionary.status.valid,
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        badgeClass: "bg-green-500/20 text-green-400 border-green-500/30"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 p-2 sm:p-4 lg:p-6">
      <div className="container mx-auto max-w-sm sm:max-w-2xl lg:max-w-4xl mt-4 sm:mt-6 lg:mt-8 mb-4 sm:mb-6 lg:mb-8 pt-24 sm:pt-28 md:pt-20">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-10 px-2 sm:px-0">
          <div className="flex items-center justify-center mb-3 sm:mb-4 lg:mb-6">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-green-400 mr-2 sm:mr-3 lg:mr-4 flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent font-mono leading-tight">
              {dictionary.title}
            </h1>
          </div>
          <p className="text-gray-300 max-w-sm sm:max-w-lg lg:max-w-2xl mx-auto leading-relaxed text-xs sm:text-sm lg:text-base px-2 sm:px-4 lg:px-0">
            {dictionary.description}
          </p>
        </div>

        {/* Input Section */}
        <Card className="bg-black/70 border-green-500/30 mb-4 sm:mb-6 lg:mb-8 mx-1 sm:mx-0">
          <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-6">
            <CardTitle className="text-green-300 font-mono flex items-center text-base sm:text-lg lg:text-xl">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 text-green-400" />
              <span className="truncate">{dictionary.hostLabel}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
            <div>
              <Input
                type="text"
                placeholder={dictionary.hostPlaceholder}
                value={host}
                onChange={(e) => setHost(e.target.value)}
                disabled={isChecking}
                className="bg-gray-900/50 border-green-500/30 text-green-300 font-mono focus:border-green-400 text-sm sm:text-base h-10 sm:h-11"
              />
            </div>
            
            <div>
              <label className="text-green-300 font-mono text-sm sm:text-base mb-2 block">
                <Server className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2 text-green-400" />
                {dictionary.portLabel}
              </label>
              <Input
                type="number"
                placeholder={dictionary.portPlaceholder}
                value={port}
                onChange={(e) => setPort(e.target.value)}
                disabled={isChecking}
                min="1"
                max="65535"
                className="bg-gray-900/50 border-green-500/30 text-green-300 font-mono focus:border-green-400 text-sm sm:text-base h-10 sm:h-11"
              />
              <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">
                {dictionary.portHelp}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {SSL_COMMON_PORTS.map((commonPort) => (
                  <button
                    key={commonPort}
                    onClick={() => setPort(commonPort.toString())}
                    disabled={isChecking}
                    className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded border border-green-500/30 hover:bg-green-500/30 disabled:opacity-50 transition-colors"
                  >
                    {commonPort}
                  </button>
                ))}
              </div>
            </div>
            
            {error && (
              <div className="flex items-start text-red-400 text-xs sm:text-sm p-2 bg-red-500/10 rounded border border-red-500/30">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span className="break-words">{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleCheck}
                disabled={isChecking || !host.trim() || !port.trim()}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-semibold text-sm sm:text-base py-2.5 sm:py-3 h-10 sm:h-11"
              >
                {isChecking ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    <span className="truncate">{dictionary.checking}</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    <span className="truncate">{dictionary.checkButton}</span>
                  </>
                )}
              </Button>
              
              {result && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-sm sm:text-base py-2.5 sm:py-3 h-10 sm:h-11 sm:w-auto w-full"
                >
                  {dictionary.resetButton}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <Card className="bg-black/70 border-green-500/30 mb-4 sm:mb-6 lg:mb-8 mx-1 sm:mx-0">
            <CardHeader className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-6">
              <CardTitle className="text-green-300 font-mono flex items-center text-base sm:text-lg lg:text-xl">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 text-green-400" />
                <span className="truncate">{dictionary.results.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
              {/* Host Info */}
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50 gap-1 sm:gap-0">
                  <span className="text-gray-300 text-xs sm:text-sm">{dictionary.results.host}:</span>
                  <span className="text-green-400 font-mono text-sm sm:text-base break-all">{host}:{port}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50 gap-1 sm:gap-0">
                  <span className="text-gray-300 text-xs sm:text-sm">{dictionary.results.resolvedIp}:</span>
                  <span className="text-green-400 font-mono text-sm sm:text-base break-all">{result.hostIp}</span>
                </div>
              </div>

              {/* Certificate Status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 gap-2 sm:gap-0">
                <div className="flex items-center">
                  {getStatusInfo(result).icon}
                  <span className="text-gray-300 text-sm sm:text-base ml-2">{dictionary.results.status}</span>
                </div>
                <Badge className={getStatusInfo(result).badgeClass + " text-xs sm:text-sm"}>
                  {getStatusInfo(result).status}
                </Badge>
              </div>

              {/* Certificate Details */}
              <div className="space-y-2 sm:space-y-3">
                <div className="p-2 sm:p-3 lg:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center mb-2">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-2 flex-shrink-0" />
                    <span className="text-green-300 font-semibold text-sm sm:text-base">{dictionary.results.subject}</span>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm break-all font-mono leading-relaxed">{result.subject}</p>
                </div>

                <div className="p-2 sm:p-3 lg:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center mb-2">
                    <Building className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-2 flex-shrink-0" />
                    <span className="text-green-300 font-semibold text-sm sm:text-base">{dictionary.results.issuer}</span>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm break-all font-mono leading-relaxed">{result.issuer}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 lg:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-2 flex-shrink-0" />
                      <span className="text-green-300 font-semibold text-sm sm:text-base truncate">{dictionary.results.validFrom}</span>
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm font-mono break-all">{result.notBefore}</p>
                  </div>

                  <div className="p-2 sm:p-3 lg:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 mr-2 flex-shrink-0" />
                      <span className="text-red-300 font-semibold text-sm sm:text-base truncate">{dictionary.results.validUntil}</span>
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm font-mono break-all">{result.notAfter}</p>
                  </div>
                </div>

                <div className="p-2 sm:p-3 lg:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center mb-2">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-2 flex-shrink-0" />
                    <span className="text-green-300 font-semibold text-sm sm:text-base">{dictionary.results.isCA}</span>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm font-mono">{result.isCA ? 'Sí' : 'No'}</p>
                </div>

                <div className="p-2 sm:p-3 lg:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center mb-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 mr-2 flex-shrink-0" />
                    <span className="text-yellow-300 font-semibold text-sm sm:text-base">{dictionary.results.daysLeft}</span>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm font-mono">
                    {result.isExpired ? '¡Certificado vencido!' : `${result.daysLeft} días`}
                  </p>
                </div>

                {result.sans && result.sans.length > 0 && (
                  <div className="p-2 sm:p-3 lg:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <div className="flex items-center mb-2">
                      <Link className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-2 flex-shrink-0" />
                      <span className="text-green-300 font-semibold text-sm sm:text-base">{dictionary.results.sans}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.sans.slice(0, 10).map((san) => (
                        <Badge key={san} variant="outline" className="text-xs break-all border-green-500/30 text-green-300">
                          {san}
                        </Badge>
                      ))}
                      {result.sans.length > 10 && (
                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-300">
                          +{result.sans.length - 10} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Terminal-style footer */}
        <div className="mt-4 sm:mt-6 lg:mt-8 bg-black/70 border border-green-500/30 rounded-lg p-3 sm:p-4 lg:p-6 font-mono mx-1 sm:mx-0">
          <div className="flex items-center mb-2 sm:mb-3 lg:mb-4">
            <div className="flex space-x-1 sm:space-x-2 mr-2 sm:mr-3 lg:mr-4 flex-shrink-0">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-green-400 text-xs sm:text-sm break-all">adrianmartinez@ssl-checker:~$</span>
          </div>
          <div className="text-green-300 text-xs sm:text-sm space-y-1">
            <p><span className="text-green-400">&gt;</span> SSL/TLS certificate validation for security auditing</p>
            <p className="break-words"><span className="text-green-400">&gt;</span> Check certificate expiration, issuer, and security configuration</p>
            <p className="break-words"><span className="text-green-400">&gt;</span> Common SSL ports: 443 (HTTPS), 993 (IMAPS), 995 (POP3S), 465/587 (SMTPS)</p>
            <div className="flex items-center mt-2">
              <span className="text-green-400 mr-2">&gt;</span>
              <div className="w-1 h-3 sm:w-2 sm:h-4 bg-green-400 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
