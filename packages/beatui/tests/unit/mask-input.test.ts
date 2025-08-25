import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, prop } from '@tempots/dom'
import { MaskInput } from '../../src/components/form/input/mask-input'

describe('MaskInput', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('formats value according to mask pattern string', () => {
    const value = prop('')

    render(
      MaskInput({
        value,
        mask: '(999) 999-9999',
        id: 'phone',
      }),
      container
    )

    const input = container.querySelector('input') as HTMLInputElement
    expect(input).toBeTruthy()

    input.value = '1234567890'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    expect(input.value).toBe('(123) 456-7890')
  })

  it('invokes onAccept and onComplete appropriately', () => {
    const value = prop('')
    const onAccept = vi.fn()
    const onComplete = vi.fn()

    render(
      MaskInput({
        value,
        mask: '9999',
        onAccept,
        onComplete,
      }),
      container
    )

    const input = container.querySelector('input') as HTMLInputElement
    input.value = '12'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(onAccept).toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()

    input.value = '1234'
    input.dispatchEvent(new Event('change', { bubbles: true }))
    expect(onComplete).toHaveBeenCalled()
  })

  it('supports dynamic mask function', () => {
    const value = prop('')

    const dynamicMask = (raw: string) => (raw.length <= 5 ? '99999' : '999-99-9999')

    render(
      MaskInput({ value, mask: dynamicMask }),
      container
    )

    const input = container.querySelector('input') as HTMLInputElement

    input.value = '12345'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(input.value).toBe('12345')

    input.value = '123456789'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(input.value).toBe('123-45-6789')
  })
})

