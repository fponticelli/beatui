import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render } from '@tempots/dom'
import { Popover } from '../../src/components/overlay/popover'
import { Button } from '../../src/components/button/button'
import { WithProviders } from '../helpers/test-providers'
import { html } from '@tempots/dom'

describe('Popover Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    // Clean up any popovers that might be left in the DOM
    const popovers = document.querySelectorAll('.bc-popover')
    popovers.forEach(popover => popover.remove())
  })

  it('should render without errors', () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Click me',
          Popover({ content: html.div('This is a popover') })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()
    expect(button!.textContent).toBe('Click me')
  })

  it('should not show popover initially', () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Click me',
          Popover({ content: html.div('This is a popover') })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()

    // Popover should not be visible initially
    const popover = container.querySelector('.bc-popover')
    expect(popover).toBeNull()
  })

  it('should have correct popover content when triggered', async () => {
    const popoverContent = 'This is a popover'
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Click me',
          Popover({ content: html.div(popoverContent), showDelay: 0 })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()

    // Initially, popover should not be visible anywhere
    let popover = document.querySelector('.bc-popover')
    expect(popover).toBeNull()

    // Simulate click to trigger popover
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    // Wait a bit for the popover to appear
    await new Promise(resolve => setTimeout(resolve, 100))

    // Now popover should be visible somewhere in the document
    popover = document.querySelector('.bc-popover')
    expect(popover).not.toBeNull()
    expect(popover!.textContent).toBe(popoverContent)
  })

  it('should support different placements', async () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Click me',
          Popover({
            content: html.div('This is a popover'),
            placement: 'bottom-start',
            showDelay: 0,
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()

    // Trigger popover
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 100))

    // Popover should be visible somewhere in the document
    const popover = document.querySelector('.bc-popover')
    expect(popover).not.toBeNull()
  })

  it('should support custom offset', async () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Click me',
          Popover({
            content: html.div('This is a popover'),
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

    // Trigger popover
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 100))

    // Popover should be visible somewhere in the document
    const popover = document.querySelector('.bc-popover')
    expect(popover).not.toBeNull()
  })

  it('should not show popover when showOn is "never"', async () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Click me',
          Popover({
            content: html.div('This is a popover'),
            showOn: 'never',
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()

    // Try to trigger popover
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 100))

    // Popover should not be visible anywhere
    const popover = document.querySelector('.bc-popover')
    expect(popover).toBeNull()
  })

  it('should support hover trigger mode', async () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Hover me',
          Popover({
            content: html.div('This is a popover'),
            showOn: 'hover',
            showDelay: 0,
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()

    // Trigger popover with hover
    button!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 100))

    // Popover should be visible
    const popover = document.querySelector('.bc-popover')
    expect(popover).not.toBeNull()
  })

  it('should support lazy content loading with factory function', async () => {
    const popoverContent = 'Lazy loaded content'
    let loadCount = 0

    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Click me',
          Popover({
            content: () => {
              loadCount++
              return html.div(popoverContent)
            },
            showDelay: 0,
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()

    // Content should not be loaded yet
    expect(loadCount).toBe(0)

    // Trigger popover
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 100))

    // Now content should be loaded
    expect(loadCount).toBeGreaterThan(0)
    const popover = document.querySelector('.bc-popover')
    expect(popover).not.toBeNull()
    expect(popover!.textContent).toBe(popoverContent)
  })
})
