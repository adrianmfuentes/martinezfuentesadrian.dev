import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    // Validar que la URL sea válida
    const parsedUrl = new URL(url)
    
    // Por seguridad, solo permitir HTTP y HTTPS
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 })
    }

    // Hacer la petición para obtener las cabeceras
    const response = await fetch(url, { 
      method: 'HEAD', // Solo queremos las cabeceras
      headers: {
        'User-Agent': 'HeadersValidator/1.0'
      }
    })

    // Extraer las cabeceras relevantes
    const headers: Record<string, string> = {}
    
    // Lista de cabeceras que nos interesan
    const relevantHeaders = [
      'access-control-allow-origin',
      'content-security-policy',
      'content-security-policy-report-only',
      'strict-transport-security',
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
      'permissions-policy'
    ]

    relevantHeaders.forEach(headerName => {
      const value = response.headers.get(headerName)
      if (value) {
        // Normalizar el nombre de la cabecera para que coincida con expectedHeaders
        const normalizedName = headerName.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join('-')
        headers[normalizedName] = value
      }
    })

    return NextResponse.json({ 
      success: true, 
      headers,
      status: response.status 
    })

  } catch (error) {
    console.error('Error validating headers:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch headers',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}