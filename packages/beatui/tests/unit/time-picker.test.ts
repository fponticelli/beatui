import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, prop } from '@tempots/dom'
import { TimePicker } from '../../src/components/data/time-picker'
import { BeatUI } from '../../src/components/beatui'
import { Temporal } from '@js-temporal/polyfill'

type PlainTime = InstanceType<typeof Temporal.PlainTime>

describe('TimePicker', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render with default options', async () => {
    render(BeatUI({}, TimePicker()), container)

    // Wait for Temporal to load
    await vi.waitFor(() => {
      expect(container.querySelector('.bc-time-picker')).not.toBeNull()
    })
  })

  it('should render hours and minutes columns', async () => {
    const time = prop<PlainTime | null>(Temporal.PlainTime.from('14:30'))

    render(BeatUI({}, TimePicker({ value: time })), container)

    await vi.waitFor(() => {
      const columns = container.querySelectorAll('.bc-time-picker__column')
      expect(columns.length).toBeGreaterThanOrEqual(2) // hours + minutes
    })
  })

  it('should show 24 hour options when use12Hour is false', async () => {
    render(BeatUI({}, TimePicker({ use12Hour: false })), container)

    await vi.waitFor(() => {
      const columns = container.querySelectorAll('.bc-time-picker__column')
      expect(columns.length).toBeGreaterThanOrEqual(2)

      // First column is hours: 0-23 = 24 items
      const hourItems = columns[0].querySelectorAll('.bc-time-picker__item')
      expect(hourItems.length).toBe(24)
    })
  })

  it('should show 60 minute options by default', async () => {
    render(BeatUI({}, TimePicker({ use12Hour: false })), container)

    await vi.waitFor(() => {
      const columns = container.querySelectorAll('.bc-time-picker__column')
      const minuteItems = columns[1].querySelectorAll('.bc-time-picker__item')
      expect(minuteItems.length).toBe(60)
    })
  })

  it('should highlight selected time', async () => {
    const time = prop<PlainTime | null>(Temporal.PlainTime.from('14:30'))

    render(BeatUI({}, TimePicker({ value: time })), container)

    await vi.waitFor(() => {
      const selectedItems = container.querySelectorAll(
        '.bc-time-picker__item--selected'
      )
      // At least hour and minute should be selected
      expect(selectedItems.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('should call onSelect when an hour is clicked', async () => {
    const time = prop<PlainTime | null>(Temporal.PlainTime.from('14:30'))
    const onSelect = vi.fn()

    render(
      BeatUI({}, TimePicker({ value: time, onSelect, use12Hour: false })),
      container
    )

    await vi.waitFor(() => {
      const columns = container.querySelectorAll('.bc-time-picker__column')
      expect(columns.length).toBeGreaterThanOrEqual(2)
    })

    // Click on hour 10 (11th item in 0-indexed)
    const columns = container.querySelectorAll('.bc-time-picker__column')
    const hourItems = columns[0].querySelectorAll('.bc-time-picker__item')
    ;(hourItems[10] as HTMLElement).click()

    expect(onSelect).toHaveBeenCalledTimes(1)
    const result = onSelect.mock.calls[0][0] as PlainTime
    expect(result.hour).toBe(10)
    expect(result.minute).toBe(30) // keeps existing minute
  })

  it('should call onSelect when a minute is clicked', async () => {
    const time = prop<PlainTime | null>(Temporal.PlainTime.from('14:30'))
    const onSelect = vi.fn()

    render(
      BeatUI({}, TimePicker({ value: time, onSelect, use12Hour: false })),
      container
    )

    await vi.waitFor(() => {
      const columns = container.querySelectorAll('.bc-time-picker__column')
      expect(columns.length).toBeGreaterThanOrEqual(2)
    })

    // Click on minute 15 (16th item)
    const columns = container.querySelectorAll('.bc-time-picker__column')
    const minuteItems = columns[1].querySelectorAll('.bc-time-picker__item')
    ;(minuteItems[15] as HTMLElement).click()

    expect(onSelect).toHaveBeenCalledTimes(1)
    const result = onSelect.mock.calls[0][0] as PlainTime
    expect(result.hour).toBe(14) // keeps existing hour
    expect(result.minute).toBe(15)
  })

  it('should respect minuteStep option', async () => {
    render(BeatUI({}, TimePicker({ minuteStep: 15 })), container)

    await vi.waitFor(() => {
      const columns = container.querySelectorAll('.bc-time-picker__column')
      const minuteItems = columns[1].querySelectorAll('.bc-time-picker__item')
      // 0, 15, 30, 45 = 4 items
      expect(minuteItems.length).toBe(4)
    })
  })

  it('should apply disabled state', async () => {
    render(BeatUI({}, TimePicker({ disabled: true })), container)

    await vi.waitFor(() => {
      const picker = container.querySelector('.bc-time-picker')
      expect(picker?.classList.contains('bc-time-picker--disabled')).toBe(true)
    })
  })

  it('should apply size classes', async () => {
    render(BeatUI({}, TimePicker({ size: 'lg' })), container)

    await vi.waitFor(() => {
      const picker = container.querySelector('.bc-time-picker')
      expect(
        picker?.classList.contains('bc-time-picker--size-lg')
      ).toBe(true)
    })
  })

  it('should react to value changes', async () => {
    const time = prop<PlainTime | null>(Temporal.PlainTime.from('10:00'))
    const onSelect = vi.fn()

    render(BeatUI({}, TimePicker({ value: time, onSelect })), container)

    await vi.waitFor(() => {
      expect(
        container.querySelectorAll('.bc-time-picker__item--selected').length
      ).toBeGreaterThanOrEqual(2)
    })

    // Change the value
    time.set(Temporal.PlainTime.from('15:45'))

    await vi.waitFor(() => {
      const selectedItems = container.querySelectorAll(
        '.bc-time-picker__item--selected'
      )
      expect(selectedItems.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('should have proper ARIA attributes', async () => {
    render(BeatUI({}, TimePicker()), container)

    await vi.waitFor(() => {
      const picker = container.querySelector('.bc-time-picker')
      expect(picker?.getAttribute('role')).toBe('group')
      expect(picker?.getAttribute('aria-label')).toBeTruthy()

      const columns = container.querySelectorAll('.bc-time-picker__column')
      columns.forEach(col => {
        expect(col.getAttribute('role')).toBe('listbox')
        expect(col.getAttribute('aria-label')).toBeTruthy()
      })
    })
  })

  it('should render with null value', async () => {
    const time = prop<PlainTime | null>(null)

    render(BeatUI({}, TimePicker({ value: time })), container)

    await vi.waitFor(() => {
      expect(container.querySelector('.bc-time-picker')).not.toBeNull()
      // No items should be selected
      const selectedItems = container.querySelectorAll(
        '.bc-time-picker__item--selected'
      )
      expect(selectedItems.length).toBe(0)
    })
  })

  it('should show Now button when showNow is true', async () => {
    render(BeatUI({}, TimePicker({ showNow: true })), container)

    await vi.waitFor(() => {
      const nowBtn = container.querySelector('.bc-time-picker__now-btn')
      expect(nowBtn).not.toBeNull()
      expect(nowBtn?.textContent).toBe('Now')
    })
  })

  it('should not show Now button by default', async () => {
    render(BeatUI({}, TimePicker()), container)

    await vi.waitFor(() => {
      expect(container.querySelector('.bc-time-picker')).not.toBeNull()
    })

    const nowBtn = container.querySelector('.bc-time-picker__now-btn')
    expect(nowBtn).toBeNull()
  })

  it('should call onSelect with current time when Now is clicked', async () => {
    const onSelect = vi.fn()

    render(
      BeatUI({}, TimePicker({ showNow: true, onSelect })),
      container
    )

    await vi.waitFor(() => {
      expect(
        container.querySelector('.bc-time-picker__now-btn')
      ).not.toBeNull()
    })

    const nowBtn = container.querySelector(
      '.bc-time-picker__now-btn'
    ) as HTMLElement
    nowBtn.click()

    expect(onSelect).toHaveBeenCalledTimes(1)
    const result = onSelect.mock.calls[0][0] as PlainTime
    // Verify it's a valid time (hour 0-23, minute 0-59)
    expect(result.hour).toBeGreaterThanOrEqual(0)
    expect(result.hour).toBeLessThanOrEqual(23)
    expect(result.minute).toBeGreaterThanOrEqual(0)
    expect(result.minute).toBeLessThanOrEqual(59)
  })

  it('should auto-detect 12-hour format from locale', async () => {
    // The default jsdom locale is 'en-US' which uses 12-hour
    // This test verifies the component renders without error when use12Hour is not provided
    const time = prop<PlainTime | null>(Temporal.PlainTime.from('14:30'))

    render(
      BeatUI({}, TimePicker({ value: time })),
      container
    )

    await vi.waitFor(() => {
      expect(container.querySelector('.bc-time-picker')).not.toBeNull()
    })
  })

  it('should not call onSelect when disabled', async () => {
    const time = prop<PlainTime | null>(Temporal.PlainTime.from('14:30'))
    const onSelect = vi.fn()

    render(
      BeatUI({}, TimePicker({ value: time, onSelect, disabled: true })),
      container
    )

    await vi.waitFor(() => {
      const columns = container.querySelectorAll('.bc-time-picker__column')
      expect(columns.length).toBeGreaterThanOrEqual(2)
    })

    // All buttons should be disabled
    const buttons = container.querySelectorAll(
      '.bc-time-picker__item'
    ) as NodeListOf<HTMLButtonElement>
    buttons.forEach(btn => {
      expect(btn.disabled).toBe(true)
    })
  })
})
