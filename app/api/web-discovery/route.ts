import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import { join } from 'path'

export type Lock = { acquire: () => Promise<void>; release: () => void }

class SimpleLock implements Lock {
    private _locked = false
    async acquire() {
        while (this._locked) {
            await new Promise((r) => setTimeout(r, 1))
        }
        this._locked = true
    }
    release() {
        this._locked = false
    }
}

async function checkPath(
    baseUrl: string,
    path: string,
    req: NextRequest,
    results: Array<[string, number]>,
    lock?: Lock
): Promise<void> {
    // Construir URL: si path ya es absoluta, usarla; si no, combinar con baseUrl
    const url = (path.startsWith('http://') || path.startsWith('https://'))
        ? path
        : new URL(path, baseUrl).toString()

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
        let resp: Response | null = null

        try { // Intentar HEAD primero
            resp = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: controller.signal })
            if (resp.status === 405 || resp.status === 0) {
                resp = await fetch(url, { method: 'GET', redirect: 'manual', signal: controller.signal })
            }
        } catch (e) {
            console.warn(`HEAD request failed for ${url}, trying GET. Error:`, e)
            try { // Si HEAD falla, intentar GET
                resp = await fetch(url, { method: 'GET', redirect: 'manual', signal: controller.signal })
            } catch (e) {
                console.warn(`GET request failed for ${url}. Error:`, e)
                return
            }
        }

        if (!resp) return

        if ([200, 301, 302, 403, 401].includes(resp.status)) {
            if (lock) await lock.acquire()
            try {
                results.push([url, resp.status])
            } finally {
                if (lock) lock.release()
            }
        }
    } catch (err) {
        if ((err as any).name === 'AbortError') {
            console.warn(`Request timed out for ${url}`)
        } else {
            console.warn(`Error fetching ${url}:`, err)
        }
    } finally {
        clearTimeout(timeoutId)
    }
}

export async function GET(request: NextRequest) {
    try {
        const urlObj = new URL(request.url)
        const searchParams = urlObj.searchParams

        const baseUrl = searchParams.get('baseUrl') || undefined
        const pathParam = searchParams.get('path') || undefined

        if (!baseUrl || !pathParam) {
            return NextResponse.json({ error: 'baseUrl and path query params are required' }, { status: 400 })
        }

        const results: Array<[string, number]> = []

        try {
            const staticFile = 'wordlist.txt' // fichero fijo en public/diccionarios
            const filePath = join(process.cwd(), 'public', 'diccionarios', staticFile)
            const data = await fs.readFile(filePath, 'utf8')

            const words = data
                .split(/\r?\n/)
                .map(s => s.trim())
                .filter(s => s && !s.startsWith('#'))

           const qIndex = pathParam.indexOf('?')
            const pathOnly = qIndex >= 0 ? pathParam.slice(0, qIndex) : pathParam
            const queryPart = qIndex >= 0 ? pathParam.slice(qIndex) : ''

            // Ejecutar con concurrencia limitada y timeout global para evitar bloqueos
            const concurrency = 3 // ajustar según entorno
            const maxResults = 100 // tope para devolver resultados parciales rápido
            const overallTimeoutMs = 30_000 // timeout global (ms)

            const lock = new SimpleLock()
            let index = 0
            let aborted = false

            const worker = async () => {
                while (!aborted) {
                    const i = index++
                    if (i >= words.length) break

                    // Comprobar tope de resultados de forma sincronizada
                    await lock.acquire()
                    try {
                        if (results.length >= maxResults) {
                            aborted = true
                            break
                        }
                    } finally {
                        lock.release()
                    }

                    const w = words[i]
                    const appended = pathOnly.endsWith('/') ? pathOnly + encodeURIComponent(w) : pathOnly + '/' + encodeURIComponent(w)
                    const target = appended + queryPart
                    try {
                        await checkPath(baseUrl, target, request, results, lock)
                    } catch (e) {
                        console.warn('checkPath error for', target, e)
                    }
                }
            }

            const runners = Array.from({ length: concurrency }, () => worker())

            try {
                await Promise.race([
                    Promise.all(runners),
                    new Promise<void>((resolve) => setTimeout(() => {
                        aborted = true
                        console.warn('Web discovery overall timeout reached')
                        resolve()
                    }, overallTimeoutMs))
                ])
            } catch (err) {
                console.warn('Web discovery stopped early:', err)
            }

            return NextResponse.json({ success: true, results }, { status: 200 })
        } catch (err) {
            console.error('Error reading static wordlist:', err)
            return NextResponse.json({ success: false, error: 'Error reading wordlist' }, { status: 500 })
        }

    } catch (err) {
        console.error('Error in web-discovery GET handler:', err)
        return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
    }
}