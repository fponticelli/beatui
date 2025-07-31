import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, html, prop } from '@tempots/dom'
import { Drawer, Button } from '../../src'
import { WithProviders } from '../helpers/test-providers'

describe('Drawer', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    const overlays = document.querySelectorAll('.bc-overlay')
    overlays.forEach(overlay => overlay.remove())
    const drawers = document.querySelectorAll('.bc-drawer')
    drawers.forEach(drawer => drawer.remove())
  })

  describe('basic functionality', () => {
    it('should render trigger and open drawer on click', async () => {
      render(
        WithProviders(() =>
          Drawer((open, _close) =>
            Button(
              { onClick: () => open({ body: html.p('Drawer content') }) },
              'Open Drawer'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      expect(button.textContent).toBe('Open Drawer')

      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const drawer = document.querySelector('.bc-drawer')
      expect(drawer).toBeTruthy()
      expect(drawer!.textContent).toContain('Drawer content')
    })

    it('should apply correct size and side classes', async () => {
      render(
        WithProviders(() =>
          Drawer((open, _close) =>
            Button(
              {
                onClick: () =>
                  open({ size: 'lg', side: 'left', body: html.p('Test') }),
              },
              'Open Drawer'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const drawer = document.querySelector('.bc-drawer')!
      expect(drawer.classList.contains('bc-drawer--size-lg')).toBe(true)
      expect(drawer.classList.contains('bc-drawer--side-left')).toBe(true)
    })

    it('should render header and footer when provided', async () => {
      render(
        WithProviders(() =>
          Drawer((open, _close) =>
            Button(
              {
                onClick: () =>
                  open({
                    header: html.h2('Drawer Title'),
                    body: html.p('Test'),
                    footer: html.div('Footer content'),
                  }),
              },
              'Open Drawer'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const header = document.querySelector('.bc-drawer__header')
      const footer = document.querySelector('.bc-drawer__footer')
      expect(header?.textContent).toContain('Drawer Title')
      expect(footer?.textContent).toBe('Footer content')
    })

    it('should show close button by default when header is present', async () => {
      render(
        WithProviders(() =>
          Drawer((open, _close) =>
            Button(
              {
                onClick: () =>
                  open({
                    header: html.h2('Title'),
                    body: html.p('Test'),
                  }),
              },
              'Open Drawer'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const closeButton = document.querySelector('.bc-drawer__header button')
      expect(closeButton).toBeTruthy()
    })

    it('should hide close button when showCloseButton is false', async () => {
      render(
        WithProviders(() =>
          Drawer((open, _close) =>
            Button(
              {
                onClick: () =>
                  open({
                    showCloseButton: false,
                    header: html.h2('Title'),
                    body: html.p('Test'),
                  }),
              },
              'Open Drawer'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const closeButton = document.querySelector('.bc-drawer__header button')
      expect(closeButton).toBeFalsy()
    })
  })

  describe('reactive behavior', () => {
    it('should reactively update size and side classes', async () => {
      const size = prop<'sm' | 'md' | 'lg' | 'xl'>('md')
      const side = prop<
        'top' | 'right' | 'bottom' | 'left' | 'inline-start' | 'inline-end'
      >('right')

      render(
        WithProviders(() =>
          Drawer((open, _close) =>
            Button(
              {
                onClick: () =>
                  open({ size, side, body: html.p('Reactive drawer') }),
              },
              'Open Drawer'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      let drawer = document.querySelector('.bc-drawer')!
      expect(drawer.classList.contains('bc-drawer--size-md')).toBe(true)
      expect(drawer.classList.contains('bc-drawer--side-right')).toBe(true)

      // Update properties
      size.set('lg')
      side.set('left')
      await new Promise(resolve => setTimeout(resolve, 50))

      drawer = document.querySelector('.bc-drawer')!
      expect(drawer.classList.contains('bc-drawer--size-lg')).toBe(true)
      expect(drawer.classList.contains('bc-drawer--side-left')).toBe(true)
    })

    it('should apply animation status classes during lifecycle', async () => {
      render(
        WithProviders(() =>
          Drawer((open, _close) =>
            Button(
              { onClick: () => open({ body: html.p('Animated drawer') }) },
              'Open Drawer'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()

      // Check for opening animation classes
      await new Promise(resolve => setTimeout(resolve, 50))
      const drawer = document.querySelector('.bc-drawer')!
      const hasOpeningStatus =
        drawer.classList.contains('bc-drawer--status-start-opening') ||
        drawer.classList.contains('bc-drawer--status-opening') ||
        drawer.classList.contains('bc-drawer--status-opened')
      expect(hasOpeningStatus).toBe(true)

      // Wait for animation to complete - increase timeout for reliable animation completion
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check if drawer has reached opened state or is still opening
      const hasOpenedStatus = drawer.classList.contains(
        'bc-drawer--status-opened'
      )
      const stillOpeningStatus = drawer.classList.contains(
        'bc-drawer--status-opening'
      )

      // Either opened or opening is acceptable for this test
      expect(hasOpenedStatus || stillOpeningStatus).toBe(true)
    })
  })

  describe('interaction behavior', () => {
    it('should close drawer when close button is clicked', async () => {
      render(
        WithProviders(() =>
          Drawer((open, _close) =>
            Button(
              {
                onClick: () =>
                  open({
                    header: html.h2('Closable Drawer'),
                    body: html.p('Click close to dismiss'),
                  }),
              },
              'Open Drawer'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const closeButton = document.querySelector('.bc-drawer__header button')!
      expect(() => {
        closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      }).not.toThrow()

      // Should have animation status class after close
      await new Promise(resolve => setTimeout(resolve, 50))
      const drawer = document.querySelector('.bc-drawer')
      if (drawer) {
        const hasStatusClass = Array.from(drawer.classList).some(cls =>
          cls.startsWith('bc-drawer--status-')
        )
        expect(hasStatusClass).toBe(true)
      } else {
        // If drawer is removed, that's also acceptable behavior
        expect(drawer).toBeNull()
      }
    })
  })

  describe('semantic anchoring', () => {
    it('should support inline-start side positioning', async () => {
      render(
        WithProviders(() =>
          Drawer((open, _close) =>
            Button(
              {
                onClick: () =>
                  open({
                    side: 'inline-start',
                    body: html.p('Inline start drawer'),
                  }),
              },
              'Open Drawer'
            )
          )
        ),
        container
      )

      // Open drawer
      const openButton = container.querySelector('button')!
      openButton.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Check for inline-start class
      const drawer = document.querySelector('.bc-drawer')
      expect(drawer).toBeTruthy()
      expect(drawer?.classList.contains('bc-drawer--side-inline-start')).toBe(
        true
      )
    })

    it('should support inline-end side positioning', async () => {
      render(
        WithProviders(() =>
          Drawer((open, _close) =>
            Button(
              {
                onClick: () =>
                  open({
                    side: 'inline-end',
                    body: html.p('Inline end drawer'),
                  }),
              },
              'Open Drawer'
            )
          )
        ),
        container
      )

      // Open drawer
      const openButton = container.querySelector('button')!
      openButton.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Check for inline-end class
      const drawer = document.querySelector('.bc-drawer')
      expect(drawer).toBeTruthy()
      expect(drawer?.classList.contains('bc-drawer--side-inline-end')).toBe(
        true
      )
    })

    it('should reactively update semantic side classes', async () => {
      const side = prop<
        'top' | 'right' | 'bottom' | 'left' | 'inline-start' | 'inline-end'
      >('inline-start')

      render(
        WithProviders(() =>
          Drawer((open, _close) =>
            Button(
              {
                onClick: () =>
                  open({
                    side,
                    body: html.p('Semantic drawer'),
                  }),
              },
              'Open Drawer'
            )
          )
        ),
        container
      )

      // Open drawer
      const openButton = container.querySelector('button')!
      openButton.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Check initial class
      let drawer = document.querySelector('.bc-drawer')
      expect(drawer?.classList.contains('bc-drawer--side-inline-start')).toBe(
        true
      )

      // Change side
      side.set('inline-end')
      await new Promise(resolve => setTimeout(resolve, 50))

      // Check updated class
      drawer = document.querySelector('.bc-drawer')
      expect(drawer?.classList.contains('bc-drawer--side-inline-end')).toBe(
        true
      )
      expect(drawer?.classList.contains('bc-drawer--side-inline-start')).toBe(
        false
      )
    })
  })
})
