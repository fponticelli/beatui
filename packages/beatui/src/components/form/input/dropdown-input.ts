import {
  attr,
  Empty,
  Ensure,
  ForEach,
  Fragment,
  html,
  computedOf,
  on,
  OnDispose,
  WithElement,
  OneOfType,
  Renderable,
  Signal,
  Value,
  Use,
  TNode,
  prop,
  When,
  aria,
  coalesce,
  Merge,
} from '@tempots/dom'

import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Expando } from '../../misc/expando'
import { BeatUII18n } from '@/beatui-i18n'
import { Flyout } from '../../navigation/flyout'
import { sessionId } from '../../../utils/session-id'
import { Icon } from '@/components/data'
import { Group } from '@/components/layout'
import {
  BaseControllerOptions,
  ControllerOptions,
  makeOnBlurHandler,
  makeOnChangeHandler,
} from '../control'
import { InputWrapper } from './input-wrapper'

// Extend existing SelectOption types to support rich content
export type DropdownValueOption<T> = {
  type: 'value'
  value: T
  label: string
  disabled?: boolean
  before?: TNode
  after?: TNode
}

export type DropdownGroupOption<T> = {
  type: 'group'
  group: string
  options: DropdownValueOption<T>[]
  disabled?: boolean
}

export type DropdownBreakOption = { type: 'break' }

export type DropdownOption<T> =
  | DropdownValueOption<T>
  | DropdownGroupOption<T>
  | DropdownBreakOption

// Helper functions similar to SelectOption
export const DropdownOption = {
  value: <T>(
    value: T,
    label: string,
    options?: {
      disabled?: boolean
      before?: TNode
      after?: TNode
    }
  ) =>
    ({
      type: 'value',
      value,
      label,
      disabled: options?.disabled,
      before: options?.before,
      after: options?.after,
    }) as DropdownValueOption<T>,

  group: <T>(
    group: string,
    options: (DropdownValueOption<T> | DropdownBreakOption)[],
    disabled?: boolean
  ) =>
    ({
      type: 'group',
      group,
      options,
      disabled,
    }) as DropdownGroupOption<T>,

  break: { type: 'break' } as DropdownBreakOption,

  getOptionValues: <T>(options: DropdownOption<T>[]): T[] => {
    return options.flatMap(o =>
      o.type === 'group'
        ? DropdownOption.getOptionValues(o.options as DropdownOption<T>[])
        : o.type === 'break'
          ? []
          : [o.value]
    )
  },

  contains: <T>(
    options: DropdownOption<T>[],
    value: T,
    equality: (a: T, b: T) => boolean = (a, b) => a === b
  ) => {
    return DropdownOption.getOptionValues(options).some(v => equality(v, value))
  },
}

export type DropdownOptions<T> = Merge<
  InputOptions<T>,
  {
    options: Value<DropdownOption<T>[]>
    unselectedLabel?: Value<string>
    equality?: (a: T, b: T) => boolean
    placeholder?: Value<string>
    searchable?: Value<boolean>
  }
>

// Internal component for rendering individual options
const DropdownOptionItem = <T>(
  option: Signal<DropdownOption<T>>,
  equality: (a: T, b: T) => boolean,
  currentValue: Value<T>,
  onSelect: (value: T) => void,
  focusedValue: Signal<T | null>
): Renderable => {
  return Ensure(option as Signal<DropdownOption<T> | undefined>, option =>
    OneOfType(option, {
      value: v => {
        const isSelected = computedOf(
          v,
          currentValue
        )((v, currentValue) => {
          return equality(v.value, currentValue as T)
        })

        const isFocused = computedOf(
          v,
          focusedValue
        )((v, focusedVal) => {
          return focusedVal != null && equality(v.value, focusedVal as T)
        })

        return html.div(
          OnDispose(isSelected.dispose),
          OnDispose(isFocused.dispose),
          attr.class('bc-dropdown__option'),
          attr.class(
            computedOf(
              isSelected,
              isFocused,
              v
            )((selected, focused, option) => {
              const classes = []
              if (selected) classes.push('bc-dropdown__option--selected')
              if (focused) classes.push('bc-dropdown__option--focused')
              if (option.disabled) classes.push('bc-dropdown__option--disabled')
              return classes.join(' ')
            })
          ),
          attr.role('option'),
          attr.id(v.map(option => `dropdown-option-${String(option.value)}`)),
          aria.selected(isSelected as Value<boolean | 'undefined'>),
          Expando('value', v.$.value),
          When(
            v.map(option => !option.disabled),
            () => on.click(() => onSelect(v.value.value)),
            () => Empty
          ),
          html.div(
            attr.class('bc-dropdown__option-content'),
            // Before content - simple conditional rendering
            v.value.before &&
              html.span(
                attr.class('bc-dropdown__option-before'),
                v.value.before
              ),
            // Label
            html.span(attr.class('bc-dropdown__option-label'), v.$.label),
            // After content - simple conditional rendering
            v.value.after &&
              html.span(attr.class('bc-dropdown__option-after'), v.value.after)
          )
        )
      },
      group: v =>
        html.div(
          attr.class('bc-dropdown__group'),
          attr.role('group'),
          aria.label(v.$.group),
          html.div(attr.class('bc-dropdown__group-label'), v.$.group),
          ForEach(v.$.options, o =>
            DropdownOptionItem(
              o as Signal<DropdownOption<T>>,
              equality,
              currentValue,
              onSelect,
              focusedValue
            )
          )
        ),
      break: () => html.hr(attr.class('bc-dropdown__separator')),
    })
  )
}

