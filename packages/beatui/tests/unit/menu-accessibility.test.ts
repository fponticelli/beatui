import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, Fragment, attr } from '@tempots/dom'
import {
  Menu,
  MenuItem,
  MenuSeparator,
} from '../../src/components/navigation/menu'
import { Button } from '../../src/components/button/button'
import { WithProviders } from '../helpers/test-providers'

describe('Menu Accessibility', () => {
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

  describe('ARIA attributes', () => {
    it('should have proper ARIA attributes on menu', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Menu',
            Menu({
              items: () => [
                MenuItem({ content: 'Edit' }),
                MenuItem({ content: 'Delete' }),
              ],
              showOn: 'click',
              ariaLabel: 'Actions menu',
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const menu = document.querySelector('.bc-menu')!
      expect(menu.getAttribute('role')).toBe('menu')
      expect(menu.getAttribute('aria-label')).toBe('Actions menu')
      expect(menu.getAttribute('aria-orientation')).toBe('vertical')
      expect(menu.getAttribute('tabindex')).toBe('-1')
    })

    it('should have proper ARIA attributes on menu items', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Menu',
            Menu({
              items: () => [
                MenuItem({
                  content: 'Edit',
                  ariaLabel: 'Edit document',
                  disabled: false,
                }),
                MenuItem({
                  content: 'Delete',
                  disabled: true,
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

      const menuItems = document.querySelectorAll('[role="menuitem"]')
      expect(menuItems).toHaveLength(2)

      const editItem = menuItems[0]
      expect(editItem.getAttribute('role')).toBe('menuitem')
      expect(editItem.getAttribute('aria-label')).toBe('Edit document')
      expect(editItem.getAttribute('aria-disabled')).toBe('false')
      expect(editItem.getAttribute('tabindex')).toBe('-1')

      const deleteItem = menuItems[1]
      expect(deleteItem.getAttribute('aria-disabled')).toBe('true')
    })

    it('should have proper ARIA attributes on separators', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Menu',
            Menu({
              items: () => [
                MenuItem({ content: 'Edit' }),
                MenuSeparator({ label: 'Dangerous actions' }),
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

      const separator = document.querySelector('[role="separator"]')!
      expect(separator.getAttribute('role')).toBe('separator')
      expect(separator.getAttribute('aria-orientation')).toBe('horizontal')
    })

    it('should support aria-labelledby', async () => {
      render(
        WithProviders(() =>
          Fragment(
            attr.id('menu-label'),
            'Actions',
            Button(
              { onClick: () => {}, stopPropagation: false },
              'Menu',
              Menu({
                items: () => [MenuItem({ content: 'Edit' })],
                showOn: 'click',
                ariaLabelledBy: 'menu-label',
              })
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const menu = document.querySelector('.bc-menu')!
      expect(menu.getAttribute('aria-labelledby')).toBe('menu-label')
    })
  })

  describe('focus management', () => {
    it('should manage focus correctly', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Menu',
            Menu({
              items: () => [
                MenuItem({ content: 'Edit' }),
                MenuItem({ content: 'Copy' }),
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

      // First item should be focused initially
      await new Promise(resolve => setTimeout(resolve, 100))
      const firstItem = document.querySelector('.bc-menu-item--focused')
      expect(firstItem).not.toBeNull()
      expect(firstItem!.getAttribute('aria-selected')).toBe('true')
    })

    it('should skip disabled items during navigation', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Menu',
            Menu({
              items: () => [
                MenuItem({ content: 'Edit' }),
                MenuItem({ content: 'Copy', disabled: true }),
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
      // Wait for auto-focus on first item
      await new Promise(resolve => setTimeout(resolve, 100))

      const menu = document.querySelector('.bc-menu') as HTMLElement

      // ArrowDown from 'Edit' should skip disabled 'Copy' and focus 'Delete'
      menu.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      )
      await new Promise(resolve => setTimeout(resolve, 50))

      const focusedItem = document.querySelector('.bc-menu-item--focused')
      expect(focusedItem!.textContent).toContain('Delete')
    })

    it('should provide screen reader announcements', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Menu',
            Menu({
              items: () => [
                MenuItem({ content: 'Edit' }),
                MenuItem({ content: 'Delete', disabled: true }),
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

      const liveRegion = document.querySelector('[aria-live="polite"]')
      expect(liveRegion).not.toBeNull()
      expect(liveRegion!.classList.contains('sr-only')).toBe(true)
    })
  })

  describe('submenu accessibility', () => {
    it('should have proper ARIA attributes for submenu items', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Menu',
            Menu({
              items: () => [
                MenuItem({
                  content: 'Edit',
                  submenu: () => [
                    MenuItem({ content: 'Undo' }),
                    MenuItem({ content: 'Redo' }),
                  ],
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

      const submenuItem = document.querySelector('.bc-menu-item--has-submenu')!
      expect(submenuItem.getAttribute('aria-haspopup')).toBe('menu')
      expect(submenuItem.getAttribute('aria-expanded')).toBe('false')
    })
  })

  describe('keyboard shortcuts', () => {
    it('should support Home and End keys', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Menu',
            Menu({
              items: () => [
                MenuItem({ content: 'First' }),
                MenuItem({ content: 'Middle' }),
                MenuItem({ content: 'Last' }),
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

      // Test End key
      menu.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true })
      )
      await new Promise(resolve => setTimeout(resolve, 50))

      let focusedItem = document.querySelector('.bc-menu-item--focused')
      expect(focusedItem!.textContent).toContain('Last')

      // Test Home key
      menu.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
      )
      await new Promise(resolve => setTimeout(resolve, 50))

      focusedItem = document.querySelector('.bc-menu-item--focused')
      expect(focusedItem!.textContent).toContain('First')
    })
  })
})
