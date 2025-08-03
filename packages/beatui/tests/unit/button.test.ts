import { describe, it, expect } from 'vitest'
import { render, prop } from '@tempots/dom'
import { Button } from '../../src/components/button/button'
import { WithProviders } from '../helpers/test-providers'

describe('Button Component', () => {
  it('should render with default props', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() => Button({}, 'Click me')),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()
    expect(button!.textContent).toBe('Click me')
    expect(button!.className).toContain('bc-button')
  })

  it('should show loading icon when loading is true', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() => Button({ loading: true }, 'Click me')),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()
    expect(button!.disabled).toBe(true)

    // Should contain the loading icon
    const icon = button!.querySelector('.bc-icon')
    expect(icon).not.toBeNull()

    // Should not contain the original text
    expect(button!.textContent).not.toBe('Click me')
  })

  it('should hide children when loading', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const loading = prop(false)

    render(
      WithProviders(() => Button({ loading }, 'Click me')),
      container
    )

    const button = container.querySelector('button')
    expect(button!.textContent).toBe('Click me')

    // Set loading to true
    loading.set(true)

    // Wait for DOM update
    await new Promise(resolve => setTimeout(resolve, 0))

    // Should not contain the original text anymore
    expect(button!.textContent).not.toBe('Click me')
    expect(button!.disabled).toBe(true)
  })

  it('should be disabled when loading is true', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() => Button({ loading: true }, 'Click me')),
      container
    )

    const button = container.querySelector('button')
    expect(button!.disabled).toBe(true)
  })

  it('should be disabled when both disabled and loading are true', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() =>
        Button({ disabled: true, loading: true }, 'Click me')
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button!.disabled).toBe(true)
  })
})
