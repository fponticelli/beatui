import {
  aria,
  attr,
  computedOf,
  Empty,
  Ensure,
  ForEach,
  html,
  Merge,
  on,
  OneOfType,
  prop,
  Renderable,
  Signal,
  TNode,
  Use,
  Value,
  When,
  WithElement,
  Fragment,
} from '@tempots/dom'

import { InputOptions } from './input-options'
import { BeatUII18n } from '../../../beatui-i18n'
import { Icon } from '../../data'
import {
  BaseControllerOptions,
  ControllerOptions,
  makeOnBlurHandler,
  makeOnChangeHandler,
} from '../control'
import { InputWrapper } from './input-wrapper'
import { DropdownOption } from './option'
import { DropdownBase } from './dropdown-base'

export type ComboboxOptions<T> = Merge<
  InputOptions<T>,
  {
    // Fetch options dynamically based on current search text
    loadOptions: (search: string) => Promise<DropdownOption<T>[]>
    // Renderers for displaying values
    renderOption: (value: Signal<T>) => TNode
    renderValue?: (value: Signal<T>) => TNode
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
  currentValue: Signal<T>,
  onSelect: (value: T) => void,
  focusedValue: Signal<T | null>,
  renderOption: (value: Signal<T>) => TNode
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
              renderOption(v.$.value)
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
    loadOptions,
    renderOption,
    renderValue,
    equality = (a, b) => a === b,
    placeholder,
    searchPlaceholder,
    debounceMs = 150,
  } = options

  const searchText = prop('')
  const loading = prop(false)
  const internalOptions = prop<DropdownOption<T>[]>([])

  let searchInputElement: HTMLInputElement | undefined

  const currentValue = Value.toSignal(value)

  const renderClosedValue = () => (renderValue ?? renderOption)(currentValue)

  // Debounced loader
  let debounceHandle: number | null = null
  const runLoad = (query: string) => {
    loading.set(true)
    Promise.resolve(loadOptions(query))
      .then(opts => {
        internalOptions.set(opts ?? [])
      })
      .catch(() => {
        internalOptions.set([])
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

  return DropdownBase<T>({
    ...options,
    role: 'combobox',
    display: When(
      computedOf(value)(v => v != null),
      renderClosedValue,
      () => Use(BeatUII18n, t => t.$.selectOne)
    ),
    optionsSource: internalOptions,
    onBeforeOpen: () => {
      const current = Value.get(searchText)
      requestLoad(current)
    },
    onAfterOpen: () => {
      // Focus the search input after open
      searchInputElement?.focus()
    },
    buildListboxContent: ({ focusedValue, handleKeyDown, onSelect }) =>
      Fragment(
        // Search input at the top
        html.div(
          attr.class('bc-dropdown__search'),
          html.input(
            attr.type('text'),
            attr.class('bc-dropdown__search-input'),
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
                currentValue,
                onSelect,
                focusedValue,
                renderOption
              )
            )
        )
      ),
  })
}

export const BaseComboboxControl = <T>(
  options: BaseControllerOptions<T, ComboboxOptions<T>>
) => {
  const { controller, onChange, onBlur, ...rest } = options
  return ComboboxInput({
    ...rest,
    value: controller.signal,
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
