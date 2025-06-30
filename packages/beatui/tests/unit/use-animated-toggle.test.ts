import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  useAnimatedToggle,
  useTimedToggle,
  type ToggleStatus,
} from '../../src/utils/use-animated-toggle'

describe('useAnimatedToggle', () => {
  let mockOpenedAfter: ReturnType<typeof vi.fn>
  let mockClosedAfter: ReturnType<typeof vi.fn>
  let openCleanup: ReturnType<typeof vi.fn>
  let closeCleanup: ReturnType<typeof vi.fn>

  beforeEach(() => {
    openCleanup = vi.fn()
    closeCleanup = vi.fn()
    mockOpenedAfter = vi.fn((cb: () => void) => {
      setTimeout(cb, 10)
      return openCleanup
    })
    mockClosedAfter = vi.fn((cb: () => void) => {
      setTimeout(cb, 10)
      return closeCleanup
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('basic functionality', () => {
    it('should initialize and complete opening sequence', async () => {
      const toggle = useAnimatedToggle({
        openedAfter: mockOpenedAfter,
        closedAfter: mockClosedAfter,
      })

      expect(toggle.status.value).toBe('closed')
      expect(toggle.display.value).toBe(false)

      const statusHistory: ToggleStatus[] = []
      toggle.status.on(status => statusHistory.push(status))

      toggle.open()
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(toggle.status.value).toBe('opened')
      expect(toggle.display.value).toBe(true)
      expect(statusHistory).toEqual([
        'closed',
        'start-opening',
        'opening',
        'opened',
      ])
    })

    it('should complete closing sequence', async () => {
      const toggle = useAnimatedToggle({
        initialStatus: 'opened',
        openedAfter: mockOpenedAfter,
        closedAfter: mockClosedAfter,
      })

      const statusHistory: ToggleStatus[] = []
      toggle.status.on(status => statusHistory.push(status))

      toggle.close()
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(toggle.status.value).toBe('closed')
      expect(statusHistory).toEqual([
        'opened',
        'start-closing',
        'closing',
        'closed',
      ])
    })
  })

  describe('critical edge cases', () => {
    it('should restart opening sequence when reopening during opening', async () => {
      const toggle = useAnimatedToggle({
        openedAfter: mockOpenedAfter,
        closedAfter: mockClosedAfter,
      })

      const statusHistory: ToggleStatus[] = []
      toggle.status.on(status => statusHistory.push(status))

      toggle.open()
      await new Promise(resolve => setTimeout(resolve, 20))
      expect(toggle.status.value).toBe('opening')

      // Reopen while opening - should restart
      toggle.open()
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(toggle.status.value).toBe('opened')
      expect(statusHistory).toEqual([
        'closed',
        'start-opening',
        'opening',
        'start-opening',
        'opened',
      ])
    })

    it('should interrupt opening with closing', async () => {
      const toggle = useAnimatedToggle({
        openedAfter: mockOpenedAfter,
        closedAfter: mockClosedAfter,
      })

      const statusHistory: ToggleStatus[] = []
      toggle.status.on(status => statusHistory.push(status))

      toggle.open()
      await new Promise(resolve => setTimeout(resolve, 20))
      expect(toggle.status.value).toBe('opening')

      // Close while opening - should interrupt
      toggle.close()
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(toggle.status.value).toBe('opened')
      expect(statusHistory).toEqual([
        'closed',
        'start-opening',
        'opening',
        'start-closing',
        'opened',
      ])
    })

    it('should interrupt closing with opening', async () => {
      const toggle = useAnimatedToggle({
        initialStatus: 'opened',
        openedAfter: mockOpenedAfter,
        closedAfter: mockClosedAfter,
      })

      const statusHistory: ToggleStatus[] = []
      toggle.status.on(status => statusHistory.push(status))

      toggle.close()
      await new Promise(resolve => setTimeout(resolve, 20))
      expect(toggle.status.value).toBe('closing')

      // Reopen while closing - should interrupt
      toggle.open()
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(toggle.status.value).toBe('closed')
      expect(statusHistory).toEqual([
        'opened',
        'start-closing',
        'closing',
        'start-opening',
        'closed',
      ])
    })
  })

  describe('utility methods', () => {
    it('should toggle between states', async () => {
      const toggle = useAnimatedToggle({
        openedAfter: mockOpenedAfter,
        closedAfter: mockClosedAfter,
      })

      toggle.toggle()
      expect(toggle.status.value).toBe('start-opening')

      await new Promise(resolve => setTimeout(resolve, 50))
      expect(toggle.status.value).toBe('opened')

      toggle.toggle()
      expect(toggle.status.value).toBe('start-closing')
    })

    it('should dispose properly', () => {
      const toggle = useAnimatedToggle({
        openedAfter: mockOpenedAfter,
        closedAfter: mockClosedAfter,
      })

      expect(() => toggle.dispose()).not.toThrow()
    })
  })
})

describe('useTimedToggle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should work with default and custom durations', async () => {
    const defaultToggle = useTimedToggle()
    const customToggle = useTimedToggle({
      openDuration: 100,
      closeDuration: 200,
    })

    // Test default duration (500ms)
    defaultToggle.open()
    vi.advanceTimersByTime(16)
    expect(defaultToggle.status.value).toBe('opening')
    vi.advanceTimersByTime(500)
    expect(defaultToggle.status.value).toBe('opened')

    // Test custom durations
    customToggle.open()
    vi.advanceTimersByTime(16)
    expect(customToggle.status.value).toBe('opening')
    vi.advanceTimersByTime(100)
    expect(customToggle.status.value).toBe('opened')

    customToggle.close()
    vi.advanceTimersByTime(16)
    expect(customToggle.status.value).toBe('closing')
    vi.advanceTimersByTime(200)
    expect(customToggle.status.value).toBe('closed')
  })
})
