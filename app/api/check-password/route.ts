export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return Response.json({ error: 'Password is required' }, { status: 400 })
    }

    // Crear hash SHA-1 de la contraseña
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
    
    // Tomar los primeros 5 caracteres
    const prefix = hashHex.slice(0, 5)
    const suffix = hashHex.slice(5)
    
    const url = `https://api.pwnedpasswords.com/range/${prefix}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'password-checker-app',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const text = await response.text()
    const hashes = text.split('\n')
    
    for (const hashLine of hashes) {
      const [hashSuffix, count] = hashLine.trim().split(':')
      if (hashSuffix === suffix) {
        return Response.json({ count: parseInt(count, 10) })
      }
    }
    
    return Response.json({ count: 0 })
  } catch (error) {
    console.error('Error checking pwned password:', error)
    return Response.json({ error: 'Failed to check password' }, { status: 500 })
  }
}