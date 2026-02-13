import {
  TNode,
  Value,
  Fragment,
  attr,
  html,
  prop,
  computedOf,
  on,
  OnDispose,
  WithElement,
  aria,
  dataAttr,
  Renderable,
} from '@tempots/dom'
import { Placement } from '@tempots/ui'
import { Flyout, FlyoutTrigger, FlyoutTriggerFunction } from './flyout'
import { sessionId } from '../../utils/session-id'

/**
 * Trigger mode for the {@link Menu} component.
 * Alias for {@link FlyoutTrigger} -- controls how the menu is shown (e.g., `'click'`, `'hover'`).
 */
export type MenuTrigger = FlyoutTrigger

/**
 * Configuration options for the {@link Menu} component.
 */
export interface MenuOptions {
  /**
   * Factory function returning the array of menu items (created via {@link MenuItem},
   * {@link MenuSeparator}, or custom nodes with `role="menuitem"`).
   */
  items: () => TNode[]
  /**
   * Placement of the menu relative to the trigger element.
   * @default 'bottom-start'
   */
  placement?: Value<Placement>
  /**
   * Delay in milliseconds before showing the menu after trigger activation.
   * @default 0
   */
  showDelay?: Value<number>
  /**
   * Delay in milliseconds before hiding the menu after trigger deactivation.
   * @default 100
   */
  hideDelay?: Value<number>
  /**
   * Offset in pixels from the main axis.
   * @default 4
   */
  mainAxisOffset?: Value<number>
  /**
   * Offset in pixels from the cross axis.
   * @default 0
   */
  crossAxisOffset?: Value<number>
  /**
   * How the menu is triggered to show and hide.
   * Accepts a built-in {@link MenuTrigger} string or a custom {@link FlyoutTriggerFunction}.
   * @default 'click'
   */
  showOn?: Value<MenuTrigger> | FlyoutTriggerFunction
  /**
   * Whether the menu can be closed with the Escape key or by clicking outside.
   * @default true
   */
  closable?: Value<boolean>
  /**
   * Callback invoked when the menu is closed (via Escape, click outside, or after item activation).
   */
  onClose?: () => void
  /**
   * Callback invoked when a menu item with a `key` is activated (via click or keyboard).
   * Receives the menu item's `key` as an argument.
   */
  onAction?: (key: string) => void
  /**
   * Accessible label for the menu container (`aria-label`).
   */
  ariaLabel?: Value<string>
  /**
   * ID of the element that labels the menu (`aria-labelledby`).
   */
  ariaLabelledBy?: Value<string>
}

/**
 * Configuration options for the {@link MenuItem} component.
 */
export interface MenuItemOptions {
  /**
   * Unique identifier for the menu item. Used by the `onAction` callback in {@link MenuOptions}.
   * When not provided, a unique session ID is generated automatically.
   */
  key?: Value<string>
  /**
   * Primary text or node content displayed as the menu item label.
   */
  content: TNode
  /**
   * Optional content displayed at the start (left side) of the menu item,
   * typically used for icons or selection indicators.
   */
  startContent?: TNode
  /**
   * Optional content displayed at the end (right side) of the menu item,
   * typically used for keyboard shortcuts or badges.
   */
  endContent?: TNode
  /**
   * Whether the menu item is disabled. Disabled items are skipped by keyboard
   * navigation and cannot be activated.
   * @default false
   */
  disabled?: Value<boolean>
  /**
   * Callback invoked when the menu item is clicked or activated via keyboard.
   */
  onClick?: () => void
  /**
   * Accessible label for the menu item (`aria-label`).
   */
  ariaLabel?: Value<string>
  /**
   * Factory function returning submenu items for nested menus.
   * When provided, the menu item gains a hover-triggered submenu.
   */
  submenu?: () => TNode[]
  /**
   * Placement of the submenu relative to the parent menu item.
   * @default 'right-start'
   */
  submenuPlacement?: Value<Placement>
}

/**
 * Configuration options for the {@link MenuSeparator} component.
 */
export interface MenuSeparatorOptions {
  /**
   * Optional label displayed alongside the separator line,
   * useful for grouping related menu items under a heading.
   */
  label?: TNode
}

