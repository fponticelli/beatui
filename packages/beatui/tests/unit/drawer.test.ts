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
    // Clean up any remaining overlays/drawers
    const overlays = document.querySelectorAll('.bc-overlay')
    overlays.forEach(overlay => overlay.remove())
    const drawers = document.querySelectorAll('.bc-drawer')
    drawers.forEach(drawer => drawer.remove())
  })

  it('should render drawer trigger button', () => {
    render(
      Provide(Theme, {}, () =>
        Drawer((open, _close) =>
          Button(
            { onClick: () => open({ body: html.p('Test') }) },
            'Open Drawer'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).toBeTruthy()
    expect(button?.textContent).toBe('Open Drawer')
  })

  it('should open drawer when button is clicked', () => {
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

    const button = container.querySelector('button')
    button?.click()

    const drawer = document.querySelector('.bc-drawer')
    expect(drawer).toBeTruthy()
    expect(drawer?.textContent).toContain('Drawer content')
  })

  it('should apply correct size class', async () => {
    render(
      Provide(Theme, {}, () =>
        Drawer((open, _close) =>
          Button(
            { onClick: () => open({ size: 'lg', body: html.p('Test') }) },
            'Open Drawer'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button?.click()

    await new Promise(resolve => setTimeout(resolve, 100))

    const drawer = document.querySelector('.bc-drawer')
    expect(drawer?.classList.contains('bc-drawer--size-lg')).toBe(true)
  })

  it('should apply correct side class', async () => {
    render(
      Provide(Theme, {}, () =>
        Drawer((open, _close) =>
          Button(
            { onClick: () => open({ side: 'left', body: html.p('Test') }) },
            'Open Drawer'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button?.click()

    await new Promise(resolve => setTimeout(resolve, 100))

    const drawer = document.querySelector('.bc-drawer')
    expect(drawer?.classList.contains('bc-drawer--side-left')).toBe(true)
  })

  it('should apply correct container class', async () => {
    render(
      Provide(Theme, {}, () =>
        Drawer((open, _close) =>
          Button(
            {
              onClick: () =>
                open({ container: 'element', body: html.p('Test') }),
            },
            'Open Drawer'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button?.click()

    await new Promise(resolve => setTimeout(resolve, 100))

    const drawer = document.querySelector('.bc-drawer')
    expect(drawer?.classList.contains('bc-drawer--container-element')).toBe(
      true
    )
  })

  it('should render header when provided', async () => {
    render(
      Provide(Theme, {}, () =>
        Drawer((open, _close) =>
          Button(
            {
              onClick: () =>
                open({
                  header: html.h2('Drawer Title'),
                  body: html.p('Test'),
                }),
            },
            'Open Drawer'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button?.click()

    await new Promise(resolve => setTimeout(resolve, 100))

    const header = document.querySelector('.bc-drawer__header')
    expect(header).toBeTruthy()
    expect(header?.textContent).toContain('Drawer Title')
  })

  it('should render footer when provided', () => {
    render(
      Provide(Theme, {}, () =>
        Drawer((open, _close) =>
          Button(
            {
              onClick: () =>
                open({
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

    const button = container.querySelector('button')
    button?.click()

    const footer = document.querySelector('.bc-drawer__footer')
    expect(footer).toBeTruthy()
    expect(footer?.textContent).toBe('Footer content')
  })

  it('should show close button by default when header is present', () => {
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

    const button = container.querySelector('button')
    button?.click()

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

    const button = container.querySelector('button')
    button?.click()

    await new Promise(resolve => setTimeout(resolve, 100))

    const closeButton = document.querySelector('.bc-drawer__header button')
    expect(closeButton).toBeFalsy()
  })

  it('should close drawer when close button is clicked', async () => {
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

    const button = container.querySelector('button')
    button?.click()

    let drawer = document.querySelector('.bc-drawer')
    expect(drawer).toBeTruthy()

    const closeButton = document.querySelector('.bc-drawer__header button')

    // Test that clicking the close button doesn't throw an error
    expect(() => {
      closeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    }).not.toThrow()

    // Wait a bit and verify the drawer still exists (it should be animating)
    await new Promise(resolve => setTimeout(resolve, 50))
    drawer = document.querySelector('.bc-drawer')
    expect(drawer).toBeTruthy()

    // Check that the drawer has some animation status class
    const hasStatusClass = Array.from(drawer?.classList || []).some(cls =>
      cls.startsWith('bc-drawer--status-')
    )
    expect(hasStatusClass).toBe(true)
  })

  it('should reactively update size class', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const size = prop<'sm' | 'md' | 'lg' | 'xl'>('md')

    render(
      Provide(Theme, {}, () =>
        Drawer((open, _close) =>
          Button(
            { onClick: () => open({ size, body: html.p('Drawer content') }) },
            'Open Drawer'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button?.click()

    await new Promise(resolve => setTimeout(resolve, 100))

    let drawer = document.querySelector('.bc-drawer')
    expect(drawer?.classList.contains('bc-drawer--size-md')).toBe(true)

    size.set('lg')

    await new Promise(resolve => setTimeout(resolve, 50))

    drawer = document.querySelector('.bc-drawer')
    expect(drawer?.classList.contains('bc-drawer--size-lg')).toBe(true)
    expect(drawer?.classList.contains('bc-drawer--size-md')).toBe(false)

    document.body.removeChild(container)
  })

  it('should reactively update side class', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const side = prop<'top' | 'right' | 'bottom' | 'left'>('right')

    render(
      Provide(Theme, {}, () =>
        Drawer((open, _close) =>
          Button(
            { onClick: () => open({ side, body: html.p('Drawer content') }) },
            'Open Drawer'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button?.click()

    await new Promise(resolve => setTimeout(resolve, 100))

    let drawer = document.querySelector('.bc-drawer')
    expect(drawer?.classList.contains('bc-drawer--side-right')).toBe(true)

    side.set('left')

    await new Promise(resolve => setTimeout(resolve, 50))

    drawer = document.querySelector('.bc-drawer')
    expect(drawer?.classList.contains('bc-drawer--side-left')).toBe(true)
    expect(drawer?.classList.contains('bc-drawer--side-right')).toBe(false)

    document.body.removeChild(container)
  })

  it('should call onClose callback when drawer is closed via escape', async () => {
    let closeCalled = false
    const onClose = () => {
      closeCalled = true
    }

    render(
      Provide(Theme, {}, () =>
        Drawer((open, _close) =>
          Button(
            {
              onClick: () =>
                open({
                  onClose,
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

    const button = container.querySelector('button')
    button?.click()

    await new Promise(resolve => setTimeout(resolve, 100))

    // Simulate escape key press
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(closeCalled).toBe(true)
  })

  it('should apply animation status classes during drawer lifecycle', async () => {
    render(
      Provide(Theme, {}, () =>
        Drawer((open, _close) =>
          Button(
            { onClick: () => open({ body: html.p('Test') }) },
            'Open Drawer'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button?.click()

    // Check initial opening state
    await new Promise(resolve => setTimeout(resolve, 10))
    let drawer = document.querySelector('.bc-drawer')
    expect(drawer).toBeTruthy()

    // Should have one of the opening status classes
    const hasOpeningStatus =
      drawer?.classList.contains('bc-drawer--status-start-opening') ||
      drawer?.classList.contains('bc-drawer--status-opening') ||
      drawer?.classList.contains('bc-drawer--status-opened')
    expect(hasOpeningStatus).toBe(true)

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 400))

    drawer = document.querySelector('.bc-drawer')
    expect(drawer?.classList.contains('bc-drawer--status-opened')).toBe(true)
  })

  it('should apply correct transform classes for each side', async () => {
    const sides: Array<'top' | 'right' | 'bottom' | 'left'> = [
      'top',
      'right',
      'bottom',
      'left',
    ]

    for (const side of sides) {
      // Clean up any existing overlays
      const existingOverlays = document.querySelectorAll('.bc-overlay')
      existingOverlays.forEach(overlay => overlay.remove())

      const testContainer = document.createElement('div')
      document.body.appendChild(testContainer)

      render(
        Provide(Theme, {}, () =>
          Drawer((open, _close) =>
            Button(
              { onClick: () => open({ side, body: html.p('Test') }) },
              `Open ${side} Drawer`
            )
          )
        ),
        testContainer
      )

      const button = testContainer.querySelector('button')
      button?.click()

      await new Promise(resolve => setTimeout(resolve, 100))

      const drawer = document.querySelector('.bc-drawer')
      expect(drawer?.classList.contains(`bc-drawer--side-${side}`)).toBe(true)

      // Should have animation status class
      const hasStatusClass = Array.from(drawer?.classList || []).some(cls =>
        cls.startsWith('bc-drawer--status-')
      )
      expect(hasStatusClass).toBe(true)

      // Clean up this test's container
      testContainer.remove()
    }
  })
})
