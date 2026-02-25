import {
  aria,
  attr,
  computedOf,
  Empty,
  Fragment,
  html,
  on,
  OnDispose,
  prop,
  Signal,
  style,
  TNode,
  Value,
  WithElement,
} from '@tempots/dom'

import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Flyout } from '../../navigation/flyout'
import { sessionId } from '../../../utils/session-id'
import { Icon } from '../../data'
import { Group } from '../../layout'
import { DropdownOption, Option } from './option'
import { ElementRect } from '@tempots/ui'

/**
 * Options for the {@link DropdownBase} component.
 * Provides a reusable foundation for building dropdown and combobox inputs
 * with full keyboard navigation, flyout positioning, and ARIA attributes.
 *
 * @typeParam T - The type of option values.
 */
export type DropdownBaseOptions<T> = InputOptions<T> & {
  /** ARIA role for the dropdown trigger (`'combobox'` or `'dropdown'`). */
  role: 'combobox' | 'dropdown'
  /** The display content shown in the trigger area (e.g., the selected label). */
  display: TNode
  /** The list of available dropdown options. */
  optionsSource: Value<DropdownOption<T>[]>
  /**
   * Whether pressing the spacebar toggles the dropdown open/closed.
   * @default false
   */
  allowSpaceToggle?: Value<boolean>
  /** Callback invoked before the dropdown opens (e.g., to kick off loading). */
  onBeforeOpen?: () => void
  /** Callback invoked right after the dropdown opens (e.g., to focus search input). */
  onAfterOpen?: () => void
  /**
   * Function that builds the listbox content inside the dropdown flyout.
   * Receives context with IDs, focused value signal, keyboard handler, and selection callback.
   */
  buildListboxContent: (ctx: {
    /** Unique ID for the dropdown trigger element. */
    dropdownId: string
    /** Unique ID for the listbox element. */
    listboxId: string
    /** Signal tracking the currently focused option value. */
    focusedValue: Signal<T | null>
    /** Keyboard event handler for arrow navigation and selection. */
    handleKeyDown: (ev: KeyboardEvent) => void
    /** Callback to invoke when an option is selected. */
    onSelect: (value: T) => void
  }) => TNode
}

/**
 * A reusable base component for building dropdown and combobox inputs.
 *
 * Provides full keyboard navigation (ArrowUp/Down, Enter, Escape, Space),
 * flyout positioning, ARIA attributes for accessibility, and click-to-toggle
 * behavior. The listbox content is delegated to the `buildListboxContent` option,
 * making this a flexible foundation for both `DropdownInput` and `ComboboxInput`.
 *
 * @typeParam T - The type of option values.
 * @param options - Configuration options for the dropdown base.
 * @returns A renderable dropdown base component.
 *
 * @example
 * ```ts
 * DropdownBase({
 *   value: prop(''),
 *   role: 'dropdown',
 *   display: html.span('Select...'),
 *   optionsSource: myOptions,
 *   onChange: v => console.log('Selected:', v),
 *   buildListboxContent: ({ onSelect, focusedValue }) =>
 *     html.div(
 *       // render option items here
 *     ),
 * })
 * ```
 */
