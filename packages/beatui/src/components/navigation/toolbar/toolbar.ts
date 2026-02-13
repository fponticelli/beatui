import {
  TNode,
  Value,
  attr,
  html,
  aria,
  WithElement,
  OnDispose,
} from '@tempots/dom'
import { Button, ButtonOptions } from '../../button/button'

// Focusable selector for roving tabindex inside the toolbar
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[role="button"]:not([aria-disabled="true"])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Configuration options for the {@link Toolbar} component.
 */
export interface ToolbarOptions {
  /**
   * Accessible label for the toolbar (`aria-label`).
   * Provides a descriptive label for screen readers.
   */
  ariaLabel?: Value<string>
}

/**
 * Horizontal toolbar component with roving tabindex keyboard navigation.
 *
 * Renders a `role="toolbar"` container with `aria-orientation="horizontal"`.
 * Implements the WAI-ARIA toolbar pattern:
 * - Arrow Left/Right to move focus between focusable children
 * - Home/End to jump to first/last focusable item
 * - Roving tabindex ensures only one item is tabbable at a time
 *
 * @param children - Toolbar items, typically {@link ToolbarButton}, {@link ToolbarGroup},
 *   {@link ToolbarDivider}, and {@link ToolbarSpacer} components
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * Toolbar(
 *   ToolbarGroup(
 *     ToolbarButton({ onClick: () => bold() }, Icon({ icon: 'bold' })),
 *     ToolbarButton({ onClick: () => italic() }, Icon({ icon: 'italic' })),
 *   ),
 *   ToolbarDivider(),
 *   ToolbarGroup(
 *     ToolbarButton({ onClick: () => alignLeft() }, Icon({ icon: 'align-left' })),
 *     ToolbarButton({ onClick: () => alignCenter() }, Icon({ icon: 'align-center' })),
 *   ),
 *   ToolbarSpacer(),
 *   ToolbarButton({ onClick: () => save() }, 'Save'),
 * )
 * ```
 */
export function Toolbar(...children: TNode[]) {
  return html.div(
    attr.class('bc-toolbar'),
    attr.role('toolbar'),
    aria.orientation('horizontal'),
    // Keyboard navigation with roving tabindex among focusable children
    WithElement(container => {
      const setRoving = () => {
        const items = Array.from(
          container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        )
        if (items.length === 0) return
        // Initialize roving tabindex
        items.forEach((el, i) =>
          el.setAttribute('tabindex', i === 0 ? '0' : '-1')
        )
      }

      const moveFocus = (direction: 1 | -1) => {
        const items = Array.from(
          container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        )
        if (items.length === 0) return
        const currentIndex = items.findIndex(
          el => el === document.activeElement
        )
        const start = currentIndex === -1 ? 0 : currentIndex
        let nextIndex = start + direction
        if (nextIndex < 0) nextIndex = items.length - 1
        if (nextIndex >= items.length) nextIndex = 0
        items.forEach(el => el.setAttribute('tabindex', '-1'))
        const next = items[nextIndex]
        next.setAttribute('tabindex', '0')
        next.focus()
      }

      // Initialize after mount
      setTimeout(setRoving, 0)

      const keydown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault()
            moveFocus(1)
            break
          case 'ArrowLeft':
            e.preventDefault()
            moveFocus(-1)
            break
          case 'Home':
            e.preventDefault()
            moveFocus(-1) // ensure current is -1 then wrap to last then to first
            // Move to first explicitly
            {
              const items = Array.from(
                container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
              )
              if (items.length) {
                items.forEach(el => el.setAttribute('tabindex', '-1'))
                const first = items[0]
                first.setAttribute('tabindex', '0')
                first.focus()
              }
            }
            break
          case 'End':
            e.preventDefault()
            {
              const items = Array.from(
                container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
              )
              if (items.length) {
                items.forEach(el => el.setAttribute('tabindex', '-1'))
                const last = items[items.length - 1]
                last.setAttribute('tabindex', '0')
                last.focus()
              }
            }
            break
        }
      }

      container.addEventListener('keydown', keydown)
      return OnDispose(() => {
        container.removeEventListener('keydown', keydown)
      })
    }),
    ...children
  )
}

