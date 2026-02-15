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

/**
 * Configuration options for the {@link ComboboxInput} component.
 *
 * Extends {@link InputOptions} with combobox-specific properties including an
 * asynchronous option loader, custom renderers for options and the selected value,
 * and debounce timing for search queries.
 *
 * @template T - The type of the selectable option values
 */
export type ComboboxOptions<T> = Merge<
  InputOptions<T>,
  {
    /** Async function to fetch options dynamically based on the current search text */
    loadOptions: (search: string) => Promise<DropdownOption<T>[]>
    /** Render function for displaying each option in the dropdown list */
    renderOption: (value: Signal<T>) => TNode
    /** Optional render function for displaying the selected value in the closed trigger. Falls back to `renderOption`. */
    renderValue?: (value: Signal<T>) => TNode
    /** Custom equality function for comparing option values. @default strict equality (===) */
    equality?: (a: T, b: T) => boolean
    /** Placeholder text displayed when no option is selected */
    placeholder?: Value<string>
    /** Placeholder text for the search input inside the dropdown. @default 'Search' */
    searchPlaceholder?: Value<string>
    /** Debounce delay in milliseconds for the search query. @default 150 */
    debounceMs?: number
    /** Whether to auto-focus the search input when the dropdown opens. @default true */
    autoFocusSearch?: boolean
  }
>

/**
 * Internal component for rendering individual combobox option items.
 *
 * Handles value options, group options, and break separators using discriminated
 * union pattern matching. Uses the provided `renderOption` function for custom
 * rendering of the option content.
 *
 * @template T - The type of the option value
 * @param option - Reactive signal wrapping the dropdown option to render
 * @param equality - Equality function for comparing option values
 * @param currentValue - Signal tracking the currently selected value
 * @param onSelect - Callback invoked when an option is selected
 * @param focusedValue - Signal tracking which option currently has keyboard focus
 * @param renderOption - Custom render function for the option's main content
 * @returns A renderable option item element
 */
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

/**
 * A searchable combobox input component with asynchronous option loading and custom rendering.
 *
 * Renders a styled dropdown trigger inside an {@link InputContainer} that opens a
 * floating listbox with a search input at the top. Options are loaded asynchronously
 * via the `loadOptions` callback, which is debounced and triggered whenever the search
 * text changes. Each option is rendered using the custom `renderOption` function, while
 * the closed trigger shows the selected value via `renderValue` (or `renderOption` as
 * fallback). A loading spinner appears while options are being fetched.
 *
 * Keyboard navigation supports Arrow Up/Down, Enter to select, and Escape to close.
 * The search input receives focus automatically when the dropdown opens.
 *
 * @template T - The type of the selectable option values
 * @param options - Configuration options for the combobox
 * @returns A styled combobox input element with search and async option loading
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { ComboboxInput, Option } from '@tempots/beatui'
 *
 * const user = prop<User | null>(null)
 * ComboboxInput({
 *   value: user,
 *   onChange: user.set,
 *   loadOptions: async (search) => {
 *     const users = await fetchUsers(search)
 *     return users.map(u => Option.value(u, u.name))
 *   },
 *   renderOption: (userSignal) => html.span(userSignal.$.name),
 *   placeholder: 'Search for a user...',
 *   debounceMs: 300,
 * })
 * ```
 */
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
    autoFocusSearch = true,
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
      if (autoFocusSearch) {
        searchInputElement?.focus()
      }
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

/**
 * A combobox input wired to a form controller for managed form state.
 *
 * Connects a {@link ComboboxInput} to a form {@link Controller}, automatically
 * mapping the controller's signal to the combobox value and routing change/blur
 * events through the controller's validation pipeline.
 *
 * @template T - The type of the selectable option values
 * @param options - Controller options including the form controller and combobox configuration
 * @returns A controller-bound combobox input
 */
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

/**
 * A complete combobox form control with label, description, error message, and validation.
 *
 * Combines {@link BaseComboboxControl} with an {@link InputWrapper} to provide a
 * full-featured form field with label, optional description, and validation error display.
 *
 * @template T - The type of the selectable option values
 * @param options - Controller options including wrapper label/description and combobox configuration
 * @returns A combobox input wrapped in a form field with label and error display
 */
export const ComboboxControl = <T>(
  options: ControllerOptions<T, ComboboxOptions<T>>
) => {
  return InputWrapper({
    ...options,
    content: BaseComboboxControl(options),
  })
}
