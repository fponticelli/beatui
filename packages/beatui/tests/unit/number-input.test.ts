import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { NumberInput } from '../../src/components/form/input/number-input'
import { BeatUI } from '../../src/components/beatui'

describe('NumberInput', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render basic number input', () => {
    const value = prop(5)

    render(
      BeatUI({}, NumberInput({ value, id: 'test-number-input' })),
      container
    )

    const input = container.querySelector(
      'input[type="number"]'
    ) as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.value).toBe('5')
  })

  it('should render stepper buttons when step is provided', () => {
    const value = prop(5)

    render(
      BeatUI({}, NumberInput({ value, step: 1, id: 'test-number-input' })),
      container
    )

    const stepperContainer = container.querySelector(
      '.bc-number-input-steppers'
    )
    expect(stepperContainer).toBeTruthy()

    const buttons = container.querySelectorAll(
      '.bc-number-input-steppers .bc-button'
    )
    expect(buttons).toHaveLength(2)
  })

  it('should not render stepper buttons when step is not provided', () => {
    const value = prop(5)

    render(
      BeatUI({}, NumberInput({ value, id: 'test-number-input' })),
      container
    )

    const stepperContainer = container.querySelector(
      '.bc-number-input-steppers'
    )
    expect(stepperContainer).toBeFalsy()
  })

  it('should increment value when increment button is clicked', () => {
    const value = prop(5)
    let changedValue: number | undefined

    render(
      BeatUI(
        {},
        NumberInput({
          value,
          step: 1,
          onChange: newValue => {
            changedValue = newValue
          },
          id: 'test-number-input',
        })
      ),
      container
    )

    const buttons = container.querySelectorAll(
      '.bc-number-input-steppers .bc-button'
    )
    const incrementButton = buttons[0] as HTMLButtonElement // First button is increment

    incrementButton.click()

    expect(changedValue).toBe(6)
  })

  it('should decrement value when decrement button is clicked', () => {
    const value = prop(5)
    let changedValue: number | undefined

    render(
      BeatUI(
        {},
        NumberInput({
          value,
          step: 1,
          onChange: newValue => {
            changedValue = newValue
          },
          id: 'test-number-input',
        })
      ),
      container
    )

    const buttons = container.querySelectorAll(
      '.bc-number-input-steppers .bc-button'
    )
    const decrementButton = buttons[1] as HTMLButtonElement // Second button is decrement

    decrementButton.click()

    expect(changedValue).toBe(4)
  })

  it('should disable decrement button when at minimum value', () => {
    const value = prop(0)

    render(
      BeatUI(
        {},
        NumberInput({
          value,
          step: 1,
          min: 0,
          id: 'test-number-input',
        })
      ),
      container
    )

    const buttons = container.querySelectorAll(
      '.bc-number-input-steppers .bc-button'
    )
    const decrementButton = buttons[1] as HTMLButtonElement

    expect(decrementButton.disabled).toBe(true)
  })

  it('should disable increment button when at maximum value', () => {
    const value = prop(10)

    render(
      BeatUI(
        {},
        NumberInput({
          value,
          step: 1,
          max: 10,
          id: 'test-number-input',
        })
      ),
      container
    )

    const buttons = container.querySelectorAll(
      '.bc-number-input-steppers .bc-button'
    )
    const incrementButton = buttons[0] as HTMLButtonElement

    expect(incrementButton.disabled).toBe(true)
  })

  it('should respect step value for increments', () => {
    const value = prop(5)
    let changedValue: number | undefined

    render(
      BeatUI(
        {},
        NumberInput({
          value,
          step: 2.5,
          onChange: newValue => {
            changedValue = newValue
          },
          id: 'test-number-input',
        })
      ),
      container
    )

    const buttons = container.querySelectorAll(
      '.bc-number-input-steppers .bc-button'
    )
    const incrementButton = buttons[0] as HTMLButtonElement

    incrementButton.click()

    expect(changedValue).toBe(7.5)
  })

  it('should not increment beyond max value', () => {
    const value = prop(9)
    let changedValue: number | undefined

    render(
      BeatUI(
        {},
        NumberInput({
          value,
          step: 2,
          max: 10,
          onChange: newValue => {
            changedValue = newValue
          },
          id: 'test-number-input',
        })
      ),
      container
    )

    const buttons = container.querySelectorAll(
      '.bc-number-input-steppers .bc-button'
    )
    const incrementButton = buttons[0] as HTMLButtonElement

    incrementButton.click()

    expect(changedValue).toBeUndefined() // Should not call onChange
  })

  it('should not decrement below min value', () => {
    const value = prop(1)
    let changedValue: number | undefined

    render(
      BeatUI(
        {},
        NumberInput({
          value,
          step: 2,
          min: 0,
          onChange: newValue => {
            changedValue = newValue
          },
          id: 'test-number-input',
        })
      ),
      container
    )

    const buttons = container.querySelectorAll(
      '.bc-number-input-steppers .bc-button'
    )
    const decrementButton = buttons[1] as HTMLButtonElement

    decrementButton.click()

    expect(changedValue).toBeUndefined() // Should not call onChange
  })
})
