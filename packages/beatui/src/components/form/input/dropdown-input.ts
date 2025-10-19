import {
  attr,
  Empty,
  Ensure,
  ForEach,
  html,
  computedOf,
  on,
  OnDispose,
  OneOfType,
  Renderable,
  Signal,
  Value,
  Use,
  When,
  aria,
  coalesce,
  Merge,
} from '@tempots/dom'

import { InputOptions } from './input-options'
import { Expando } from '../../misc/expando'
import { BeatUII18n } from '@/beatui-i18n'
import {
  BaseControllerOptions,
  ControllerOptions,
  makeOnBlurHandler,
  makeOnChangeHandler,
} from '../control'
import { InputWrapper } from './input-wrapper'
import { DropdownOption } from './option'
import { DropdownBase } from './dropdown-base'

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
    options: dropdownOptions,
    unselectedLabel,
    equality = (a, b) => a === b,
    placeholder,
    searchable = false,
  } = options

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

  const spaceToggle = computedOf(searchable)(s => !s)

  return DropdownBase<T>({
    ...options,
    role: 'dropdown',
    display: When(
      displayLabel.map(label => label.length > 0),
      () => displayLabel,
      () =>
        Use(BeatUII18n, t =>
          coalesce(placeholder, unselectedLabel, t.$.selectOne)
        )
    ),
    optionsSource: dropdownOptions,
    allowSpaceToggle: spaceToggle,
    buildListboxContent: ({ focusedValue, onSelect }) =>
      ForEach(dropdownOptions, option =>
        DropdownOptionItem(option, equality, value, onSelect, focusedValue)
      ),
  })
}

export const BaseDropdownControl = <T>(
  options: BaseControllerOptions<T, DropdownOptions<T>>
) => {
  const { controller, onChange, onBlur, ...rest } = options
  return DropdownInput({
    ...rest,
    value: controller.signal,
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
