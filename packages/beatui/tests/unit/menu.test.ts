import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, html } from '@tempots/dom'
import {
  Menu,
  MenuItem,
  MenuSeparator,
} from '../../src/components/navigation/menu'
import { Button } from '../../src/components/button/button'
import { Icon } from '../../src/components/data/icon'
import { WithProviders } from '../helpers/test-providers'

describe('Menu Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    // Clean up any menus that might be in the DOM
    const menus = document.querySelectorAll('.bc-menu, .bc-flyout')
    menus.forEach(menu => menu.remove())
  })

  describe('basic functionality', () => {
    it('should render menu with items', async () => {
      const onAction = vi.fn()

      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Menu',
            Menu({
              items: () => [
                MenuItem({ content: 'Edit', key: 'edit' }),
                MenuItem({ content: 'Delete', key: 'delete' }),
              ],
              showOn: 'click',
              onAction,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      expect(button.textContent).toBe('Menu')

      // Click to open menu
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const menu = document.querySelector('.bc-menu')
      expect(menu).not.toBeNull()
      expect(menu!.getAttribute('role')).toBe('menu')

      const menuItems = menu!.querySelectorAll('[role="menuitem"]')
      expect(menuItems).toHaveLength(2)
      expect(menuItems[0].textContent).toContain('Edit')
      expect(menuItems[1].textContent).toContain('Delete')
    })

    it('should handle menu item clicks', async () => {
      const onAction = vi.fn()
      const onEdit = vi.fn()

      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Menu',
            Menu({
              items: () => [
                MenuItem({ content: 'Edit', key: 'edit', onClick: onEdit }),
                MenuItem({ content: 'Delete', key: 'delete' }),
              ],
              showOn: 'click',
              onAction,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const editItem = document.querySelector(
        '[data-key="edit"]'
      ) as HTMLElement
      expect(editItem).not.toBeNull()

      editItem.click()
      expect(onEdit).toHaveBeenCalledOnce()
      expect(onAction).toHaveBeenCalledWith('edit')
    })

    it('should render menu items with start and end content', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Menu',
            Menu({
              items: () => [
                MenuItem({
                  content: 'Edit',
                  startContent: Icon({ icon: 'edit' }),
                  endContent: html.span('⌘E'),
                }),
              ],
              showOn: 'click',
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const menuItem = document.querySelector('.bc-menu-item')!
      const startContent = menuItem.querySelector('.bc-menu-item__start')
      const endContent = menuItem.querySelector('.bc-menu-item__end')

      expect(startContent).not.toBeNull()
      expect(endContent).not.toBeNull()
      expect(endContent!.textContent).toBe('⌘E')
    })

    it('should render menu separator', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Menu',
            Menu({
              items: () => [
                MenuItem({ content: 'Edit' }),
                MenuSeparator(),
                MenuItem({ content: 'Delete' }),
              ],
              showOn: 'click',
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const separator = document.querySelector('.bc-menu-separator')
      expect(separator).not.toBeNull()
      expect(separator!.getAttribute('role')).toBe('separator')
    })
  })

  describe('disabled items', () => {
    it('should handle disabled menu items', async () => {
      const onClick = vi.fn()

      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Menu',
            Menu({
              items: () => [
                MenuItem({ content: 'Edit', disabled: true, onClick }),
                MenuItem({ content: 'Delete' }),
              ],
              showOn: 'click',
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const disabledItem = document.querySelector(
        '[aria-disabled="true"]'
      ) as HTMLElement
      expect(disabledItem).not.toBeNull()
      expect(disabledItem.classList.contains('bc-menu-item--disabled')).toBe(
        true
      )

      disabledItem.click()
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('keyboard navigation', () => {
    it('should navigate with arrow keys', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Menu',
            Menu({
              items: () => [
                MenuItem({ content: 'Edit', key: 'edit' }),
                MenuItem({ content: 'Copy', key: 'copy' }),
                MenuItem({ content: 'Delete', key: 'delete' }),
              ],
              showOn: 'click',
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const menu = document.querySelector('.bc-menu') as HTMLElement
      expect(menu).not.toBeNull()

      // Test arrow down navigation
      menu.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      )
      await new Promise(resolve => setTimeout(resolve, 50))

      const focusedItem = document.querySelector('.bc-menu-item--focused')
      expect(focusedItem).not.toBeNull()
    })

    it('should activate items with Enter key', async () => {
      const onAction = vi.fn()

      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Menu',
            Menu({
              items: () => [MenuItem({ content: 'Edit', key: 'edit' })],
              showOn: 'click',
              onAction,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const menu = document.querySelector('.bc-menu') as HTMLElement

      // Focus first item and activate with Enter
      menu.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      )
      await new Promise(resolve => setTimeout(resolve, 50))

      menu.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      )
      expect(onAction).toHaveBeenCalledWith('edit')
    })

    it('should close menu with Escape key', async () => {
      const onClose = vi.fn()

      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Menu',
            Menu({
              items: () => [MenuItem({ content: 'Edit' })],
              showOn: 'click',
              onClose,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const menu = document.querySelector('.bc-menu') as HTMLElement
      menu.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
      )

      expect(onClose).toHaveBeenCalledOnce()
    })
  })
})