/**
 * Dropdown menu component that provides a list of actions or options.
 *
 * Built on top of the {@link Flyout} component for positioning and overlay behavior.
 * Follows the WAI-ARIA menu pattern with full keyboard navigation support:
 * - Arrow Up/Down to navigate items
 * - Home/End to jump to first/last item
 * - Enter/Space to activate the focused item
 * - Escape to close
 * - Arrow Right to open submenus, Arrow Left to close them
 *
 * Focus is restored to the trigger element when the menu closes.
 *
 * @param options - Configuration options for menu behavior, positioning, and accessibility
 * @returns A renderable node to be placed inside the trigger element
 *
 * @example
 * ```typescript
 * Button(
 *   { variant: 'outline' },
 *   'Actions',
 *   Menu({
 *     items: () => [
 *       MenuItem({ content: 'Edit', key: 'edit', onClick: () => console.log('edit') }),
 *       MenuItem({ content: 'Duplicate', key: 'dup' }),
 *       MenuSeparator(),
 *       MenuItem({ content: 'Delete', key: 'delete', disabled: true }),
 *     ],
 *     onAction: (key) => console.log('Selected:', key),
 *     placement: 'bottom-start',
 *   })
 * )
 * ```
 */
export function Menu(options: MenuOptions): Renderable {
  const {
    items,
    placement = 'bottom-start',
    showDelay = 0,
    hideDelay = 100,
    mainAxisOffset = 4,
    crossAxisOffset = 0,
    showOn = 'click',
    closable = true,
    onClose,
    onAction,
    ariaLabel,
    ariaLabelledBy,
  } = options

  const menuId = sessionId('menu')
  const focusedItemIndex = prop<number>(-1)
  const menuItems = prop<HTMLElement[]>([])
  let previouslyFocusedElement: HTMLElement | null = null

  return Fragment(
    Flyout({
      content: () => {
        return WithElement(menuElement => {
          // Store previously focused element for restoration
          previouslyFocusedElement = document.activeElement as HTMLElement
          // Helper function to find next focusable item (skipping disabled items)
          const findNextFocusableItem = (
            currentIndex: number,
            items: HTMLElement[],
            direction: number
          ): number => {
            if (items.length === 0) return -1

            let nextIndex = currentIndex + direction
            let attempts = 0

            // Wrap around and search for non-disabled items
            while (attempts < items.length) {
              if (nextIndex >= items.length) nextIndex = 0
              if (nextIndex < 0) nextIndex = items.length - 1

              const item = items[nextIndex]
              if (item && item.getAttribute('aria-disabled') !== 'true') {
                return nextIndex
              }

              nextIndex += direction
              attempts++
            }

            return currentIndex // Return current if no focusable items found
          }

          // Set up keyboard navigation
          const handleKeyDown = (event: KeyboardEvent) => {
            const items = menuItems.value
            const currentIndex = focusedItemIndex.value

            switch (event.key) {
              case 'ArrowDown':
                event.preventDefault()
                event.stopPropagation()
                const nextIndex = findNextFocusableItem(currentIndex, items, 1)
                focusMenuItem(nextIndex, items)
                break

              case 'ArrowUp':
                event.preventDefault()
                event.stopPropagation()
                const prevIndex = findNextFocusableItem(currentIndex, items, -1)
                focusMenuItem(prevIndex, items)
                break

              case 'Enter':
              case ' ':
                event.preventDefault()
                event.stopPropagation()
                if (currentIndex >= 0 && items[currentIndex]) {
                  const menuItem = items[currentIndex]
                  // Check if item is disabled
                  if (menuItem.getAttribute('aria-disabled') === 'true') {
                    return
                  }

                  const key = menuItem.getAttribute('data-key')
                  if (key && onAction) {
                    onAction(key)
                  }
                  menuItem.click()
                  onClose?.() // Close menu after activation
                }
                break

              case 'Escape':
                // Call the Menu's onClose callback first
                onClose?.()
                // Let the event propagate to the Flyout so it can also handle Escape
                // Don't prevent default or stop propagation
                break

              case 'Home':
                event.preventDefault()
                event.stopPropagation()
                if (items.length > 0) {
                  focusMenuItem(0, items)
                }
                break

              case 'End':
                event.preventDefault()
                event.stopPropagation()
                if (items.length > 0) {
                  focusMenuItem(items.length - 1, items)
                }
                break

              case 'ArrowRight':
                event.preventDefault()
                event.stopPropagation()
                // Open submenu if current item has one
                if (currentIndex >= 0 && items[currentIndex]) {
                  const menuItem = items[currentIndex]
                  const hasSubmenu = menuItem.classList.contains(
                    'bc-menu-item--has-submenu'
                  )
                  if (hasSubmenu) {
                    // Trigger submenu opening (implementation depends on submenu structure)
                    menuItem.dispatchEvent(new Event('mouseenter'))
                  }
                }
                break

              case 'ArrowLeft':
                event.preventDefault()
                event.stopPropagation()
                // Close current menu if it's a submenu (basic implementation)
                // This would need to be enhanced for proper submenu hierarchy
                onClose?.()
                break
            }
          }

          const focusMenuItem = (index: number, items: HTMLElement[]) => {
            // Remove focus from current item
            if (focusedItemIndex.value >= 0 && items[focusedItemIndex.value]) {
              items[focusedItemIndex.value].classList.remove(
                'bc-menu-item--focused'
              )
              items[focusedItemIndex.value].removeAttribute('aria-selected')
            }

            // Focus new item
            if (index >= 0 && items[index]) {
              items[index].classList.add('bc-menu-item--focused')
              items[index].setAttribute('aria-selected', 'true')
              focusedItemIndex.set(index)

              // Scroll item into view if needed (check for method availability in test environments)
              if (typeof items[index].scrollIntoView === 'function') {
                items[index].scrollIntoView({ block: 'nearest' })
              }
            }
          }

          // Update menu items when content changes
          const updateMenuItems = () => {
            const itemElements = Array.from(
              menuElement.querySelectorAll('[role="menuitem"]')
            ) as HTMLElement[]
            menuItems.set(itemElements)

            // Set initial focus on first non-disabled item
            if (itemElements.length > 0) {
              const firstEnabledIndex = itemElements.findIndex(
                item => item.getAttribute('aria-disabled') !== 'true'
              )
              if (firstEnabledIndex >= 0) {
                focusMenuItem(firstEnabledIndex, itemElements)
              }
            }
          }

          // Set up mutation observer to track menu items
          const observer = new MutationObserver(updateMenuItems)
          observer.observe(menuElement, { childList: true, subtree: true })

          // Initial setup
          setTimeout(() => {
            updateMenuItems()
            // Focus the menu container for keyboard navigation
            menuElement.focus()
          }, 0)

          // Add document-level keyboard listener
          document.addEventListener('keydown', handleKeyDown, true)

          return Fragment(
            OnDispose(() => {
              observer.disconnect()
              document.removeEventListener('keydown', handleKeyDown, true)
              // Restore focus when menu is disposed
              if (previouslyFocusedElement) {
                previouslyFocusedElement.focus()
              }
            }),
            attr.class('bc-menu'),
            attr.id(menuId),
            attr.role('menu'),
            attr.tabindex(-1),
            aria.orientation('vertical'),
            ariaLabel ? aria.label(ariaLabel) : Fragment(),
            ariaLabelledBy ? aria.labelledby(ariaLabelledBy) : Fragment(),
            aria.activedescendant(
              focusedItemIndex.map(index => {
                const items = menuItems.value
                return index >= 0 && items[index]
                  ? items[index].id || `${menuId}-item-${index}`
                  : ''
              })
            ),
            on.click((event: MouseEvent) => {
              const target = event.target as HTMLElement
              const menuItem = target.closest(
                '[role="menuitem"]'
              ) as HTMLElement
              if (
                menuItem &&
                menuItem.getAttribute('aria-disabled') !== 'true'
              ) {
                const key = menuItem.getAttribute('data-key')
                if (key && onAction) {
                  onAction(key)
                }
              }
            }),

            // Live region for screen reader announcements
            html.div(
              attr.class('sr-only'),
              aria.live('polite'),
              aria.atomic(true),
              focusedItemIndex.map(index => {
                const items = menuItems.value
                if (index >= 0 && items[index]) {
                  const itemText = items[index].textContent || ''
                  const isDisabled =
                    items[index].getAttribute('aria-disabled') === 'true'
                  return isDisabled
                    ? `${itemText}, disabled`
                    : `${itemText}, ${index + 1} of ${items.length}`
                }
                return ''
              })
            ),

            ...items()
          )
        })
      },
      placement,
      showDelay,
      hideDelay,
      mainAxisOffset,
      crossAxisOffset,
      showOn,
      closable,
      role: 'menu',
    })
  )
}

