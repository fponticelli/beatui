import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { NumberStepper } from '../../src/components/form/input/number-stepper'
import { BeatUI } from '../../src/components/beatui'

describe('NumberStepper', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render with value display and two buttons', () => {
    const value = prop(5)
    render(
      BeatUI({}, NumberStepper({ value, onChange: value.set })),
      container
    )

    expect(container.querySelector('.bc-number-stepper')).not.toBeNull()
    expect(container.querySelector('.bc-number-stepper__value')).not.toBeNull()

    const buttons = container.querySelectorAll('.bc-number-stepper__button')
    expect(buttons.length).toBe(2)
  })

  it('should display the current value', () => {
    const value = prop(42)
    render(
      BeatUI({}, NumberStepper({ value, onChange: value.set })),
      container
    )

    const display = container.querySelector('.bc-number-stepper__value')
    expect(display?.textContent).toBe('42')
  })

  it('should increment on plus button click', () => {
    const value = prop(5)
    const onChange = vi.fn()
    render(
      BeatUI({}, NumberStepper({ value, onChange })),
      container
    )

    // Second button is increment (plus)
    const buttons = container.querySelectorAll('.bc-number-stepper__button')
    ;(buttons[1] as HTMLElement).click()

    expect(onChange).toHaveBeenCalledWith(6)
  })

  it('should decrement on minus button click', () => {
    const value = prop(5)
    const onChange = vi.fn()
    render(
      BeatUI({}, NumberStepper({ value, onChange })),
      container
    )

    // First button is decrement (minus)
    const buttons = container.querySelectorAll('.bc-number-stepper__button')
    ;(buttons[0] as HTMLElement).click()

    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('should respect min constraint', () => {
    const value = prop(0)
    const onChange = vi.fn()
    render(
      BeatUI({}, NumberStepper({ value, onChange, min: 0 })),
      container
    )

    // Decrement button should be disabled at min
    const buttons = container.querySelectorAll('.bc-number-stepper__button')
    ;(buttons[0] as HTMLElement).click()

    expect(onChange).not.toHaveBeenCalled()
  })

  it('should respect max constraint', () => {
    const value = prop(10)
    const onChange = vi.fn()
    render(
      BeatUI({}, NumberStepper({ value, onChange, max: 10 })),
      container
    )

    // Increment button should be disabled at max
    const buttons = container.querySelectorAll('.bc-number-stepper__button')
    ;(buttons[1] as HTMLElement).click()

    expect(onChange).not.toHaveBeenCalled()
  })

  it('should use custom step value', () => {
    const value = prop(10)
    const onChange = vi.fn()
    render(
      BeatUI({}, NumberStepper({ value, onChange, step: 5 })),
      container
    )

    const buttons = container.querySelectorAll('.bc-number-stepper__button')
    ;(buttons[1] as HTMLElement).click()

    expect(onChange).toHaveBeenCalledWith(15)
  })

  it('should apply disabled state', () => {
    const value = prop(5)
    render(
      BeatUI({}, NumberStepper({ value, onChange: () => {}, disabled: true })),
      container
    )

    const stepper = container.querySelector('.bc-number-stepper')
    expect(stepper?.classList.contains('bc-number-stepper--disabled')).toBe(true)
  })

  it('should apply size class', () => {
    const value = prop(5)
    render(
      BeatUI({}, NumberStepper({ value, onChange: () => {}, size: 'lg' })),
      container
    )

    const stepper = container.querySelector('.bc-number-stepper')
    expect(stepper?.classList.contains('bc-number-stepper--size-lg')).toBe(true)
  })

  it('should have role="group"', () => {
    const value = prop(5)
    render(
      BeatUI({}, NumberStepper({ value, onChange: () => {} })),
      container
    )

    const stepper = container.querySelector('.bc-number-stepper')
    expect(stepper?.getAttribute('role')).toBe('group')
  })

  it('should update display reactively', async () => {
    const value = prop(5)
    render(
      BeatUI({}, NumberStepper({ value, onChange: value.set })),
      container
    )

    const display = container.querySelector('.bc-number-stepper__value')
    expect(display?.textContent).toBe('5')

    value.set(10)
    await vi.waitFor(() => {
      expect(display?.textContent).toBe('10')
    })
  })
})