export const DropdownInput = <T>(options: DropdownOptions<T>) => {
  const {
    value,
    onBlur,
    onChange,
    options: dropdownOptions,
    unselectedLabel,
    equality = (a, b) => a === b,
    placeholder,
    searchable = false,
  } = options

  const isOpen = prop(false)
  const focusedIndex = prop(-1)
  const focusedValue = prop<T | null>(null)
  const dropdownId = sessionId('dropdown')
  const listboxId = sessionId('listbox')

  let triggerElement: HTMLElement | undefined
  let listboxElement: HTMLElement | undefined

  // Get display label for current value
  const displayLabel = computedOf(
    value,
    dropdownOptions
  )((currentValue, opts) => {
    if (currentValue == null) return ''

    const findLabel = (options: DropdownOption<T>[]): string | undefined => {
      for (const opt of options) {
        if (opt.type === 'value' && equality(opt.value, currentValue as T)) {
          return opt.label
        } else if (opt.type === 'group') {
          const label = findLabel(opt.options as DropdownOption<T>[])
          if (label) return label
        }
      }
      return undefined
    }

    return findLabel(opts) || String(currentValue)
  })

  // Create a wrapped onChange that closes the dropdown after selection
  const wrappedOnChange = (selectedValue: T) => {
    // Call the original onChange callback
    onChange?.(selectedValue)

    // Close the dropdown by setting isOpen to false
    // The Flyout will automatically close when isOpen becomes false
    isOpen.set(false)
    focusedIndex.set(-1)
    focusedValue.set(null)
    triggerElement?.focus()
  }

  // Handle option selection (for keyboard navigation)
  const handleSelect = (selectedValue: T) => {
    wrappedOnChange(selectedValue)
  }

  // Get all selectable options (flattened)
  const getSelectableOptions = (
    opts: DropdownOption<T>[]
  ): DropdownValueOption<T>[] => {
    return opts.flatMap(opt => {
      if (opt.type === 'value' && !opt.disabled) {
        return [opt]
      } else if (opt.type === 'group') {
        return getSelectableOptions(opt.options as DropdownOption<T>[])
      }
      return []
    })
  }

  // Keyboard navigation
  const handleKeyDown = (event: KeyboardEvent) => {
    const opts = Value.get(dropdownOptions)
    const selectableOptions = getSelectableOptions(opts)

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!isOpen.value) {
          isOpen.set(true)
          if (selectableOptions.length > 0) {
            focusedIndex.set(0)
            focusedValue.set(selectableOptions[0].value)
          }
        } else {
          const nextIndex = Math.min(
            focusedIndex.value + 1,
            selectableOptions.length - 1
          )
          focusedIndex.set(nextIndex)
          focusedValue.set(selectableOptions[nextIndex]?.value || null)
        }
        break

      case 'ArrowUp':
        event.preventDefault()
        if (isOpen.value) {
          const prevIndex = Math.max(focusedIndex.value - 1, 0)
          focusedIndex.set(prevIndex)
          focusedValue.set(selectableOptions[prevIndex]?.value || null)
        }
        break

      case 'Enter':
        event.preventDefault()
        if (isOpen.value && focusedIndex.value >= 0) {
          const selectedOption = selectableOptions[focusedIndex.value]
          if (selectedOption) {
            handleSelect(selectedOption.value)
          }
        } else {
          isOpen.set(true)
          if (selectableOptions.length > 0) {
            focusedIndex.set(0)
            focusedValue.set(selectableOptions[0].value)
          }
        }
        break

      case 'Escape':
        event.preventDefault()
        isOpen.set(false)
        focusedIndex.set(-1)
        focusedValue.set(null)
        triggerElement?.focus()
        break

      case ' ':
        if (!Value.get(searchable)) {
          event.preventDefault()
          isOpen.set(!isOpen.value)
          if (isOpen.value && selectableOptions.length > 0) {
            focusedIndex.set(0)
            focusedValue.set(selectableOptions[0].value)
          }
        }
        break
    }
  }

  return InputContainer(
    {
      ...options,
      input: Group(
        attr.class('bc-dropdown__trigger'),
        html.span(
          attr.class('bc-dropdown__display'),
          When(
            displayLabel.map(label => label.length > 0),
            () => displayLabel,
            () =>
              Use(BeatUII18n, t =>
                coalesce(placeholder, unselectedLabel, t.$.selectOne)
              )
          )
        ),
        Icon(
          { icon: 'ph:caret-up-down-bold', color: 'neutral' },
          attr.class('bc-dropdown__arrow')
        )
      ),
    },

    WithElement(el => {
      triggerElement = el
      el.addEventListener('keydown', handleKeyDown)
      el.setAttribute('aria-haspopup', 'listbox')
      el.setAttribute('aria-controls', listboxId)
      // Set up reactive aria attributes
      return OnDispose(() => el.removeEventListener('keydown', handleKeyDown))
    }),
    CommonInputAttributes(options),
    attr.id(dropdownId),
    attr.tabindex(0),
    aria.expanded(isOpen as Value<boolean | 'undefined'>),
    attr.class('bc-dropdown'),
    attr.role('dropdown'),
    aria.activedescendant(
      computedOf(
        isOpen,
        focusedValue
      )((open, focused): string => {
        if (open && focused != null) {
          return `dropdown-option-${String(focused)}`
        }
        return ''
      })
    ),
    onBlur != null
      ? on.blur(() => {
          // Delay to allow option click to register
          setTimeout(() => {
            if (!listboxElement?.contains(document.activeElement)) {
              isOpen.set(false)
              focusedIndex.set(-1)
              onBlur()
            }
          }, 100)
        })
      : Empty,
    // Dropdown using Flyout with custom trigger
    Flyout({
      content: () =>
        Fragment(
          WithElement(el => {
            listboxElement = el
          }),
          attr.class('bc-dropdown__listbox'),
          attr.role('listbox'),
          attr.id(listboxId),
          aria.labelledby(dropdownId),
          ForEach(dropdownOptions, option =>
            DropdownOptionItem(
              option,
              equality,
              value,
              wrappedOnChange,
              focusedValue
            )
          )
        ),
      mainAxisOffset: 0,
      placement: 'bottom-start',
      showOn: (flyoutShow, flyoutHide) => {
        // Override flyoutHide to also update dropdown state
        // This ensures that when Flyout's closable behavior triggers,
        // the dropdown state is properly updated
        const originalHide = flyoutHide
        flyoutHide = () => {
          isOpen.set(false)
          focusedIndex.set(-1)
          focusedValue.set(null)
          originalHide()
        }

        // Custom click handler that manages both our state and the flyout
        const handleClick = () => {
          if (isOpen.value) {
            flyoutHide()
          } else {
            const opts = Value.get(dropdownOptions)
            const selectableOptions = getSelectableOptions(opts)
            isOpen.set(true)
            if (selectableOptions.length > 0) {
              focusedIndex.set(0)
              focusedValue.set(selectableOptions[0].value)
            }
            flyoutShow()
          }
        }

        return on.click(handleClick)
      },
      showDelay: 0,
      hideDelay: 0,
      closable: true, // Allow closing when clicking outside
    })
  )
}

export const BaseDropdownControl = <T>(
  options: BaseControllerOptions<T, DropdownOptions<T>>
) => {
  const { controller, onChange, onBlur, ...rest } = options
  return DropdownInput({
    ...rest,
    value: controller.value,
    onChange: makeOnChangeHandler(controller, onChange),
    onBlur: makeOnBlurHandler(controller, onBlur),
  })
}

export const DropdownControl = <T>(
  options: ControllerOptions<T, DropdownOptions<T>>
) => {
  return InputWrapper({
    ...options,
    content: BaseDropdownControl(options),
  })
}
