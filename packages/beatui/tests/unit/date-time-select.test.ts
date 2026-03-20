import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, prop } from '@tempots/dom'
import { DateTimeSelect } from '../../src/components/form/input/date-time-select'
import { NullableDateTimeSelect } from '../../src/components/form/input/nullable-date-time-select'
import { BeatUI } from '../../src/components/beatui'
import { Temporal } from '@js-temporal/polyfill'

type PlainDateTime = InstanceType<typeof Temporal.PlainDateTime>

describe('DateTimeSelect', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render with a date-time value', async () => {
    const dt = prop<PlainDateTime>(Temporal.Now.plainDateTimeISO())

    render(BeatUI({}, DateTimeSelect({ value: dt })), container)

    await vi.waitFor(() => {
      const trigger = container.querySelector('.bc-date-time-select')
      expect(trigger).not.toBeNull()
    })
  })

  it('should display the formatted date-time in the trigger', async () => {
    const dt = prop<PlainDateTime>(
      Temporal.PlainDateTime.from('2024-06-15T14:30')
    )

    render(BeatUI({}, DateTimeSelect({ value: dt })), container)

    await vi.waitFor(() => {
      const triggerText = container.querySelector('.bc-dropdown__trigger')
      expect(triggerText?.textContent).toContain('2024-06-15')
      expect(triggerText?.textContent).toContain('\u00b7')
    })
  })

  it('should use custom formatDateTime', async () => {
    const dt = prop<PlainDateTime>(
      Temporal.PlainDateTime.from('2024-06-15T14:30')
    )

    render(
      BeatUI(
        {},
        DateTimeSelect({
          value: dt,
          formatDateTime: d =>
            `${d.day}/${d.month}/${d.year} ${d.hour}:${String(d.minute).padStart(2, '0')}`,
        })
      ),
      container
    )

    await vi.waitFor(() => {
      const triggerText = container.querySelector('.bc-dropdown__trigger')
      expect(triggerText?.textContent).toContain('15/6/2024 14:30')
    })
  })

  it('should show the calendar-clock icon', async () => {
    const dt = prop<PlainDateTime>(Temporal.Now.plainDateTimeISO())

    render(BeatUI({}, DateTimeSelect({ value: dt })), container)

    await vi.waitFor(() => {
      const afterSlot = container.querySelector('.bc-input-container__after')
      expect(afterSlot).not.toBeNull()
    })
  })

  it('should apply disabled state', async () => {
    const dt = prop<PlainDateTime>(Temporal.Now.plainDateTimeISO())

    render(
      BeatUI({}, DateTimeSelect({ value: dt, disabled: true })),
      container
    )

    await vi.waitFor(() => {
      const inputContainer = container.querySelector('.bc-input-container')
      expect(
        inputContainer?.classList.contains('bc-input-container--disabled')
      ).toBe(true)
    })
  })

  it('should open flyout on click', async () => {
    const dt = prop<PlainDateTime>(Temporal.Now.plainDateTimeISO())

    render(BeatUI({}, DateTimeSelect({ value: dt })), container)

    await vi.waitFor(() => {
      expect(container.querySelector('[role="combobox"]')).not.toBeNull()
    })

    const combobox = container.querySelector('[role="combobox"]') as HTMLElement
    expect(combobox.getAttribute('aria-expanded')).toBe('false')
    combobox.click()
    expect(combobox.getAttribute('aria-expanded')).toBe('true')
  })

  it('should have proper ARIA attributes', async () => {
    const dt = prop<PlainDateTime>(Temporal.Now.plainDateTimeISO())

    render(BeatUI({}, DateTimeSelect({ value: dt })), container)

    await vi.waitFor(() => {
      const combobox = container.querySelector('[role="combobox"]')
      expect(combobox).not.toBeNull()
      expect(combobox?.getAttribute('aria-controls')).toBeTruthy()
      expect(combobox?.getAttribute('aria-expanded')).toBe('false')
    })
  })

  it('should update display text reactively', async () => {
    const dt = prop<PlainDateTime>(
      Temporal.PlainDateTime.from('2024-06-15T14:30')
    )

    render(BeatUI({}, DateTimeSelect({ value: dt })), container)

    await vi.waitFor(() => {
      const triggerText = container.querySelector('.bc-dropdown__trigger')
      expect(triggerText?.textContent).toMatch(/14:30|2:30\sPM/)
    })

    dt.set(Temporal.PlainDateTime.from('2024-06-15T09:15'))
    await vi.waitFor(() => {
      const triggerText = container.querySelector('.bc-dropdown__trigger')
      expect(triggerText?.textContent).toMatch(/09:15|9:15\sAM/)
    })
  })
})

