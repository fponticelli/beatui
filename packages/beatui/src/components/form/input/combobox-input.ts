import {
  aria,
  attr,
  computedOf,
  Empty,
  Ensure,
  ForEach,
  Fragment,
  html,
  Merge,
  on,
  OneOfType,
  OnDispose,
  prop,
  Renderable,
  Signal,
  TNode,
  Use,
  Value,
  When,
  WithElement,
} from '@tempots/dom'

import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
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
import { DropdownOption, Option } from './option'

export type ComboboxOptions<T> = Merge<
  InputOptions<T>,
  {
    // Fetch options dynamically based on current search text
    loadOptions: (search: string) => Promise<DropdownOption<T>[]>
    // Renderers for displaying values
    renderOption: (value: T) => TNode
    renderValue?: (value: T) => TNode
    // Behavior
    equality?: (a: T, b: T) => boolean
    placeholder?: Value<string>
    searchPlaceholder?: Value<string>
    debounceMs?: number
  }
>

const ComboboxOptionItem = <T>(
  option: Signal<DropdownOption<T>>,
  equality: (a: T, b: T) => boolean,
  currentValue: Value<T>,
  onSelect: (value: T) => void,
  focusedValue: Signal<T | null>,
  renderOption: (value: T) => TNode
): Renderable => {
  return Ensure(option as Signal<DropdownOption<T> | undefined>, option =>
    OneOfType(option, {
      value: v => {
        const isSelected = computedOf(
          v,
          currentValue
        )((v, currentValue) => equality(v.value, currentValue as T))

        const isFocused = computedOf(
          v,
          focusedValue
        )(
          (v, focusedVal) =>
            focusedVal != null && equality(v.value, focusedVal as T)
        )

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
              const classes: string[] = []
              if (selected) classes.push('bc-dropdown__option--selected')
              if (focused) classes.push('bc-dropdown__option--focused')
              if (option.disabled) classes.push('bc-dropdown__option--disabled')
              return classes.join(' ')
            })
          ),
          attr.role('option'),
          attr.id(v.map(option => `dropdown-option-${String(option.value)}`)),
          aria.selected(isSelected as Value<boolean | 'undefined'>),
          When(
            v.map(option => !option.disabled),
            () => on.click(() => onSelect(v.value.value)),
            () => Empty
          ),
          html.div(
            attr.class('bc-dropdown__option-content'),
            // Before slot
            v.value.before &&
              html.span(
                attr.class('bc-dropdown__option-before'),
                v.value.before
              ),
            // Custom renderer for the main content
            html.span(
              attr.class('bc-dropdown__option-label'),
              renderOption(v.value.value)
            ),
            // After slot
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
            ComboboxOptionItem(
              o as Signal<DropdownOption<T>>,
              equality,
              currentValue,
              onSelect,
              focusedValue,
              renderOption
            )
          )
        ),
      break: () => html.hr(attr.class('bc-dropdown__separator')),
    })
  )
}

