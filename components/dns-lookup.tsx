"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Badge } from "@components/ui/badge"
import { Globe, Search, AlertTriangle, Server, Loader2 } from "lucide-react"

interface DnsLookupProps {
  dictionary: {
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
}

type RecordType = "A" | "AAAA" | "MX" | "TXT" | "NS" | "CNAME"

interface MxRecord {
  exchange: string
  priority: number
}

type DnsRecords = Record<RecordType, (string | MxRecord)[]>

const RECORD_TYPES: RecordType[] = ["A", "AAAA", "MX", "TXT", "NS", "CNAME"]

function isValidDomain(domain: string): boolean {
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  return hostnameRegex.test(domain) && domain.length <= 253
}

function formatRecordValue(value: string | MxRecord): string {
  if (typeof value === "string") return value
  return `${value.exchange} (priority ${value.priority})`
}

export function DnsLookup({ dictionary }: Readonly<DnsLookupProps>) {
  const [domain, setDomain] = useState("")
  const [records, setRecords] = useState<DnsRecords | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLookup = async () => {
    setError("")
    const trimmedDomain = domain.trim()

    if (!trimmedDomain || !isValidDomain(trimmedDomain)) {
      setError(dictionary.errors.invalidDomain)
      return
    }

    setIsLoading(true)
    setRecords(null)

    try {
      const response = await fetch("/api/dns-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: trimmedDomain }),
      })

      if (response.status === 429) {
        setError(dictionary.errors.rateLimited)
        return
      }

      const data = await response.json()

      if (!data.success) {
        setError(dictionary.errors.lookupError)
        return
      }

      setRecords(data.records)
    } catch {
      setError(dictionary.errors.lookupError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setDomain("")
    setRecords(null)
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-cyan-950 p-3 sm:p-6">
      <div className="container mx-auto max-w-4xl pt-32 sm:pt-28 md:pt-20">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Globe className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-cyan-400 mr-2 sm:mr-4" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500 bg-clip-text text-transparent font-mono leading-tight">
              {dictionary.title}
            </h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base px-4 sm:px-0">
            {dictionary.description}
          </p>
        </div>

        {/* Input Section */}
        <Card className="bg-black/70 border-cyan-500/30 mb-6 sm:mb-8 mx-2 sm:mx-0">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-cyan-300 font-mono flex items-center text-lg sm:text-xl">
              <Server className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {dictionary.domainLabel}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder={dictionary.domainPlaceholder}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              className="bg-gray-900/50 border-cyan-500/30 text-cyan-300 font-mono focus:border-cyan-400 text-sm sm:text-base"
            />

            {error && (
              <div className="flex items-center text-red-400 text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            <Button
              onClick={handleLookup}
              disabled={isLoading || !domain.trim()}
              className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-semibold text-sm sm:text-base py-2 sm:py-3"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {isLoading ? dictionary.lookingUp : dictionary.lookupButton}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {records && (
          <Card className="bg-black/70 border-cyan-500/30 mb-6 sm:mb-8 mx-2 sm:mx-0">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-cyan-300 font-mono flex items-center text-lg sm:text-xl">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {domain.trim()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {RECORD_TYPES.map((type) => (
                <div key={type} className="p-2 sm:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-300 font-mono text-xs sm:text-sm font-semibold">
                      {dictionary.recordTypes[type]}
                    </span>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                      {records[type].length}
                    </Badge>
                  </div>
                  {records[type].length === 0 ? (
                    <p className="text-gray-500 text-xs sm:text-sm italic">{dictionary.noRecords}</p>
                  ) : (
                    <div className="space-y-1">
                      {records[type].map((value, i) => (
                        <p key={`${type}-${i}`} className="text-gray-300 font-mono text-xs sm:text-sm break-all">
                          {formatRecordValue(value)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-sm sm:text-base py-2 sm:py-3"
              >
                {dictionary.resetButton}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Terminal-style footer */}
        <div className="mt-6 sm:mt-8 bg-black/70 border border-cyan-500/30 rounded-lg p-4 sm:p-6 font-mono mx-2 sm:mx-0">
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="flex space-x-1 sm:space-x-2 mr-3 sm:mr-4">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-cyan-400 text-xs sm:text-sm break-all">adrianmartinez@dns-lookup:~$</span>
          </div>
          <div className="text-cyan-300 text-xs sm:text-sm space-y-1">
            <p><span className="text-cyan-400">&gt;</span> Queries A, AAAA, MX, TXT, NS and CNAME records</p>
            <p><span className="text-cyan-400">&gt;</span> Private, loopback and metadata hosts are blocked</p>
            <p><span className="text-cyan-400">&gt;</span> Requests are rate-limited per IP address</p>
            <div className="flex items-center mt-2">
              <span className="text-cyan-400 mr-2">&gt;</span>
              <div className="w-1 h-3 sm:w-2 sm:h-4 bg-cyan-400 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
