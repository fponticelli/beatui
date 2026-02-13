import {
  attr,
  Empty,
  Ensure,
  ForEach,
  html,
  computedOf,
  on,
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
import { BeatUII18n } from '../../../beatui-i18n'
import {
  BaseControllerOptions,
  ControllerOptions,
  makeOnBlurHandler,
  makeOnChangeHandler,
} from '../control'
import { InputWrapper } from './input-wrapper'
import { DropdownOption } from './option'
import { DropdownBase } from './dropdown-base'

/**
 * Configuration options for the {@link DropdownInput} component.
 *
 * Extends {@link InputOptions} with dropdown-specific properties including the
 * list of selectable options, custom equality comparison, and optional search
 * filtering.
 *
 * @template T - The type of the selectable option values
 */
export type DropdownOptions<T> = Merge<
  InputOptions<T>,
  {
    /** The list of selectable options, supporting value items, groups, and break separators */
    options: Value<DropdownOption<T>[]>
    /** Label to show when no option is selected (fallback for `placeholder`). Uses i18n "selectOne" when both are omitted. */
    unselectedLabel?: Value<string>
    /** Custom equality function for comparing option values. @default strict equality (===) */
    equality?: (a: T, b: T) => boolean
    /** Placeholder text displayed when no option is selected */
    placeholder?: Value<string>
    /** Whether to enable keyboard search filtering (disables Space-to-toggle). @default false */
    searchable?: Value<boolean>
  }
>

/**
 * Internal component for rendering individual dropdown option items.
 *
 * Handles value options, group options, and break separators using discriminated
 * union pattern matching. Applies selected and focused styling classes and manages
 * click interactions for selection.
 *
 * @template T - The type of the option value
 * @param option - Reactive signal wrapping the dropdown option to render
 * @param equality - Equality function for comparing option values
 * @param currentValue - The currently selected value
 * @param onSelect - Callback invoked when an option is selected
 * @param focusedValue - Signal tracking which option currently has keyboard focus
 * @returns A renderable option item element
 */
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

/**
 * A dropdown select input component with keyboard navigation and flyout option list.
 *
 * Renders a styled dropdown trigger inside an {@link InputContainer} that opens a
 * floating listbox of options on click or keyboard interaction. Supports value options,
 * grouped options, and break separators. The display label automatically reflects the
 * currently selected value's label. Keyboard navigation supports Arrow Up/Down, Enter
 * to select, Escape to close, and optionally Space to toggle (when `searchable` is false).
 *
 * @template T - The type of the selectable option values
 * @param options - Configuration options for the dropdown
 * @returns A styled dropdown input element with a floating option list
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { DropdownInput, Option } from '@tempots/beatui'
 *
 * const color = prop('red')
 * DropdownInput({
 *   value: color,
 *   onChange: color.set,
 *   options: [
 *     Option.value('red', 'Red'),
 *     Option.value('green', 'Green'),
 *     Option.value('blue', 'Blue'),
 *   ],
 *   placeholder: 'Select a color',
 * })
 * ```
 *
 * @example
 * ```ts
 * // With grouped options
 * DropdownInput({
 *   value: prop(''),
 *   onChange: (v) => console.log('Selected:', v),
 *   options: [
 *     Option.group('Warm', [
 *       Option.value('red', 'Red'),
 *       Option.value('orange', 'Orange'),
 *     ]),
 *     Option.break,
 *     Option.group('Cool', [
 *       Option.value('blue', 'Blue'),
 *       Option.value('green', 'Green'),
 *     ]),
 *   ],
 * })
 * ```
 */
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

/**
 * A dropdown input wired to a form controller for managed form state.
 *
 * Connects a {@link DropdownInput} to a form {@link Controller}, automatically
 * mapping the controller's signal to the dropdown value and routing change/blur
 * events through the controller's validation pipeline.
 *
 * @template T - The type of the selectable option values
 * @param options - Controller options including the form controller and dropdown configuration
 * @returns A controller-bound dropdown input
 */
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

/**
 * A complete dropdown form control with label, description, error message, and validation.
 *
 * Combines {@link BaseDropdownControl} with an {@link InputWrapper} to provide a
 * full-featured form field with label, optional description, and validation error display.
 *
 * @template T - The type of the selectable option values
 * @param options - Controller options including wrapper label/description and dropdown configuration
 * @returns A dropdown input wrapped in a form field with label and error display
 */
export const DropdownControl = <T>(
  options: ControllerOptions<T, DropdownOptions<T>>
) => {
  return InputWrapper({
    ...options,
    content: BaseDropdownControl(options),
  })
}
