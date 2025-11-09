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

export interface ToolbarOptions {
  ariaLabel?: Value<string>
}

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

export interface ToolbarButtonOptions extends ButtonOptions {
  iconOnly?: Value<boolean>
  ariaLabel?: Value<string>
}

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

export interface ToolbarGroupOptions {
  ariaLabel?: Value<string>
}

export function ToolbarGroup(...children: TNode[]) {
  return html.div(
    attr.class('bc-toolbar__group'),
    attr.role('group'),
    ...children
  )
}

export function ToolbarDivider() {
  return html.div(
    attr.class('bc-toolbar__divider'),
    attr.role('separator'),
    aria.orientation('vertical')
  )
}

export function ToolbarSpacer() {
  return html.div(attr.class('bc-toolbar__spacer'))
}
