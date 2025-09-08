'use client'
import React, { useState } from 'react'

type DictShape = Record<string, any>

export function WebDiscovery({ dictionary }: { readonly dictionary?: DictShape }) {
  const [url, setUrl] = useState<string>('') 
  const [status, setStatus] = useState<string>('idle')
  const [results, setResults] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Estados para progreso y baseUrl
  const [progress, setProgress] = useState<number>(0)
  const [baseUrlState, setBaseUrlState] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<string>('')

  function onStart() {
    if (!url.trim()) {
      setStatus('empty')
      return
    }

    setStatus('scanning')
    setErrorMsg(null)
    setResults([]);
    setProgress(0)
    setBaseUrlState(null);
    setCurrentStep('Preparando escaneo...');

    (async () => {
      try {
        setProgress(15)
        setCurrentStep('Validando URL...')
        
        let parsed: URL
        try {
          parsed = new URL(url)
        } catch {
          parsed = new URL(`https://${url}`)
        }

        const baseUrl = parsed.origin
        setBaseUrlState(baseUrl)
        const originalPath = (parsed.pathname || '/') + (parsed.search || '')

        setProgress(35)
        setCurrentStep('Conectando con el servidor...')

        // Ya no se usa ninguna plantilla; siempre enviamos el path original
        const apiUrl = `/api/web-discovery?baseUrl=${encodeURIComponent(baseUrl)}&path=${encodeURIComponent(originalPath)}`

        setProgress(50)
        setCurrentStep('Iniciando descubrimiento...')

        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error(`API responded with ${res.status}`)

        setProgress(75)
        setCurrentStep('Procesando resultados...')

        const json = await res.json()
        if (Array.isArray(json.results)) {
          // Transformar URLs completas devueltas por la API a solo path (pathname + search)
          const paths: string[] = []
          for (const item of json.results) {
            try {
              const u = Array.isArray(item) ? item[0] : item // por si viene como [url, status] o similar
              const parsedUrl = new URL(u)
              const p = (parsedUrl.pathname || '/') + (parsedUrl.search || '')
              // Normalizar: quitar doble slash en caso de que exista
              paths.push(p)
            } catch (e) {
              // ignorar entradas que no sean URLs válidas
              console.warn('Ignoring invalid URL from API result:', item, e)
            }
          }
          setResults(paths)
        } else {
          setResults([])
        }
        
        setProgress(100)
        setCurrentStep('¡Escaneo completado!')
        setTimeout(() => setStatus('done'), 500)
      } catch (err) {
        console.error('WebDiscovery start error:', err)
        setErrorMsg(err instanceof Error ? err.message : String(err) || 'Unknown error')
        setProgress(0)
        setCurrentStep('')
        setStatus('error')
      }
    })()
  }

  function onReset() {
    setUrl('')
    setStatus('idle')
    setResults([]) 
    setErrorMsg(null)
    setProgress(0)
    setBaseUrlState(null)
    setCurrentStep('')
  }

  // Función de traducción que consulta la prop 'dictionary'
  const t = (key: string, fallback = '') => {
    if (!dictionary) return fallback
    const parts = key.split('.')
    let cur: any = dictionary
    for (const p of parts) {
      cur = cur?.[p]
      if (cur === undefined) return fallback
    }
    return cur
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl pt-16 sm:pt-20">
        <div className="bg-black/70 border border-green-500/30 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
          <header className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-mono text-green-300 mb-2">{t('title', 'Web Content Discovery')}</h1>
            <p className="text-xs sm:text-sm text-gray-300">{t('description', '')}</p>
          </header>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-green-300">{t('urlLabel', 'URL objetivo')}</label>
            <div className="w-full">
              <input
                aria-label={t('urlLabel', 'URL objetivo')}
                placeholder={t('urlPlaceholder', 'https://example.com')}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-gray-900/50 border border-green-500/20 text-green-200 font-mono rounded-md p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                type="text"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onStart}
              disabled={status === 'scanning'}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-md bg-gradient-to-r from-green-600 to-green-500 text-black font-semibold hover:from-green-500 hover:to-green-400 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {status === 'scanning' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  {t('scanning', 'Escaneando...')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  {t('scanButton', 'Iniciar Descubrimiento')}
                </>
              )}
            </button>

            <button
              onClick={onReset}
              disabled={status === 'scanning'}
              className="px-4 py-3 sm:py-2 rounded-md border border-green-500/30 text-green-300 hover:bg-green-500/10 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {t('resetButton', 'Nuevo Descubrimiento')}
            </button>
          </div>

          {/* Barra de progreso mejorada */}
          {status === 'scanning' && (
            <div className="space-y-4 p-4 bg-gray-900/30 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 border-2 border-green-500/30 rounded-full"></div>
                    <div className="absolute inset-0 w-8 h-8 border-2 border-green-400 rounded-full animate-spin border-t-transparent"></div>
                  </div>
                  <div>
                    <div className="text-green-300 font-medium text-sm">{currentStep}</div>
                    <div className="text-xs text-gray-400">Progreso del escaneo</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-300 font-mono text-lg font-bold">{progress}%</div>
                  <div className="text-xs text-gray-400">Completado</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden border border-green-500/20">
                  <div 
                    className="h-full bg-gradient-to-r from-green-600 via-green-500 to-green-400 transition-all duration-500 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Iniciado</span>
                  <span>Procesando</span>
                  <span>Completado</span>
                </div>
              </div>

              {/* Indicadores de pasos */}
              <div className="flex items-center justify-between">
                {Object.entries({
                  1: 'Validar',
                  2: 'Conectar',
                  3: 'Escanear',
                  4: 'Procesar',
                  5: 'Finalizar'
                }).map(([step, label]) => {
                  const threshold = Number(step) * 20
                  
                  const getStepClasses = () => {
                    if (progress >= threshold) {
                      return 'bg-green-400 border-green-400 shadow-lg shadow-green-400/50'
                    }
                    if (progress >= threshold - 20) {
                      return 'bg-green-600 border-green-500 animate-pulse'
                    }
                    return 'bg-gray-700 border-gray-600'
                  }
                  
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${getStepClasses()}`}></div>
                      <span className={`text-xs mt-1 transition-colors duration-300 ${
                        progress >= threshold ? 'text-green-300' : 'text-gray-500'
                      }`}>{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Estado de finalización */}
          {status === 'done' && (
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <div className="text-green-300 font-medium">¡Escaneo completado exitosamente!</div>
                  <div className="text-sm text-gray-300">Se encontraron {results.length} resultados</div>
                </div>
              </div>
            </div>
          )}

          {/* Estado de error */}
          {status === 'error' && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </div>
                <div>
                  <div className="text-red-300 font-medium">Error en el escaneo</div>
                  <div className="text-sm text-gray-300">{errorMsg}</div>
                </div>
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {status === 'empty' && (
            <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-yellow-300 font-medium">URL requerida</div>
                  <div className="text-sm text-gray-300">Por favor, introduce una URL válida para continuar</div>
                </div>
              </div>
            </div>
          )}

          {/* Mostrar resultados */}
          {results.length > 0 && (
            <div className="mt-4 bg-gray-900/50 border border-green-500/20 rounded-md p-3 sm:p-4 font-mono text-xs sm:text-sm text-green-200">
              <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="font-medium text-green-300 text-sm sm:text-base">Resultados</div>
                <div className="text-xs text-gray-300">{results.length} encontrados</div>
              </div>
              <div className="grid gap-2 grid-cols-1 lg:grid-cols-2">
                {results.map((p) => {
                  const full = baseUrlState ? `${baseUrlState.replace(/\/$/, '')}${p}` : p
                  return (
                    <a
                      key={p}
                      href={full}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-2 sm:gap-3 bg-black/40 border border-green-500/10 rounded px-2 sm:px-3 py-2 hover:bg-green-900/20 transition-colors min-w-0"
                    >
                      <span className="truncate text-green-200 text-xs sm:text-sm">{p}</span>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M13 7h6m0 0v6m0-6L10 16"></path>
                      </svg>
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer terminal responsivo */}
        <div className="mt-4 sm:mt-6 bg-black/70 border border-green-500/30 rounded-lg p-3 sm:p-4 font-mono text-xs text-green-300">
          <div className="flex items-center mb-2">
            <div className="flex space-x-1 mr-2 sm:mr-3">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-green-400 font-medium text-xs sm:text-sm">adrianmartinez@web-discovery:~$</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm"><span className="text-green-400">&gt;</span> Ejecuta un escaneo básico de descubrimiento web</p>
            <p className="hidden sm:block text-xs"><span className="text-green-400">&gt;</span> Pega la URL y pulsa "{t('scanButton','Start Discovery')}"</p>
            <div className="flex items-center mt-2">
              <span className="text-green-400 mr-2 text-xs sm:text-sm">&gt;</span>
              <div className="w-1 h-2 sm:h-3 bg-green-400 animate-pulse rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}