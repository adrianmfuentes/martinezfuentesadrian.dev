import * as tls from "tls"
import { Socket } from "net"

interface CertificateInfo {
  subject: string
  issuer: string
  notBefore: string
  notAfter: string
  isCA: boolean
  daysLeft: number
  isExpired: boolean
  sans: string[]
  hostIp: string
}

function formatDate(date: Date): string {
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC")
}

export async function getCertificateInfo(host: string, port: number): Promise<CertificateInfo> {
  return new Promise((resolve, reject) => {
    const socket = new Socket()

    socket.setTimeout(10000)
    socket.connect(port, host, () => {
      const tlsSocket = tls.connect({
        socket,
        servername: host,
        rejectUnauthorized: false,
      })

      tlsSocket.on("secureConnect", () => {
        try {
          const cert = tlsSocket.getPeerCertificate(true)

          if (!cert || Object.keys(cert).length === 0) {
            throw new Error("No certificate received")
          }

          const now = new Date()
          const notAfter = new Date(cert.valid_to)
          const notBefore = new Date(cert.valid_from)
          const daysLeft = Math.floor((notAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          const isExpired = now > notAfter

          // SANs
          const sans: string[] = []
          if (cert.subjectaltname) {
            cert.subjectaltname.split(", ").forEach((alt) => { // NOSONAR
              if (alt.startsWith("DNS:")) {
                sans.push(alt.substring(4))
              }
            })
          }

          const result: CertificateInfo = {
            subject: cert.subject?.CN || "Unknown",
            issuer: cert.issuer?.CN || "Unknown",
            notBefore: formatDate(notBefore),
            notAfter: formatDate(notAfter),
            isCA: Boolean(cert.ca),
            daysLeft,
            isExpired,
            sans,
            hostIp: socket.remoteAddress || host,
          }

          tlsSocket.destroy()
          socket.destroy()
          resolve(result)
        } catch (error) {
          tlsSocket.destroy()
          socket.destroy()
          reject(new Error(`Certificate parsing error: ${error instanceof Error ? error.message : "Unknown error"}`))
        }
      })

      tlsSocket.on("error", (error) => {
        tlsSocket.destroy()
        socket.destroy()
        reject(new Error(`TLS connection error: ${error.message}`))
      })
    })

    socket.on("timeout", () => {
      socket.destroy()
      reject(new Error("Connection timeout"))
    })

    socket.on("error", (error) => {
      socket.destroy()
      reject(new Error(`Socket error: ${error.message}`))
    })
  })
}

export async function POST(request: Request) {
  try {
    const { host, port } = await request.json()

    if (!host || typeof host !== 'string') {
      return Response.json(
        { success: false, error: 'Host is required and must be a string' },
        { status: 400 }
      )
    }

    if (!port || typeof port !== 'number' || port < 1 || port > 65535) {
      return Response.json(
        { success: false, error: 'Port must be a number between 1 and 65535' },
        { status: 400 }
      )
    }

    const certificate = await getCertificateInfo(host, port)
    
    return Response.json({
      success: true,
      certificate
    })
  } catch (error) {
    console.error('Certificate check error:', error)
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}