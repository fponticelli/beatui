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

export type MenuTrigger = FlyoutTrigger

export interface MenuOptions {
  /** The menu items to display */
  items: () => TNode[]
  /** Placement of the menu relative to the trigger element */
  placement?: Value<Placement>
  /** Delay in milliseconds before showing the menu on hover */
  showDelay?: Value<number>
  /** Delay in milliseconds before hiding the menu after mouse leave */
  hideDelay?: Value<number>
  /** Offset in pixels from the main axis */
  mainAxisOffset?: Value<number>
  /** Offset in pixels from the cross axis */
  crossAxisOffset?: Value<number>
  /** How to show the menu (accepts Flyout trigger or a custom trigger function) */
  showOn?: Value<MenuTrigger> | FlyoutTriggerFunction
  /** Whether the menu can be closed with Escape key */
  closable?: Value<boolean>
  /** Callback when menu is closed */
  onClose?: () => void
  /** Callback when a menu item is selected */
  onAction?: (key: string) => void
  /** Accessible label for the menu */
  ariaLabel?: Value<string>
  /** ID of element that labels the menu */
  ariaLabelledBy?: Value<string>
}

export interface MenuItemOptions {
  /** Unique identifier for the menu item */
  key?: Value<string>
  /** The text content of the menu item */
  content: TNode
  /** Content to display at the start of the menu item (icons, indicators) */
  startContent?: TNode
  /** Content to display at the end of the menu item (shortcuts, badges) */
  endContent?: TNode
  /** Whether the menu item is disabled */
  disabled?: Value<boolean>
  /** Callback when the menu item is clicked */
  onClick?: () => void
  /** ARIA label for accessibility */
  ariaLabel?: Value<string>
  /** Submenu items for nested menus */
  submenu?: () => TNode[]
  /** Placement of submenu relative to parent item */
  submenuPlacement?: Value<Placement>
}

export interface MenuSeparatorOptions {
  /** Optional label for the separator */
  label?: TNode
}

/**
 * Menu component that provides a list of actions or options.
 * Built on top of the Flyout component for positioning and overlay behavior.
 *
 * Follows WAI-ARIA menu pattern with proper keyboard navigation and accessibility.
 *
 * @example
 * ```typescript
 * Button(
 *   { onClick: () => {} },
 *   'Actions',
 *   Menu({
 *     items: () => [
 *       MenuItem({ content: 'Edit', onClick: () => console.log('edit') }),
 *       MenuItem({ content: 'Delete', onClick: () => console.log('delete') }),
 *     ]
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

  return Flyout({
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
            const menuItem = target.closest('[role="menuitem"]') as HTMLElement
            if (menuItem && menuItem.getAttribute('aria-disabled') !== 'true') {
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
}

/**
 * MenuItem component for individual menu items.
 *
 * @example
 * ```typescript
 * MenuItem({
 *   content: 'Edit',
 *   startContent: Icon({ icon: 'edit' }),
 *   endContent: html.span('⌘E'),
 *   onClick: () => console.log('edit clicked')
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
    hasSubmenu
      ? WithElement(el => {
          el.setAttribute('aria-haspopup', 'menu')
          return Fragment()
        })
      : Fragment(),
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
 * MenuSeparator component for visual grouping of menu items.
 * Creates a visual divider between groups of menu items.
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
