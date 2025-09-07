import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import { join } from 'path'

export type Lock = { acquire: () => Promise<void>; release: () => void }

async function checkPath(
    baseUrl: string,
    path: string,
    req: NextRequest,
    results: Array<[string, number]>,
    lock?: Lock,
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

        if ([200, 301, 302].includes(resp.status)) {
            console.log(`[${resp.status}] ${url}`)
            if (lock) await lock.acquire()
            try {
                results.push([url, resp.status])
            } finally {
                if (lock) lock.release()
            }
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

            // Iterar secuencialmente — concatenar cada palabra AL FINAL del path
            const qIndex = pathParam.indexOf('?')
            const pathOnly = qIndex >= 0 ? pathParam.slice(0, qIndex) : pathParam
            const queryPart = qIndex >= 0 ? pathParam.slice(qIndex) : ''

            for (const w of words) {
                const appended = pathOnly.endsWith('/') ? pathOnly + encodeURIComponent(w) : pathOnly + '/' + encodeURIComponent(w)
                const target = appended + queryPart
                await checkPath(baseUrl, target, request, results)
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
            