import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, Provide, Fragment, attr } from '@tempots/dom'
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
    const flyouts = document.querySelectorAll('.bc-flyout, [role="tooltip"]')
    flyouts.forEach(flyout => flyout.remove())
  })

  describe('basic functionality', () => {
    it('should render and show on hover', async () => {
      render(
        Provide(Theme, {}, () =>
          Button(
            { onClick: () => {} },
            'Hover me',
            Flyout({
              content: () =>
                Fragment(attr.class('bc-flyout'), 'This is a flyout'),
              showOn: 'hover',
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      expect(button.textContent).toBe('Hover me')

      // Trigger hover
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 300))

      const flyout = document.querySelector('.bc-flyout')
      expect(flyout).not.toBeNull()
      expect(flyout!.textContent).toBe('This is a flyout')
    })

    it('should support different placements', async () => {
      render(
        Provide(Theme, {}, () =>
          Button(
            { onClick: () => {} },
            'Placement test',
            Flyout({
              content: () =>
                Fragment(attr.class('bc-flyout placement-test'), 'Top flyout'),
              showOn: 'hover',
              placement: 'top',
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 300))

      const flyout = document.querySelector('.placement-test')
      expect(flyout).not.toBeNull()
    })

    it('should support closable option', async () => {
      render(
        Provide(Theme, {}, () =>
          Button(
            { onClick: () => {} },
            'Closable test',
            Flyout({
              content: () =>
                Fragment(
                  attr.class('bc-flyout closable-test'),
                  'Closable flyout'
                ),
              showOn: 'click',
              closable: true,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 300))

      const flyout = document.querySelector('.closable-test')
      expect(flyout).not.toBeNull()

      // Test that Escape key closes the flyout
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      // Wait for hide delay (500ms) + animation time
      await new Promise(resolve => setTimeout(resolve, 600))

      // Flyout should be closed
      const flyoutAfterEscape = document.querySelector('.closable-test')
      expect(flyoutAfterEscape).toBeNull()
    })
  })

  describe('interaction behavior', () => {
    it('should handle rapid show/hide without flickering', async () => {
      render(
        Provide(Theme, {}, () =>
          Button(
            { onClick: () => {} },
            'Rapid test',
            Flyout({
              content: () =>
                Fragment(attr.class('bc-flyout rapid-test'), 'Rapid flyout'),
              showOn: 'hover',
              showDelay: 10,
              hideDelay: 10,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Rapid hover/leave sequence
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

      await new Promise(resolve => setTimeout(resolve, 50))

      const flyouts = document.querySelectorAll('.rapid-test')
      expect(flyouts.length).toBeLessThanOrEqual(1)
    })

    it('should handle multiple independent flyouts', async () => {
      render(
        Provide(Theme, {}, () =>
          Fragment(
            Button(
              { onClick: () => {} },
              'Button 1',
              Flyout({
                content: () =>
                  Fragment(attr.class('bc-flyout flyout-1'), 'Flyout 1'),
                showOn: 'hover',
              })
            ),
            Button(
              { onClick: () => {} },
              'Button 2',
              Flyout({
                content: () =>
                  Fragment(attr.class('bc-flyout flyout-2'), 'Flyout 2'),
                showOn: 'hover',
              })
            )
          )
        ),
        container
      )

      const buttons = container.querySelectorAll('button')

      // Show both flyouts
      buttons[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      buttons[1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

      await new Promise(resolve => setTimeout(resolve, 300))

      expect(document.querySelector('.flyout-1')).not.toBeNull()
      expect(document.querySelector('.flyout-2')).not.toBeNull()
    })

    it('should handle concurrent flyouts with different hide delays', async () => {
      render(
        Provide(Theme, {}, () =>
          Fragment(
            Button(
              { onClick: () => {} },
              'Fast hide',
              Flyout({
                content: () =>
                  Fragment(
                    attr.class('bc-flyout fast-hide'),
                    'Fast hide flyout'
                  ),
                showOn: 'hover',
                hideDelay: 10,
              })
            ),
            Button(
              { onClick: () => {} },
              'Slow hide',
              Flyout({
                content: () =>
                  Fragment(
                    attr.class('bc-flyout slow-hide'),
                    'Slow hide flyout'
                  ),
                showOn: 'hover',
                hideDelay: 100,
              })
            )
          )
        ),
        container
      )

      const buttons = container.querySelectorAll('button')

      // Trigger both flyouts
      buttons[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      buttons[1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

      await new Promise(resolve => setTimeout(resolve, 300))

      // Both should be visible
      expect(document.querySelector('.fast-hide')).not.toBeNull()
      expect(document.querySelector('.slow-hide')).not.toBeNull()

      // Hide both
      buttons[0].dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      buttons[1].dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))

      await new Promise(resolve => setTimeout(resolve, 50))

      // Fast hide should be gone, slow hide should still be visible
      expect(document.querySelector('.fast-hide')).toBeNull()
      expect(document.querySelector('.slow-hide')).not.toBeNull()
    })
  })
})
