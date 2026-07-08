const buffer = new Uint32Array(1)

export function secureRandom(): number {
  crypto.getRandomValues(buffer)
  return buffer[0] / 4294967296
}
