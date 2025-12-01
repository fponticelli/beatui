import { describe, it, expect, vi, beforeEach } from 'vitest'
import { html, render, prop } from '@tempots/dom'
import { BaseVideoPlayer } from '../../src/components/media'
import { WithProviders } from '../helpers/test-providers'

// Mocks for dynamic imports
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any

g.__hlsCreated = 0

function makeHlsMock() {
  class HlsMock {
    static isSupported() {
      return true
    }
    constructor() {
      g.__hlsCreated++
    }
    attachMedia() {}
    loadSource() {}
    destroy() {}
    on() {}
  }
  return { default: HlsMock }
}

vi.mock('hls.js', makeHlsMock)
vi.mock('hls.js/dist/hls.light.min.js', makeHlsMock)

function setupRoot() {
  const root = document.createElement('div')
  document.body.innerHTML = ''
  document.body.appendChild(root)
  return root
}

beforeEach(() => {
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  HTMLMediaElement.prototype.pause = vi.fn()
  HTMLMediaElement.prototype.load = vi.fn()
})

describe('BaseVideoPlayer (HLS provider)', () => {
  it('HLS: dynamic import used when native HLS unsupported', async () => {
    setupRoot()
    const url = prop<string | null>('https://example.com/stream.m3u8')
    // Force no native HLS support
    const canPlay = HTMLMediaElement.prototype.canPlayType
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(HTMLMediaElement.prototype as any).canPlayType = vi.fn(() => '')

    const app = BaseVideoPlayer({ url, controls: true })
    render(
      WithProviders(() => html.div(app)),
      document.body
    )

    // Give dynamic import time to resolve in jsdom/Vitest
    await Promise.resolve()
    await new Promise(r => setTimeout(r, 0))

    expect(g.__hlsCreated).toBeGreaterThan(0)

    // restore
    HTMLMediaElement.prototype.canPlayType = canPlay
  })
})
