import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, Fragment, attr, prop, html } from '@tempots/dom'
import { Flyout } from '../../src/components/navigation/flyout'
import { Button } from '../../src/components/button/button'
import { WithProviders } from '../helpers/test-providers'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('Flyout open signal (controlled mode)', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    const flyouts = document.querySelectorAll(
      '.bc-flyout, .bc-flyout-container'
    )
    flyouts.forEach(f => f.remove())
  })

  it('should open when external signal is set to true', async () => {
    const open = prop(false)

    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Trigger',
          Flyout({
            content: () =>
              Fragment(attr.class('bc-flyout controlled-test'), 'Content'),
            open,
            showOn: 'never',
            showDelay: 0,
            hideDelay: 0,
          })
        )
      ),
      container
    )

    // Initially closed
    expect(document.querySelector('.controlled-test')).toBeNull()

    // Open via signal
    open.set(true)
    await wait(50)

    expect(document.querySelector('.controlled-test')).not.toBeNull()
  })

  it('should close when external signal is set to false', async () => {
    const open = prop(false)

    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Trigger',
          Flyout({
            content: () =>
              Fragment(attr.class('bc-flyout close-signal-test'), 'Content'),
            open,
            showOn: 'never',
            showDelay: 0,
            hideDelay: 0,
          })
        )
      ),
      container
    )

    // Open
    open.set(true)
    await wait(50)
    expect(document.querySelector('.close-signal-test')).not.toBeNull()

    // Close via signal
    open.set(false)
    await wait(50)

    // Signal should be false and aria-expanded should update
    // (DOM removal depends on CSS animation completion which doesn't run in jsdom)
    expect(open.value).toBe(false)
    const button = container.querySelector('button')!
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('should toggle open/close via signal multiple times', async () => {
    const open = prop(false)

    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Trigger',
          Flyout({
            content: () =>
              Fragment(attr.class('bc-flyout toggle-test'), 'Content'),
            open,
            showOn: 'never',
            showDelay: 0,
            hideDelay: 0,
          })
        )
      ),
      container
    )

    for (let i = 0; i < 3; i++) {
      open.set(true)
      await wait(50)
      expect(document.querySelector('.toggle-test')).not.toBeNull()

      open.set(false)
      await wait(50)
      expect(open.value).toBe(false)
      const button = container.querySelector('button')!
      expect(button.getAttribute('aria-expanded')).toBe('false')
    }
  })

  it('should update aria-expanded from the open signal', async () => {
    const open = prop(false)

    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Trigger',
          Flyout({
            content: () => Fragment(attr.class('bc-flyout'), 'Content'),
            open,
            showOn: 'never',
            showDelay: 0,
            hideDelay: 0,
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')!
    expect(button.getAttribute('aria-expanded')).toBe('false')

    open.set(true)
    await wait(50)
    expect(button.getAttribute('aria-expanded')).toBe('true')

    open.set(false)
    await wait(100)
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('should set signal to false when Escape is pressed (closable)', async () => {
    const open = prop(false)

    render(
      WithProviders(() =>
        Button(
          { onClick: () => {} },
          'Trigger',
          Flyout({
            content: () => Fragment(attr.class('bc-flyout'), 'Content'),
            open,
            showOn: 'never',
            showDelay: 0,
            hideDelay: 0,
            closable: true,
          })
        )
      ),
      container
    )

    open.set(true)
    await wait(50)
    expect(open.value).toBe(true)

    // Press Escape
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    )
    await wait(50)

    expect(open.value).toBe(false)
  })

  it('should set signal to false on click-outside (closable)', async () => {
    const open = prop(false)

    render(
      WithProviders(() =>
        Fragment(
          Button(
            { onClick: () => {} },
            'Trigger',
            Flyout({
              content: () => Fragment(attr.class('bc-flyout'), 'Content'),
              open,
              showOn: 'never',
              showDelay: 0,
              hideDelay: 0,
              closable: true,
            })
          ),
          html.div(attr.class('outside-target'), 'Outside')
        )
      ),
      container
    )

    open.set(true)
    await wait(50)
    expect(open.value).toBe(true)

    // Click outside
    const outside = container.querySelector('.outside-target') as HTMLElement
    outside.click()
    await wait(50)

    expect(open.value).toBe(false)
  })

  it('should reopen reliably after click-outside close', async () => {
    const open = prop(false)

    render(
      WithProviders(() =>
        Fragment(
          Button(
            { onClick: () => {} },
            'Trigger',
            Flyout({
              content: () =>
                Fragment(attr.class('bc-flyout reopen-test'), 'Content'),
              open,
              showOn: 'never',
              showDelay: 0,
              hideDelay: 0,
              closable: true,
            })
          ),
          html.div(attr.class('outside-target'), 'Outside')
        )
      ),
      container
    )

    // Open
    open.set(true)
    await wait(50)
    expect(document.querySelector('.reopen-test')).not.toBeNull()

    // Close via click-outside
    const outside = container.querySelector('.outside-target') as HTMLElement
    outside.click()
    await wait(100)
    expect(open.value).toBe(false)

    // Reopen — this is the core bug scenario
    open.set(true)
    await wait(50)
    expect(document.querySelector('.reopen-test')).not.toBeNull()
    expect(open.value).toBe(true)
  })

  it('should work with custom showOn trigger function', async () => {
    const open = prop(false)

    render(
      WithProviders(() =>
        Button(
          { onClick: () => {}, stopPropagation: false },
          'Trigger',
          Flyout({
            content: () =>
              Fragment(attr.class('bc-flyout custom-trigger-test'), 'Content'),
            open,
            showOn: _openSignal => {
              return html.span(attr.class('custom-toggle'))
            },
            showDelay: 0,
            hideDelay: 0,
          })
        )
      ),
      container
    )

    // Toggle via external signal (since custom trigger is minimal)
    open.set(true)
    await wait(50)
    expect(document.querySelector('.custom-trigger-test')).not.toBeNull()

    open.set(false)
    await wait(50)
    expect(open.value).toBe(false)
  })
})

describe('Flyout built-in click trigger', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    const flyouts = document.querySelectorAll(
      '.bc-flyout, .bc-flyout-container'
    )
    flyouts.forEach(f => f.remove())
  })

  it('should toggle open/close on repeated clicks', async () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {}, stopPropagation: false },
          'Click me',
          Flyout({
            content: () =>
              Fragment(attr.class('bc-flyout click-toggle-test'), 'Content'),
            showOn: 'click',
            showDelay: 0,
            hideDelay: 0,
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')!

    // First click: open
    button.click()
    await wait(50)
    expect(document.querySelector('.click-toggle-test')).not.toBeNull()
    expect(button.getAttribute('aria-expanded')).toBe('true')

    // Second click: close
    button.click()
    await wait(100)
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('should reopen after click-outside close', async () => {
    render(
      WithProviders(() =>
        Fragment(
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Click me',
            Flyout({
              content: () =>
                Fragment(
                  attr.class('bc-flyout click-reopen-test'),
                  'Content'
                ),
              showOn: 'click',
              showDelay: 0,
              hideDelay: 0,
              closable: true,
            })
          ),
          html.div(attr.class('outside'), 'Outside')
        )
      ),
      container
    )

    const button = container.querySelector('button')!
    const outside = container.querySelector('.outside') as HTMLElement

    // Open
    button.click()
    await wait(50)
    expect(document.querySelector('.click-reopen-test')).not.toBeNull()

    // Close via click-outside
    outside.click()
    await wait(100)

    // Reopen — previously this required 2 clicks due to state desync
    button.click()
    await wait(50)
    expect(document.querySelector('.click-reopen-test')).not.toBeNull()
  })

  it('should reopen after Escape close', async () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {}, stopPropagation: false },
          'Click me',
          Flyout({
            content: () =>
              Fragment(attr.class('bc-flyout esc-reopen-test'), 'Content'),
            showOn: 'click',
            showDelay: 0,
            hideDelay: 0,
            closable: true,
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')!

    // Open
    button.click()
    await wait(50)
    expect(document.querySelector('.esc-reopen-test')).not.toBeNull()

    // Close with Escape
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    )
    await wait(100)

    // Reopen — should work on first click
    button.click()
    await wait(50)
    expect(document.querySelector('.esc-reopen-test')).not.toBeNull()
  })

  it('should handle rapid open/close/reopen cycles', async () => {
    render(
      WithProviders(() =>
        Fragment(
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Click me',
            Flyout({
              content: () =>
                Fragment(attr.class('bc-flyout rapid-click-test'), 'Content'),
              showOn: 'click',
              showDelay: 0,
              hideDelay: 0,
              closable: true,
            })
          ),
          html.div(attr.class('outside'), 'Outside')
        )
      ),
      container
    )

    const button = container.querySelector('button')!
    const outside = container.querySelector('.outside') as HTMLElement

    for (let i = 0; i < 3; i++) {
      // Open
      button.click()
      await wait(50)
      expect(document.querySelector('.rapid-click-test')).not.toBeNull()

      // Close via click-outside
      outside.click()
      await wait(100)
    }

    // Final open should still work
    button.click()
    await wait(50)
    expect(document.querySelector('.rapid-click-test')).not.toBeNull()
  })
})
