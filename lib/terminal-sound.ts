import { secureRandom } from "@/lib/secure-random"

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return null
  audioContext ??= new AudioContextClass()
  if (audioContext.state === "suspended") {
    void audioContext.resume()
  }
  return audioContext
}

function playTone(frequency: number, duration: number, type: OscillatorType = "square", volume = 0.04) {
  const ctx = getAudioContext()
  if (!ctx) return
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start()
  oscillator.stop(ctx.currentTime + duration)
}

export function playKeyTick() {
  playTone(520 + secureRandom() * 80, 0.03, "square", 0.03)
}

export function playAccessGranted() {
  const ctx = getAudioContext()
  if (!ctx) return
  const tones = [440, 660, 880]
  tones.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.12, "sine", 0.05), i * 90)
  })
}

export function playError() {
  playTone(160, 0.15, "sawtooth", 0.05)
}

export function playSubmit() {
  playTone(720, 0.05, "square", 0.03)
}
