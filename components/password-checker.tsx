"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Lock,
  Zap,
  Key
} from "lucide-react"

interface PasswordAnalysis {
  length: number
  lowercase: number
  uppercase: number
  digits: number
  special: number
  whitespace: number
  entropy: number
  strength: "very-weak" | "weak" | "moderate" | "strong" | "very-strong"
  remarks: string
}

interface PasswordCheckerProps {
  dictionary: {
    title: string
    description: string
    passwordLabel: string
    passwordPlaceholder: string
    analyzeButton: string
    showPassword: string
    hidePassword: string
    analysis: {
      title: string
      length: string
      lowercase: string
      uppercase: string
      digits: string
      special: string
      whitespace: string
      entropy: string
      strength: string
      remarks: string
    }
    strengthLevels: {
      veryWeak: string
      weak: string
      moderate: string
      strong: string
      veryStrong: string
    }
    strengthRemarks: {
      veryWeak: string
      weak: string
      moderate: string
      strong: string
      veryStrong: string
    }
    minLengthWarning: string
    resetButton: string
  }
}

const MIN_LENGTH = 8
const MIN_ENTROPY = 40

// Character sets for entropy calculation
const ASCII_LOWERCASE = 26
const ASCII_UPPERCASE = 26
const DIGITS = 10
const PUNCTUATION = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~".length
const WHITESPACE = 1

function calculateEntropy(password: string): number {
  let charsetSize = 0
  
  if (/[a-z]/.test(password)) charsetSize += ASCII_LOWERCASE
  if (/[A-Z]/.test(password)) charsetSize += ASCII_UPPERCASE
  if (/\d/.test(password)) charsetSize += DIGITS
  if (/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password)) charsetSize += PUNCTUATION
  if (/\s/.test(password)) charsetSize += WHITESPACE
  
  return charsetSize > 0 ? password.length * Math.log2(charsetSize) : 0
}

function analyzePassword(password: string): PasswordAnalysis {
  const lowercase = (password.match(/[a-z]/g) || []).length
  const uppercase = (password.match(/[A-Z]/g) || []).length
  const digits = (password.match(/\d/g) || []).length
  const special = (password.match(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g) || []).length
  const whitespace = (password.match(/\s/g) || []).length
  
  const entropy = calculateEntropy(password)
  
  let strength: PasswordAnalysis["strength"]
  let remarks: string
  
  if (entropy < 28) {
    strength = "very-weak"
    remarks = "⚠️ Very Weak: Easily guessable! Change it immediately."
  } else if (entropy < 36) {
    strength = "weak"
    remarks = "⚠️ Weak: Can be cracked quickly. Use a stronger password."
  } else if (entropy < 60) {
    strength = "moderate"
    remarks = "✅ Moderate: Decent password, but can still be improved."
  } else if (entropy < 80) {
    strength = "strong"
    remarks = "✅ Strong: Hard to guess, but consider making it longer."
  } else {
    strength = "very-strong"
    remarks = "✅ Very Strong: Excellent password! Highly secure."
  }
  
  return {
    length: password.length,
    lowercase,
    uppercase,
    digits,
    special,
    whitespace,
    entropy,
    strength,
    remarks
  }
}

// Función helper para convertir strength a clave del diccionario
function getStrengthKey(strength: PasswordAnalysis["strength"]): keyof PasswordCheckerProps["dictionary"]["strengthLevels"] {
  switch (strength) {
    case "very-weak": return "veryWeak"
    case "very-strong": return "veryStrong"
    default: return strength as keyof PasswordCheckerProps["dictionary"]["strengthLevels"]
  }
}