export const DropdownBase = <T>(options: DropdownBaseOptions<T>) => {
  const {
    onChange,
    onInput,
    onBlur,
    role,
    display,
    optionsSource,
    allowSpaceToggle = false,
    onBeforeOpen,
    onAfterOpen,
    buildListboxContent,
  } = options

  const isOpen = prop(false)
  const focusedIndex = prop(-1)
  const focusedValue = prop<T | null>(null)

  const dropdownId = sessionId('dropdown')
  const listboxId = sessionId('listbox')

  let triggerElement: HTMLElement | undefined
  let listboxElement: HTMLElement | undefined
  let flyoutHideFn: (() => void) | undefined

  const wrappedOnChange = (selectedValue: T) => {
    onChange?.(selectedValue)
    onInput?.(selectedValue)
    isOpen.set(false)
    focusedIndex.set(-1)
    focusedValue.set(null)
    flyoutHideFn?.()
    triggerElement?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const selectableOptions = Option.getValues(Value.get(optionsSource))
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        if (!isOpen.value) {
          isOpen.set(true)
          if (selectableOptions.length > 0) {
            focusedIndex.set(0)
            focusedValue.set(selectableOptions[0])
          }
        } else {
          const nextIndex = Math.min(
            focusedIndex.value + 1,
            selectableOptions.length - 1
          )
          focusedIndex.set(nextIndex)
          focusedValue.set(selectableOptions[nextIndex] ?? null)
        }
        break
      }
      case 'ArrowUp': {
        event.preventDefault()
        if (isOpen.value) {
          const prevIndex = Math.max(focusedIndex.value - 1, 0)
          focusedIndex.set(prevIndex)
          focusedValue.set(selectableOptions[prevIndex] ?? null)
        }
        break
      }
      case 'Enter': {
        event.preventDefault()
        if (isOpen.value && focusedIndex.value >= 0) {
          const selectedOption = selectableOptions[focusedIndex.value]
          if (selectedOption != null) {
            wrappedOnChange(selectedOption)
          }
        } else {
          // Open and focus first option if available
          onBeforeOpen?.()
          const selectable = Option.getValues(Value.get(optionsSource))
          isOpen.set(true)
          if (selectable.length > 0) {
            focusedIndex.set(0)
            focusedValue.set(selectable[0])
          }
          setTimeout(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                onAfterOpen?.()
              })
            })
          }, 0)
        }
        break
      }
      case 'Escape': {
        if (isOpen.value) {
          event.preventDefault()
          isOpen.set(false)
          focusedIndex.set(-1)
          focusedValue.set(null)
          triggerElement?.focus()
        }
        break
      }
      case ' ': {
        if (Value.get(allowSpaceToggle)) {
          event.preventDefault()
          const selectable = Option.getValues(Value.get(optionsSource))
          isOpen.set(!isOpen.value)
          if (isOpen.value && selectable.length > 0) {
            focusedIndex.set(0)
            focusedValue.set(selectable[0])
          }
        }
        break
      }
    }
  }

  return InputContainer(
    {
      ...options,
      input: Group(
        attr.class('bc-dropdown__trigger'),
        html.span(attr.class('bc-dropdown__display'), display),
        Icon(
          { icon: 'ph:caret-up-down-bold', color: 'neutral' },
          attr.class('bc-dropdown__arrow')
        )
      ),
    },
    ElementRect(rect => {
      return Fragment(
        WithElement(el => {
          triggerElement = el
          el.addEventListener('keydown', handleKeyDown)
          return OnDispose(() =>
            el.removeEventListener('keydown', handleKeyDown)
          )
        }),
        CommonInputAttributes(options),
        attr.id(dropdownId),
        attr.tabindex(0),
        aria.controls(listboxId),
        aria.expanded(isOpen as Value<boolean | 'undefined'>),
        attr.class('bc-dropdown'),
        attr.role(role),
        aria.activedescendant(
          computedOf(
            isOpen,
            focusedValue
          )((open, focused): string =>
            open && focused != null ? `dropdown-option-${String(focused)}` : ''
          )
        ),
        onBlur != null
          ? on.blur(() => {
              setTimeout(() => {
                if (!listboxElement?.contains(document.activeElement)) {
                  isOpen.set(false)
                  focusedIndex.set(-1)
                  onBlur()
                }
              }, 100)
            })
          : Empty,

        Flyout({
          content: () =>
            html.div(
              WithElement(el => {
                listboxElement = el
              }),
              style.minWidth(rect.$.width.map(w => `${w - 10}px`)),
              attr.class('bc-dropdown__listbox'),
              attr.role('listbox'),
              attr.id(listboxId),
              aria.labelledby(dropdownId),
              buildListboxContent({
                dropdownId,
                listboxId,
                focusedValue,
                handleKeyDown,
                onSelect: wrappedOnChange,
              })
            ),
          mainAxisOffset: 0,
          placement: 'bottom-start',
          hasPopup: 'listbox',
          showOn: (flyoutShow, flyoutHide) => {
            const originalHide = flyoutHide
            flyoutHide = () => {
              isOpen.set(false)
              focusedIndex.set(-1)
              focusedValue.set(null)
              originalHide()
            }
            flyoutHideFn = flyoutHide

            const handleClick = () => {
              if (isOpen.value) {
                flyoutHide()
              } else {
                onBeforeOpen?.()
                const selectable = Option.getValues(Value.get(optionsSource))
                isOpen.set(true)
                if (selectable.length > 0) {
                  focusedIndex.set(0)
                  focusedValue.set(selectable[0])
                }
                flyoutShow()
                // Defer until the flyout animation has started (start-opening)
                // so the content is visible and focusable.
                // The flyout opens in setTimeout(0) → rAF → start-opening,
                // so we need setTimeout(0) → rAF → rAF to run after that.
                setTimeout(() => {
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      onAfterOpen?.()
                    })
                  })
                }, 0)
              }
            }

            return on.click(handleClick)
          },
          showDelay: 0,
          hideDelay: 0,
          closable: true,
        })
      )
    })
  )
}
