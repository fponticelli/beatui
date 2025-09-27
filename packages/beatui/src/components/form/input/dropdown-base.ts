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
import { Icon } from '@/components/data'
import { Group } from '@/components/layout'
import { DropdownOption, Option } from './option'
import { ElementRect } from '@tempots/ui'

export type DropdownBaseOptions<T> = InputOptions<T> & {
  role: 'combobox' | 'dropdown'
  display: TNode
  optionsSource: Value<DropdownOption<T>[]>
  allowSpaceToggle?: Value<boolean>
  // Called before opening (e.g., to kick off loading)
  onBeforeOpen?: () => void
  // Called right after opening (e.g., focus search input)
  onAfterOpen?: () => void
  // Build the listbox content (inside the container)
  buildListboxContent: (ctx: {
    dropdownId: string
    listboxId: string
    focusedValue: Signal<T | null>
    handleKeyDown: (ev: KeyboardEvent) => void
    onSelect: (value: T) => void
  }) => TNode
}

export const DropdownBase = <T>(options: DropdownBaseOptions<T>) => {
  const {
    onChange,
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

  const wrappedOnChange = (selectedValue: T) => {
    onChange?.(selectedValue)
    isOpen.set(false)
    focusedIndex.set(-1)
    focusedValue.set(null)
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
          setTimeout(() => onAfterOpen?.(), 0)
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
                // Defer to allow DOM to mount (e.g., focusing search input)
                setTimeout(() => onAfterOpen?.(), 0)
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
