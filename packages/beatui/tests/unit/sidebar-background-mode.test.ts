import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, html, attr } from '@tempots/dom'
import { Sidebar, SidebarGroup } from '../../src/components/navigation/sidebar'

describe('Sidebar Background Mode', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('Default Light Background Mode', () => {
    it('should apply default light background mode classes', () => {
      render(Sidebar({}, SidebarGroup({}, html.div('Test Content'))), container)

      const sidebar = container.querySelector('.bc-sidebar')
      expect(sidebar).toBeTruthy()
      expect(sidebar?.classList.contains('bc-sidebar--dark-bg')).toBe(false)
    })

    it('should apply light background mode when explicitly set', () => {
      render(
        Sidebar(
          { backgroundMode: 'light' },
          SidebarGroup({}, html.div('Test Content'))
        ),
        container
      )

      const sidebar = container.querySelector('.bc-sidebar')
      expect(sidebar).toBeTruthy()
      expect(sidebar?.classList.contains('bc-sidebar--dark-bg')).toBe(false)
    })
  })

  describe('Dark Background Mode', () => {
    it('should apply dark background mode classes', () => {
      render(
        Sidebar(
          { backgroundMode: 'dark' },
          SidebarGroup({}, html.div('Test Content'))
        ),
        container
      )

      const sidebar = container.querySelector('.bc-sidebar')
      expect(sidebar).toBeTruthy()
      expect(sidebar?.classList.contains('bc-sidebar--dark-bg')).toBe(true)
    })

    it('should contain sidebar groups with proper structure', () => {
      render(
        Sidebar(
          { backgroundMode: 'dark' },
          SidebarGroup(
            {},
            html.div('Test Content 1'),
            html.div('Test Content 2')
          )
        ),
        container
      )

      const sidebar = container.querySelector('.bc-sidebar')
      const sidebarGroup = container.querySelector('.bc-sidebar-group')

      expect(sidebar).toBeTruthy()
      expect(sidebar?.classList.contains('bc-sidebar--dark-bg')).toBe(true)
      expect(sidebarGroup).toBeTruthy()
    })
  })

  describe('Background Mode with Content', () => {
    it('should render content in dark background mode', () => {
      render(
        Sidebar(
          { backgroundMode: 'dark' },
          SidebarGroup({}, html.div(attr.class('test-content'), 'Test Content'))
        ),
        container
      )

      const sidebar = container.querySelector('.bc-sidebar')
      const testContent = container.querySelector('.test-content')

      expect(sidebar?.classList.contains('bc-sidebar--dark-bg')).toBe(true)
      expect(testContent).toBeTruthy()
      expect(testContent?.textContent).toBe('Test Content')
    })

    it('should render multiple content items in dark background mode', () => {
      render(
        Sidebar(
          { backgroundMode: 'dark' },
          SidebarGroup(
            {},
            html.div(attr.class('item-1'), 'Item 1'),
            html.div(attr.class('item-2'), 'Item 2')
          )
        ),
        container
      )

      const sidebar = container.querySelector('.bc-sidebar')
      const item1 = container.querySelector('.item-1')
      const item2 = container.querySelector('.item-2')

      expect(sidebar?.classList.contains('bc-sidebar--dark-bg')).toBe(true)
      expect(item1).toBeTruthy()
      expect(item2).toBeTruthy()
    })
  })

  describe('Nested Sidebar Groups', () => {
    it('should apply background mode to nested sidebar groups', () => {
      render(
        Sidebar(
          { backgroundMode: 'dark' },
          SidebarGroup(
            { rail: true },
            html.div('Parent Content'),
            SidebarGroup({}, html.div('Nested Content'))
          )
        ),
        container
      )

      const sidebar = container.querySelector('.bc-sidebar')
      const sidebarGroups = container.querySelectorAll('.bc-sidebar-group')
      const railGroup = container.querySelector('.bc-sidebar-group--rail')

      expect(sidebar?.classList.contains('bc-sidebar--dark-bg')).toBe(true)
      expect(sidebarGroups.length).toBeGreaterThan(0)
      expect(railGroup).toBeTruthy()
    })
  })
})
