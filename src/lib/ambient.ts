export type AmbientPreset = 'rain' | 'forest' | 'cafe' | 'night'

type AmbientVoice = {
  oscillator: OscillatorNode
  gain: GainNode
}

const frequencies: Record<AmbientPreset, [number, number]> = {
  rain: [180, 0.02],
  forest: [260, 0.015],
  cafe: [120, 0.018],
  night: [90, 0.012],
}

export class AmbientAudioEngine {
  private context?: AudioContext
  private master?: GainNode
  private voices: AmbientVoice[] = []

  start(preset: AmbientPreset, volume: number): void {
    if (typeof window === 'undefined' || !('AudioContext' in window)) return
    if (!this.context) {
      this.context = new AudioContext()
      this.master = this.context.createGain()
      this.master.connect(this.context.destination)
    }
    const master = this.master
    if (!master) return
    this.stopVoices()
    const [frequency, detune] = frequencies[preset]
    for (const [offset, type] of [[0, 'sine'], [7, 'triangle']] as const) {
      const oscillator = this.context.createOscillator()
      const gain = this.context.createGain()
      oscillator.type = type
      oscillator.frequency.value = frequency + offset
      gain.gain.value = detune
      oscillator.connect(gain)
      gain.connect(master)
      oscillator.start()
      this.voices.push({ oscillator, gain })
    }
    this.setVolume(volume)
    void this.context.resume()
  }

  setVolume(volume: number): void {
    if (this.master) this.master.gain.value = Math.max(0, Math.min(1, volume / 100))
  }

  stop(): void {
    this.stopVoices()
    if (this.context) void this.context.suspend()
  }

  dispose(): void {
    this.stopVoices()
    if (this.context) void this.context.close()
    this.context = undefined
    this.master = undefined
  }

  private stopVoices(): void {
    for (const voice of this.voices) {
      voice.oscillator.stop()
      voice.oscillator.disconnect()
      voice.gain.disconnect()
    }
    this.voices = []
  }
}
