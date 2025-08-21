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
      'Access-Control-Allow-Origin',
      'Content-Security-Policy',
      'Content-Security-Policy-Report-Only',
      'Strict-Transport-Security',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy'
    ]

    relevantHeaders.forEach(headerName => {
      const value = response.headers.get(headerName)
      if (value) {
        headers[headerName] = value
      }
    })

    return NextResponse.json({ 
      url,
      status: response.status,
      headers 
    })
  } catch (error) {
    console.error('Error fetching headers:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch headers',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
