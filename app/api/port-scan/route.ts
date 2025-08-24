import { NextRequest, NextResponse } from 'next/server'
import { Socket } from 'net'

export async function POST(request: NextRequest) {
  try {
    const { host, ports } = await request.json()
    
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