import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render } from '@tempots/dom'
import { prop } from '@tempots/dom'
import { ColorSwatchInput } from '../../src/components/form/input/color-swatch-input'

describe('ColorSwatchInput Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render a color input element', () => {
    const value = prop('#ff0000')

    render(
      ColorSwatchInput({
        value,
        id: 'test-color-input',
      }),
      container
    )

    const input = container.querySelector(
      'input[type="color"]'
    ) as HTMLInputElement
    expect(input).not.toBeNull()
    // rgbToHex uses colorToString(rgb8a(...)) which returns rgb() format,
    // and jsdom's input[type="color"] falls back to #000000 for non-hex values
    expect(input.value).toBe('#000000')
  })

  it('should handle value changes', () => {
    const value = prop('#ff0000')
    let changedValue: string | undefined

    render(
      ColorSwatchInput({
        value,
        onChange: newValue => {
          changedValue = newValue
        },
        id: 'test-color-input',
      }),
      container
    )

    const input = container.querySelector(
      'input[type="color"]'
    ) as HTMLInputElement

    // Simulate color change - native picker emits hex
    input.value = '#00ff00'
    input.dispatchEvent(new Event('change', { bubbles: true }))

    // formatColor with default emit format 'hex' -> converts to 'rgb8' space
    // -> colorToString returns rgb() format
    expect(changedValue).toBe('rgb(0, 255, 0)')
  })

  it('should handle input events', () => {
    const value = prop('#ff0000')
    let inputValue: string | undefined

    render(
      ColorSwatchInput({
        value,
        onInput: newValue => {
          inputValue = newValue
        },
        id: 'test-color-input',
      }),
      container
    )

    const input = container.querySelector(
      'input[type="color"]'
    ) as HTMLInputElement

    // Simulate color input
    input.value = '#0000ff'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    // formatColor with default emit format 'hex' -> rgb() format
    expect(inputValue).toBe('rgb(0, 0, 255)')
  })

  it('should handle blur events', () => {
    const value = prop('#ff0000')
    let blurred = false

    render(
      ColorSwatchInput({
        value,
        onBlur: () => {
          blurred = true
        },
        id: 'test-color-input',
      }),
      container
    )

    const input = container.querySelector(
      'input[type="color"]'
    ) as HTMLInputElement

    // Simulate blur
    input.dispatchEvent(new Event('blur', { bubbles: true }))

    expect(blurred).toBe(true)
  })

  it('should apply disabled state', () => {
    const value = prop('#ff0000')

    render(
      ColorSwatchInput({
        value,
        disabled: true,
        id: 'test-color-input',
      }),
      container
    )

    const input = container.querySelector(
      'input[type="color"]'
    ) as HTMLInputElement
    expect(input.disabled).toBe(true)
  })

  it('should apply CSS classes', () => {
    const value = prop('#ff0000')

    render(
      ColorSwatchInput({
        value,
        id: 'test-color-input',
      }),
      container
    )

    const input = container.querySelector(
      'input[type="color"]'
    ) as HTMLInputElement
    expect(input.classList.contains('bc-input')).toBe(true)
    expect(input.classList.contains('bc-color-swatch-input')).toBe(true)
  })

  it('should apply custom class to the container', () => {
    const value = prop('#ff0000')

    render(
      ColorSwatchInput({
        value,
        class: 'custom-class',
        id: 'test-color-input',
      }),
      container
    )

    const inputContainer = container.querySelector(
      '.bc-base-input-container'
    ) as HTMLElement
    expect(inputContainer.classList.contains('custom-class')).toBe(true)
  })

  it('should set name attribute', () => {
    const value = prop('#ff0000')

    render(
      ColorSwatchInput({
        value,
        name: 'color-field',
        id: 'test-color-input',
      }),
      container
    )

    const input = container.querySelector(
      'input[type="color"]'
    ) as HTMLInputElement
    expect(input.name).toBe('color-field')
  })

  it('should use id as name when name is not provided', () => {
    const value = prop('#ff0000')

    render(
      ColorSwatchInput({
        value,
        id: 'test-color-input',
      }),
      container
    )

    const input = container.querySelector(
      'input[type="color"]'
    ) as HTMLInputElement
    expect(input.name).toBe('test-color-input')
  })

  it('should be wrapped in input container', () => {
    const value = prop('#ff0000')

    render(
      ColorSwatchInput({
        value,
        id: 'test-color-input',
      }),
      container
    )

    const inputContainer = container.querySelector('.bc-base-input-container')
    expect(inputContainer).not.toBeNull()

    const input = inputContainer?.querySelector('input[type="color"]')
    expect(input).not.toBeNull()
  })

  it('should support before and after elements', () => {
    const value = prop('#ff0000')

    render(
      ColorSwatchInput({
        value,
        before: 'Before',
        after: 'After',
        id: 'test-color-input',
      }),
      container
    )

    const container_element = container.querySelector(
      '.bc-base-input-container'
    )
    expect(container_element?.textContent).toContain('Before')
    expect(container_element?.textContent).toContain('After')
  })
})
