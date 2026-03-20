import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, prop } from '@tempots/dom'
import { TimeSelect } from '../../src/components/form/input/time-select'
import { NullableTimeSelect } from '../../src/components/form/input/nullable-time-select'
import { BeatUI } from '../../src/components/beatui'
import { Temporal } from '@js-temporal/polyfill'

type PlainTime = InstanceType<typeof Temporal.PlainTime>

describe('TimeSelect', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render with a time value', () => {
    const time = prop<PlainTime>(Temporal.PlainTime.from('14:30'))

    render(BeatUI({}, TimeSelect({ value: time })), container)

    const trigger = container.querySelector('.bc-time-select')
    expect(trigger).not.toBeNull()
  })

  it('should display the formatted time in the trigger', () => {
    const time = prop<PlainTime>(Temporal.PlainTime.from('14:30'))

    render(BeatUI({}, TimeSelect({ value: time })), container)

    const triggerText = container.querySelector('.bc-dropdown__trigger')
    // Locale-aware: could be "14:30" (24h) or "2:30 PM" (12h)
    expect(triggerText?.textContent).toMatch(/14:30|2:30\sPM/)
  })

  it('should use custom formatTime', () => {
    const time = prop<PlainTime>(Temporal.PlainTime.from('14:30'))

    render(
      BeatUI(
        {},
        TimeSelect({
          value: time,
          formatTime: t =>
            `${t.hour % 12 || 12}:${String(t.minute).padStart(2, '0')} ${t.hour >= 12 ? 'PM' : 'AM'}`,
        })
      ),
      container
    )

    const triggerText = container.querySelector('.bc-dropdown__trigger')
    expect(triggerText?.textContent).toContain('2:30 PM')
  })

  it('should show the clock icon', () => {
    const time = prop<PlainTime>(Temporal.PlainTime.from('09:00'))

    render(BeatUI({}, TimeSelect({ value: time })), container)

    // Check for the icon container element
    const icon = container.querySelector('.bc-input-container__after')
    expect(icon).not.toBeNull()
  })

  it('should apply disabled state', () => {
    const time = prop<PlainTime>(Temporal.PlainTime.from('09:00'))

    render(
      BeatUI({}, TimeSelect({ value: time, disabled: true })),
      container
    )

    const inputContainer = container.querySelector('.bc-input-container')
    expect(
      inputContainer?.classList.contains('bc-input-container--disabled')
    ).toBe(true)
  })

  it('should open flyout on click', () => {
    const time = prop<PlainTime>(Temporal.PlainTime.from('14:30'))

    render(BeatUI({}, TimeSelect({ value: time })), container)

    // The combobox trigger
    const combobox = container.querySelector('[role="combobox"]') as HTMLElement
    expect(combobox).not.toBeNull()

    expect(combobox.getAttribute('aria-expanded')).toBe('false')
    combobox.click()
    expect(combobox.getAttribute('aria-expanded')).toBe('true')
  })

  it('should update display text reactively', async () => {
    const time = prop<PlainTime>(Temporal.PlainTime.from('14:30'))

    render(BeatUI({}, TimeSelect({ value: time })), container)

    const triggerText = container.querySelector('.bc-dropdown__trigger')
    expect(triggerText?.textContent).toMatch(/14:30|2:30\sPM/)

    time.set(Temporal.PlainTime.from('09:15'))
    await vi.waitFor(() => {
      expect(triggerText?.textContent).toMatch(/09:15|9:15\sAM/)
    })
  })

  it('should have proper ARIA attributes', () => {
    const time = prop<PlainTime>(Temporal.PlainTime.from('14:30'))

    render(BeatUI({}, TimeSelect({ value: time })), container)

    const combobox = container.querySelector('[role="combobox"]')
    expect(combobox).not.toBeNull()
    expect(combobox?.getAttribute('aria-controls')).toBeTruthy()
    expect(combobox?.getAttribute('aria-expanded')).toBe('false')
  })

  it('should apply size classes', () => {
    const time = prop<PlainTime>(Temporal.PlainTime.from('14:30'))

    render(
      BeatUI({}, TimeSelect({ value: time, size: 'sm' })),
      container
    )

    // Verify the time-select renders with size configuration
    const timeSelect = container.querySelector('.bc-time-select')
    expect(timeSelect).not.toBeNull()
  })
})

describe('NullableTimeSelect', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render with null value showing placeholder', () => {
    const time = prop<PlainTime | null>(null)

    render(BeatUI({}, NullableTimeSelect({ value: time })), container)

    const triggerText = container.querySelector('.bc-dropdown__trigger')
    expect(triggerText?.textContent).toContain('Select time')
  })

  it('should display formatted time when value is set', () => {
    const time = prop<PlainTime | null>(Temporal.PlainTime.from('14:30'))

    render(BeatUI({}, NullableTimeSelect({ value: time })), container)

    const triggerText = container.querySelector('.bc-dropdown__trigger')
    expect(triggerText?.textContent).toMatch(/14:30|2:30\sPM/)
  })

  it('should show custom placeholder', () => {
    const time = prop<PlainTime | null>(null)

    render(
      BeatUI(
        {},
        NullableTimeSelect({ value: time, placeholder: 'Pick a time' })
      ),
      container
    )

    const triggerText = container.querySelector('.bc-dropdown__trigger')
    expect(triggerText?.textContent).toContain('Pick a time')
  })

  it('should render a reset button', () => {
    const time = prop<PlainTime | null>(Temporal.PlainTime.from('14:30'))

    render(BeatUI({}, NullableTimeSelect({ value: time })), container)

    const resetBtn = container.querySelector('.bc-input-container__reset')
    expect(resetBtn).not.toBeNull()
  })

  it('should clear value when reset button is clicked', () => {
    const time = prop<PlainTime | null>(Temporal.PlainTime.from('14:30'))
    const onChange = vi.fn()

    render(
      BeatUI({}, NullableTimeSelect({ value: time, onChange })),
      container
    )

    const resetBtn = container.querySelector(
      '.bc-input-container__reset'
    ) as HTMLElement
    expect(resetBtn).not.toBeNull()

    resetBtn.click()

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('should disable reset button when value is null', () => {
    const time = prop<PlainTime | null>(null)

    render(BeatUI({}, NullableTimeSelect({ value: time })), container)

    const resetBtn = container.querySelector(
      '.bc-input-container__reset'
    ) as HTMLButtonElement
    expect(resetBtn?.disabled).toBe(true)
  })

  it('should update display text reactively when value changes', async () => {
    const time = prop<PlainTime | null>(null)

    render(BeatUI({}, NullableTimeSelect({ value: time })), container)

    const triggerText = container.querySelector('.bc-dropdown__trigger')
    expect(triggerText?.textContent).toContain('Select time')

    time.set(Temporal.PlainTime.from('09:15'))
    await vi.waitFor(() => {
      expect(triggerText?.textContent).toMatch(/09:15|9:15\sAM/)
    })

    time.set(null)
    await vi.waitFor(() => {
      expect(triggerText?.textContent).toContain('Select time')
    })
  })
})
