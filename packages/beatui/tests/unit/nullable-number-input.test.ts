import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, Provide, prop } from '@tempots/dom'
import { NullableNumberInput } from '../../src/components/form/input/nullable-number-input'
import { Theme } from '../../src/components/theme/theme'

describe('NullableNumberInput Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders empty when value is null', () => {
    const value = prop<number | null>(null)
    const el = NullableNumberInput({ value, onChange: vi.fn() })
    render(Provide(Theme, {}, () => el), container)

    const input = container.querySelector('input[type="number"]') as HTMLInputElement
    expect(input).not.toBeNull()
    expect(input.value).toBe('')
  })

  it('maps numeric input to number and empty to null on change', () => {
    const value = prop<number | null>(5)
    const onChange = vi.fn()
    const el = NullableNumberInput({ value, onChange })
    render(Provide(Theme, {}, () => el), container)

    const input = container.querySelector('input[type="number"]') as HTMLInputElement
    input.value = '42'
    input.dispatchEvent(new Event('change', { bubbles: true }))
    expect(onChange).toHaveBeenCalledWith(42)

    onChange.mockClear()
    input.value = ''
    input.dispatchEvent(new Event('change', { bubbles: true }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('steppers increment/decrement from null using step', () => {
    const value = prop<number | null>(null)
    const onChange = vi.fn()
    const step = prop(1)
    const el = NullableNumberInput({ value, onChange, step })
    render(Provide(Theme, {}, () => el), container)

    const inc = container.querySelector(
      '.bc-number-input-steppers-button--increment'
    ) as HTMLButtonElement
    const dec = container.querySelector(
      '.bc-number-input-steppers-button--decrement'
    ) as HTMLButtonElement

    expect(inc).not.toBeNull()
    expect(dec).not.toBeNull()

    inc.click()
    expect(onChange).toHaveBeenCalledWith(1)

    onChange.mockClear()
    dec.click()
    expect(onChange).toHaveBeenCalledWith(-1)
  })
})

