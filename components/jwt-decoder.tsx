"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Textarea } from "@components/ui/textarea"
import { Input } from "@components/ui/input"
import { Badge } from "@components/ui/badge"
import {
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Copy,
  Check,
  Lock,
} from "lucide-react"

interface JwtDecoderProps {
  dictionary: {
    title: string
    description: string
    tokenLabel: string
    tokenPlaceholder: string
    decodeButton: string
    resetButton: string
    secretLabel: string
    secretPlaceholder: string
    verifyButton: string
    header: string
    payload: string
    copy: string
    copied: string
    expiryStatus: {
      valid: string
      expired: string
      notYetValid: string
      noExpiry: string
    }
    signatureStatus: {
      valid: string
      invalid: string
      unsupported: string
    }
    errors: {
      invalidToken: string
      emptyToken: string
    }
  }
}

interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
  signingInput: string
}

type ExpiryState = "valid" | "expired" | "notYetValid" | "noExpiry"
type SignatureState = "unknown" | "valid" | "invalid" | "unsupported"

function base64UrlDecode(input: string): string {
  const base64 = input.replaceAll("-", "+").replaceAll("_", "/")
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (c) => c.codePointAt(0) ?? 0)
  return new TextDecoder("utf-8").decode(bytes)
}

function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split(".")
  if (parts.length !== 3) throw new Error("Invalid JWT format")

  const [headerPart, payloadPart, signaturePart] = parts
  const header = JSON.parse(base64UrlDecode(headerPart))
  const payload = JSON.parse(base64UrlDecode(payloadPart))

  return {
    header,
    payload,
    signature: signaturePart,
    signingInput: `${headerPart}.${payloadPart}`,
  }
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  bytes.forEach((b) => (binary += String.fromCodePoint(b)))
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")
}

async function verifyHs256(signingInput: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput))
  return arrayBufferToBase64Url(sigBuffer) === signature
}

function getExpiryState(payload: Record<string, unknown>): ExpiryState {
  const now = Math.floor(Date.now() / 1000)
  const exp = typeof payload.exp === "number" ? payload.exp : undefined
  const nbf = typeof payload.nbf === "number" ? payload.nbf : undefined

  if (exp !== undefined && now >= exp) return "expired"
  if (nbf !== undefined && now < nbf) return "notYetValid"
  if (exp !== undefined) return "valid"
  return "noExpiry"
}

function formatClaimValue(key: string, value: unknown): string {
  if ((key === "exp" || key === "iat" || key === "nbf") && typeof value === "number") {
    return `${value} (${new Date(value * 1000).toLocaleString()})`
  }
  return JSON.stringify(value)
}

