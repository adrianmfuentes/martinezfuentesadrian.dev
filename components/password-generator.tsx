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
    <Card className="w-full max-w-2xl mx-auto mt-20 mb-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-6 w-6" />
          {dictionary.title}
        </CardTitle>
        <p className="text-muted-foreground">{dictionary.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{dictionary.length}</label>
            <Input
              type="number"
              min={MIN_LENGTH}
              max={100}
              value={length}
              onChange={(e) => setLength(Math.max(MIN_LENGTH, parseInt(e.target.value) || MIN_LENGTH))}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {dictionary.minLength}: {MIN_LENGTH}
            </p>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeGreek}
                onChange={(e) => setIncludeGreek(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">{dictionary.includeGreek}</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSpecial}
                onChange={(e) => setIncludeSpecial(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">{dictionary.includeSpecial}</span>
            </label>
          </div>

          <Button onClick={generatePassword} className="w-full" size="lg">
            <Zap className="h-4 w-4 mr-2" />
            {dictionary.generate}
          </Button>
        </div>

        {password && (
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{dictionary.strength}</span>
              {(() => {
                let badgeVariant: "default" | "secondary" | "destructive";
                if (strength.score >= 75) {
                  badgeVariant = "default";
                } else if (strength.score >= 50) {
                  badgeVariant = "secondary";
                } else {
                  badgeVariant = "destructive";
                }
                return (
                  <Badge variant={badgeVariant}>
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
                    className="pr-20 font-mono"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copyToClipboard}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {copied ? dictionary.copied : dictionary.copy}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}