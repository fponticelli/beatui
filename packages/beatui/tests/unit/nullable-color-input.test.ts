import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, prop } from '@tempots/dom'
import { NullableColorInput } from '../../src/components/form/input/nullable-color-input'


describe('NullableColorInput Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render a color input element when value is null', () => {
    const value = prop<string | null>(null)

    render(
      NullableColorInput({
        value,
        id: 'test-color-input',
      }),
      container
    )

    const input = container.querySelector('input[type="color"]') as HTMLInputElement
    expect(input).not.toBeNull()
    expect(input.value).toBe('#000000')
  })

  it('should handle value changes', () => {
    const value = prop<string | null>(null)
    const onChange = vi.fn()

    render(
      NullableColorInput({
        value,
        onChange,
        id: 'test-color-input',
      }),
      container
    )

    const input = container.querySelector('input[type="color"]') as HTMLInputElement

    input.value = '#00ff00'
    input.dispatchEvent(new Event('change', { bubbles: true }))

    expect(onChange).toHaveBeenCalledWith('#00ff00')
  })

  it('should handle input events', () => {
    const value = prop<string | null>(null)
    const onInput = vi.fn()

    render(
      NullableColorInput({
        value,
        onInput,
        id: 'test-color-input',
      }),
      container
    )

    const input = container.querySelector('input[type="color"]') as HTMLInputElement

    input.value = '#0000ff'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    expect(onInput).toHaveBeenCalledWith('#0000ff')
  })
})
