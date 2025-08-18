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
} from '@tempots/dom'

import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Expando } from '../../misc/expando'
import { BeatUII18n } from '@/beatui-i18n'
import { Flyout } from '../../navigation/flyout'
import { sessionId } from '../../../utils/session-id'
import { Icon } from '@/components/data'
import { Group } from '@/components/layout'

// Extend existing SelectOption types to support rich content
export type ComboboxValueOption<T> = {
  type: 'value'
  value: T
  label: string
  disabled?: boolean
  before?: TNode
  after?: TNode
}

export type ComboboxGroupOption<T> = {
  type: 'group'
  group: string
  options: ComboboxValueOption<T>[]
  disabled?: boolean
}

export type ComboboxBreakOption = { type: 'break' }

export type ComboboxOption<T> =
  | ComboboxValueOption<T>
  | ComboboxGroupOption<T>
  | ComboboxBreakOption

// Helper functions similar to SelectOption
export const ComboboxOption = {
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
    }) as ComboboxValueOption<T>,

  group: <T>(
    group: string,
    options: (ComboboxValueOption<T> | ComboboxBreakOption)[],
    disabled?: boolean
  ) =>
    ({
      type: 'group',
      group,
      options,
      disabled,
    }) as ComboboxGroupOption<T>,

  break: { type: 'break' } as ComboboxBreakOption,

  getOptionValues: <T>(options: ComboboxOption<T>[]): T[] => {
    return options.flatMap(o =>
      o.type === 'group'
        ? ComboboxOption.getOptionValues(o.options as ComboboxOption<T>[])
        : o.type === 'break'
          ? []
          : [o.value]
    )
  },

  contains: <T>(
    options: ComboboxOption<T>[],
    value: T,
    equality: (a: T, b: T) => boolean = (a, b) => a === b
  ) => {
    return ComboboxOption.getOptionValues(options).some(v => equality(v, value))
  },
}

export type ComboboxOptions<T> = InputOptions<T> & {
  options: Value<ComboboxOption<T>[]>
  unselectedLabel?: Value<string>
  equality?: (a: T, b: T) => boolean
  placeholder?: Value<string>
  searchable?: Value<boolean>
}

// Internal component for rendering individual options
const ComboboxOptionItem = <T>(
  option: Signal<ComboboxOption<T>>,
  equality: (a: T, b: T) => boolean,
  currentValue: Value<T>,
  onSelect: (value: T) => void,
  focusedValue: Signal<T | null>
): Renderable => {
  return Ensure(option as Signal<ComboboxOption<T> | undefined>, option =>
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
          attr.class('bc-combobox__option'),
          attr.class(
            computedOf(
              isSelected,
              isFocused,
              v
            )((selected, focused, option) => {
              const classes = []
              if (selected) classes.push('bc-combobox__option--selected')
              if (focused) classes.push('bc-combobox__option--focused')
              if (option.disabled) classes.push('bc-combobox__option--disabled')
              return classes.join(' ')
            })
          ),
          attr.role('option'),
          attr.id(v.map(option => `combobox-option-${String(option.value)}`)),
          aria.selected(isSelected as Value<boolean | 'undefined'>),
          Expando('value', v.$.value),
          When(
            v.map(option => !option.disabled),
            () => on.click(() => onSelect(v.value.value)),
            () => Empty
          ),
          html.div(
            attr.class('bc-combobox__option-content'),
            // Before content - simple conditional rendering
            v.value.before &&
              html.span(
                attr.class('bc-combobox__option-before'),
                v.value.before
              ),
            // Label
            html.span(attr.class('bc-combobox__option-label'), v.$.label),
            // After content - simple conditional rendering
            v.value.after &&
              html.span(attr.class('bc-combobox__option-after'), v.value.after)
          )
        )
      },
      group: v =>
        html.div(
          attr.class('bc-combobox__group'),
          attr.role('group'),
          aria.label(v.$.group),
          html.div(attr.class('bc-combobox__group-label'), v.$.group),
          ForEach(v.$.options, o =>
            ComboboxOptionItem(
              o as Signal<ComboboxOption<T>>,
              equality,
              currentValue,
              onSelect,
              focusedValue
            )
          )
        ),
      break: () => html.hr(attr.class('bc-combobox__separator')),
    })
  )
}

export const Combobox = <T>(options: ComboboxOptions<T>) => {
  const {
    value,
    onBlur,
    onChange,
    options: comboboxOptions,
    unselectedLabel,
    equality = (a, b) => a === b,
    placeholder,
    searchable = false,
  } = options

  const isOpen = prop(false)
  const focusedIndex = prop(-1)
  const focusedValue = prop<T | null>(null)
  const comboboxId = sessionId('combobox')
  const listboxId = sessionId('listbox')

  let triggerElement: HTMLElement | undefined
  let listboxElement: HTMLElement | undefined

  // Get display label for current value
  const displayLabel = computedOf(
    value,
    comboboxOptions
  )((currentValue, opts) => {
    if (currentValue == null) return ''

    const findLabel = (options: ComboboxOption<T>[]): string | undefined => {
      for (const opt of options) {
        if (opt.type === 'value' && equality(opt.value, currentValue as T)) {
          return opt.label
        } else if (opt.type === 'group') {
          const label = findLabel(opt.options as ComboboxOption<T>[])
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
    opts: ComboboxOption<T>[]
  ): ComboboxValueOption<T>[] => {
    return opts.flatMap(opt => {
      if (opt.type === 'value' && !opt.disabled) {
        return [opt]
      } else if (opt.type === 'group') {
        return getSelectableOptions(opt.options as ComboboxOption<T>[])
      }
      return []
    })
  }

  // Keyboard navigation
  const handleKeyDown = (event: KeyboardEvent) => {
    const opts = Value.get(comboboxOptions)
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

  return InputContainer({
    ...options,
    child: Fragment(
      WithElement(el => {
        triggerElement = el
        el.addEventListener('keydown', handleKeyDown)
        el.setAttribute('aria-haspopup', 'listbox')
        el.setAttribute('aria-controls', listboxId)
        // Set up reactive aria attributes
        return OnDispose(() => el.removeEventListener('keydown', handleKeyDown))
      }),
      CommonInputAttributes(options),
      attr.id(comboboxId),
      attr.tabindex(0),
      aria.expanded(isOpen as Value<boolean | 'undefined'>),
      attr.class('bc-combobox'),
      attr.role('combobox'),
      aria.activedescendant(
        computedOf(
          isOpen,
          focusedValue
        )((open, focused): string => {
          if (open && focused != null) {
            return `combobox-option-${String(focused)}`
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
            attr.class('bc-combobox__listbox'),
            attr.role('listbox'),
            attr.id(listboxId),
            aria.labelledby(comboboxId),
            ForEach(comboboxOptions, option =>
              ComboboxOptionItem(
                option,
                equality,
                value,
                wrappedOnChange,
                focusedValue
              )
            )
          ),
        placement: 'bottom-start',
        showOn: (flyoutShow, flyoutHide) => {
          // Override flyoutHide to also update combobox state
          // This ensures that when Flyout's closable behavior triggers,
          // the combobox state is properly updated
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
              const opts = Value.get(comboboxOptions)
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
    ),
    input: Group(
      attr.class('bc-combobox__trigger'),
      html.span(
        attr.class('bc-combobox__display'),
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
        { icon: 'ph:caret-up-down-bold', color: 'primary' },
        attr.class('bc-combobox__arrow')
      )
    ),
  })
}
