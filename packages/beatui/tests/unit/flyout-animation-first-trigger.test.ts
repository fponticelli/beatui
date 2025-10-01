import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, Fragment, attr } from '@tempots/dom'
import { Flyout } from '../../src/components/navigation/flyout'
import { Button } from '../../src/components/button/button'
import { WithProviders } from '../helpers/test-providers'

function getToggleStatusFromClasses(element: HTMLElement): string {
  const classList = element.className
  if (classList.includes('bc-toggle--closed')) return 'closed'
  if (classList.includes('bc-toggle--start-opening')) return 'start-opening'
  if (classList.includes('bc-toggle--opening')) return 'opening'
  if (classList.includes('bc-toggle--opened')) return 'opened'
  if (classList.includes('bc-toggle--start-closing')) return 'start-closing'
  if (classList.includes('bc-toggle--closing')) return 'closing'
  return 'unknown'
}

describe('Flyout First Trigger Animation Bug', () => {
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

  it('should reproduce animation skip on first trigger', async () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Test Button',
          Flyout({
            content: () =>
              Fragment(
                attr.class('bc-flyout first-trigger-test'),
                'First trigger flyout'
              ),
            showOn: 'hover',
            showDelay: 10, // Very short delay to speed up test
            hideDelay: 10,
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')!

    // FIRST TRIGGER - this is where the animation should start properly
    button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

    // Wait just enough for the flyout to appear
    await new Promise(resolve => setTimeout(resolve, 15))

    const flyout = document.querySelector('.first-trigger-test') as HTMLElement
    expect(flyout).not.toBeNull()

    // Check the animation status at the moment it appears (now using CSS classes)
    const statusAtAppearance = getToggleStatusFromClasses(flyout)
    console.log('Status when flyout first appears:', statusAtAppearance)

    // It should be in 'closed', 'start-opening' or 'opening' state, NOT 'opened'
    // If it's 'opened' immediately, the animation was skipped
    expect(statusAtAppearance).not.toBe('opened')
    expect(['closed', 'start-opening', 'opening']).toContain(statusAtAppearance)

    // Wait for animation to complete (now needs longer due to 16ms delay)
    await new Promise(resolve => setTimeout(resolve, 1200)) // Increased timeout for animation completion

    // Now it should be opened or opening (both are acceptable for this test)
    const statusAfterAnimation = getToggleStatusFromClasses(flyout)
    expect(['opened', 'opening']).toContain(statusAfterAnimation)

    // The key test is complete - we verified first trigger doesn't skip to 'opened'
  })

  it('should ensure animation states transition correctly on first trigger', async () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Animation States Test',
          Flyout({
            content: () =>
              Fragment(
                attr.class('bc-flyout animation-states-test'),
                'Animation states flyout'
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
    const statusHistory: string[] = []

    // Trigger the flyout
    button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

    // Monitor status changes over time
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 5))
      const flyout = document.querySelector(
        '.animation-states-test'
      ) as HTMLElement
      if (flyout) {
        const status = getToggleStatusFromClasses(flyout)
        if (status && statusHistory[statusHistory.length - 1] !== status) {
          statusHistory.push(status)
        }
      }
    }

    console.log('Status transition history:', statusHistory)

    // The expected transition should be: start-opening → opening → opened
    // OR at minimum we should see 'opening' before 'opened'
    expect(statusHistory).not.toEqual(['opened']) // Should not jump directly to opened

    // We should see opening before opened
    const openingIndex = statusHistory.indexOf('opening')
    const openedIndex = statusHistory.indexOf('opened')

    if (openedIndex !== -1) {
      expect(openingIndex).toBeGreaterThan(-1) // Should have 'opening' state
      if (openingIndex !== -1) {
        expect(openingIndex).toBeLessThan(openedIndex) // 'opening' should come before 'opened'
      }
    }
  })

  it('should handle immediate element setup and animation start', async () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Element Setup Test',
          Flyout({
            content: () =>
              Fragment(
                attr.class('bc-flyout element-setup-test'),
                'Element setup flyout'
              ),
            showOn: 'hover', // Use hover for consistency
            showDelay: 5,
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')!

    // Trigger flyout with hover
    button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

    // Check after show delay
    await new Promise(resolve => setTimeout(resolve, 10))

    let flyout = document.querySelector('.element-setup-test') as HTMLElement
    if (flyout) {
      const immediateStatus = getToggleStatusFromClasses(flyout)
      console.log('Status after hover trigger:', immediateStatus)

      // Should be closed, start-opening or opening, but definitely not opened immediately
      expect(['closed', 'start-opening', 'opening']).toContain(immediateStatus)
    }

    // Wait a bit more for the animation to progress (account for 16ms delay)
    await new Promise(resolve => setTimeout(resolve, 40))

    flyout = document.querySelector('.element-setup-test') as HTMLElement
    expect(flyout).not.toBeNull()

    const statusAfterDelay = getToggleStatusFromClasses(flyout)
    console.log('Status after animation delay:', statusAfterDelay)

    // Should be in start-opening, opening or opened state by now
    expect(['start-opening', 'opening', 'opened']).toContain(statusAfterDelay)
  })
})