/**
 * Individual menu item component with optional start/end content and submenu support.
 *
 * Renders a `role="menuitem"` element with proper ARIA attributes for disabled state,
 * selection state, and submenu expansion. Disabled items prevent click propagation
 * and are skipped by keyboard navigation.
 *
 * @param options - Configuration options for the menu item's content, behavior, and accessibility
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * MenuItem({
 *   key: 'edit',
 *   content: 'Edit',
 *   startContent: Icon({ icon: 'edit', size: 'sm' }),
 *   endContent: html.span(attr.class('shortcut'), 'Ctrl+E'),
 *   onClick: () => console.log('edit clicked'),
 * })
 * ```
 *
 * @example
 * ```typescript
 * // Menu item with a submenu
 * MenuItem({
 *   content: 'Export as...',
 *   submenu: () => [
 *     MenuItem({ content: 'PDF', onClick: () => exportAs('pdf') }),
 *     MenuItem({ content: 'CSV', onClick: () => exportAs('csv') }),
 *   ],
 * })
 * ```
 */
export function MenuItem(options: MenuItemOptions): Renderable {
  const {
    key,
    content,
    startContent,
    endContent,
    disabled = false,
    onClick,
    ariaLabel,
    submenu,
    submenuPlacement = 'right-start',
  } = options

  const itemKey = key ?? sessionId('menu-item')
  const itemId = `menu-item-${itemKey}`
  const hasSubmenu = submenu != null

  return html.div(
    attr.class(
      computedOf(disabled)(
        disabled =>
          `bc-menu-item ${disabled ? 'bc-menu-item--disabled' : ''} ${hasSubmenu ? 'bc-menu-item--has-submenu' : ''}`
      )
    ),
    attr.id(itemId),
    attr.role('menuitem'),
    attr.tabindex(-1),
    dataAttr.key(itemKey),
    aria.disabled(disabled),
    aria.selected(false), // Will be updated by focus management
    hasSubmenu ? aria.expanded(false) : Fragment(),
    ariaLabel ? aria.label(ariaLabel) : Fragment(),
    on.click(event => {
      if (Value.get(disabled)) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      onClick?.()
    }),

    // Start content
    startContent && html.span(attr.class('bc-menu-item__start'), startContent),

    // Main content
    html.span(attr.class('bc-menu-item__content'), content),

    // End content
    endContent && html.span(attr.class('bc-menu-item__end'), endContent),

    // Submenu (if present)
    hasSubmenu && submenu
      ? Flyout({
          content: () =>
            Fragment(
              attr.class('bc-menu bc-submenu'),
              attr.role('menu'),
              ...submenu()
            ),
          placement: submenuPlacement,
          showOn: 'hover',
          hasPopup: 'menu',
          showDelay: 100,
          hideDelay: 300,
          mainAxisOffset: 0,
          crossAxisOffset: 0,
          role: 'menu',
        })
      : Fragment()
  )
}

/**
 * Visual separator for grouping related menu items within a {@link Menu}.
 *
 * Renders a `role="separator"` element with horizontal orientation. An optional label
 * can be provided to act as a section heading for the items below.
 *
 * @param options - Optional configuration with a label for the separator
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * Menu({
 *   items: () => [
 *     MenuItem({ content: 'Cut' }),
 *     MenuItem({ content: 'Copy' }),
 *     MenuSeparator(),
 *     MenuItem({ content: 'Paste' }),
 *   ]
 * })
 * ```
 *
 * @example
 * ```typescript
 * // With a labeled section
 * MenuSeparator({ label: 'Advanced' })
 * ```
 */
export function MenuSeparator(options: MenuSeparatorOptions = {}): Renderable {
  const { label } = options

  return html.div(
    attr.class('bc-menu-separator'),
    attr.role('separator'),
    aria.orientation('horizontal'),
    label && html.span(attr.class('bc-menu-separator__label'), label)
  )
}
