"use client"

import { useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Textarea } from "@components/ui/textarea"
import { Hash, Upload, Type, Copy, Check, AlertTriangle, Loader2 } from "lucide-react"

interface HashGeneratorProps {
  dictionary: {
    title: string
    description: string
    textTab: string
    fileTab: string
    textLabel: string
    textPlaceholder: string
    fileLabel: string
    filePlaceholder: string
    generateButton: string
    generating: string
    resetButton: string
    copy: string
    copied: string
    errors: {
      empty: string
      fileTooLarge: string
    }
  }
}

type HashAlgorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-512"

const ALGORITHMS: HashAlgorithm[] = ["MD5", "SHA-1", "SHA-256", "SHA-512"]
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB — pure-JS MD5 is slow on bigger inputs in the browser

function safeAdd(x: number, y: number): number {
  const lsw = (x & 0xffff) + (y & 0xffff)
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
  return (msw << 16) | (lsw & 0xffff)
}

function bitRotateLeft(num: number, cnt: number): number {
  return (num << cnt) | (num >>> (32 - cnt))
}

function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
}
function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return md5cmn((b & c) | (~b & d), a, b, x, s, t)
}
function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
}
function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t)
}
function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t)
}

// Public-domain MD5 core (Paul Johnston et al.) adapted to operate on raw bytes
// instead of strings, so it hashes binary file content correctly.
function binlMd5(x: number[], len: number): number[] {
  x[len >> 5] |= 0x80 << (len % 32)
  x[(((len + 64) >>> 9) << 4) + 14] = len

  let a = 1732584193
  let b = -271733879
  let c = -1732584194
  let d = 271733878

  for (let i = 0; i < x.length; i += 16) {
    const olda = a, oldb = b, oldc = c, oldd = d

    a = md5ff(a, b, c, d, x[i], 7, -680876936)
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586)
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819)
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330)
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897)
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426)
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341)
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983)
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416)
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417)
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063)
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162)
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682)
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101)
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290)
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329)

    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510)
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632)
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713)
    b = md5gg(b, c, d, a, x[i], 20, -373897302)
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691)
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083)
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335)
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848)
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438)
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690)
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961)
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501)
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467)
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784)
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473)
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734)

    a = md5hh(a, b, c, d, x[i + 5], 4, -378558)
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463)
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562)
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556)
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060)
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353)
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632)
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640)
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174)
    d = md5hh(d, a, b, c, x[i], 11, -358537222)
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979)
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189)
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487)
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835)
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520)
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651)

    a = md5ii(a, b, c, d, x[i], 6, -198630844)
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415)
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905)
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055)
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571)
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606)
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523)
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799)
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359)
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744)
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380)
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649)
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070)
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379)
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259)
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551)

    a = safeAdd(a, olda)
    b = safeAdd(b, oldb)
    c = safeAdd(c, oldc)
    d = safeAdd(d, oldd)
  }
  return [a, b, c, d]
}

function bytesToWords(bytes: Uint8Array): number[] {
  const words: number[] = []
  for (let i = 0; i < bytes.length * 8; i += 8) {
    words[i >> 5] |= (bytes[i / 8] & 0xff) << (i % 32)
  }
  return words
}

function wordsToHex(words: number[]): string {
  const hexChars = "0123456789abcdef"
  let output = ""
  for (let i = 0; i < words.length * 4; i++) {
    const byte = (words[i >> 2] >>> ((i % 4) * 8)) & 0xff
    output += hexChars.charAt((byte >>> 4) & 0x0f) + hexChars.charAt(byte & 0x0f)
  }
  return output
}

