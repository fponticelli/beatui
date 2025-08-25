import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { MaskInput } from '../../src/components/form/input/mask-input'

// Placeholder behavior basic smoke: when empty, value is empty and not prefixed with literals
// and when user types, literals appear.
describe('MaskInput - placeholder/guide basics', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('keeps empty when value is empty, then shows literals on first input', () => {
    const value = prop('')
    render(
      MaskInput({
        value,
        mask: '(999) 999-9999',
      }),
      container
    )

    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('')

    input.value = '1'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(input.value.startsWith('(')).toBe(true)
  })
})

