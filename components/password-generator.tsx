"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { 
  Eye, 
  EyeOff, 
  Zap,
  Key,
  Copy,
  Check
} from "lucide-react"

interface PasswordGeneratorProps {
  dictionary: {
    title: string
    description: string
    length: string
    minLength: string
    includeGreek: string
    includeSpecial: string
    generate: string
    copy: string
    copied: string
    strength: string
    weak: string
    medium: string
    strong: string
    veryStrong: string
    show: string
    hide: string
  }
}

const MIN_LENGTH = 8
const DEFAULT_LENGTH = 25
const DIGITS = "0123456789"
const GREEK_CHARACTERS = "αβγδεζηθικλμνξοπρστυφχψω"
const LATIN_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const SPECIAL_CHARACTERS = "!@#$%^&*()-+"

export function PasswordGenerator({ dictionary }: Readonly<PasswordGeneratorProps>) {
  const [length, setLength] = useState(DEFAULT_LENGTH)
  const [includeGreek, setIncludeGreek] = useState(false)
  const [includeSpecial, setIncludeSpecial] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(true)
  const [copied, setCopied] = useState(false)

  const generatePassword = () => {
    let characterPool = LATIN_CHARACTERS + DIGITS

    if (includeGreek) {
      characterPool += GREEK_CHARACTERS
    }
    if (includeSpecial) {
      characterPool += SPECIAL_CHARACTERS
    }

    const newPassword = Array.from({ length }, () => 
      characterPool[Math.floor(Math.random() * characterPool.length)]
    ).join('')

    setPassword(newPassword)
    setCopied(false)
  }

  const copyToClipboard = async () => {
    if (password) {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const calculateStrength = () => {
    if (!password) return { score: 0, label: dictionary.weak }
    
    let score = 0
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecials = /[!@#$%^&*()\-\+]/.test(password) // NOSONAR
    const hasGreekChars = /[αβγδεζηθικλμνξοπρστυφχψω]/.test(password)
    
    if (hasLower) score += 1
    if (hasUpper) score += 1
    if (hasNumbers) score += 1
    if (hasSpecials) score += 1
    if (hasGreekChars) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1

    if (score <= 2) return { score: 25, label: dictionary.weak }
    if (score <= 4) return { score: 50, label: dictionary.medium }
    if (score <= 5) return { score: 75, label: dictionary.strong }
    return { score: 100, label: dictionary.veryStrong }
  }

  const strength = calculateStrength()

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 p-3 sm:p-6">
      <div className="container mx-auto max-w-4xl pt-32 sm:pt-28 md:pt-20">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Key className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-400 mr-2 sm:mr-4" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent font-mono leading-tight">
              {dictionary.title}
            </h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base px-4 sm:px-0">
            {dictionary.description}
          </p>
        </div>

        <Card className="bg-black/70 border-green-500/30 mb-6 sm:mb-8 mx-2 sm:mx-0">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-green-300 font-mono flex items-center text-lg sm:text-xl">
              <Key className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-green-400" />
              {dictionary.title}
            </CardTitle>
            <p className="text-gray-300 text-sm sm:text-base">{dictionary.description}</p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="password-length" className="text-sm font-medium text-green-300">{dictionary.length}</label>
                <Input
                  id="password-length"
                  type="number"
                  min={MIN_LENGTH}
                  max={100}
                  value={length}
                  onChange={(e) => setLength(Math.max(MIN_LENGTH, parseInt(e.target.value) || MIN_LENGTH))}
                  className="mt-1 bg-gray-900/50 border-green-500/30 text-green-300 font-mono focus:border-green-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {dictionary.minLength}: {MIN_LENGTH}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <label htmlFor="include-greek" className="flex items-center space-x-2 cursor-pointer">
                  <input
                    id="include-greek"
                    type="checkbox"
                    checked={includeGreek}
                    onChange={(e) => setIncludeGreek(e.target.checked)}
                    className="rounded accent-green-500"
                  />
                  <span className="text-sm text-gray-300">{dictionary.includeGreek}</span>
                </label>
                <label htmlFor="include-special" className="flex items-center space-x-2 cursor-pointer">
                  <input
                    id="include-special"
                    type="checkbox"
                    checked={includeSpecial}
                    onChange={(e) => setIncludeSpecial(e.target.checked)}
                    className="rounded accent-green-500"
                  />
                  <span className="text-sm text-gray-300">{dictionary.includeSpecial}</span>
                </label>
              </div>

              <Button onClick={generatePassword} className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-semibold" size="lg">
                <Zap className="h-4 w-4 mr-2" />
                {dictionary.generate}
              </Button>
            </div>

            {password && (
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-900/30 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-300">{dictionary.strength}</span>
                  {(() => {
                    let badgeClass: string;
                    if (strength.score >= 75) {
                      badgeClass = "bg-green-500/20 text-green-400 border-green-500/30";
                    } else if (strength.score >= 50) {
                      badgeClass = "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
                    } else {
                      badgeClass = "bg-red-500/20 text-red-400 border-red-500/30";
                    }
                    return (
                      <Badge className={badgeClass + " text-xs"}>
                        {strength.label}
                      </Badge>
                    );
                  })()}
                </div>
                <Progress value={strength.score} className="h-2" />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        readOnly
                        className="pr-16 sm:pr-20 font-mono text-xs sm:text-sm bg-gray-900/50 border-green-500/30 text-green-300"
                      />
                      <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 flex gap-0.5 sm:gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPassword(!showPassword)}
                          className="h-8 w-8 p-1 sm:h-9 sm:w-9 sm:p-2 text-green-400 hover:text-green-300"
                        >
                          {showPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={copyToClipboard}
                          className="h-8 w-8 p-1 sm:h-9 sm:w-9 sm:p-2 text-green-400 hover:text-green-300"
                        >
                          {copied ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : <Copy className="h-3 w-3 sm:h-4 sm:w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {copied ? dictionary.copied : dictionary.copy}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terminal-style footer */}
        <div className="mt-6 mb-6 sm:mt-8 bg-black/70 border border-green-500/30 rounded-lg p-3 sm:p-4 md:p-6 font-mono mx-auto max-w-4xl">
          <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
            <div className="flex space-x-1 mr-2 sm:mr-3 md:mr-4">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-green-400 text-xs sm:text-sm break-all font-medium">adrianmartinez@password-generator:~$</span>
          </div>
          <div className="text-green-300 text-xs sm:text-sm space-y-1 sm:space-y-1.5">
            <p><span className="text-green-400">&gt;</span> <span className="text-green-300">./generate_secure_password --tips</span></p>
            <p><span className="text-green-400">&gt;</span> Use 16+ characters for maximum security</p>
            <p><span className="text-green-400">&gt;</span> Enable special characters and Greek letters for complexity</p>
            <p className="hidden sm:block"><span className="text-green-400">&gt;</span> Never reuse passwords across different accounts</p>
            <p><span className="text-green-400">&gt;</span> Store passwords in a trusted password manager</p>
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