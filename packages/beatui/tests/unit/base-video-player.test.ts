import { describe, it, expect, vi, beforeEach } from 'vitest'
import { html, render, prop } from '@tempots/dom'
import { BaseVideoPlayer } from '../../src/components/media'
import { WithProviders } from '../helpers/test-providers'

function setupRoot() {
  const root = document.createElement('div')
  document.body.innerHTML = ''
  document.body.appendChild(root)
  return root
}

// Stub HTMLMediaElement methods for JSDOM
beforeEach(() => {
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  HTMLMediaElement.prototype.pause = vi.fn()
})

describe('BaseVideoPlayer (file provider)', () => {
  it('renders <video> and applies attributes', () => {
    setupRoot()
    const url = prop<string | null>('https://example.com/video.mp4')
    const playing = prop(false)

    const app = BaseVideoPlayer({
      url,
      playing,
      controls: true,
      loop: true,
      muted: true,
      playsinline: true,
    })

    render(
      WithProviders(() => html.div(app)),
      document.body
    )

    const video = document.querySelector('video') as HTMLVideoElement | null
    expect(video).not.toBeNull()
    expect(video!.getAttribute('src')).toContain('video.mp4')
    expect(video!.hasAttribute('controls')).toBe(true)
    expect(video!.loop).toBe(true)
    expect(video!.muted).toBe(true)
  })

  it('plays/pauses when "playing" changes', async () => {
    setupRoot()
    const url = prop<string | null>('https://example.com/video.mp4')
    const playing = prop(false)

    const app = BaseVideoPlayer({ url, playing })
    render(
      WithProviders(() => html.div(app)),
      document.body
    )

    const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play')
    const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause')

    playing.value = true
    expect(playSpy).toHaveBeenCalled()

    playing.value = false
    expect(pauseSpy).toHaveBeenCalled()
  })
})

describe('BaseVideoPlayer (provider detection)', () => {
  it('uses YouTube provider for youtube URLs (no crash)', () => {
    setupRoot()
    const url = prop<string | null>(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    )

    const app = BaseVideoPlayer({ url })
    render(
      WithProviders(() => html.div(app)),
      document.body
    )

    // YouTube provider renders a div container (no <video>)
    const video = document.querySelector('video')
    expect(video).toBeNull()
  })
})
