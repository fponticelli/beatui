import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@tempots/dom'
import { NavigationProgress } from '../../src/components/navigation/navigation-progress'
import { WithProviders } from '../helpers/test-providers'

describe('NavigationProgress', () => {
  let container: HTMLElement

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.removeChild(container)
    // Clean up portaled elements
    document.querySelectorAll('.bc-navigation-progress').forEach(el => el.remove())
    document.querySelectorAll('.bc-navigation-progress__spinner').forEach(el => el.remove())
  })

  function getBar() {
    return document.body.querySelector('.bc-navigation-progress')
  }

  function getSpinner() {
    return document.body.querySelector('.bc-navigation-progress__spinner')
  }

  function getBarFill() {
    return document.body.querySelector('.bc-navigation-progress__bar')
  }

  describe('initial state', () => {
    it('should not render the bar initially', () => {
      const [node] = NavigationProgress({})
      render(WithProviders(() => node), container)

      expect(getBar()).toBeNull()
    })

    it('should return a controller with expected methods', () => {
      const [, ctrl] = NavigationProgress({})
      expect(ctrl.start).toBeInstanceOf(Function)
      expect(ctrl.done).toBeInstanceOf(Function)
      expect(ctrl.set).toBeInstanceOf(Function)
      expect(ctrl.reset).toBeInstanceOf(Function)
      expect(ctrl.isActive).toBeDefined()
    })

    it('should have isActive as false initially', () => {
      const [, ctrl] = NavigationProgress({})
      expect(ctrl.isActive.value).toBe(false)
    })
  })

  describe('start()', () => {
    it('should render the bar when started', async () => {
      const [node, ctrl] = NavigationProgress({})
      render(WithProviders(() => node), container)

      ctrl.start()
      // Wait for requestAnimationFrame
      await vi.advanceTimersByTimeAsync(0)

      expect(getBar()).not.toBeNull()
    })

    it('should set isActive to true', async () => {
      const [node, ctrl] = NavigationProgress({})
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)

      expect(ctrl.isActive.value).toBe(true)
    })

    it('should render with progressbar role', async () => {
      const [node, ctrl] = NavigationProgress({})
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)

      const bar = getBar()
      expect(bar?.getAttribute('role')).toBe('progressbar')
      expect(bar?.getAttribute('aria-valuemin')).toBe('0')
      expect(bar?.getAttribute('aria-valuemax')).toBe('100')
    })

    it('should apply top position class by default', async () => {
      const [node, ctrl] = NavigationProgress({})
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)

      const bar = getBar()
      expect(bar?.classList.contains('bc-navigation-progress--top')).toBe(true)
    })
  })

  describe('set()', () => {
    it('should make the bar visible when setting a value', () => {
      const [node, ctrl] = NavigationProgress({})
      render(WithProviders(() => node), container)

      ctrl.set(50)

      expect(getBar()).not.toBeNull()
      expect(ctrl.isActive.value).toBe(true)
    })

    it('should clamp values below 0', () => {
      const [node, ctrl] = NavigationProgress({})
      render(WithProviders(() => node), container)

      ctrl.set(-10)

      const bar = getBar()
      expect(bar?.getAttribute('aria-valuenow')).toBe('0')
    })

    it('should clamp values above 100', () => {
      const [node, ctrl] = NavigationProgress({})
      render(WithProviders(() => node), container)

      // First make the bar visible
      ctrl.set(50)
      expect(getBar()).not.toBeNull()

      ctrl.set(200)

      const bar = getBar()
      expect(bar?.getAttribute('aria-valuenow')).toBe('100')
    })

    it('should update aria-valuenow', () => {
      const [node, ctrl] = NavigationProgress({})
      render(WithProviders(() => node), container)

      ctrl.set(75)

      const bar = getBar()
      expect(bar?.getAttribute('aria-valuenow')).toBe('75')
    })
  })

  describe('done()', () => {
    it('should set progress to 100 and hide after animation', async () => {
      const [node, ctrl] = NavigationProgress({ minimumDuration: 0, animationSpeed: 100 })
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)
      expect(getBar()).not.toBeNull()

      ctrl.done()
      // Progress should be set to 100
      const bar = getBar()
      expect(bar?.getAttribute('aria-valuenow')).toBe('100')

      // After animation speed, isActive becomes false
      await vi.advanceTimersByTimeAsync(100)
      expect(ctrl.isActive.value).toBe(false)

      // After another animation speed, bar is hidden
      await vi.advanceTimersByTimeAsync(100)
      expect(getBar()).toBeNull()
    })

    it('should respect minimumDuration', async () => {
      const [node, ctrl] = NavigationProgress({ minimumDuration: 500, animationSpeed: 100 })
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)

      // Call done immediately — should wait for minimumDuration
      ctrl.done()
      await vi.advanceTimersByTimeAsync(100)
      // Bar should still be visible since minimumDuration hasn't elapsed
      expect(getBar()).not.toBeNull()
      expect(ctrl.isActive.value).toBe(true)

      // After remaining minimum duration
      await vi.advanceTimersByTimeAsync(400)
      // Now finishProgress runs, progress = 100
      expect(getBar()?.getAttribute('aria-valuenow')).toBe('100')

      // After animation completes
      await vi.advanceTimersByTimeAsync(200)
      expect(getBar()).toBeNull()
    })
  })

  describe('reset()', () => {
    it('should immediately hide the bar', async () => {
      const [node, ctrl] = NavigationProgress({})
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)
      expect(getBar()).not.toBeNull()

      ctrl.reset()
      expect(getBar()).toBeNull()
      expect(ctrl.isActive.value).toBe(false)
    })
  })

  describe('trickle', () => {
    it('should auto-increment progress over time', async () => {
      const [node, ctrl] = NavigationProgress({ trickleSpeed: 100 })
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)

      const initialValue = Number(getBar()?.getAttribute('aria-valuenow') ?? '0')

      // Advance past a few trickle intervals
      await vi.advanceTimersByTimeAsync(300)

      const newValue = Number(getBar()?.getAttribute('aria-valuenow') ?? '0')
      expect(newValue).toBeGreaterThan(initialValue)
    })
  })

  describe('position', () => {
    it('should support bottom position', async () => {
      const [node, ctrl] = NavigationProgress({ position: 'bottom' })
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)

      const bar = getBar()
      expect(bar?.classList.contains('bc-navigation-progress--bottom')).toBe(true)
    })
  })

  describe('height', () => {
    it('should apply custom height', async () => {
      const [node, ctrl] = NavigationProgress({ height: 5 })
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)

      const bar = getBar() as HTMLElement
      expect(bar?.style.height).toBe('5px')
    })
  })

  describe('showSpinner', () => {
    it('should not render spinner by default', async () => {
      const [node, ctrl] = NavigationProgress({})
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)

      expect(getSpinner()).toBeNull()
    })

    it('should render spinner when showSpinner is true', async () => {
      const [node, ctrl] = NavigationProgress({ showSpinner: true })
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)

      expect(getSpinner()).not.toBeNull()
    })

    it('should render spinner icon inside spinner', async () => {
      const [node, ctrl] = NavigationProgress({ showSpinner: true })
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)

      const spinner = getSpinner()
      expect(spinner?.querySelector('.bc-navigation-progress__spinner-icon')).not.toBeNull()
    })

    it('should hide spinner when bar is hidden', async () => {
      const [node, ctrl] = NavigationProgress({ showSpinner: true, minimumDuration: 0, animationSpeed: 50 })
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)
      expect(getSpinner()).not.toBeNull()

      ctrl.done()
      await vi.advanceTimersByTimeAsync(100)
      expect(getSpinner()).toBeNull()
    })

    it('should add bottom class to spinner when position is bottom', async () => {
      const [node, ctrl] = NavigationProgress({ showSpinner: true, position: 'bottom' })
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)

      const spinner = getSpinner()
      expect(spinner?.classList.contains('bc-navigation-progress__spinner--bottom')).toBe(true)
    })
  })

  describe('bar fill classes', () => {
    it('should have active bar class when active', async () => {
      const [node, ctrl] = NavigationProgress({})
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)

      const fill = getBarFill()
      expect(fill?.classList.contains('bc-navigation-progress__bar')).toBe(true)
      expect(fill?.classList.contains('bc-navigation-progress__bar--done')).toBe(false)
    })

    it('should add done class when completing', async () => {
      const [node, ctrl] = NavigationProgress({ minimumDuration: 0, animationSpeed: 100 })
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)

      ctrl.done()
      await vi.advanceTimersByTimeAsync(100)

      const fill = getBarFill()
      expect(fill?.classList.contains('bc-navigation-progress__bar--done')).toBe(true)
    })
  })

  describe('portaling', () => {
    it('should portal to body', async () => {
      const [node, ctrl] = NavigationProgress({})
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)

      // The bar should be a direct child of body, not inside the container
      const bar = getBar()
      expect(bar).not.toBeNull()
      expect(container.querySelector('.bc-navigation-progress')).toBeNull()
    })
  })

  describe('peg element', () => {
    it('should render the peg inside the bar fill', async () => {
      const [node, ctrl] = NavigationProgress({})
      render(WithProviders(() => node), container)

      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)

      const peg = document.body.querySelector('.bc-navigation-progress__peg')
      expect(peg).not.toBeNull()
      expect(peg?.parentElement?.classList.contains('bc-navigation-progress__bar')).toBe(true)
    })
  })

  describe('multiple start/done cycles', () => {
    it('should work across multiple start/done cycles', async () => {
      const [node, ctrl] = NavigationProgress({ minimumDuration: 0, animationSpeed: 50 })
      render(WithProviders(() => node), container)

      // First cycle
      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)
      expect(getBar()).not.toBeNull()

      ctrl.done()
      await vi.advanceTimersByTimeAsync(100)
      expect(getBar()).toBeNull()

      // Second cycle
      ctrl.start()
      await vi.advanceTimersByTimeAsync(0)
      expect(getBar()).not.toBeNull()
      expect(ctrl.isActive.value).toBe(true)

      ctrl.done()
      await vi.advanceTimersByTimeAsync(100)
      expect(getBar()).toBeNull()
    })
  })
})
