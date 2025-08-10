import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render } from '@tempots/dom'
import { prop } from '@tempots/dom'
import { ColorInput } from '../../src/components/form/input/color-input'

describe('ColorInput Component', () => {
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
      ColorInput({
        value,
        id: 'test-color-input',
      }),
      container
    )

    const input = container.querySelector(
      'input[type="color"]'
    ) as HTMLInputElement
    expect(input).not.toBeNull()
    expect(input.value).toBe('#ff0000')
  })

  it('should handle value changes', () => {
    const value = prop('#ff0000')
    let changedValue: string | undefined

    render(
      ColorInput({
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

    // Simulate color change
    input.value = '#00ff00'
    input.dispatchEvent(new Event('change', { bubbles: true }))

    expect(changedValue).toBe('#00ff00')
  })

  it('should handle input events', () => {
    const value = prop('#ff0000')
    let inputValue: string | undefined

    render(
      ColorInput({
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

    expect(inputValue).toBe('#0000ff')
  })

  it('should handle blur events', () => {
    const value = prop('#ff0000')
    let blurred = false

    render(
      ColorInput({
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
      ColorInput({
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
      ColorInput({
        value,
        id: 'test-color-input',
      }),
      container
    )

    const input = container.querySelector(
      'input[type="color"]'
    ) as HTMLInputElement
    expect(input.classList.contains('bc-input')).toBe(true)
    expect(input.classList.contains('bc-color-input')).toBe(true)
  })

  it('should apply custom class', () => {
    const value = prop('#ff0000')

    render(
      ColorInput({
        value,
        class: 'custom-class',
        id: 'test-color-input',
      }),
      container
    )

    const input = container.querySelector(
      'input[type="color"]'
    ) as HTMLInputElement
    expect(input.classList.contains('custom-class')).toBe(true)
  })

  it('should set name attribute', () => {
    const value = prop('#ff0000')

    render(
      ColorInput({
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
      ColorInput({
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
      ColorInput({
        value,
        id: 'test-color-input',
      }),
      container
    )

    const inputContainer = container.querySelector('.bc-input-container')
    expect(inputContainer).not.toBeNull()

    const input = inputContainer?.querySelector('input[type="color"]')
    expect(input).not.toBeNull()
  })

  it('should support before and after elements', () => {
    const value = prop('#ff0000')

    render(
      ColorInput({
        value,
        before: 'Before',
        after: 'After',
        id: 'test-color-input',
      }),
      container
    )

    const container_element = container.querySelector('.bc-input-container')
    expect(container_element?.textContent).toContain('Before')
    expect(container_element?.textContent).toContain('After')
  })
})
