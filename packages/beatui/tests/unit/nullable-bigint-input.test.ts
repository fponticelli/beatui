import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { NullableBigintInput } from '../../src/components/form/input/nullable-bigint-input'
import { sleep } from '@tempots/std'
import { BeatUI } from '../../src/index'

describe('NullableBigintInput Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders empty when value is null', () => {
    const value = prop<bigint | null>(null)
    const el = NullableBigintInput({ value, onChange: vi.fn() })
    render(BeatUI({}, el), container)

    const input = container.querySelector(
      'input.bc-number-input'
    ) as HTMLInputElement
    expect(input).not.toBeNull()
    expect(input.value).toBe('')
  })

  it('maps numeric input to bigint and empty to null on change', () => {
    const value = prop<bigint | null>(5n)
    const onChange = vi.fn()
    const el = NullableBigintInput({ value, onChange })
    render(BeatUI({}, el), container)

    const input = container.querySelector(
      'input.bc-number-input'
    ) as HTMLInputElement
    input.value = '42'
    input.dispatchEvent(new Event('change', { bubbles: true }))
    expect(onChange).toHaveBeenCalledWith(42n)

    onChange.mockClear()
    input.value = ''
    input.dispatchEvent(new Event('change', { bubbles: true }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('steppers increment/decrement from null using step', async () => {
    const value = prop<bigint | null>(null)
    const onChange = vi.fn()
    const step = prop<bigint>(1n)
    const el = NullableBigintInput({ value, onChange, step })
    render(BeatUI({}, el), container)
    await sleep(10)

    const inc = container.querySelector(
      '.bc-number-input-steppers-button--increment'
    ) as HTMLButtonElement
    const dec = container.querySelector(
      '.bc-number-input-steppers-button--decrement'
    ) as HTMLButtonElement

    expect(inc).not.toBeNull()
    expect(dec).not.toBeNull()

    inc.click()
    expect(onChange).toHaveBeenCalledWith(1n)

    onChange.mockClear()
    dec.click()
    expect(onChange).toHaveBeenCalledWith(-1n)
  })
})

