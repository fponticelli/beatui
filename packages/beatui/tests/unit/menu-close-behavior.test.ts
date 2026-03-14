import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, html, Fragment } from '@tempots/dom'
import { Menu, MenuItem } from '../../src/components/navigation/menu'
import { Button } from '../../src/components/button/button'
import { WithProviders } from '../helpers/test-providers'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('Menu close behavior', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    const menus = document.querySelectorAll('.bc-menu, .bc-flyout')
    menus.forEach(menu => menu.remove())
  })

  it('should call onClose when menu closes via click-outside', async () => {
    const onClose = vi.fn()

    render(
      WithProviders(() =>
        Fragment(
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Menu',
            Menu({
              items: () => [MenuItem({ content: 'Edit', key: 'edit' })],
              showOn: 'click',
              onClose,
            })
          ),
          html.div('outside-content')
        )
      ),
      container
    )

    const button = container.querySelector('button')!

    // Open menu
    button.click()
    await wait(100)
    expect(document.querySelector('.bc-menu')).not.toBeNull()

    // Click outside
    document.body.click()
    await wait(100)

    expect(onClose).toHaveBeenCalled()
  })

  it('should call onClose when menu item is clicked', async () => {
    const onClose = vi.fn()
    const onAction = vi.fn()

    render(
      WithProviders(() =>
        Button(
          { onClick: () => {}, stopPropagation: false },
          'Menu',
          Menu({
            items: () => [
              MenuItem({ content: 'Edit', key: 'edit' }),
              MenuItem({ content: 'Delete', key: 'delete' }),
            ],
            showOn: 'click',
            onClose,
            onAction,
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')!

    // Open menu
    button.click()
    await wait(100)

    // Click a menu item
    const editItem = document.querySelector(
      '[data-key="edit"]'
    ) as HTMLElement
    editItem.click()
    await wait(50)

    expect(onAction).toHaveBeenCalledWith('edit')
    expect(onClose).toHaveBeenCalled()
  })

  it('should close menu on item click and allow reopening', async () => {
    const onAction = vi.fn()

    render(
      WithProviders(() =>
        Button(
          { onClick: () => {}, stopPropagation: false },
          'Menu',
          Menu({
            items: () => [
              MenuItem({ content: 'Edit', key: 'edit' }),
            ],
            showOn: 'click',
            onAction,
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')!

    // Open menu
    button.click()
    await wait(100)
    expect(document.querySelector('.bc-menu')).not.toBeNull()

    // Click menu item — should close
    const editItem = document.querySelector(
      '[data-key="edit"]'
    ) as HTMLElement
    editItem.click()
    await wait(100)

    // Reopen — should work on first click
    button.click()
    await wait(100)
    expect(document.querySelector('.bc-menu')).not.toBeNull()
  })

  it('should reopen menu after Escape close', async () => {
    render(
      WithProviders(() =>
        Button(
          { onClick: () => {}, stopPropagation: false },
          'Menu',
          Menu({
            items: () => [MenuItem({ content: 'Edit', key: 'edit' })],
            showOn: 'click',
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')!

    // Open
    button.click()
    await wait(100)
    expect(document.querySelector('.bc-menu')).not.toBeNull()

    // Close with Escape
    const menu = document.querySelector('.bc-menu') as HTMLElement
    menu.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    )
    await wait(100)

    // Reopen
    button.click()
    await wait(100)
    expect(document.querySelector('.bc-menu')).not.toBeNull()
  })

  it('should reopen menu after click-outside close', async () => {
    render(
      WithProviders(() =>
        Fragment(
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Menu',
            Menu({
              items: () => [MenuItem({ content: 'Edit', key: 'edit' })],
              showOn: 'click',
            })
          ),
          html.div('outside-content')
        )
      ),
      container
    )

    const button = container.querySelector('button')!

    // Open
    button.click()
    await wait(100)
    expect(document.querySelector('.bc-menu')).not.toBeNull()

    // Close via click-outside
    document.body.click()
    await wait(100)

    // Reopen — should work on first click
    button.click()
    await wait(100)
    expect(document.querySelector('.bc-menu')).not.toBeNull()
  })

  it('should handle multiple open/close cycles via different mechanisms', async () => {
    const onClose = vi.fn()

    render(
      WithProviders(() =>
        Fragment(
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Menu',
            Menu({
              items: () => [
                MenuItem({ content: 'Edit', key: 'edit' }),
                MenuItem({ content: 'Delete', key: 'delete' }),
              ],
              showOn: 'click',
              onClose,
            })
          ),
          html.div('outside-content')
        )
      ),
      container
    )

    const button = container.querySelector('button')!

    // Cycle 1: Open and close with Escape
    button.click()
    await wait(100)
    expect(document.querySelector('.bc-menu')).not.toBeNull()

    const menu1 = document.querySelector('.bc-menu') as HTMLElement
    menu1.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    )
    await wait(100)
    expect(onClose).toHaveBeenCalledTimes(1)

    // Cycle 2: Open and close with click-outside
    button.click()
    await wait(100)
    expect(document.querySelector('.bc-menu')).not.toBeNull()

    document.body.click()
    await wait(100)
    expect(onClose).toHaveBeenCalledTimes(2)

    // Cycle 3: Open and close with item click
    button.click()
    await wait(100)
    expect(document.querySelector('.bc-menu')).not.toBeNull()

    const editItem = document.querySelector(
      '[data-key="edit"]'
    ) as HTMLElement
    editItem.click()
    await wait(100)
    expect(onClose).toHaveBeenCalledTimes(3)

    // Final open — everything should still work
    button.click()
    await wait(100)
    expect(document.querySelector('.bc-menu')).not.toBeNull()
  })

  it('should not call onClose when disabled item is clicked', async () => {
    const onClose = vi.fn()

    render(
      WithProviders(() =>
        Button(
          { onClick: () => {}, stopPropagation: false },
          'Menu',
          Menu({
            items: () => [
              MenuItem({ content: 'Edit', key: 'edit', disabled: true }),
              MenuItem({ content: 'Delete', key: 'delete' }),
            ],
            showOn: 'click',
            onClose,
          })
        )
      ),
      container
    )

    const button = container.querySelector('button')!

    // Open
    button.click()
    await wait(100)

    // Click disabled item — should NOT close
    const disabledItem = document.querySelector(
      '[data-key="edit"]'
    ) as HTMLElement
    disabledItem.click()
    await wait(50)

    // Menu should still be open, onClose should not have been called
    expect(document.querySelector('.bc-menu')).not.toBeNull()
    expect(onClose).not.toHaveBeenCalled()
  })
})
