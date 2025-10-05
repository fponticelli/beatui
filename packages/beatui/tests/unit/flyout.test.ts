import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, Fragment, attr } from '@tempots/dom'
import { Flyout } from '../../src/components/navigation/flyout'
import { Button } from '../../src/components/button/button'
import { WithProviders } from '../helpers/test-providers'

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
        WithProviders(() =>
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
        WithProviders(() =>
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
        WithProviders(() =>
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
      // Wait for hide delay (500ms) + animation time (500ms) + buffer
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Flyout should be closed or in closing state
      const flyoutAfterEscape = document.querySelector('.closable-test')
      if (flyoutAfterEscape) {
        // If still present, it should be in closing state
        expect(flyoutAfterEscape.classList.contains('bc-toggle--closing')).toBe(
          true
        )
      } else {
        // If completely removed, that's also acceptable
        expect(flyoutAfterEscape).toBeNull()
      }
    })
  })

  describe('interaction behavior', () => {
    it('should handle rapid show/hide without flickering', async () => {
      render(
        WithProviders(() =>
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

    it('should reproduce timing issue: hover/leave/hover during fade-out', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Timing test',
            Flyout({
              content: () =>
                Fragment(attr.class('bc-flyout timing-test'), 'Timing flyout'),
              showOn: 'hover',
              showDelay: 50,
              hideDelay: 200, // Longer hide delay to simulate fade-out
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Step 1: Show flyout
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 100)) // Wait for show

      let flyout = document.querySelector('.timing-test')
      expect(flyout).not.toBeNull()

      // Step 2: Start hiding (trigger fade-out)
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50)) // Wait partial hide delay

      // Step 3: Hover again while fading out
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 100)) // Wait for show

      flyout = document.querySelector('.timing-test')
      expect(flyout).not.toBeNull()

      // Step 4: Leave again
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 300)) // Wait for full hide

      // Step 5: Try to show again - this should work but might fail due to timing bug
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 100))

      flyout = document.querySelector('.timing-test')
      expect(flyout).not.toBeNull() // This might fail due to the timing bug
    })

    it('should reproduce disappearing flyout after rapid interactions', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Disappearing test',
            Flyout({
              content: () =>
                Fragment(
                  attr.class('bc-flyout disappearing-test'),
                  'Disappearing flyout'
                ),
              showOn: 'hover',
              showDelay: 25,
              hideDelay: 100,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Simulate the problematic sequence:
      // 1. Hover (start showing)
      // 2. Leave quickly (start hiding)
      // 3. Hover again while hiding is in progress
      // 4. Leave again
      // 5. Try to hover again - flyout should appear but might disappear unexpectedly

      // Step 1: Initial hover
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50))

      // Step 2: Quick leave
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 25)) // Partial hide delay

      // Step 3: Hover again during hide
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50))

      // Step 4: Leave again
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 150)) // Full hide

      // Step 5: Final hover - should show and stay visible
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50))

      const flyout = document.querySelector('.disappearing-test')
      expect(flyout).not.toBeNull()

      // Wait a bit more to see if it disappears unexpectedly
      await new Promise(resolve => setTimeout(resolve, 200))

      const flyoutStillThere = document.querySelector('.disappearing-test')
      expect(flyoutStillThere).not.toBeNull() // This might fail due to the bug
    })

    it('should handle overlapping timeout scenarios', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Timeout test',
            Flyout({
              content: () =>
                Fragment(
                  attr.class('bc-flyout timeout-test'),
                  'Timeout flyout'
                ),
              showOn: 'hover',
              showDelay: 100,
              hideDelay: 150,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Create a scenario where multiple timeouts could be active
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50)) // Partial show delay

      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 25)) // Start hide timeout

      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50)) // Should cancel hide, start show

      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 75)) // Partial hide

      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 150)) // Should show

      const flyout = document.querySelector('.timeout-test')
      expect(flyout).not.toBeNull()

      // Verify only one flyout exists
      const flyouts = document.querySelectorAll('.timeout-test')
      expect(flyouts.length).toBe(1)
    })

    it('should handle multiple independent flyouts', async () => {
      render(
        WithProviders(() =>
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

    it('should handle concurrent flyouts independently', async () => {
      render(
        WithProviders(() =>
          Fragment(
            Button(
              { onClick: () => {} },
              'Button 1',
              Flyout({
                content: () =>
                  Fragment(
                    attr.class('bc-flyout flyout-1'),
                    'Flyout 1 content'
                  ),
                showOn: 'hover',
                hideDelay: 100,
              })
            ),
            Button(
              { onClick: () => {} },
              'Button 2',
              Flyout({
                content: () =>
                  Fragment(
                    attr.class('bc-flyout flyout-2'),
                    'Flyout 2 content'
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

      // Show first flyout
      buttons[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 300))

      expect(document.querySelector('.flyout-1')).not.toBeNull()
      expect(document.querySelector('.flyout-2')).toBeNull()

      // Show second flyout while first is still visible
      buttons[1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 300))

      // Both should be visible
      expect(document.querySelector('.flyout-1')).not.toBeNull()
      expect(document.querySelector('.flyout-2')).not.toBeNull()

      // Hide first flyout only
      buttons[0].dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 1000)) // Increased timeout for animation completion

      // First should be gone or closing, second should still be visible
      const flyout1 = document.querySelector('.flyout-1')
      if (flyout1) {
        expect(flyout1.classList.contains('bc-toggle--closing')).toBe(true)
      }
      expect(document.querySelector('.flyout-2')).not.toBeNull()

      // Hide second flyout
      buttons[1].dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 1000)) // Increased timeout for animation completion

      // Both should be gone or closing
      const flyout1Final = document.querySelector('.flyout-1')
      const flyout2Final = document.querySelector('.flyout-2')
      if (flyout1Final) {
        expect(flyout1Final.classList.contains('bc-toggle--closing')).toBe(true)
      }
      if (flyout2Final) {
        expect(flyout2Final.classList.contains('bc-toggle--closing')).toBe(true)
      }
    })
  })

  describe('animation state management bugs', () => {
    it('should handle state transitions during animation phases', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Animation state test',
            Flyout({
              content: () =>
                Fragment(
                  attr.class('bc-flyout animation-state-test'),
                  'Animation state flyout'
                ),
              showOn: 'hover',
              showDelay: 10,
              hideDelay: 50,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Test rapid state changes during different animation phases
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 15)) // Should be opening

      // Check if flyout is in opening state
      let flyout = document.querySelector('.animation-state-test')
      expect(flyout).not.toBeNull()

      // Interrupt opening with closing
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 25)) // Partial close

      // Interrupt closing with opening
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 25))

      flyout = document.querySelector('.animation-state-test')
      expect(flyout).not.toBeNull()

      // Final state should be stable
      await new Promise(resolve => setTimeout(resolve, 100))
      flyout = document.querySelector('.animation-state-test')
      expect(flyout).not.toBeNull()
    })

    it('should properly cleanup onClosed callbacks during rapid transitions', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Callback cleanup test',
            Flyout({
              content: () =>
                Fragment(
                  attr.class('bc-flyout callback-test'),
                  'Callback test flyout'
                ),
              showOn: 'hover',
              showDelay: 5,
              hideDelay: 20,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Create multiple rapid transitions that could leave dangling callbacks
      for (let i = 0; i < 5; i++) {
        button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
        await new Promise(resolve => setTimeout(resolve, 10))
        button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      // Final show should work correctly
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50))

      const flyout = document.querySelector('.callback-test')
      expect(flyout).not.toBeNull()

      // Should only have one flyout instance
      const flyouts = document.querySelectorAll('.callback-test')
      expect(flyouts.length).toBe(1)
    })

    it('should handle isOpen state checks correctly during transitions', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'State check test',
            Flyout({
              content: () =>
                Fragment(
                  attr.class('bc-flyout state-check-test'),
                  'State check flyout'
                ),
              showOn: 'hover',
              showDelay: 30,
              hideDelay: 40,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Test the specific scenario where isOpen checks might fail
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 40)) // Should be open

      let flyout = document.querySelector('.state-check-test')
      expect(flyout).not.toBeNull()

      // Start closing
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 20)) // Partial close

      // Try to show again - this tests the isOpen.value check in show()
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50))

      flyout = document.querySelector('.state-check-test')
      expect(flyout).not.toBeNull()

      // Leave and wait for full close
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 100))

      // Try to show one more time - this should definitely work
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50))

      flyout = document.querySelector('.state-check-test')
      expect(flyout).not.toBeNull()
    })
  })

  describe('timeout race condition bug', () => {
    it('should handle overlapping show/hide timeouts correctly', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Race condition test',
            Flyout({
              content: () =>
                Fragment(
                  attr.class('bc-flyout race-condition-test'),
                  'Race condition flyout'
                ),
              showOn: 'hover',
              showDelay: 100,
              hideDelay: 100,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Create overlapping timeouts scenario
      // 1. Start show timeout
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50)) // Partial show delay

      // 2. Start hide timeout while show is pending
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50)) // Partial hide delay

      // 3. Start show timeout again while hide is pending
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 150)) // Wait for show to complete

      // Should have exactly one flyout visible
      const flyouts = document.querySelectorAll('.race-condition-test')
      expect(flyouts.length).toBe(1)
      expect(flyouts[0]).not.toBeNull()
    })

    it('should properly cancel previous timeouts when new ones start', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Timeout cancel test',
            Flyout({
              content: () =>
                Fragment(
                  attr.class('bc-flyout timeout-cancel-test'),
                  'Timeout cancel flyout'
                ),
              showOn: 'hover',
              showDelay: 200,
              hideDelay: 200,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Multiple rapid interactions to create multiple timeout scenarios
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50))

      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50))

      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50))

      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50))

      // Final show should work correctly
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 250)) // Wait for full show

      const flyout = document.querySelector('.timeout-cancel-test')
      expect(flyout).not.toBeNull()

      // Should only have one flyout (no duplicates from cancelled timeouts)
      const flyouts = document.querySelectorAll('.timeout-cancel-test')
      expect(flyouts.length).toBe(1)
    })
  })

  describe('timing race conditions with controlled delays', () => {
    it('should handle rapid state transitions with minimal delays', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Rapid state test',
            Flyout({
              content: () =>
                Fragment(
                  attr.class('bc-flyout rapid-state-test'),
                  'Rapid state flyout'
                ),
              showOn: 'hover',
              showDelay: 5, // Very short delays to test race conditions
              hideDelay: 5,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Test rapid state changes that could cause race conditions
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 10))

      let flyout = document.querySelector('.rapid-state-test')
      expect(flyout).not.toBeNull()

      // Rapid hide/show sequence
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 2)) // Interrupt hide
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 10))

      flyout = document.querySelector('.rapid-state-test')
      expect(flyout).not.toBeNull()

      // Final hide
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 15))

      // Try to show again - this tests the fix for the timing bug
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 20)) // Increased delay to account for internal delays

      flyout = document.querySelector('.rapid-state-test')
      if (!flyout) {
        // Debug: wait a bit more and check again
        await new Promise(resolve => setTimeout(resolve, 20))
        flyout = document.querySelector('.rapid-state-test')
      }
      expect(flyout).not.toBeNull()
    })

    it('should handle complex timing scenarios with real delays', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Complex timing test',
            Flyout({
              content: () =>
                Fragment(
                  attr.class('bc-flyout complex-timing-test'),
                  'Complex timing flyout'
                ),
              showOn: 'hover',
              showDelay: 20,
              hideDelay: 30,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Step 1: Start showing
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 10)) // Partial show delay

      // Step 2: Cancel show, start hide
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 5)) // Partial delay

      // Step 3: Cancel hide, start show again
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 25)) // Complete show delay

      // Should have opened the flyout
      let flyout = document.querySelector('.complex-timing-test')
      expect(flyout).not.toBeNull()

      // Step 4: Start hiding
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 15)) // Partial hide delay

      // Step 5: Cancel hide, show again
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 25)) // Wait for full show delay (20ms) + buffer

      flyout = document.querySelector('.complex-timing-test')
      expect(flyout).not.toBeNull()

      // Step 6: Final hide
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 40)) // Complete hide delay

      // Step 7: Try to show again - this tests the fix for the timing bug
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 35)) // Increased delay to account for internal delays

      flyout = document.querySelector('.complex-timing-test')
      if (!flyout) {
        // Debug: wait a bit more and check again
        await new Promise(resolve => setTimeout(resolve, 20))
        flyout = document.querySelector('.complex-timing-test')
      }
      expect(flyout).not.toBeNull()

      // Verify it stays visible
      await new Promise(resolve => setTimeout(resolve, 50))
      flyout = document.querySelector('.complex-timing-test')
      expect(flyout).not.toBeNull()
    })

    it('should handle extreme rapid interactions', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Extreme rapid test',
            Flyout({
              content: () =>
                Fragment(
                  attr.class('bc-flyout extreme-rapid-test'),
                  'Extreme rapid flyout'
                ),
              showOn: 'hover',
              showDelay: 5,
              hideDelay: 5,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Simulate very rapid interactions that could cause race conditions
      for (let i = 0; i < 5; i++) {
        button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
        await new Promise(resolve => setTimeout(resolve, 2)) // Very short delay
        button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
        await new Promise(resolve => setTimeout(resolve, 2))
      }

      // Final show should work despite the rapid interactions
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 10))

      const flyout = document.querySelector('.extreme-rapid-test')
      expect(flyout).not.toBeNull()

      // Should only have one flyout instance
      const flyouts = document.querySelectorAll('.extreme-rapid-test')
      expect(flyouts.length).toBe(1)
    })

    it('should reproduce the exact user-reported bug', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'User bug test',
            Flyout({
              content: () =>
                Fragment(
                  attr.class('bc-flyout user-bug-test'),
                  'User bug flyout'
                ),
              showOn: 'hover',
              showDelay: 100,
              hideDelay: 300, // Longer delays to match real usage
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Step 1: Hover to show flyout
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 150)) // Wait for show

      let flyout = document.querySelector('.user-bug-test')
      expect(flyout).not.toBeNull()

      // Step 2: Leave and wait for COMPLETE disposal (including animations)
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 1200)) // Wait for full hide delay (300ms) + animation (500ms) + buffer

      flyout = document.querySelector('.user-bug-test')
      if (flyout) {
        // If still present, it should be in closing state
        expect(flyout.classList.contains('bc-toggle--closing')).toBe(true)
      }

      // Step 3: Hover again - this should show and stay visible
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 150)) // Wait for show

      flyout = document.querySelector('.user-bug-test')
      expect(flyout).not.toBeNull()

      // Step 4: Wait longer to see if it disappears unexpectedly (the bug)
      await new Promise(resolve => setTimeout(resolve, 500))

      flyout = document.querySelector('.user-bug-test')
      expect(flyout).not.toBeNull() // This should pass but might fail due to the bug

      // Step 5: Verify it's still responsive to interactions
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 400)) // Wait for hide

      flyout = document.querySelector('.user-bug-test')
      if (flyout) {
        // If still present, it should be in closing state
        expect(flyout.classList.contains('bc-toggle--closing')).toBe(true)
      } // Otherwise it's properly disposed (null is also acceptable)
    })

    it('should reproduce new issue: leaving while fading then hovering again', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'New issue test',
            Flyout({
              content: () =>
                Fragment(
                  attr.class('bc-flyout new-issue-test'),
                  'New issue flyout'
                ),
              showOn: 'hover',
              showDelay: 50,
              hideDelay: 200, // Longer hide delay to create fading period
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Step 1: Show flyout
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 60)) // Wait for show

      let flyout = document.querySelector('.new-issue-test')
      expect(flyout).not.toBeNull()

      // Step 2: Leave to start fading
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 100)) // Wait partial hide delay (fading period)

      flyout = document.querySelector('.new-issue-test')
      // The flyout might be gone at this point due to timing, which is OK
      // The real test is whether it can show again in step 3

      // Step 3: Hover again - this should show the flyout again (the real test)
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 60)) // Wait for show

      flyout = document.querySelector('.new-issue-test')
      expect(flyout).not.toBeNull() // This is the real test - can it show again?
    })

    it('should handle rapid hover/leave/hover during actual closing animation', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Rapid interaction test',
            Flyout({
              content: () =>
                Fragment(
                  attr.class('bc-flyout rapid-test'),
                  'Rapid interaction flyout'
                ),
              showOn: 'hover',
              showDelay: 10, // Very fast show
              hideDelay: 100, // Fast hide to catch transitions
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Simulate rapid user interactions that could cause the browser issue
      for (let i = 0; i < 3; i++) {
        // Show
        button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
        await new Promise(resolve => setTimeout(resolve, 20))

        // Hide
        button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
        await new Promise(resolve => setTimeout(resolve, 20))
      }

      // Final show - this should work even after rapid interactions
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50))

      const flyout = document.querySelector('.rapid-test')
      expect(flyout).not.toBeNull()
    })

    it('should handle hover after full disposal correctly', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Full disposal test',
            Flyout({
              content: () =>
                Fragment(
                  attr.class('bc-flyout full-disposal-test'),
                  'Full disposal flyout'
                ),
              showOn: 'hover',
              showDelay: 50,
              hideDelay: 100,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Step 1: Show flyout
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 60))

      let flyout = document.querySelector('.full-disposal-test')
      expect(flyout).not.toBeNull()

      // Step 2: Hide flyout and wait for FULL disposal
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 200)) // Wait for hide delay + animation

      // Verify it's fully gone
      flyout = document.querySelector('.full-disposal-test')
      expect(flyout).toBeNull()

      // Step 3: Try to show again - this should work and stay visible
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 60))

      flyout = document.querySelector('.full-disposal-test')
      expect(flyout).not.toBeNull()

      // Step 4: Wait a bit more to see if it disappears unexpectedly
      await new Promise(resolve => setTimeout(resolve, 200))

      flyout = document.querySelector('.full-disposal-test')
      expect(flyout).not.toBeNull() // This might fail due to the second bug
    })
  })
})
