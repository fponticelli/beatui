import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, html, prop } from '@tempots/dom'
import {
  AnimatedToggleClass,
  type ToggleStatus,
  type AnimationConfig,
} from '../../src/utils/use-animated-toggle'

describe('AnimatedToggleClass', () => {
  let container: HTMLElement

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.useRealTimers()
  })

  /** Allow reactive DOM updates to propagate */
  async function flush() {
    vi.advanceTimersByTime(16)
    await vi.advanceTimersByTimeAsync(0)
  }

  describe('class name generation', () => {
    it('should prefix each animation class individually', async () => {
      const status = prop<ToggleStatus>('opened')
      const animation: AnimationConfig = {
        fade: true,
        slide: 'up',
        scale: true,
      }

      render(
        html.div(AnimatedToggleClass({ animation, status })),
        container
      )
      await flush()

      const el = container.querySelector('div')!
      expect(el.classList.contains('bc-animated-toggle')).toBe(true)
      expect(el.classList.contains('bc-animated-toggle--fade')).toBe(true)
      expect(el.classList.contains('bc-animated-toggle--slide-up')).toBe(true)
      expect(el.classList.contains('bc-animated-toggle--scale')).toBe(true)
      expect(el.classList.contains('bc-animated-toggle--opened')).toBe(true)
    })

    it('should include status class', async () => {
      const status = prop<ToggleStatus>('closed')
      const animation: AnimationConfig = { fade: true }

      render(
        html.div(AnimatedToggleClass({ animation, status })),
        container
      )
      await flush()

      const el = container.querySelector('div')!
      expect(el.classList.contains('bc-animated-toggle--closed')).toBe(true)
      expect(el.classList.contains('bc-animated-toggle--fade')).toBe(true)
    })

    it('should update classes when status changes', async () => {
      const status = prop<ToggleStatus>('closed')
      const animation: AnimationConfig = { fade: true }

      render(
        html.div(AnimatedToggleClass({ animation, status })),
        container
      )
      await flush()

      const el = container.querySelector('div')!
      expect(el.classList.contains('bc-animated-toggle--closed')).toBe(true)

      status.set('opening')
      await flush()

      expect(el.classList.contains('bc-animated-toggle--opening')).toBe(true)
      expect(el.classList.contains('bc-animated-toggle--closed')).toBe(false)
    })

    it('should handle enter/exit animation configs', async () => {
      const status = prop<ToggleStatus>('opening')
      const animation: AnimationConfig = {
        enter: { fade: true, slide: 'up' },
        exit: { fade: true, slide: 'down' },
      }

      render(
        html.div(AnimatedToggleClass({ animation, status })),
        container
      )
      await flush()

      const el = container.querySelector('div')!
      // Opening uses enter animation
      expect(el.classList.contains('bc-animated-toggle--fade')).toBe(true)
      expect(el.classList.contains('bc-animated-toggle--slide-up')).toBe(true)

      // Switching to closing should use exit animation
      status.set('closing')
      await flush()

      expect(el.classList.contains('bc-animated-toggle--fade')).toBe(true)
      expect(el.classList.contains('bc-animated-toggle--slide-down')).toBe(true)
      expect(el.classList.contains('bc-animated-toggle--slide-up')).toBe(false)
    })

    it('should work without animation config', async () => {
      const status = prop<ToggleStatus>('opened')

      render(
        html.div(AnimatedToggleClass({ status })),
        container
      )
      await flush()

      const el = container.querySelector('div')!
      expect(el.classList.contains('bc-animated-toggle')).toBe(true)
      expect(el.classList.contains('bc-animated-toggle--opened')).toBe(true)
    })
  })

  describe('inline style preservation', () => {
    it('should not overwrite existing inline styles on the element', async () => {
      const status = prop<ToggleStatus>('closed')
      const animation: AnimationConfig = {
        fade: true,
        scale: true,
        transformOrigin: 'top',
      }

      render(
        html.div(AnimatedToggleClass({ animation, status })),
        container
      )
      await flush()

      const el = container.querySelector('div')!
      // Simulate PopOver setting position:absolute
      el.style.position = 'absolute'
      el.style.top = '100px'
      el.style.left = '50px'

      // Trigger a status change to re-apply styles
      status.set('opening')
      await flush()

      // The animation's CSS custom properties should be set
      expect(el.style.getPropertyValue('--transform-origin')).toBe('top')

      // PopOver's positioning must NOT be overwritten
      expect(el.style.position).toBe('absolute')
      expect(el.style.top).toBe('100px')
      expect(el.style.left).toBe('50px')
    })

    it('should set CSS custom properties via setProperty', async () => {
      const status = prop<ToggleStatus>('opened')
      const animation: AnimationConfig = {
        fade: true,
        scale: 0.8,
        transformOrigin: 'bottom',
        duration: 300,
        easing: 'ease-in-out',
      }

      render(
        html.div(AnimatedToggleClass({ animation, status })),
        container
      )
      await flush()

      const el = container.querySelector('div')!
      expect(el.style.getPropertyValue('--transform-origin')).toBe('bottom')
      expect(el.style.getPropertyValue('--scale-factor')).toBe('0.8')
      expect(el.style.getPropertyValue('--animation-duration')).toBe('300ms')
      expect(el.style.getPropertyValue('--animation-easing')).toBe(
        'ease-in-out'
      )
    })

    it('should clean up old CSS custom properties when status changes', async () => {
      const status = prop<ToggleStatus>('opening')
      const animation: AnimationConfig = {
        enter: {
          fade: true,
          transformOrigin: 'top',
          duration: 500,
        },
        exit: {
          fade: true,
          transformOrigin: 'bottom',
        },
      }

      render(
        html.div(AnimatedToggleClass({ animation, status })),
        container
      )
      await flush()

      const el = container.querySelector('div')!
      expect(el.style.getPropertyValue('--transform-origin')).toBe('top')
      expect(el.style.getPropertyValue('--animation-duration')).toBe('500ms')

      // Change to exit animation (no duration)
      status.set('closing')
      await flush()

      expect(el.style.getPropertyValue('--transform-origin')).toBe('bottom')
      // Duration from enter config should be cleaned up
      expect(el.style.getPropertyValue('--animation-duration')).toBe('')
    })
  })
})
