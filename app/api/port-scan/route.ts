import { NextRequest, NextResponse } from 'next/server'
import { Socket } from 'net'
import { z } from 'zod'

const portScanSchema = z.object({
  host: z.string().min(1).max(253), // Validar host
  ports: z.array(z.number().int().min(1).max(65535)).min(1).max(100), // Máximo 100 puertos
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { host, ports } = portScanSchema.parse(body)
    
    const results = await Promise.all(
      ports.map(async (port: number) => {
        return new Promise((resolve) => {
          const socket = new Socket()
          socket.setTimeout(3000)
          
          socket.on('connect', () => {
            socket.destroy()
            resolve({ port, isOpen: true, status: 'open' })
          })
          
          socket.on('timeout', () => {
            socket.destroy()
            resolve({ port, isOpen: false, status: 'closed' })
          })
          
          socket.on('error', () => {
            resolve({ port, isOpen: false, status: 'closed' })
          })
          
          socket.connect(port, host)
        })
      })
    )
    
    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Error during port scan:", error)
    return NextResponse.json({ success: false, error: 'Scan failed' }, { status: 500 })
  }
}