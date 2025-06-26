import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, Provide, on } from '@tempots/dom'
import { Flyout } from '../../src/components/navigation/flyout'
import { Button } from '../../src/components/button/button'
import { Theme } from '../../src/components/theme/theme'

describe('Flyout Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    // Clean up any flyouts that might be left in the DOM
    const flyouts = document.querySelectorAll('.bc-flyout, [role="tooltip"]')
    flyouts.forEach(flyout => flyout.remove())
  })

  it('should render without errors', () => {
    render(
      Provide(Theme, {}, () =>
        Button(
          { onClick: () => {} },
          'Hover me',
          Flyout({
            content: 'This is a flyout',
            showOn: 'hover',
            className: 'bc-flyout',
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()
    expect(button!.textContent).toBe('Hover me')
  })

  it('should support custom trigger configuration', () => {
    let showCalled = false
    let hideCalled = false

    render(
      Provide(Theme, {}, () =>
        Button(
          { onClick: () => {} },
          'Custom trigger',
          Flyout({
            content: 'Custom flyout content',
            showOn: {
              render: (show, hide) => {
                return [
                  on.dblclick(() => {
                    showCalled = true
                    show()
                  }),
                  on.contextmenu(() => {
                    hideCalled = true
                    hide()
                  }),
                ]
              },
            },
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()

    // Initially, no flyout should be visible
    let flyout = document.querySelector('.bc-flyout')
    expect(flyout).toBeNull()

    // Double-click should trigger show
    button!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    expect(showCalled).toBe(true)

    // Right-click should trigger hide
    button!.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }))
    expect(hideCalled).toBe(true)
  })

  it('should support different placements', async () => {
    render(
      Provide(Theme, {}, () =>
        Button(
          { onClick: () => {} },
          'Bottom flyout',
          Flyout({
            content: 'This flyout appears at the bottom',
            placement: 'bottom',
            showOn: 'hover',
            showDelay: 0,
            className: 'bc-flyout',
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()

    // Trigger flyout
    button!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 300))

    // Flyout should be visible somewhere in the document
    const flyout = document.querySelector('.bc-flyout') || document.querySelector('[data-status]')
    expect(flyout).not.toBeNull()
  })

  it('should support closable option', async () => {
    render(
      Provide(Theme, {}, () =>
        Button(
          { onClick: () => {} },
          'Non-closable flyout',
          Flyout({
            content: 'This flyout cannot be closed with Escape',
            showOn: 'click',
            closable: false,
            showDelay: 0,
            className: 'bc-flyout',
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()

    // Trigger flyout
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 300))

    // Flyout should be visible
    const flyout = document.querySelector('.bc-flyout') || document.querySelector('[data-status]')
    expect(flyout).not.toBeNull()

    // Escape key should not close it (we can't easily test this without more complex setup)
    // This test mainly verifies that the closable option is accepted
  })

  it('should add animation data attributes', async () => {
    render(
      Provide(Theme, {}, () =>
        Button(
          { onClick: () => {} },
          'Animated flyout',
          Flyout({
            content: 'This flyout has animations',
            showOn: 'hover',
            showDelay: 0,
            className: 'bc-flyout',
            placement: 'bottom',
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()

    // Trigger flyout
    button!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 300))

    // Flyout should be visible with animation attributes
    const flyout = document.querySelector('.bc-flyout') || document.querySelector('[data-status]')
    expect(flyout).not.toBeNull()
    expect(flyout!.getAttribute('data-status')).toBeTruthy()
    expect(flyout!.getAttribute('data-placement')).toBe('bottom')
  })
})
