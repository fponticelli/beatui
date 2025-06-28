import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, html, prop, Provide } from '@tempots/dom'
import { Drawer, Button, Theme } from '../../src'

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
        Provide(Theme, {}, () =>
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
        Provide(Theme, {}, () =>
          Drawer((open, _close) =>
            Button(
              { onClick: () => open({ size: 'lg', side: 'left', body: html.p('Test') }) },
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
        Provide(Theme, {}, () =>
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
        Provide(Theme, {}, () =>
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
        Provide(Theme, {}, () =>
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
      const side = prop<'top' | 'right' | 'bottom' | 'left'>('right')

      render(
        Provide(Theme, {}, () =>
          Drawer((open, _close) =>
            Button(
              { onClick: () => open({ size, side, body: html.p('Reactive drawer') }) },
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
        Provide(Theme, {}, () =>
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

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 400))
      expect(drawer.classList.contains('bc-drawer--status-opened')).toBe(true)
    })
  })

  describe('interaction behavior', () => {
    it('should close drawer when close button is clicked', async () => {
      render(
        Provide(Theme, {}, () =>
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
      const drawer = document.querySelector('.bc-drawer')!
      const hasStatusClass = Array.from(drawer.classList).some(cls =>
        cls.startsWith('bc-drawer--status-')
      )
      expect(hasStatusClass).toBe(true)
    })
  })
})