/**
 * Configuration options for the {@link ToolbarButton} component.
 * Extends {@link ButtonOptions} with toolbar-specific properties.
 */
export interface ToolbarButtonOptions extends ButtonOptions {
  /**
   * Whether the button displays only an icon without text.
   * When `true`, ensure `ariaLabel` is provided for accessibility.
   */
  iconOnly?: Value<boolean>
  /**
   * Accessible label for the button (`aria-label`).
   * Required when `iconOnly` is `true` to provide a text alternative.
   */
  ariaLabel?: Value<string>
}

/**
 * Button component pre-configured for use inside a {@link Toolbar}.
 *
 * Applies default toolbar styling (neutral color, light variant, medium roundedness)
 * that can be overridden via the options object.
 *
 * @param options - Button configuration options. Defaults are overridden with toolbar-appropriate values.
 * @param children - Child content for the button (text, icons, or both)
 * @returns A renderable button node
 *
 * @example
 * ```typescript
 * ToolbarButton(
 *   { onClick: () => toggleBold() },
 *   Icon({ icon: 'bold', size: 'sm' })
 * )
 * ```
 */
export function ToolbarButton(options: ButtonOptions, ...children: TNode[]) {
  return Button(
    {
      color: 'neutral',
      roundedness: 'md',
      variant: 'light',
      ...options,
    },
    attr.class('bc-toolbar__button'),
    ...children
  )
}

/**
 * Configuration options for the {@link ToolbarGroup} component.
 */
export interface ToolbarGroupOptions {
  /**
   * Accessible label for the toolbar group (`aria-label`).
   * Provides a descriptive label for screen readers.
   */
  ariaLabel?: Value<string>
}

/**
 * Groups related toolbar items together within a {@link Toolbar}.
 *
 * Renders a `role="group"` container that visually and semantically groups
 * related buttons or controls.
 *
 * @param children - Toolbar items to group (e.g., {@link ToolbarButton} components)
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * ToolbarGroup(
 *   ToolbarButton({ onClick: () => bold() }, Icon({ icon: 'bold' })),
 *   ToolbarButton({ onClick: () => italic() }, Icon({ icon: 'italic' })),
 *   ToolbarButton({ onClick: () => underline() }, Icon({ icon: 'underline' })),
 * )
 * ```
 */
export function ToolbarGroup(...children: TNode[]) {
  return html.div(
    attr.class('bc-toolbar__group'),
    attr.role('group'),
    ...children
  )
}

/**
 * Visual divider for separating groups of items within a {@link Toolbar}.
 *
 * Renders a `role="separator"` element with vertical orientation.
 *
 * @returns A renderable divider node
 *
 * @example
 * ```typescript
 * Toolbar(
 *   ToolbarGroup(boldBtn, italicBtn),
 *   ToolbarDivider(),
 *   ToolbarGroup(alignLeftBtn, alignCenterBtn),
 * )
 * ```
 */
export function ToolbarDivider() {
  return html.div(
    attr.class('bc-toolbar__divider'),
    attr.role('separator'),
    aria.orientation('vertical')
  )
}

/**
 * Flexible spacer that pushes toolbar items apart within a {@link Toolbar}.
 *
 * Uses CSS flex to fill available space, creating a gap between the items
 * before and after it.
 *
 * @returns A renderable spacer node
 *
 * @example
 * ```typescript
 * Toolbar(
 *   ToolbarGroup(editBtns),
 *   ToolbarSpacer(),
 *   ToolbarButton({ onClick: save }, 'Save'),
 * )
 * ```
 */
export function ToolbarSpacer() {
  return html.div(attr.class('bc-toolbar__spacer'))
}
