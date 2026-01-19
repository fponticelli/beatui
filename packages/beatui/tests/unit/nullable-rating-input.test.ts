import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { NullableRatingInput } from '../../src/components/form/input/nullable-rating-input'
import { WithProviders } from '../helpers/test-providers'
import { sleep } from '@tempots/std'

describe('NullableRatingInput Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders with empty state when value is null and reset button is disabled, enabled when has value', async () => {
    const value = prop<number | null>(null)
    const onChange = vi.fn((v: number | null) => value.set(v))

    render(
      WithProviders(() => NullableRatingInput({ value, onChange })),
      container
    )

    const slider = container.querySelector('[role="slider"]') as HTMLElement
    expect(slider).toBeTruthy()
    // aria-valuenow should be 0 when null is mapped for display
    expect(slider.getAttribute('aria-valuenow')).toBe('0')

    // Reset button is always visible but disabled when value is null
    let reset = container.querySelector(
      '.bc-input-container__reset'
    ) as HTMLButtonElement | null
    expect(reset).not.toBeNull()
    expect(reset!.disabled).toBe(true)

    // Simulate clicking the first star to set a non-null value
    const firstIcon = container.querySelector(
      '.bc-rating-input__icon-container'
    ) as HTMLElement
    expect(firstIcon).toBeTruthy()
    // Click at the middle of the icon to set ~0.5
    const rect = { left: 0, width: 100 } as DOMRect as unknown as DOMRect
    // Monkey patch getBoundingClientRect on the element to a known value
    ;(
      firstIcon as unknown as { getBoundingClientRect: () => DOMRect }
    ).getBoundingClientRect = () => rect
    firstIcon.dispatchEvent(
      new MouseEvent('click', { bubbles: true, clientX: 50 })
    )

    expect(onChange).toHaveBeenCalled()

    // Give the reactive system a tick to update after onChange
    await sleep(0)

    // After a value is set, reset button should be enabled
    reset = container.querySelector(
      '.bc-input-container__reset'
    ) as HTMLButtonElement | null
    expect(reset).not.toBeNull()
    expect(reset!.disabled).toBe(false)

    // Clicking reset should call onChange(null)
    onChange.mockClear()
    reset!.click()
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
