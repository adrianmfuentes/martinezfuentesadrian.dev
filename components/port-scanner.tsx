"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Badge } from "@components/ui/badge"
import { Progress } from "@components/ui/progress"
import { 
  Globe, 
  Shield, 
  Play, 
  Square,
  AlertTriangle, 
  Wifi,
  Monitor,
  Server,
  Lock,
  LockOpen
} from "lucide-react"

interface PortScanResult {
  port: number
  isOpen: boolean
  status: "open" | "closed" | "scanning"
}

interface ScanProgress {
  current: number
  total: number
  percentage: number
}

interface PortScannerProps {
  dictionary: {
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
}

// Función para parsear puertos (similar al código Python)
function parsePorts(portString: string): number[] {
  if (portString.includes('-')) {
    // Rango de puertos (ej: 80-90)
    const [start, end] = portString.split('-').map(p => Number.parseInt(p.trim()))
    if (Number.isNaN(start) || Number.isNaN(end) || start > end || start < 1 || end > 65535) {
      throw new Error('Invalid port range')
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  } else if (portString.includes(',')) {
    // Lista de puertos separados por comas
    return portString.split(',').map(p => {
      const port = Number.parseInt(p.trim())
      if (Number.isNaN(port) || port < 1 || port > 65535) {
        throw new Error('Invalid port number')
      }
      return port
    })
  } else {
    // Puerto individual
    const port = Number.parseInt(portString.trim())
    if (Number.isNaN(port) || port < 1 || port > 65535) {
      throw new Error('Invalid port number')
    }
    return [port]
  }
}

// Función para validar hostname/IP
function isValidHost(host: string): boolean {
  // Validar IP
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (ipRegex.test(host)) return true
  
  // Validar hostname
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return hostnameRegex.test(host) && host.length <= 253
}

// Función para escanear un puerto usando fetch con timeout
async function scanPortViaAPI(host: string, ports: number[]): Promise<PortScanResult[]> {
  try {
    const response = await fetch('/api/port-scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ host, ports }),
    })
    
    const data = await response.json()
    
    if (data.success) {
      return data.results
    } else {
      throw new Error(data.error || 'Scan failed')
    }
  } catch (error) {
    throw new Error(`API error: ${error}`)
  }
}

async function resolveHostname(hostname: string): Promise<string> {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${hostname}&type=A`)
    const data = await response.json()
    return data.Answer?.[0]?.data || hostname
  } catch {
    return hostname // Fallback al hostname original
  }
}

export function PortScanner({ dictionary }: Readonly<PortScannerProps>) {
  const [host, setHost] = useState("")
  const [ports, setPorts] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [results, setResults] = useState<PortScanResult[]>([])
  const [progress, setProgress] = useState<ScanProgress>({ current: 0, total: 0, percentage: 0 })
  const [resolvedIp, setResolvedIp] = useState("")
  const [error, setError] = useState("")
  const [scanCompleted, setScanCompleted] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Helper function to update results outside of handleScan to reduce nesting
  function updateResults(prevResults: PortScanResult[], batchResults: PortScanResult[]): PortScanResult[] {
    const newResults = [...prevResults]
    batchResults.forEach(result => {
      const index = newResults.findIndex(r => r.port === result.port)
      if (index !== -1) {
        newResults[index] = result
      }
    })
    return newResults
  }

  const handleScan = async () => {
    setError("")
    
    // Validaciones
    if (!host.trim()) {
      setError(dictionary.errors.invalidHost)
      return
    }
    
    if (!isValidHost(host.trim())) {
      setError(dictionary.errors.invalidHost)
      return
    }
    
    if (!ports.trim()) {
      setError(dictionary.errors.invalidPorts)
      return
    }
    
    let portsToScan: number[]
    try {
      portsToScan = parsePorts(ports.trim())
    } catch (err) {
      // Si hay un error al parsear los puertos, mostramos un mensaje
      console.error("Error al parsear los puertos:", err)
      setError(dictionary.errors.invalidPorts)
      return
    }
    
    if (portsToScan.length > 100) {
      setError("Maximum 100 ports allowed for browser scanning")
      return
    }
    
    setIsScanning(true)
    setScanCompleted(false)
    setResults([])
    setProgress({ current: 0, total: portsToScan.length, percentage: 0 })
    
    // Crear AbortController para poder cancelar el escaneo
    abortControllerRef.current = new AbortController()
    
    try {
      setResolvedIp(await resolveHostname(host.trim()))
      
      // Inicializar resultados
      const initialResults: PortScanResult[] = portsToScan.map(port => ({
        port,
        isOpen: false,
        status: "scanning" as const
      }))

      setResults([...initialResults])
      
      // Usar la API
      const scanResults = await scanPortViaAPI(host.trim(), portsToScan)

      setResults(scanResults)

      setProgress({
        current: portsToScan.length,
        total: portsToScan.length,
        percentage: 100
      })

      if (!abortControllerRef.current?.signal.aborted) {
        setScanCompleted(true)
      }      
    } catch (err) {
      console.error("Error during port scan:", err)
      setError(dictionary.errors.scanError)
    } finally {
      setIsScanning(false)
      abortControllerRef.current = null
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsScanning(false)
    setScanCompleted(true)
  }

  const handleReset = () => {
    setHost("")
    setPorts("")
    setResults([])
    setProgress({ current: 0, total: 0, percentage: 0 })
    setResolvedIp("")
    setError("")
    setScanCompleted(false)
    setIsScanning(false)
  }

  const openPorts = results.filter(r => r.isOpen).length
  const closedPorts = results.filter(r => !r.isOpen && r.status !== "scanning").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 p-3 sm:p-6">
      <div className="container mx-auto max-w-4xl pt-32 sm:pt-28 md:pt-20">
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
                disabled={isScanning}
                className="bg-gray-900/50 border-blue-500/30 text-blue-300 font-mono focus:border-blue-400 text-sm sm:text-base"
              />
            </div>
            
            <div>
              <label className="text-blue-300 font-mono text-sm sm:text-base mb-2 block">
                <Server className="w-4 h-4 inline mr-2" />
                {dictionary.portsLabel}
              </label>
              <Input
                type="text"
                placeholder={dictionary.portsPlaceholder}
                value={ports}
                onChange={(e) => setPorts(e.target.value)}
                disabled={isScanning}
                className="bg-gray-900/50 border-blue-500/30 text-blue-300 font-mono focus:border-blue-400 text-sm sm:text-base"
              />
              <p className="text-gray-400 text-xs sm:text-sm mt-2">
                {dictionary.portsHelp}
              </p>
            </div>
            
            {error && (
              <div className="flex items-center text-red-400 text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleScan}
                disabled={isScanning || !host.trim() || !ports.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-sm sm:text-base py-2 sm:py-3"
              >
                <Play className="w-4 h-4 mr-2" />
                {isScanning ? dictionary.scanning : dictionary.scanButton}
              </Button>
              
              {isScanning && (
                <Button
                  onClick={handleStop}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm sm:text-base py-2 sm:py-3"
                >
                  <Square className="w-4 h-4 mr-2" />
                  {dictionary.stopButton}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress Section */}
        {(isScanning || scanCompleted) && (
          <Card className="bg-black/70 border-blue-500/30 mb-6 sm:mb-8 mx-2 sm:mx-0">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-blue-300 font-mono flex items-center text-lg sm:text-xl">
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {dictionary.results.progress}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{dictionary.results.status}:</span>
                  <span className="text-blue-400 font-mono">
                    {progress.current} / {progress.total} ({progress.percentage}%)
                  </span>
                </div>
                <Progress value={progress.percentage} className="h-2" />
              </div>
              
              {resolvedIp && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <span className="text-gray-300 text-xs sm:text-sm">{dictionary.results.host}:</span>
                    <span className="text-blue-400 font-mono text-sm sm:text-base">{host}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <span className="text-gray-300 text-xs sm:text-sm">{dictionary.results.resolvedIp}:</span>
                    <span className="text-blue-400 font-mono text-sm sm:text-base">{resolvedIp}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <Card className="bg-black/70 border-blue-500/30 mb-6 sm:mb-8 mx-2 sm:mx-0">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-blue-300 font-mono flex items-center text-lg sm:text-xl">
                <Wifi className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {dictionary.results.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <span className="text-gray-300 text-xs sm:text-sm">{dictionary.results.totalPorts}:</span>
                  <span className="text-blue-400 font-mono text-sm sm:text-base">{results.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 sm:p-3 bg-green-900/50 rounded-lg border border-green-700/50">
                  <span className="text-gray-300 text-xs sm:text-sm">{dictionary.results.openPorts}:</span>
                  <span className="text-green-400 font-mono text-sm sm:text-base">{openPorts}</span>
                </div>
                <div className="flex justify-between items-center p-2 sm:p-3 bg-red-900/50 rounded-lg border border-red-700/50">
                  <span className="text-gray-300 text-xs sm:text-sm">{dictionary.results.closedPorts}:</span>
                  <span className="text-red-400 font-mono text-sm sm:text-base">{closedPorts}</span>
                </div>
              </div>

              {/* Port List */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {results.map((result) => (
                  <div
                    key={result.port}
                    className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border ${
                      result.status === "open" 
                        ? "bg-green-900/30 border-green-500/30"
                        : result.status === "closed" /* NOSONAR */
                        ? "bg-red-900/30 border-red-500/30"
                        : "bg-gray-900/30 border-gray-500/30"
                    }`}
                  >
                    <div className="flex items-center">
                      {result.status === "open" ? (
                        <LockOpen className="w-4 h-4 text-green-400 mr-2" />
                      ) : result.status === "closed" ? ( /* NOSONAR */
                        <Lock className="w-4 h-4 text-red-400 mr-2" />
                      ) : (
                        <div className="w-4 h-4 mr-2">
                          <div className="w-full h-full border-2 border-gray-400 border-t-blue-400 rounded-full animate-spin"></div>
                        </div>
                      )}
                      <span className="text-gray-300 font-mono text-sm sm:text-base">
                        Puerto {result.port}
                      </span>
                    </div>
                    <Badge
                      className={
                        result.status === "open"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : result.status === "closed" /* NOSONAR */
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      }
                    >
                      {dictionary.portStatus[result.status]}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Reset Button */}
              {scanCompleted && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-sm sm:text-base py-2 sm:py-3"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {dictionary.resetButton}
                </Button>
              )}
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
            <span className="text-blue-400 text-xs sm:text-sm break-all">adrianmartinez@port-scanner:~$</span>
          </div>
          <div className="text-blue-300 text-xs sm:text-sm space-y-1">
            <p><span className="text-blue-400">&gt;</span> Note: Browser-based port scanning has limitations due to CORS policies</p>
            <p><span className="text-blue-400">&gt;</span> Some ports may appear closed even if they&apos;re open due to security restrictions</p>
            <p><span className="text-blue-400">&gt;</span> For comprehensive scanning, use command-line tools like nmap</p>
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
