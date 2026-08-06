"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Badge } from "@components/ui/badge"
import { Button } from "@components/ui/button"
import Link from "next/link"
import { useParams } from "next/navigation"

import {
  Terminal,
  Shield,
  Code2,
  Network,
  Search,
  ExternalLink,
  Lock,
  Zap,
  ChevronRight
} from "lucide-react"

interface ToolItem {
  id: string
  name: string
  description: string
  category: string
  status: string
}

interface ToolsDict {
  title: string
  subtitle: string
  description: string
  comingSoon: string
  launchTool: string
  stats: string
  api: string
  categories: {
    security: string
    development: string
    networking: string
    analysis: string
  }
  items: ToolItem[]
}

interface ToolsSectionProps {
  readonly dictionary: ToolsDict
}

export function ToolsSection({ dictionary }: ToolsSectionProps) {
  const params = useParams()
  const lang = params?.lang as string || "en"
  
  const categoryIcons = {
    security: Shield,
    development: Code2,
    networking: Network,
    analysis: Search
  }

  const filteredTools = dictionary.items

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "security": return "from-red-500/20 to-red-900/20 border-red-500/30"
      case "development": return "from-blue-500/20 to-blue-900/20 border-blue-500/30"
      case "networking": return "from-purple-500/20 to-purple-900/20 border-purple-500/30"
      case "analysis": return "from-yellow-500/20 to-yellow-900/20 border-yellow-500/30"
      default: return "from-green-500/20 to-green-900/20 border-green-500/30"
    }
  }

  const getToolUrl = (toolId: string) => {
    return `/${lang}/tools/${toolId}`
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Matrix-style background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-green-950">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full matrix-rain">
            <div className="absolute text-green-400 font-mono text-xs animate-pulse" style={{ left: '10%', top: '20%' }}>1</div>
            <div className="absolute text-green-400 font-mono text-xs animate-pulse" style={{ left: '30%', top: '40%', animationDelay: '1s' }}>0</div>
            <div className="absolute text-green-400 font-mono text-xs animate-pulse" style={{ left: '50%', top: '10%', animationDelay: '2s' }}>1</div>
            <div className="absolute text-green-400 font-mono text-xs animate-pulse" style={{ left: '70%', top: '60%', animationDelay: '3s' }}>0</div>
            <div className="absolute text-green-400 font-mono text-xs animate-pulse" style={{ left: '90%', top: '30%', animationDelay: '4s' }}>1</div>
            <div className="absolute text-green-400 font-mono text-xs animate-pulse" style={{ left: '20%', top: '80%', animationDelay: '1.5s' }}>0</div>
            <div className="absolute text-green-400 font-mono text-xs animate-pulse" style={{ left: '60%', top: '90%', animationDelay: '2.5s' }}>1</div>
            <div className="absolute text-green-400 font-mono text-xs animate-pulse" style={{ left: '80%', top: '15%', animationDelay: '3.5s' }}>0</div>
          </div>
        </div>
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <Terminal className="w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 text-green-400 shrink-0" />
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent font-mono">
              {dictionary.title}
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-green-300 mb-3 sm:mb-4 font-mono px-2">
            {dictionary.subtitle}
          </p>
          <p className="text-sm sm:text-base text-gray-300 max-w-3xl mx-auto leading-relaxed px-2">
            {dictionary.description}
          </p>
        </div>

        {/* Tools list - compact rows on mobile so users aren't scrolling through one full-height card at a time */}
        <div className="sm:hidden space-y-2">
          {filteredTools.map((tool) => {
            const IconComponent = categoryIcons[tool.category as keyof typeof categoryIcons] || Terminal
            const disabled = tool.status === "coming-soon"
            const row = (
              <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-black/40 px-4 py-3 active:bg-green-500/10 transition-colors">
                <div className="p-2 rounded-md bg-black/30 shrink-0">
                  <IconComponent className="w-5 h-5 text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-green-300 font-mono text-sm font-medium truncate">{tool.name}</p>
                  <p className="text-gray-400 text-xs truncate">{tool.description}</p>
                </div>
                {disabled ? (
                  <Lock className="w-4 h-4 text-gray-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-green-400 shrink-0" />
                )}
              </div>
            )
            return disabled ? (
              <div key={tool.id} className="opacity-60">
                {row}
              </div>
            ) : (
              <Link key={tool.id} href={getToolUrl(tool.id)}>
                {row}
              </Link>
            )
          })}
        </div>

        {/* Tools Grid (sm and up) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTools.map((tool) => {
            const IconComponent = categoryIcons[tool.category as keyof typeof categoryIcons] || Terminal
            return (
              <Card 
                key={tool.id}
                className={`bg-gradient-to-br ${getCategoryColor(tool.category)} backdrop-blur-sm border hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105 group`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-black/30">
                      <IconComponent className="w-6 h-6 text-green-400" />
                    </div>
                    <Badge 
                      variant="outline" 
                      className="border-green-500/50 text-green-400 bg-green-500/10"
                    >
                      {dictionary.categories[tool.category as keyof typeof dictionary.categories]}
                    </Badge>
                  </div>
                  <CardTitle className="text-green-300 font-mono text-lg group-hover:text-green-200 transition-colors">
                    {tool.name}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tool.status === "coming-soon" ? (
                    <Button 
                      disabled 
                      className="w-full bg-gray-600/50 text-gray-400 border border-gray-500/30"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {dictionary.comingSoon}
                    </Button>
                  ) : (
                    <Link href={getToolUrl(tool.id)}>
                      <Button 
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-semibold border-0 shadow-lg shadow-green-500/30"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        {dictionary.launchTool}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Link
            href={`/${lang}/tools/stats`}
            className="text-sm text-green-400 hover:text-green-300 underline underline-offset-4 font-mono"
          >
            {dictionary.stats}
          </Link>
          <Link
            href={`/${lang}/tools/api`}
            className="text-sm text-green-400 hover:text-green-300 underline underline-offset-4 font-mono"
          >
            {dictionary.api}
          </Link>
        </div>

        {/* Terminal-style footer */}
        <div className="mt-12 sm:mt-16 lg:mt-20 bg-black/70 border border-green-500/30 rounded-lg p-4 sm:p-6 font-mono">
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="flex space-x-1.5 sm:space-x-2 mr-3 sm:mr-4">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-green-400 text-xs sm:text-sm truncate">
              adrianmartinez@tools:~$
            </span>
          </div>
          <div className="text-green-300 text-xs sm:text-sm space-y-1 sm:space-y-2">
            <p className="break-words">
              <span className="text-green-400">&gt;</span> 
              <span className="ml-1">Status: Development in progress...</span>
            </p>
            <p className="break-words">
              <span className="text-green-400">&gt;</span> 
              <span className="ml-1">New tools will be added regularly</span>
            </p>
            <p className="break-words">
              <span className="text-green-400">&gt;</span> 
              <span className="ml-1">Stay tuned for updates!</span>
            </p>
            <div className="flex items-center mt-2 sm:mt-3">
              <span className="text-green-400 mr-2">&gt;</span>
              <div className="w-1.5 h-3 sm:w-2 sm:h-4 bg-green-400 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