function md5(bytes: Uint8Array): string {
  return wordsToHex(binlMd5(bytesToWords(bytes), bytes.length * 8))
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

async function computeHashes(bytes: Uint8Array<ArrayBuffer>): Promise<Record<HashAlgorithm, string>> {
  const [sha1, sha256, sha512] = await Promise.all([
    crypto.subtle.digest("SHA-1", bytes), // NOSONAR typescript:S4790 -- checksum utility output, not used for security (passwords/signing)
    crypto.subtle.digest("SHA-256", bytes),
    crypto.subtle.digest("SHA-512", bytes),
  ])

  return {
    MD5: md5(bytes),
    "SHA-1": bufferToHex(sha1),
    "SHA-256": bufferToHex(sha256),
    "SHA-512": bufferToHex(sha512),
  }
}

export function HashGenerator({ dictionary }: Readonly<HashGeneratorProps>) {
  const [mode, setMode] = useState<"text" | "file">("text")
  const [text, setText] = useState("")
  const [fileName, setFileName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [hashes, setHashes] = useState<Record<HashAlgorithm, string> | null>(null)
  const [error, setError] = useState("")
  const [copiedAlgorithm, setCopiedAlgorithm] = useState<HashAlgorithm | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleGenerateFromText = async () => {
    setError("")
    if (!text) {
      setError(dictionary.errors.empty)
      return
    }

    setIsProcessing(true)
    try {
      const bytes = new TextEncoder().encode(text)
      setHashes(await computeHashes(bytes))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileSelected = async (file: File) => {
    setError("")

    if (file.size > MAX_FILE_SIZE) {
      setError(dictionary.errors.fileTooLarge)
      return
    }

    setFileName(file.name)
    setIsProcessing(true)
    try {
      const bytes = new Uint8Array(await file.arrayBuffer())
      setHashes(await computeHashes(bytes))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setText("")
    setFileName("")
    setHashes(null)
    setError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const copyToClipboard = async (algorithm: HashAlgorithm, value: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedAlgorithm(algorithm)
    setTimeout(() => setCopiedAlgorithm(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-orange-950 p-3 sm:p-6">
      <div className="container mx-auto max-w-4xl pt-32 sm:pt-28 md:pt-20">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Hash className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-orange-400 mr-2 sm:mr-4" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500 bg-clip-text text-transparent font-mono leading-tight">
              {dictionary.title}
            </h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base px-4 sm:px-0">
            {dictionary.description}
          </p>
        </div>

        {/* Mode toggle + input */}
        <Card className="bg-black/70 border-orange-500/30 mb-6 sm:mb-8 mx-2 sm:mx-0">
          <CardHeader className="pb-4 sm:pb-6">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === "text" ? "default" : "outline"}
                onClick={() => setMode("text")}
                className={
                  mode === "text"
                    ? "bg-gradient-to-r from-orange-600 to-orange-500 text-black font-semibold flex-1"
                    : "border-orange-500/30 text-orange-400 hover:bg-orange-500/10 flex-1"
                }
              >
                <Type className="w-4 h-4 mr-2" />
                {dictionary.textTab}
              </Button>
              <Button
                type="button"
                variant={mode === "file" ? "default" : "outline"}
                onClick={() => setMode("file")}
                className={
                  mode === "file"
                    ? "bg-gradient-to-r from-orange-600 to-orange-500 text-black font-semibold flex-1"
                    : "border-orange-500/30 text-orange-400 hover:bg-orange-500/10 flex-1"
                }
              >
                <Upload className="w-4 h-4 mr-2" />
                {dictionary.fileTab}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "text" ? (
              <>
                <Textarea
                  placeholder={dictionary.textPlaceholder}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="bg-gray-900/50 border-orange-500/30 text-orange-300 font-mono min-h-32 focus:border-orange-400 text-xs sm:text-sm"
                />
                {error && (
                  <div className="flex items-center text-red-400 text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="break-words">{error}</span>
                  </div>
                )}
                <Button
                  onClick={handleGenerateFromText}
                  disabled={isProcessing || !text}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-black font-semibold text-sm sm:text-base py-2 sm:py-3"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Hash className="w-4 h-4 mr-2" />}
                  {isProcessing ? dictionary.generating : dictionary.generateButton}
                </Button>
              </>
            ) : (
              <>
                <label
                  htmlFor="hash-file-input"
                  className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-orange-500/30 rounded-lg cursor-pointer hover:border-orange-400 transition-colors"
                >
                  <Upload className="w-6 h-6 text-orange-400" />
                  <span className="text-orange-300 text-sm text-center break-all">
                    {fileName || dictionary.filePlaceholder}
                  </span>
                </label>
                <input
                  id="hash-file-input"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelected(file)
                  }}
                />
                {isProcessing && (
                  <div className="flex items-center text-orange-400 text-xs sm:text-sm">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>{dictionary.generating}</span>
                  </div>
                )}
                {error && (
                  <div className="flex items-center text-red-400 text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="break-words">{error}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {hashes && (
          <Card className="bg-black/70 border-orange-500/30 mb-6 sm:mb-8 mx-2 sm:mx-0">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-orange-300 font-mono flex items-center text-lg sm:text-xl">
                <Hash className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {dictionary.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ALGORITHMS.map((algorithm) => (
                <div key={algorithm} className="p-2 sm:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-orange-300 font-mono text-xs sm:text-sm font-semibold">{algorithm}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(algorithm, hashes[algorithm])}
                      className="h-7 px-2 text-orange-400 hover:text-orange-300"
                    >
                      {copiedAlgorithm === algorithm ? (
                        <Check className="h-3.5 w-3.5 mr-1" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span className="text-xs">{copiedAlgorithm === algorithm ? dictionary.copied : dictionary.copy}</span>
                    </Button>
                  </div>
                  <p className="text-gray-300 font-mono text-xs sm:text-sm break-all">{hashes[algorithm]}</p>
                </div>
              ))}

              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-sm sm:text-base py-2 sm:py-3"
              >
                {dictionary.resetButton}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Terminal-style footer */}
        <div className="mt-6 sm:mt-8 bg-black/70 border border-orange-500/30 rounded-lg p-4 sm:p-6 font-mono mx-2 sm:mx-0">
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="flex space-x-1 sm:space-x-2 mr-3 sm:mr-4">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-orange-400 text-xs sm:text-sm break-all">adrianmartinez@hash-generator:~$</span>
          </div>
          <div className="text-orange-300 text-xs sm:text-sm space-y-1">
            <p><span className="text-orange-400">&gt;</span> Generates MD5, SHA-1, SHA-256 and SHA-512 digests</p>
            <p><span className="text-orange-400">&gt;</span> Everything runs locally in your browser</p>
            <p><span className="text-orange-400">&gt;</span> Files never leave your device</p>
            <div className="flex items-center mt-2">
              <span className="text-orange-400 mr-2">&gt;</span>
              <div className="w-1 h-3 sm:w-2 sm:h-4 bg-orange-400 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