export function PasswordChecker({ dictionary }: Readonly<PasswordCheckerProps>) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const handleAnalyze = () => {
    if (password.length === 0) return
    
    const result = analyzePassword(password)
    setAnalysis(result)
    setShowAnalysis(true)
  }

  const getStrengthColor = (strength: PasswordAnalysis["strength"]) => {
    switch (strength) {
      case "very-weak": return "text-red-500"
      case "weak": return "text-orange-500"
      case "moderate": return "text-yellow-500"
      case "strong": return "text-blue-500"
      case "very-strong": return "text-green-500"
      default: return "text-gray-500"
    }
  }

  const getStrengthProgress = (strength: PasswordAnalysis["strength"]) => {
    switch (strength) {
      case "very-weak": return 20
      case "weak": return 40
      case "moderate": return 60
      case "strong": return 80
      case "very-strong": return 100
      default: return 0
    }
  }

  const getStrengthBadgeColor = (strength: PasswordAnalysis["strength"]) => {
    switch (strength) {
      case "very-weak": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "weak": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "moderate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "strong": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "very-strong": return "bg-green-500/20 text-green-400 border-green-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 p-3 sm:p-6">
      <div className="container mx-auto max-w-4xl pt-32 sm:pt-28 md:pt-20">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-400 mr-2 sm:mr-4" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent font-mono leading-tight">
              {dictionary.title}
            </h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base px-4 sm:px-0">
            {dictionary.description}
          </p>
        </div>

        {/* Input Section */}
        <Card className="bg-black/70 border-green-500/30 mb-6 sm:mb-8 mx-2 sm:mx-0">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-green-300 font-mono flex items-center text-lg sm:text-xl">
              <Key className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {dictionary.passwordLabel}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={dictionary.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-900/50 border-green-500/30 text-green-300 font-mono pr-12 focus:border-green-400 text-sm sm:text-base"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0 text-green-400 hover:text-green-300"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? dictionary.hidePassword : dictionary.showPassword}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {password.length > 0 && password.length < MIN_LENGTH && (
              <div className="flex items-center text-orange-400 text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="break-words">
                  {dictionary.minLengthWarning.replace("{min}", MIN_LENGTH.toString())}
                </span>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={password.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-semibold text-sm sm:text-base py-2 sm:py-3"
            >
              <Zap className="w-4 h-4 mr-2" />
              {dictionary.analyzeButton}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {showAnalysis && analysis && (
          <Card className="bg-black/70 border-green-500/30 mx-2 sm:mx-0">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-green-300 font-mono flex items-center text-lg sm:text-xl">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {dictionary.analysis.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Strength Overview */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-gray-300 text-sm sm:text-base">{dictionary.analysis.strength}:</span>
                  <Badge className={`${getStrengthBadgeColor(analysis.strength)} text-xs sm:text-sm`}>
                    {dictionary.strengthLevels[getStrengthKey(analysis.strength)]}
                  </Badge>
                </div>
                <Progress 
                  value={getStrengthProgress(analysis.strength)} 
                  className="h-2"
                />
                <p className={`text-xs sm:text-sm ${getStrengthColor(analysis.strength)} leading-relaxed`}>
                  {dictionary.strengthRemarks[getStrengthKey(analysis.strength)]}
                </p>
              </div>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <span className="text-gray-300 text-xs sm:text-sm">{dictionary.analysis.length}:</span>
                    <span className="text-green-400 font-mono text-sm sm:text-base">{analysis.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <span className="text-gray-300 text-xs sm:text-sm">{dictionary.analysis.lowercase}:</span>
                    <span className="text-green-400 font-mono text-sm sm:text-base">{analysis.lowercase}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <span className="text-gray-300 text-xs sm:text-sm">{dictionary.analysis.uppercase}:</span>
                    <span className="text-green-400 font-mono text-sm sm:text-base">{analysis.uppercase}</span>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <span className="text-gray-300 text-xs sm:text-sm">{dictionary.analysis.digits}:</span>
                    <span className="text-green-400 font-mono text-sm sm:text-base">{analysis.digits}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <span className="text-gray-300 text-xs sm:text-sm">{dictionary.analysis.special}:</span>
                    <span className="text-green-400 font-mono text-sm sm:text-base">{analysis.special}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <span className="text-gray-300 text-xs sm:text-sm">{dictionary.analysis.whitespace}:</span>
                    <span className="text-green-400 font-mono text-sm sm:text-base">{analysis.whitespace}</span>
                  </div>
                </div>
              </div>

              {/* Entropy */}
              <div className="p-3 sm:p-4 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-lg">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="text-gray-300 font-semibold text-sm sm:text-base">{dictionary.analysis.entropy}:</span>
                  <span className="text-green-400 font-mono text-base sm:text-lg">{analysis.entropy.toFixed(2)} bits</span>
                </div>
              </div>

              {/* Reset Button */}
              <Button
                onClick={() => {
                  setPassword("")
                  setAnalysis(null)
                  setShowAnalysis(false)
                }}
                variant="outline"
                className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10 text-sm sm:text-base py-2 sm:py-3"
              >
                <Lock className="w-4 h-4 mr-2" />
                {dictionary.resetButton}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Terminal-style footer */}
        <div className="mt-6 sm:mt-8 bg-black/70 border border-green-500/30 rounded-lg p-4 sm:p-6 font-mono mx-2 sm:mx-0">
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="flex space-x-1 sm:space-x-2 mr-3 sm:mr-4">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-green-400 text-xs sm:text-sm break-all">adrianmartinez@password-checker:~$</span>
          </div>
          <div className="text-green-300 text-xs sm:text-sm space-y-1">
            <p><span className="text-green-400">&gt;</span> Security tip: Use a combination of uppercase, lowercase, numbers, and special characters</p>
            <p><span className="text-green-400">&gt;</span> Aim for at least 12 characters for better security</p>
            <p><span className="text-green-400">&gt;</span> Consider using a password manager for unique passwords</p>
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