export const ComboboxInput = <T>(options: ComboboxOptions<T>) => {
  const {
    value,
    onBlur,
    onChange,
    loadOptions,
    renderOption,
    renderValue,
    equality = (a, b) => a === b,
    placeholder,
    searchPlaceholder,
    debounceMs = 150,
  } = options

  const isOpen = prop(false)
  const focusedIndex = prop(-1)
  const focusedValue = prop<T | null>(null)
  const searchText = prop('')
  const loading = prop(false)
  const internalOptions = prop<DropdownOption<T>[]>([])

  const dropdownId = sessionId('combobox')
  const listboxId = sessionId('listbox')

  let triggerElement: HTMLElement | undefined
  let listboxElement: HTMLElement | undefined
  let searchInputElement: HTMLInputElement | undefined

  // Rendered value when closed (reactive via Ensure)
  const renderClosedValue = () =>
    Ensure(value as Signal<T | undefined>, v =>
      (renderValue ?? renderOption)(v.value as T)
    )

  const wrappedOnChange = (selectedValue: T) => {
    onChange?.(selectedValue)
    isOpen.set(false)
    focusedIndex.set(-1)
    focusedValue.set(null)
    triggerElement?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const selectableOptions = Option.getValues(Value.get(internalOptions))
    switch (event.key) {
      case 'ArrowDown':
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
      case 'ArrowUp':
        event.preventDefault()
        if (isOpen.value) {
          const prevIndex = Math.max(focusedIndex.value - 1, 0)
          focusedIndex.set(prevIndex)
          focusedValue.set(selectableOptions[prevIndex] ?? null)
        }
        break
      case 'Enter':
        if (isOpen.value && focusedIndex.value >= 0) {
          event.preventDefault()
          const selectedOption = selectableOptions[focusedIndex.value]
          if (selectedOption) wrappedOnChange(selectedOption)
        }
        break
      case 'Escape':
        if (isOpen.value) {
          event.preventDefault()
          isOpen.set(false)
          focusedIndex.set(-1)
          focusedValue.set(null)
          triggerElement?.focus()
        }
        break
    }
  }

  // Debounced loader
  let debounceHandle: number | null = null
  const runLoad = (query: string) => {
    loading.set(true)
    Promise.resolve(loadOptions(query))
      .then(opts => {
        internalOptions.set(opts ?? [])
        const selectable = Option.getValues(opts ?? [])
        if (selectable.length > 0) {
          focusedIndex.set(0)
          focusedValue.set(selectable[0])
        } else {
          focusedIndex.set(-1)
          focusedValue.set(null)
        }
      })
      .catch(() => {
        internalOptions.set([])
        focusedIndex.set(-1)
        focusedValue.set(null)
      })
      .finally(() => loading.set(false))
  }

  const requestLoad = (query: string) => {
    if (debounceHandle != null) {
      clearTimeout(debounceHandle)
      debounceHandle = null
    }
    debounceHandle = setTimeout(
      () => {
        runLoad(query)
      },
      Math.max(0, debounceMs)
    ) as unknown as number
  }

  return InputContainer(
    {
      ...options,
      input: Group(
        attr.class('bc-dropdown__trigger'),
        html.span(
          attr.class('bc-dropdown__display'),
          When(
            computedOf(value)(v => v != null),
            renderClosedValue,
            () => Use(BeatUII18n, t => t.$.selectOne)
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
      return OnDispose(() => el.removeEventListener('keydown', handleKeyDown))
    }),
    CommonInputAttributes(options),
    attr.id(dropdownId),
    attr.tabindex(0),
    aria.expanded(isOpen as Value<boolean | 'undefined'>),
    attr.class('bc-dropdown'),
    attr.role('combobox'),
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
        Fragment(
          attr.class('bc-dropdown__listbox'),
          attr.role('listbox'),
          attr.id(listboxId),
          aria.labelledby(dropdownId),
          WithElement(el => {
            listboxElement = el
          }),
          // Search input at the top
          html.div(
            attr.class('bc-dropdown__search'),
            html.input(
              attr.type('text'),
              attr.class('bc-input'),
              attr.placeholder(
                computedOf(
                  searchPlaceholder,
                  placeholder
                )((sph, ph) => sph ?? ph ?? 'Search')
              ),
              attr.value(searchText),
              WithElement(el => {
                searchInputElement = el as HTMLInputElement
                return Empty
              }),
              on.input(e => {
                const target = e.target as HTMLInputElement
                searchText.set(target.value)
                requestLoad(target.value)
              }),
              on.keydown(handleKeyDown)
            )
          ),
          When(
            loading,
            () =>
              html.div(
                attr.class('bc-dropdown__loading'),
                Icon({ icon: 'ph:spinner-bold', color: 'neutral' })
              ),
            () =>
              ForEach(internalOptions, option =>
                ComboboxOptionItem(
                  option,
                  equality,
                  value,
                  wrappedOnChange,
                  focusedValue,
                  renderOption
                )
              )
          )
        ),
      mainAxisOffset: 0,
      placement: 'bottom-start',
      showOn: (flyoutShow, flyoutHide) => {
        const originalHide = flyoutHide
        flyoutHide = () => {
          isOpen.set(false)
          focusedIndex.set(-1)
          focusedValue.set(null)
          originalHide()
        }

        const open = () => {
          const current = Value.get(searchText)
          isOpen.set(true)
          requestLoad(current)
          flyoutShow()
          // Focus the search input after open
          setTimeout(() => searchInputElement?.focus(), 0)
        }

        const handleClick = () => {
          if (isOpen.value) {
            flyoutHide()
          } else {
            open()
          }
        }
        return on.click(handleClick)
      },
      showDelay: 0,
      hideDelay: 0,
      closable: true,
    })
  )
}

export const BaseComboboxControl = <T>(
  options: BaseControllerOptions<T, ComboboxOptions<T>>
) => {
  const { controller, onChange, onBlur, ...rest } = options
  return ComboboxInput({
    ...rest,
    value: controller.value,
    onChange: makeOnChangeHandler(controller, onChange),
    onBlur: makeOnBlurHandler(controller, onBlur),
  })
}

export const ComboboxControl = <T>(
  options: ControllerOptions<T, ComboboxOptions<T>>
) => {
  return InputWrapper({
    ...options,
    content: BaseComboboxControl(options),
  })
}