export function JwtDecoder({ dictionary }: Readonly<JwtDecoderProps>) {
  const [token, setToken] = useState("")
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null)
  const [error, setError] = useState("")
  const [secret, setSecret] = useState("")
  const [signatureState, setSignatureState] = useState<SignatureState>("unknown")
  const [copiedField, setCopiedField] = useState<"header" | "payload" | null>(null)

  const handleDecode = () => {
    setSignatureState("unknown")

    if (!token.trim()) {
      setError(dictionary.errors.emptyToken)
      setDecoded(null)
      return
    }

    try {
      setDecoded(decodeJwt(token))
      setError("")
    } catch {
      setDecoded(null)
      setError(dictionary.errors.invalidToken)
    }
  }

  const handleVerify = async () => {
    if (!decoded || !secret) return

    if (decoded.header.alg !== "HS256") {
      setSignatureState("unsupported")
      return
    }

    const isValid = await verifyHs256(decoded.signingInput, decoded.signature, secret)
    setSignatureState(isValid ? "valid" : "invalid")
  }

  const handleReset = () => {
    setToken("")
    setDecoded(null)
    setError("")
    setSecret("")
    setSignatureState("unknown")
  }

  const copyToClipboard = async (field: "header" | "payload", value: Record<string, unknown>) => {
    await navigator.clipboard.writeText(JSON.stringify(value, null, 2))
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const expiryState = decoded ? getExpiryState(decoded.payload) : null

  const getExpiryBadgeClass = (state: ExpiryState) => {
    switch (state) {
      case "expired": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "notYetValid": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "valid": return "bg-green-500/20 text-green-400 border-green-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getSignatureBannerClass = (state: SignatureState) => {
    switch (state) {
      case "valid": return "bg-green-900/30 border-green-500/30 text-green-400"
      case "invalid": return "bg-red-900/30 border-red-500/30 text-red-400"
      default: return "bg-gray-900/30 border-gray-500/30 text-gray-400"
    }
  }

  const renderClaims = (obj: Record<string, unknown>) => (
    <div className="space-y-2">
      {Object.entries(obj).map(([key, value]) => (
        <div
          key={key}
          className="flex justify-between items-start gap-2 p-2 sm:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50"
        >
          <span className="text-gray-300 text-xs sm:text-sm font-mono">{key}</span>
          <span className="text-purple-400 font-mono text-xs sm:text-sm text-right break-all">
            {formatClaimValue(key, value)}
          </span>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 p-3 sm:p-6">
      <div className="container mx-auto max-w-4xl pt-32 sm:pt-28 md:pt-20">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <KeyRound className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-purple-400 mr-2 sm:mr-4" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent font-mono leading-tight">
              {dictionary.title}
            </h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base px-4 sm:px-0">
            {dictionary.description}
          </p>
        </div>

        {/* Input Section */}
        <Card className="bg-black/70 border-purple-500/30 mb-6 sm:mb-8 mx-2 sm:mx-0">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-purple-300 font-mono flex items-center text-lg sm:text-xl">
              <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {dictionary.tokenLabel}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={dictionary.tokenPlaceholder}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="bg-gray-900/50 border-purple-500/30 text-purple-300 font-mono min-h-32 focus:border-purple-400 text-xs sm:text-sm"
            />

            {error && (
              <div className="flex items-center text-red-400 text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            <Button
              onClick={handleDecode}
              disabled={!token.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold text-sm sm:text-base py-2 sm:py-3"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              {dictionary.decodeButton}
            </Button>
          </CardContent>
        </Card>

        {decoded && (
          <>
            {/* Header & Payload */}
            <Card className="bg-black/70 border-purple-500/30 mb-6 sm:mb-8 mx-2 sm:mx-0">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-purple-300 font-mono flex items-center text-lg sm:text-xl">
                    {dictionary.header}
                  </CardTitle>
                  {expiryState && (
                    <Badge className={`${getExpiryBadgeClass(expiryState)} text-xs sm:text-sm`}>
                      {dictionary.expiryStatus[expiryState]}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-end mb-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard("header", decoded.header)}
                      className="h-7 px-2 text-purple-400 hover:text-purple-300"
                    >
                      {copiedField === "header" ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                      <span className="text-xs">{copiedField === "header" ? dictionary.copied : dictionary.copy}</span>
                    </Button>
                  </div>
                  {renderClaims(decoded.header)}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-300 font-mono text-sm sm:text-base">{dictionary.payload}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard("payload", decoded.payload)}
                      className="h-7 px-2 text-purple-400 hover:text-purple-300"
                    >
                      {copiedField === "payload" ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                      <span className="text-xs">{copiedField === "payload" ? dictionary.copied : dictionary.copy}</span>
                    </Button>
                  </div>
                  {renderClaims(decoded.payload)}
                </div>
              </CardContent>
            </Card>

            {/* Signature verification */}
            <Card className="bg-black/70 border-purple-500/30 mb-6 sm:mb-8 mx-2 sm:mx-0">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-purple-300 font-mono flex items-center text-lg sm:text-xl">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {dictionary.secretLabel}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="password"
                  placeholder={dictionary.secretPlaceholder}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="bg-gray-900/50 border-purple-500/30 text-purple-300 font-mono focus:border-purple-400 text-sm sm:text-base"
                />
                <Button
                  onClick={handleVerify}
                  disabled={!secret}
                  variant="outline"
                  className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-sm sm:text-base py-2 sm:py-3"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  {dictionary.verifyButton}
                </Button>

                {signatureState !== "unknown" && (
                  <div
                    className={`flex items-center text-xs sm:text-sm p-2 sm:p-3 rounded-lg border ${getSignatureBannerClass(signatureState)}`}
                  >
                    {signatureState === "valid" && <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />}
                    {signatureState === "invalid" && <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />}
                    {signatureState === "unsupported" && <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />}
                    <span>{dictionary.signatureStatus[signatureState]}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mx-2 sm:mx-0 mb-6 sm:mb-8">
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-sm sm:text-base py-2 sm:py-3"
              >
                <Lock className="w-4 h-4 mr-2" />
                {dictionary.resetButton}
              </Button>
            </div>
          </>
        )}

        {/* Terminal-style footer */}
        <div className="mt-6 sm:mt-8 bg-black/70 border border-purple-500/30 rounded-lg p-4 sm:p-6 font-mono mx-2 sm:mx-0">
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="flex space-x-1 sm:space-x-2 mr-3 sm:mr-4">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-purple-400 text-xs sm:text-sm break-all">adrianmartinez@jwt-decoder:~$</span>
          </div>
          <div className="text-purple-300 text-xs sm:text-sm space-y-1">
            <p><span className="text-purple-400">&gt;</span> All decoding happens locally in your browser</p>
            <p><span className="text-purple-400">&gt;</span> The token and secret are never sent to a server</p>
            <p><span className="text-purple-400">&gt;</span> Only HS256 signature verification is supported</p>
            <div className="flex items-center mt-2">
              <span className="text-purple-400 mr-2">&gt;</span>
              <div className="w-1 h-3 sm:w-2 sm:h-4 bg-purple-400 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
