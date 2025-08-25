import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { NumberInput } from '../../src/components/form/input/number-input'
import { WithProviders } from '../helpers/test-providers'

describe('NumberInput - formatting', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('formats number with stepping and bounds', () => {
    const value = prop(0)
    render(
      WithProviders(() =>
        NumberInput({
          value,
          min: prop(0),
          max: prop(10000),
          step: prop(0.25),
        })
      ),
      container
    )

    const input = container.querySelector('input') as HTMLInputElement
    input.value = '12.5'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(input.value).toBe('12.5')

    input.value = '-1'
    input.dispatchEvent(new Event('change', { bubbles: true }))
    // NumberInput does not auto-clamp user-typed values on change; HTML min only affects validity
    expect(Number(input.value)).toBe(-1)
  })
})
