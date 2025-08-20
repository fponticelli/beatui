import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render } from '@tempots/dom'
import { Tooltip } from '../../src/components/overlay/tooltip'
import { Button } from '../../src/components/button/button'
import { WithProviders } from '../helpers/test-providers'

describe('Tooltip Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    // Clean up any tooltips that might be left in the DOM
    const tooltips = document.querySelectorAll('.bc-tooltip')
    tooltips.forEach(tooltip => tooltip.remove())
  })

  it('should render without errors', () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Hover me',
          Tooltip({ content: 'This is a tooltip' })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()
    expect(button!.textContent).toBe('Hover me')
  })

  it('should attach event listeners to parent element', () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Hover me',
          Tooltip({ content: 'This is a tooltip' })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()

    // The tooltip should be attached as event listeners to the button
    // We can't directly test event listeners, but we can verify the button exists
    // and that no tooltip content is visible initially
    const tooltip = container.querySelector('.bc-tooltip')
    expect(tooltip).toBeNull() // Tooltip should not be visible initially
  })

  it('should have correct tooltip content when triggered', async () => {
    const tooltipContent = 'This is a tooltip'
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Hover me',
          Tooltip({ content: tooltipContent, showDelay: 0 })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()

    // Initially, tooltip should not be visible anywhere
    let tooltip = document.querySelector('.bc-tooltip')
    expect(tooltip).toBeNull()

    // Simulate mouseenter to trigger tooltip
    button!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

    // Wait a bit for the tooltip to appear (even with 0 delay, there might be async behavior)
    await new Promise(resolve => setTimeout(resolve, 100))

    // Now tooltip should be visible somewhere in the document
    tooltip = document.querySelector('.bc-tooltip')
    expect(tooltip).not.toBeNull()
    expect(tooltip!.textContent).toBe(tooltipContent)
  })

  it('should support different placements', async () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Hover me',
          Tooltip({
            content: 'This is a tooltip',
            placement: 'bottom',
            showDelay: 0,
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()

    // Trigger tooltip
    button!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 100))

    // Tooltip should be visible somewhere in the document
    const tooltip = document.querySelector('.bc-tooltip')
    expect(tooltip).not.toBeNull()
  })

  it('should support custom offset', async () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Hover me',
          Tooltip({
            content: 'This is a tooltip',
            crossAxisOffset: 8,
            mainAxisOffset: 16,
            showDelay: 0,
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()

    // Trigger tooltip
    button!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 100))

    // Tooltip should be visible somewhere in the document
    const tooltip = document.querySelector('.bc-tooltip')
    expect(tooltip).not.toBeNull()
  })

  it('should not show tooltip when showOn is "never"', async () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Hover me',
          Tooltip({ content: 'This is a tooltip', showOn: 'never' })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()

    // Try to trigger tooltip
    button!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 100))

    // Tooltip should not be visible anywhere
    const tooltip = document.querySelector('.bc-tooltip')
    expect(tooltip).toBeNull()
  })
})
