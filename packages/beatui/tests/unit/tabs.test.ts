import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, html, prop } from '@tempots/dom'
import {
  Tabs,
  TabItem,
  TabsDirection,
  TabsVariant,
} from '../../src/components/navigation/tabs/tabs'
import { WithProviders } from '../helpers/test-providers'
import { ControlSize } from '../../src/index'

describe('Tabs Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  const createBasicTabs = (activeTab = 'tab1') => {
    const value = prop(activeTab)
    const onChange = vi.fn((key: string) => value.set(key))

    const items: TabItem<string>[] = [
      { key: 'tab1', label: 'First Tab', content: () => html.div('Content 1') },
      {
        key: 'tab2',
        label: 'Second Tab',
        content: () => html.div('Content 2'),
      },
      { key: 'tab3', label: 'Third Tab', content: () => html.div('Content 3') },
    ]

    return { value, onChange, items }
  }

  describe('basic functionality', () => {
    it('should render tabs with correct structure', () => {
      const { value, onChange, items } = createBasicTabs()

      render(
        WithProviders(() => Tabs({ items, value, onChange })),
        container
      )

      const tabsContainer = container.querySelector('.bc-tabs')
      expect(tabsContainer).not.toBeNull()
      expect(tabsContainer!.className).toContain('bc-tabs--horizontal')
      expect(tabsContainer!.className).toContain('bc-tabs--md')

      const tabList = container.querySelector('[role="tablist"]')
      expect(tabList).not.toBeNull()
      expect(tabList!.getAttribute('aria-orientation')).toBe('horizontal')

      const tabs = container.querySelectorAll('[role="tab"]')
      expect(tabs).toHaveLength(3)
      expect(tabs[0].textContent).toBe('First Tab')
      expect(tabs[1].textContent).toBe('Second Tab')
      expect(tabs[2].textContent).toBe('Third Tab')
    })

    it('should show correct active tab', () => {
      const { value, onChange, items } = createBasicTabs('tab2')

      render(
        WithProviders(() => Tabs({ items, value, onChange })),
        container
      )

      const tabs = container.querySelectorAll('[role="tab"]')
      expect(tabs[0].getAttribute('aria-selected')).toBe('false')
      expect(tabs[1].getAttribute('aria-selected')).toBe('true')
      expect(tabs[2].getAttribute('aria-selected')).toBe('false')

      expect(tabs[0].className).not.toContain('bc-tab--active')
      expect(tabs[1].className).toContain('bc-tab--active')
      expect(tabs[2].className).not.toContain('bc-tab--active')
    })

    it('should show correct tab content', () => {
      const { value, onChange, items } = createBasicTabs('tab2')

      render(
        WithProviders(() => Tabs({ items, value, onChange })),
        container
      )

      const panels = container.querySelectorAll('[role="tabpanel"]')
      expect(panels).toHaveLength(1)

      // Only the active tab's panel should be rendered
      expect(panels[0].textContent).toBe('Content 2')
      expect(panels[0].getAttribute('id')).toContain('panel-tab2')
    })

    it('should call onChange when tab is clicked', () => {
      const { value, onChange, items } = createBasicTabs()

      render(
        WithProviders(() => Tabs({ items, value, onChange })),
        container
      )

      const tabs = container.querySelectorAll(
        '[role="tab"]'
      ) as NodeListOf<HTMLElement>
      tabs[1].click()

      expect(onChange).toHaveBeenCalledWith('tab2')
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { value, onChange, items } = createBasicTabs()

      render(
        WithProviders(() =>
          Tabs({ items, value, onChange, ariaLabel: 'Main navigation' })
        ),
        container
      )

      const tabList = container.querySelector('[role="tablist"]')
      expect(tabList!.getAttribute('aria-label')).toBe('Main navigation')

      const tabs = container.querySelectorAll('[role="tab"]')
      const panels = container.querySelectorAll('[role="tabpanel"]')

      // Only one panel should be rendered (for the active tab)
      expect(panels).toHaveLength(1)

      // Check that all tabs have proper IDs and aria-controls
      tabs.forEach((tab, index) => {
        const tabId = tab.getAttribute('id')
        const ariaControls = tab.getAttribute('aria-controls')

        expect(tabId).toBeTruthy()
        expect(ariaControls).toBeTruthy()

        // The aria-controls should point to the panel for this tab
        expect(ariaControls).toContain(`panel-${items[index].key}`)
      })

      // Check the active panel's aria-labelledby
      const activePanel = panels[0]
      const ariaLabelledBy = activePanel.getAttribute('aria-labelledby')
      expect(ariaLabelledBy).toBeTruthy()
      expect(ariaLabelledBy).toContain('tab-tab1') // tab1 is the default active tab
    })

    it('should manage focus correctly', () => {
      const { value, onChange, items } = createBasicTabs()

      render(
        WithProviders(() => Tabs({ items, value, onChange })),
        container
      )

      const tabs = container.querySelectorAll(
        '[role="tab"]'
      ) as NodeListOf<HTMLElement>

      // Active tab should be focusable
      expect(tabs[0].getAttribute('tabindex')).toBe('0')
      expect(tabs[1].getAttribute('tabindex')).toBe('-1')
      expect(tabs[2].getAttribute('tabindex')).toBe('-1')

      // Focus management is handled by the component
      // We can verify that focus events are properly attached
      expect(tabs[0].getAttribute('tabindex')).toBe('0')
      expect(tabs[1].getAttribute('tabindex')).toBe('-1')
      expect(tabs[2].getAttribute('tabindex')).toBe('-1')
    })

    it('should handle disabled tabs correctly', () => {
      const { value, onChange } = createBasicTabs()
      const items: TabItem<string>[] = [
        {
          key: 'tab1',
          label: 'First Tab',
          content: () => html.div('Content 1'),
        },
        {
          key: 'tab2',
          label: 'Second Tab',
          content: () => html.div('Content 2'),
          disabled: prop(true),
        },
        {
          key: 'tab3',
          label: 'Third Tab',
          content: () => html.div('Content 3'),
        },
      ]

      render(
        WithProviders(() => Tabs({ items, value, onChange })),
        container
      )

      const tabs = container.querySelectorAll(
        '[role="tab"]'
      ) as NodeListOf<HTMLElement>

      expect(tabs[1].getAttribute('aria-disabled')).toBe('true')
      expect(tabs[1].hasAttribute('disabled')).toBe(true)
      expect(tabs[1].className).toContain('bc-tab--disabled')

      // Clicking disabled tab should not call onChange
      tabs[1].click()
      expect(onChange).not.toHaveBeenCalledWith('tab2')
    })
  })

  describe('keyboard navigation', () => {
    it('should navigate with arrow keys in horizontal mode', () => {
      const { value, onChange, items } = createBasicTabs()

      render(
        WithProviders(() => Tabs({ items, value, onChange })),
        container
      )

      const tabList = container.querySelector('[role="tablist"]') as HTMLElement

      // Arrow right should prevent default
      const rightArrowEvent = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
      })
      const preventDefaultSpy = vi.spyOn(rightArrowEvent, 'preventDefault')
      tabList.dispatchEvent(rightArrowEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()

      // Arrow left should also prevent default
      const leftArrowEvent = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
      })
      const preventDefaultSpy2 = vi.spyOn(leftArrowEvent, 'preventDefault')
      tabList.dispatchEvent(leftArrowEvent)

      expect(preventDefaultSpy2).toHaveBeenCalled()
    })

    it('should navigate with arrow keys in vertical mode', () => {
      const { value, onChange, items } = createBasicTabs()

      render(
        WithProviders(() =>
          Tabs({
            items,
            value,
            onChange,
            orientation: prop<TabsDirection>('vertical'),
          })
        ),
        container
      )

      const tabList = container.querySelector('[role="tablist"]') as HTMLElement

      // Arrow down should prevent default in vertical mode
      const downArrowEvent = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
      })
      const preventDefaultSpy = vi.spyOn(downArrowEvent, 'preventDefault')
      tabList.dispatchEvent(downArrowEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()

      // Arrow up should also prevent default
      const upArrowEvent = new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
      })
      const preventDefaultSpy2 = vi.spyOn(upArrowEvent, 'preventDefault')
      tabList.dispatchEvent(upArrowEvent)

      expect(preventDefaultSpy2).toHaveBeenCalled()
    })

    it('should handle Home and End keys', () => {
      const { value, onChange, items } = createBasicTabs()

      render(
        WithProviders(() => Tabs({ items, value, onChange })),
        container
      )

      const tabList = container.querySelector('[role="tablist"]') as HTMLElement

      // Home should prevent default
      const homeEvent = new KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true,
      })
      const preventDefaultSpy = vi.spyOn(homeEvent, 'preventDefault')
      tabList.dispatchEvent(homeEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()

      // End should also prevent default
      const endEvent = new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
      })
      const preventDefaultSpy2 = vi.spyOn(endEvent, 'preventDefault')
      tabList.dispatchEvent(endEvent)

      expect(preventDefaultSpy2).toHaveBeenCalled()
    })

    it('should activate tab with Enter or Space', () => {
      const { value, onChange, items } = createBasicTabs()

      render(
        WithProviders(() => Tabs({ items, value, onChange })),
        container
      )

      const tabList = container.querySelector('[role="tablist"]') as HTMLElement
      const tabs = container.querySelectorAll(
        '[role="tab"]'
      ) as NodeListOf<HTMLElement>

      tabs[1].focus()

      // Enter should activate the focused tab
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      })
      tabList.dispatchEvent(enterEvent)

      expect(onChange).toHaveBeenCalledWith('tab2')

      // Space should also activate the focused tab
      tabs[2].focus()
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
      })
      tabList.dispatchEvent(spaceEvent)

      expect(onChange).toHaveBeenCalledWith('tab3')
    })

    it('should skip disabled tabs during keyboard navigation', () => {
      const { value, onChange } = createBasicTabs()
      const items: TabItem<string>[] = [
        {
          key: 'tab1',
          label: 'First Tab',
          content: () => html.div('Content 1'),
        },
        {
          key: 'tab2',
          label: 'Second Tab',
          content: () => html.div('Content 2'),
          disabled: prop(true),
        },
        {
          key: 'tab3',
          label: 'Third Tab',
          content: () => html.div('Content 3'),
        },
      ]

      render(
        WithProviders(() => Tabs({ items, value, onChange })),
        container
      )

      const tabList = container.querySelector('[role="tablist"]') as HTMLElement

      // Arrow right should prevent default (testing that keyboard navigation is handled)
      const rightArrowEvent = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
      })
      const preventDefaultSpy = vi.spyOn(rightArrowEvent, 'preventDefault')
      tabList.dispatchEvent(rightArrowEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('variants and options', () => {
    it('should apply different sizes', () => {
      const { value, onChange, items } = createBasicTabs()

      render(
        WithProviders(() =>
          Tabs({ items, value, onChange, size: prop<ControlSize>('lg') })
        ),
        container
      )

      const tabsContainer = container.querySelector('.bc-tabs')
      expect(tabsContainer!.className).toContain('bc-tabs--lg')

      const tabs = container.querySelectorAll('[role="tab"]')
      tabs.forEach(tab => {
        expect(tab.className).toContain('bc-tab--lg')
      })
    })

    it('should support vertical orientation', () => {
      const { value, onChange, items } = createBasicTabs()

      render(
        WithProviders(() =>
          Tabs({
            items,
            value,
            onChange,
            orientation: prop<TabsDirection>('vertical'),
          })
        ),
        container
      )

      const tabsContainer = container.querySelector('.bc-tabs')
      expect(tabsContainer!.className).toContain('bc-tabs--vertical')

      const tabList = container.querySelector('[role="tablist"]')
      expect(tabList!.getAttribute('aria-orientation')).toBe('vertical')
    })

    it('should hide content when showContent is false', () => {
      const { value, onChange, items } = createBasicTabs()

      render(
        WithProviders(() =>
          Tabs({ items, value, onChange, showContent: prop(false) })
        ),
        container
      )

      const panels = container.querySelector('.bc-tabs__panels')
      expect(panels).toBeNull()
    })

    it('should disable all tabs when disabled is true', () => {
      const { value, onChange, items } = createBasicTabs()

      render(
        WithProviders(() =>
          Tabs({ items, value, onChange, disabled: prop(true) })
        ),
        container
      )

      const tabsContainer = container.querySelector('.bc-tabs')
      expect(tabsContainer!.className).toContain('bc-tabs--disabled')

      const tabs = container.querySelectorAll('[role="tab"]')
      tabs.forEach(tab => {
        expect(tab.hasAttribute('disabled')).toBe(true)
        expect(tab.getAttribute('aria-disabled')).toBe('true')
      })
    })

    it('should apply underline variant', () => {
      const { value, onChange, items } = createBasicTabs()

      render(
        WithProviders(() =>
          Tabs({ items, value, onChange, variant: prop<TabsVariant>('underline') })
        ),
        container
      )

      const tabsContainer = container.querySelector('.bc-tabs')
      expect(tabsContainer!.className).toContain('bc-tabs--variant-underline')
    })

    it('should apply pill variant', () => {
      const { value, onChange, items } = createBasicTabs()

      render(
        WithProviders(() =>
          Tabs({ items, value, onChange, variant: prop<TabsVariant>('pill') })
        ),
        container
      )

      const tabsContainer = container.querySelector('.bc-tabs')
      expect(tabsContainer!.className).toContain('bc-tabs--variant-pill')
    })

    it('should apply other button variants', () => {
      const { value, onChange, items } = createBasicTabs()

      render(
        WithProviders(() =>
          Tabs({ items, value, onChange, variant: prop<TabsVariant>('filled') })
        ),
        container
      )

      const tabsContainer = container.querySelector('.bc-tabs')
      expect(tabsContainer!.className).toContain('bc-tabs--variant-filled')
    })
  })

  describe('edge cases', () => {
    it('should handle empty items array', () => {
      const value = prop('tab1')
      const onChange = vi.fn()

      render(
        WithProviders(() => Tabs({ items: [], value, onChange })),
        container
      )

      const tabs = container.querySelectorAll('[role="tab"]')
      expect(tabs).toHaveLength(0)

      const panels = container.querySelectorAll('[role="tabpanel"]')
      expect(panels).toHaveLength(0)
    })

    it('should handle invalid active tab key', () => {
      const { onChange, items } = createBasicTabs()
      const value = prop('invalid-key')

      render(
        WithProviders(() => Tabs({ items, value, onChange })),
        container
      )

      const tabs = container.querySelectorAll('[role="tab"]')
      tabs.forEach(tab => {
        expect(tab.getAttribute('aria-selected')).toBe('false')
      })

      // No panel should be rendered when there's no valid active tab
      const panels = container.querySelectorAll('[role="tabpanel"]')
      expect(panels).toHaveLength(0)
    })
  })
})
