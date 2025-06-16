import { describe, it, expect } from 'vitest'
import { render, Provide } from '@tempots/dom'
import { Button } from '../../src/components/button/button'
import { Theme } from '../../src/components/theme/theme'

describe('Button Component', () => {
  it('should render with default props', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      Provide(Theme, {}, () => Button({}, 'Click me')),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()
    expect(button!.textContent).toBe('Click me')
    expect(button!.className).toContain('bc-button')
  })
})
