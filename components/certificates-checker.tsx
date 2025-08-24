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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 p-3 sm:p-6">
      <div className="container mx-auto max-w-4xl mt-8 mb-8 pt-32 sm:pt-28 md:pt-20">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-400 mr-2 sm:mr-4" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent font-mono leading-tight">
              {dictionary.title}
            </h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base px-4 sm:px-0">
            {dictionary.description}
          </p>
        </div>

        {/* Input Section */}
        <Card className="bg-black/70 border-blue-500/30 mb-6 sm:mb-8 mx-2 sm:mx-0">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-blue-300 font-mono flex items-center text-lg sm:text-xl">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {dictionary.hostLabel}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder={dictionary.hostPlaceholder}
                value={host}
                onChange={(e) => setHost(e.target.value)}
                disabled={isChecking}
                className="bg-gray-900/50 border-blue-500/30 text-blue-300 font-mono focus:border-blue-400 text-sm sm:text-base"
              />
            </div>
            
            <div>
              <label className="text-blue-300 font-mono text-sm sm:text-base mb-2 block">
                <Server className="w-4 h-4 inline mr-2" />
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
                className="bg-gray-900/50 border-blue-500/30 text-blue-300 font-mono focus:border-blue-400 text-sm sm:text-base"
              />
              <p className="text-gray-400 text-xs sm:text-sm mt-2">
                {dictionary.portHelp}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {SSL_COMMON_PORTS.map((commonPort) => (
                  <button
                    key={commonPort}
                    onClick={() => setPort(commonPort.toString())}
                    disabled={isChecking}
                    className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50"
                  >
                    {commonPort}
                  </button>
                ))}
              </div>
            </div>
            
            {error && (
              <div className="flex items-center text-red-400 text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleCheck}
                disabled={isChecking || !host.trim() || !port.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-sm sm:text-base py-2 sm:py-3"
              >
                {isChecking ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    {dictionary.checking}
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    {dictionary.checkButton}
                  </>
                )}
              </Button>
              
              {result && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-sm sm:text-base py-2 sm:py-3"
                >
                  {dictionary.resetButton}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <Card className="bg-black/70 border-blue-500/30 mb-6 sm:mb-8 mx-2 sm:mx-0">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-blue-300 font-mono flex items-center text-lg sm:text-xl">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {dictionary.results.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Host Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <span className="text-gray-300 text-xs sm:text-sm">{dictionary.results.host}:</span>
                  <span className="text-blue-400 font-mono text-sm sm:text-base">{host}:{port}</span>
                </div>
                <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <span className="text-gray-300 text-xs sm:text-sm">{dictionary.results.resolvedIp}:</span>
                  <span className="text-blue-400 font-mono text-sm sm:text-base">{result.hostIp}</span>
                </div>
              </div>

              {/* Certificate Status */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center">
                  {getStatusInfo(result).icon}
                  <span className="text-gray-300 text-sm sm:text-base ml-2">{dictionary.results.status}</span>
                </div>
                <Badge className={getStatusInfo(result).badgeClass}>
                  {getStatusInfo(result).status}
                </Badge>
              </div>

              {/* Certificate Details */}
              <div className="space-y-3">
                <div className="p-3 sm:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center mb-2">
                    <FileText className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-blue-300 font-semibold">{dictionary.results.subject}</span>
                  </div>
                  <p className="text-gray-300 text-sm break-all font-mono">{result.subject}</p>
                </div>

                <div className="p-3 sm:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center mb-2">
                    <Building className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-blue-300 font-semibold">{dictionary.results.issuer}</span>
                  </div>
                  <p className="text-gray-300 text-sm break-all font-mono">{result.issuer}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 sm:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-green-300 font-semibold">{dictionary.results.validFrom}</span>
                    </div>
                    <p className="text-gray-300 text-sm font-mono">{result.notBefore}</p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-4 h-4 text-red-400 mr-2" />
                      <span className="text-red-300 font-semibold">{dictionary.results.validUntil}</span>
                    </div>
                    <p className="text-gray-300 text-sm font-mono">{result.notAfter}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">                
                  <div className="p-3 sm:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <div className="flex items-center mb-2">
                      <Shield className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-blue-300 font-semibold">{dictionary.results.isCA}</span>
                    </div>
                    <p className="text-gray-300 text-sm font-mono">{result.isCA ? 'Sí' : 'No'}</p>
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 text-yellow-400 mr-2" />
                    <span className="text-yellow-300 font-semibold">{dictionary.results.daysLeft}</span>
                  </div>
                  <p className="text-gray-300 text-sm font-mono">
                    {result.isExpired ? '¡Certificado vencido!' : `${result.daysLeft} días`}
                  </p>
                </div>

                {result.sans && result.sans.length > 0 && (
                  <div className="p-3 sm:p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <div className="flex items-center mb-2">
                      <Link className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-blue-300 font-semibold">{dictionary.results.sans}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.sans.slice(0, 10).map((san) => (
                        <Badge key={san} variant="outline" className="text-xs">
                          {san}
                        </Badge>
                      ))}
                      {result.sans.length > 10 && (
                        <Badge variant="outline" className="text-xs">
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
        <div className="mt-6 sm:mt-8 bg-black/70 border border-blue-500/30 rounded-lg p-4 sm:p-6 font-mono mx-2 sm:mx-0">
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="flex space-x-1 sm:space-x-2 mr-3 sm:mr-4">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-blue-400 text-xs sm:text-sm break-all">adrianmartinez@ssl-checker:~$</span>
          </div>
          <div className="text-blue-300 text-xs sm:text-sm space-y-1">
            <p><span className="text-blue-400">&gt;</span> SSL/TLS certificate validation for security auditing</p>
            <p><span className="text-blue-400">&gt;</span> Check certificate expiration, issuer, and security configuration</p>
            <p><span className="text-blue-400">&gt;</span> Common SSL ports: 443 (HTTPS), 993 (IMAPS), 995 (POP3S), 465/587 (SMTPS)</p>
            <div className="flex items-center mt-2">
              <span className="text-blue-400 mr-2">&gt;</span>
              <div className="w-1 h-3 sm:w-2 sm:h-4 bg-blue-400 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
