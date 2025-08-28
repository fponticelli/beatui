import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { BigintInput } from '../../src/components/form/input/bigint-input'
import { BeatUI } from '../../src/components/beatui'

describe('BigintInput', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render basic bigint input', () => {
    const value = prop<bigint>(5n)

    render(
      BeatUI({}, BigintInput({ value, id: 'test-bigint-input' })),
      container
    )

    const input = container.querySelector(
      'input.bc-number-input'
    ) as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.value).toBe('5')
  })

  it('should render stepper buttons when step is provided', () => {
    const value = prop<bigint>(5n)

    render(
      BeatUI({}, BigintInput({ value, step: 1n, id: 'test-bigint-input' })),
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
    const value = prop<bigint>(5n)

    render(
      BeatUI({}, BigintInput({ value, id: 'test-bigint-input' })),
      container
    )

    const stepperContainer = container.querySelector(
      '.bc-number-input-steppers'
    )
    expect(stepperContainer).toBeFalsy()
  })

  it('should increment value when increment button is clicked', () => {
    const value = prop<bigint>(5n)
    let changedValue: bigint | undefined

    render(
      BeatUI(
        {},
        BigintInput({
          value,
          step: 1n,
          onChange: newValue => {
            changedValue = newValue
          },
          id: 'test-bigint-input',
        })
      ),
      container
    )

    const buttons = container.querySelectorAll(
      '.bc-number-input-steppers .bc-button'
    )
    const incrementButton = buttons[0] as HTMLButtonElement

    incrementButton.click()

    expect(changedValue).toBe(6n)
  })

  it('should decrement value when decrement button is clicked', () => {
    const value = prop<bigint>(5n)
    let changedValue: bigint | undefined

    render(
      BeatUI(
        {},
        BigintInput({
          value,
          step: 1n,
          onChange: newValue => {
            changedValue = newValue
          },
          id: 'test-bigint-input',
        })
      ),
      container
    )

    const buttons = container.querySelectorAll(
      '.bc-number-input-steppers .bc-button'
    )
    const decrementButton = buttons[1] as HTMLButtonElement

    decrementButton.click()

    expect(changedValue).toBe(4n)
  })

  it('should disable decrement button when at minimum value', () => {
    const value = prop<bigint>(0n)

    render(
      BeatUI(
        {},
        BigintInput({
          value,
          step: 1n,
          min: 0n,
          id: 'test-bigint-input',
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
    const value = prop<bigint>(10n)

    render(
      BeatUI(
        {},
        BigintInput({
          value,
          step: 1n,
          max: 10n,
          id: 'test-bigint-input',
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
    const value = prop<bigint>(5n)
    let changedValue: bigint | undefined

    render(
      BeatUI(
        {},
        BigintInput({
          value,
          step: 2n,
          onChange: newValue => {
            changedValue = newValue
          },
          id: 'test-bigint-input',
        })
      ),
      container
    )

    const buttons = container.querySelectorAll(
      '.bc-number-input-steppers .bc-button'
    )
    const incrementButton = buttons[0] as HTMLButtonElement

    incrementButton.click()

    expect(changedValue).toBe(7n)
  })

  it('should not increment beyond max value', () => {
    const value = prop<bigint>(9n)
    let changedValue: bigint | undefined

    render(
      BeatUI(
        {},
        BigintInput({
          value,
          step: 2n,
          max: 10n,
          onChange: newValue => {
            changedValue = newValue
          },
          id: 'test-bigint-input',
        })
      ),
      container
    )

    const buttons = container.querySelectorAll(
      '.bc-number-input-steppers .bc-button'
    )
    const incrementButton = buttons[0] as HTMLButtonElement

    incrementButton.click()

    expect(changedValue).toBeUndefined()
  })

  it('should not decrement below min value', () => {
    const value = prop<bigint>(1n)
    let changedValue: bigint | undefined

    render(
      BeatUI(
        {},
        BigintInput({
          value,
          step: 2n,
          min: 0n,
          onChange: newValue => {
            changedValue = newValue
          },
          id: 'test-bigint-input',
        })
      ),
      container
    )

    const buttons = container.querySelectorAll(
      '.bc-number-input-steppers .bc-button'
    )
    const decrementButton = buttons[1] as HTMLButtonElement

    decrementButton.click()

    expect(changedValue).toBeUndefined()
  })
})

