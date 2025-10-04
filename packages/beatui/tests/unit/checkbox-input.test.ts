import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { CheckboxInput } from '../../src/components/form/input/checkbox-input'
import { WithProviders } from '../helpers/test-providers'

describe('CheckboxInput Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render with default props', () => {
    const value = prop(false)
    render(
      WithProviders(() =>
        CheckboxInput({
          value,
          onChange: vi.fn(),
          placeholder: 'Test checkbox',
        })
      ),
      container
    )

    const checkboxElement = container.querySelector('[role="checkbox"]')
    expect(checkboxElement).not.toBeNull()
    expect(checkboxElement!.getAttribute('aria-checked')).toBe('false')
    expect(container.textContent).toContain('Test checkbox')
  })

  it('should handle checked state', () => {
    const value = prop(true)
    render(
      WithProviders(() =>
        CheckboxInput({
          value,
          onChange: vi.fn(),
          placeholder: 'Test checkbox',
        })
      ),
      container
    )

    const checkboxElement = container.querySelector('[role="checkbox"]')
    expect(checkboxElement!.getAttribute('aria-checked')).toBe('true')
    expect(checkboxElement!.className).toContain(
      'bc-checkbox-input__checkbox--checked'
    )
  })

  it('should handle click events', () => {
    const value = prop(false)
    const onChange = vi.fn()
    render(
      WithProviders(() =>
        CheckboxInput({
          value,
          onChange,
          placeholder: 'Test checkbox',
        })
      ),
      container
    )

    const checkboxElement = container.querySelector(
      '[role="checkbox"]'
    ) as HTMLElement
    checkboxElement.click()

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('should handle keyboard events', () => {
    const value = prop(false)
    const onChange = vi.fn()
    render(
      WithProviders(() =>
        CheckboxInput({
          value,
          onChange,
          placeholder: 'Test checkbox',
        })
      ),
      container
    )

    const checkboxElement = container.querySelector(
      '[role="checkbox"]'
    ) as HTMLElement

    // Test Space key
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true })
    checkboxElement.dispatchEvent(spaceEvent)
    expect(onChange).toHaveBeenCalledWith(true)

    // Test Enter key
    onChange.mockClear()
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
    })
    checkboxElement.dispatchEvent(enterEvent)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('should handle disabled state', () => {
    const value = prop(false)
    const onChange = vi.fn()
    const disabled = prop(true)
    render(
      WithProviders(() =>
        CheckboxInput({
          value,
          onChange,
          disabled,
          placeholder: 'Test checkbox',
        })
      ),
      container
    )

    const checkboxElement = container.querySelector(
      '[role="checkbox"]'
    ) as HTMLElement
    expect(checkboxElement.getAttribute('aria-disabled')).toBe('true')
    expect(checkboxElement.getAttribute('tabindex')).toBe('-1')
    expect(checkboxElement.className).toContain(
      'bc-checkbox-input__checkbox--disabled'
    )

    // Should not respond to clicks when disabled
    checkboxElement.click()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('should handle blur events', () => {
    const value = prop(true)
    const onBlur = vi.fn()
    render(
      WithProviders(() =>
        CheckboxInput({
          value,
          onChange: vi.fn(),
          onBlur,
          placeholder: 'Test checkbox',
        })
      ),
      container
    )

    const checkboxElement = container.querySelector(
      '[role="checkbox"]'
    ) as HTMLElement
    checkboxElement.dispatchEvent(new Event('blur', { bubbles: true }))

    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('should have proper accessibility attributes', () => {
    const value = prop(false)
    render(
      WithProviders(() =>
        CheckboxInput({
          value,
          onChange: vi.fn(),
          placeholder: 'Test checkbox',
          id: 'test-checkbox',
        })
      ),
      container
    )

    const checkboxElement = container.querySelector('[role="checkbox"]')
    const label = container.querySelector('.bc-checkbox-input__label')

    expect(checkboxElement!.getAttribute('role')).toBe('checkbox')
    expect(checkboxElement!.getAttribute('id')).toBe('test-checkbox')
    expect(checkboxElement!.getAttribute('tabindex')).toBe('0')
    expect(label!.getAttribute('id')).toBe('test-checkbox-label')
    expect(checkboxElement!.getAttribute('aria-labelledby')).toBe(
      'test-checkbox-label'
    )
  })
})
