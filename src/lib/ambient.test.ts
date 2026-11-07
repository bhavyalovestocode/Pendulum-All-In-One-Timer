import { describe, expect, it } from 'vitest'
import { AmbientAudioEngine } from './ambient'

describe('AmbientAudioEngine', () => {
  it('can be controlled safely without browser audio APIs', () => {
    const engine = new AmbientAudioEngine()
    expect(() => {
      engine.start('rain', 35)
      engine.setVolume(50)
      engine.stop()
      engine.dispose()
    }).not.toThrow()
  })
})
