'use client'
import React, { useEffect, useState } from 'react'

type DictShape = Record<string, any>

export function WebDiscovery({ dictionary: initialDict }: { readonly dictionary?: DictShape }) {
  const [dict, setDict] = useState<DictShape | null>(initialDict ?? null)
  const [url, setUrl] = useState<string>('') 
  const [status, setStatus] = useState<string>('idle')

  // Añadidos: resultados y error
  const [results, setResults] = useState<Array<[string, number]>>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (initialDict) return // si viene por props, usarlo
    const lang = (typeof navigator !== 'undefined' && navigator.language?.startsWith('es')) ? 'es' : 'en'
    const path = `/web-discovery.${lang}.json`
    let mounted = true

    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load dictionary ${path}`)
        return res.json()
      })
      .then((json) => { if (mounted) setDict(json) })
      .catch((err) => {
        console.error('Error loading dictionary:', err)
        if (mounted) setDict({
          title: lang === 'es' ? 'Descubrimiento de Contenido Web' : 'Web Content Discovery',
          description: '',
          scanButton: lang === 'es' ? 'Iniciar Búsqueda' : 'Start Discovery',
          resetButton: lang === 'es' ? 'Nuevo Escaneo' : 'New Discovery'
        })
      })

    return () => { mounted = false }
  }, [initialDict])

  function onStart() {
    if (!url.trim()) {
      setStatus('empty')
      return
    }

    setStatus('scanning')
    setErrorMsg(null)
    setResults([]);

    (async () => {
      try {
        let parsed: URL
        try {
          parsed = new URL(url)
        } catch {
          parsed = new URL(`https://${url}`)
        }

        const baseUrl = parsed.origin
        const originalPath = (parsed.pathname || '/') + (parsed.search || '')

        // Ya no se usa ninguna plantilla; siempre enviamos el path original
        const apiUrl = `/api/web-discovery?baseUrl=${encodeURIComponent(baseUrl)}&path=${encodeURIComponent(originalPath)}`

        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error(`API responded with ${res.status}`)

        const json = await res.json()
        if (Array.isArray(json.results)) {
          setResults(json.results)
        } else {
          setResults([])
        }
        setStatus('done')
      } catch (err) {
        console.error('WebDiscovery start error:', err)
        setErrorMsg(err instanceof Error ? err.message : String(err) || 'Unknown error')
        setStatus('error')
      }
    })()
  }

  function onReset() {
    setUrl('')
    setStatus('idle')
    setResults([]) 
    setErrorMsg(null)
  }

  const t = (key: string, fallback = '') => {
    if (!dict) return fallback
    const parts = key.split('.')
    let cur: any = dict
    for (const p of parts) {
      cur = cur?.[p]
      if (cur === undefined) return fallback
    }
    return cur
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 p-6 sm:p-8">
      <div className="container mx-auto max-w-3xl pt-20">
        <div className="bg-black/70 border border-green-500/30 rounded-lg p-6 space-y-4">
          <header>
            <h1 className="text-2xl sm:text-3xl font-mono text-green-300 mb-1">{t('title', 'Web Content Discovery')}</h1>
            <p className="text-sm text-gray-300">{t('description', '')}</p>
          </header>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-green-300">{t('urlLabel', 'URL objetivo')}</label>
            <textarea
              aria-label={t('urlLabel', 'URL objetivo')}
              placeholder={t('urlPlaceholder', 'https://example.com')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              rows={3}
              className="w-full bg-gray-900/50 border border-green-500/20 text-green-200 font-mono rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-green-600 to-green-500 text-black font-semibold hover:from-green-500 hover:to-green-400"
            >
              {status === 'scanning' ? t('scanning', 'Scanning...') : t('scanButton', 'Start Discovery')}
            </button>

            <button
              onClick={onReset}
              className="px-4 py-2 rounded-md border border-green-500/30 text-green-300 hover:bg-green-500/10"
            >
              {t('resetButton', 'New Discovery')}
            </button>

            <div className="ml-auto text-sm text-gray-300">
              {(() => {
                if (status === 'idle') return null
                if (status === 'empty') return <span className="text-rose-400">{t('errors.wordlistMissing', 'Introduce una URL')}</span>
                if (status === 'scanning') return <span className="text-green-200">{t('scanning', 'Scanning...')}</span>
                if (status === 'done') return <span className="text-green-200">Resultados recibidos</span>
                if (status === 'error') return <span className="text-rose-400">Error: {errorMsg}</span>
                return null
              })()}
            </div>
          </div>

          {/* Mostrar resultados o error (UI mínima) */}
          {(() => {
            if (errorMsg) {
              return <div className="mt-3 text-rose-400 font-mono text-sm">{errorMsg}</div>
            }
            
            if (results.length > 0) {
              return (
                <div className="mt-3 bg-gray-900/50 border border-green-500/20 rounded-md p-3 font-mono text-sm text-green-200">
                  <div className="mb-2 font-medium text-green-300">Resultados</div>
                  <ul className="space-y-1">
                    {results.map(([u, s]) => (
                      <li key={`${u}-${s}`} className="flex justify-between">
                        <span className="truncate pr-4">{u}</span>
                        <span className="ml-2 text-green-300">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            }
            
            return null
          })()}
        </div>

        {/* Footer estilo terminal coherente con las otras herramientas */}
        <div className="mt-6 bg-black/70 border border-green-500/30 rounded-lg p-4 font-mono text-xs text-green-300 mx-auto">
          <div className="flex items-center mb-2">
            <div className="flex space-x-1 mr-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-green-400 font-medium">adrianmartinez@web-discovery:~$</span>
          </div>
          <div className="space-y-1">
            <p><span className="text-green-400">&gt;</span> Ejecuta un escaneo básico de descubrimiento web (UI limitada)</p>
            <p className="hidden sm:block"><span className="text-green-400">&gt;</span> Pega la URL y pulsa "{t('scanButton','Start Discovery')}"</p>
            <div className="flex items-center mt-2">
              <span className="text-green-400 mr-2">&gt;</span>
              <div className="w-1 h-3 bg-green-400 animate-pulse rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
