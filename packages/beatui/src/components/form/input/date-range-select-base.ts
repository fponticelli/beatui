import {
  aria,
  attr,
  Empty,
  Fragment,
  html,
  on,
  OnDispose,
  prop,
  style,
  TNode,
  Value,
  WithElement,
} from '@tempots/dom'
import { InputContainer, InputIcon } from './input-container'
import { CommonInputAttributes, CommonInputOptions } from './input-options'
import { Flyout } from '../../navigation/flyout'
import { sessionId } from '../../../utils/session-id'
import { ElementRect } from '@tempots/ui'

/**
 * Internal base options for the date range select shell (trigger + flyout).
 * The actual picker content is provided via `panelContent`.
 */
export interface DateRangeSelectShellOptions extends CommonInputOptions {
  /** The display text shown in the trigger. */
  displayText: Value<string>
  /** The content to render inside the flyout panel. */
  panelContent: TNode
  /** Callback invoked on blur. */
  onBlur?: () => void
  /** Content to render before the display text. */
  before?: TNode
  /** Content to render after the display text. */
  after?: TNode
}

/**
 * Shared shell for date range selectors: trigger button + flyout panel.
 * Used by both DateRangeSelect and OpenDateRangeSelect.
 */
export function DateRangeSelectShell(
  options: DateRangeSelectShellOptions
): TNode {
  const { displayText, panelContent, onBlur, disabled = false } = options

  const isOpen = prop(false)
  const triggerId = sessionId('date-range-select')
  const panelId = sessionId('date-range-panel')

  let triggerElement: HTMLElement | undefined
  let panelElement: HTMLElement | undefined

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ': {
        event.preventDefault()
        isOpen.set(!isOpen.value)
        break
      }
      case 'Escape': {
        if (isOpen.value) {
          event.preventDefault()
          isOpen.set(false)
          triggerElement?.focus()
        }
        break
      }
    }
  }

  return InputContainer(
    {
      ...options,
      input: html.span(attr.class('bc-dropdown__trigger'), displayText),
      after: Fragment(
        InputIcon({
          icon: 'lucide:calendar',
          color: 'neutral',
          size: 'sm',
        }),
        options.after
      ),
    },
    ElementRect(rect =>
      Fragment(
        WithElement(el => {
          triggerElement = el
          const handleClick = () => {
            if (Value.get(disabled)) return
            isOpen.set(!isOpen.value)
          }
          el.addEventListener('keydown', handleKeyDown)
          el.addEventListener('click', handleClick)
          return OnDispose(() => {
            el.removeEventListener('keydown', handleKeyDown)
            el.removeEventListener('click', handleClick)
          })
        }),
        CommonInputAttributes(options),
        attr.id(triggerId),
        attr.tabindex(0),
        aria.controls(panelId),
        aria.expanded(isOpen as Value<boolean | 'undefined'>),
        attr.class('bc-dropdown bc-date-range-select'),
        attr.role('combobox'),
        onBlur != null
          ? on.blur(() => {
              requestAnimationFrame(() => {
                if (
                  !panelElement?.contains(document.activeElement) &&
                  !triggerElement?.contains(document.activeElement)
                ) {
                  isOpen.set(false)
                  onBlur()
                }
              })
            })
          : Empty,
        Flyout({
          content: () =>
            html.div(
              WithElement(el => {
                panelElement = el
              }),
              style.minWidth(rect.$.width.map(w => `${Math.max(w, 300)}px`)),
              attr.class('bc-date-range-select__panel'),
              attr.id(panelId),
              on.keydown(e => {
                if (e.key === 'Escape') {
                  isOpen.set(false)
                  triggerElement?.focus()
                }
              }),
              panelContent
            ),
          mainAxisOffset: 0,
          placement: 'bottom-start',
          hasPopup: 'dialog',
          open: isOpen,
          showOn: 'never',
          showDelay: 0,
          hideDelay: 0,
          closable: true,
        })
      )
    )
  )
}