describe('NullableDateTimeSelect', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render with null value showing placeholder', async () => {
    const dt = prop<PlainDateTime | null>(null)

    render(
      BeatUI({}, NullableDateTimeSelect({ value: dt })),
      container
    )

    await vi.waitFor(() => {
      const triggerText = container.querySelector('.bc-dropdown__trigger')
      expect(triggerText?.textContent).toContain('Select date and time')
    })
  })

  it('should display formatted date-time when value is set', async () => {
    const dt = prop<PlainDateTime | null>(
      Temporal.PlainDateTime.from('2024-06-15T14:30')
    )

    render(
      BeatUI({}, NullableDateTimeSelect({ value: dt })),
      container
    )

    await vi.waitFor(() => {
      const triggerText = container.querySelector('.bc-dropdown__trigger')
      expect(triggerText?.textContent).toContain('2024-06-15')
      expect(triggerText?.textContent).toContain('\u00b7')
    })
  })

  it('should show custom placeholder', async () => {
    const dt = prop<PlainDateTime | null>(null)

    render(
      BeatUI(
        {},
        NullableDateTimeSelect({
          value: dt,
          placeholder: 'Pick date & time',
        })
      ),
      container
    )

    await vi.waitFor(() => {
      const triggerText = container.querySelector('.bc-dropdown__trigger')
      expect(triggerText?.textContent).toContain('Pick date & time')
    })
  })

  it('should render a reset button', async () => {
    const dt = prop<PlainDateTime | null>(
      Temporal.PlainDateTime.from('2024-06-15T14:30')
    )

    render(
      BeatUI({}, NullableDateTimeSelect({ value: dt })),
      container
    )

    await vi.waitFor(() => {
      const resetBtn = container.querySelector('.bc-input-container__reset')
      expect(resetBtn).not.toBeNull()
    })
  })

  it('should clear value when reset button is clicked', async () => {
    const dt = prop<PlainDateTime | null>(
      Temporal.PlainDateTime.from('2024-06-15T14:30')
    )
    const onChange = vi.fn()

    render(
      BeatUI({}, NullableDateTimeSelect({ value: dt, onChange })),
      container
    )

    await vi.waitFor(() => {
      expect(
        container.querySelector('.bc-input-container__reset')
      ).not.toBeNull()
    })

    const resetBtn = container.querySelector(
      '.bc-input-container__reset'
    ) as HTMLElement
    resetBtn.click()

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('should disable reset button when value is null', async () => {
    const dt = prop<PlainDateTime | null>(null)

    render(
      BeatUI({}, NullableDateTimeSelect({ value: dt })),
      container
    )

    await vi.waitFor(() => {
      const resetBtn = container.querySelector(
        '.bc-input-container__reset'
      ) as HTMLButtonElement
      expect(resetBtn?.disabled).toBe(true)
    })
  })

  it('should update display text reactively', async () => {
    const dt = prop<PlainDateTime | null>(null)

    render(
      BeatUI({}, NullableDateTimeSelect({ value: dt })),
      container
    )

    await vi.waitFor(() => {
      const triggerText = container.querySelector('.bc-dropdown__trigger')
      expect(triggerText?.textContent).toContain('Select date and time')
    })

    dt.set(Temporal.PlainDateTime.from('2024-06-15T09:15'))
    await vi.waitFor(() => {
      const triggerText = container.querySelector('.bc-dropdown__trigger')
      expect(triggerText?.textContent).toMatch(/09:15|9:15\sAM/)
    })

    dt.set(null)
    await vi.waitFor(() => {
      const triggerText = container.querySelector('.bc-dropdown__trigger')
      expect(triggerText?.textContent).toContain('Select date and time')
    })
  })
})
