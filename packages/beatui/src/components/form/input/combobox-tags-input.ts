import {
  attr,
  Fragment,
  html,
  on,
  prop,
  TNode,
  Value,
  Use,
  computedOf,
  aria,
  WithElement,
  OnDispose,
} from '@tempots/dom'
import { InputContainer, InputIcon } from './input-container'
import { InputOptions } from './input-options'
import { DropdownOption } from './option'
import { Menu, MenuSeparator } from '../../navigation/menu'
import { BeatUII18n } from '../../../beatui-i18n'
import {
  BaseControllerOptions,
  ControllerOptions,
  BaseControl,
  Control,
} from '../control'
import {
  removeValue,
  toggleValue,
  containsValue,
  filterOptionsByQuery,
} from './tag-utils'
import { Chips } from './select-tags-input'
// AutoFocus not needed since search is always visible

/**
 * Options for the {@link ComboboxTagsInput} component.
 * Combines tag selection with a searchable dropdown.
 *
 * @typeParam T - The type of tag values.
 */
export type ComboboxTagsOptions<T> = {
  /** The available dropdown options to choose from. */
  options: Value<DropdownOption<T>[]>
  /**
   * Custom equality function for comparing option values.
   * @default (a, b) => a === b
   */
  equality?: (a: T, b: T) => boolean
  /** Placeholder text shown when no tags are selected. */
  placeholder?: Value<string>
  /** Placeholder text for the search input field. */
  searchPlaceholder?: Value<string>
  /** Custom filter function for matching options against the search query. */
  filter?: (q: string, opt: { label: string }) => boolean
} & InputOptions<T[]>

/**
 * A multi-select tag input with an integrated searchable dropdown.
 *
 * Selected values are displayed as removable chips. An always-visible search
 * input filters the dropdown options. Clicking a dropdown item toggles
 * its selection. Supports grouped options and custom filtering.
 *
 * @typeParam T - The type of tag values.
 * @param options - Configuration options for the combobox tags input.
 * @returns A renderable combobox tags input component.
 *
 * @example
 * ```ts
 * ComboboxTagsInput({
 *   value: prop<string[]>([]),
 *   options: [
 *     { type: 'value', value: 'react', label: 'React' },
 *     { type: 'value', value: 'vue', label: 'Vue' },
 *     { type: 'value', value: 'angular', label: 'Angular' },
 *   ],
 *   placeholder: 'Select frameworks...',
 *   searchPlaceholder: 'Search...',
 *   onChange: tags => console.log('Selected:', tags),
 * })
 * ```
 */
export function ComboboxTagsInput<T>(options: ComboboxTagsOptions<T>) {
  const {
    value,
    options: allOptions,
    equality = (a, b) => a === b,
    placeholder,
    searchPlaceholder,
    filter,
  } = options

  const query = prop('')

  const removeOne = (v: T) => {
    const current = Value.get(value)
    options.onChange?.(removeValue(current, v, equality))
  }

  const toggleOne = (v: T) => {
    const current = Value.get(value)
    options.onChange?.(toggleValue(current, v, equality))
  }

  const selectedHas = (v: T) =>
    computedOf(value)(vals => containsValue(vals, v, equality))

  const filteredOptions = computedOf(
    allOptions,
    query
  )((opts, q) => filterOptionsByQuery(opts, q, filter))

  const menu = Menu({
    items: () => {
      const items: TNode[] = []
      const opts = Value.get(filteredOptions)
      if (opts.length === 0) {
        items.push(
          html.div(
            attr.class('bc-dropdown__empty'),
            Use(BeatUII18n, t => t.$.noResults)
          )
        )
        return items
      }

      for (const opt of opts) {
        if (opt.type === 'value') {
          const selected = selectedHas(opt.value)
          items.push(
            html.div(
              attr.role('menuitem'),
              attr.tabindex(-1),
              aria.disabled(opt.disabled === true),
              aria.checked(selected as Value<boolean | 'mixed'>),
              attr.class('bc-menu-item'),
              html.span(attr.class('bc-menu-item__content'), opt.label),
              on.click(() => toggleOne(opt.value))
            )
          )
        } else if (opt.type === 'group') {
          items.push(
            html.div(
              attr.class('bc-menu-group'),
              html.div(attr.class('bc-menu-group__label'), opt.group),
              ...opt.options.map(o => {
                if (o.type === 'value') {
                  const selected = selectedHas(o.value)
                  return html.div(
                    attr.role('menuitem'),
                    attr.tabindex(-1),
                    aria.disabled(o.disabled === true),
                    aria.checked(selected as Value<boolean | 'mixed'>),
                    attr.class('bc-menu-item'),
                    html.span(attr.class('bc-menu-item__content'), o.label),
                    on.click(() => toggleOne(o.value))
                  )
                }
                return Fragment()
              })
            )
          )
        } else {
          items.push(MenuSeparator())
        }
      }

      return items
    },
    placement: 'bottom-start',
    showDelay: 0,
    hideDelay: 100,
    // Open the menu when the search input gains focus
    // We intentionally do not auto-hide on blur here because the Menu
    // manages its own close behavior (outside click, Escape, etc.)
    showOn: (flyoutShow, _flyoutHide) => {
      return WithElement(trigger => {
        const input = trigger.querySelector(
          '.bc-dropdown__search-input'
        ) as HTMLInputElement | null
        if (input) {
          const onFocus = () => flyoutShow()
          input.addEventListener('focus', onFocus)
          return OnDispose(() => {
            input.removeEventListener('focus', onFocus)
          })
        }
        return Fragment()
      })
    },
    closable: true,
  })

  return InputContainer({
    ...options,
    before:
      options.before ?? InputIcon({ icon: 'tabler:tags', color: 'neutral' }),
    input: Fragment(
      attr.class('bc-input-container__tags'),
      Chips({
        values: value,
        options: allOptions,
        placeholder,
        equality,
        disabled: options.disabled,
        onRemove: removeOne,
      }),
      // Always-visible search box replacing the selector button
      html.div(
        attr.class('bc-input-container__tags-selector'),
        html.input(
          attr.type('text'),
          attr.class('bc-dropdown__search-input'),
          attr.placeholder(
            computedOf(
              searchPlaceholder,
              placeholder
            )((sph, ph) => sph ?? ph ?? '')
          ),
          attr.value(query),
          on.input(e => {
            const target = e.target as HTMLInputElement
            query.set(target.value)
          }),
          on.keydown(ev => {
            // Prevent Menu global handler while typing
            if (
              ev.key === 'ArrowUp' ||
              ev.key === 'ArrowDown' ||
              ev.key === 'Enter' ||
              ev.key === ' '
            ) {
              ev.stopPropagation()
            }
          })
        ),
        menu
      )
    ),
  })
}

/**
 * A base form control wrapper for {@link ComboboxTagsInput} using a raw controller.
 *
 * @typeParam T - The type of tag values.
 * @param options - Base controller options for the combobox tags control.
 * @returns A renderable form control component.
 */
export function BaseComboboxTagsControl<T>(
  options: BaseControllerOptions<T[], ComboboxTagsOptions<T>>
) {
  return BaseControl(ComboboxTagsInput<T>, options)
}

/**
 * A full form control wrapper for {@link ComboboxTagsInput} with label, error, and description support.
 *
 * @typeParam T - The type of tag values.
 * @param options - Controller options for the combobox tags control.
 * @returns A renderable form control component with wrapper.
 */
export function ComboboxTagsControl<T>(
  options: ControllerOptions<T[], ComboboxTagsOptions<T>>
) {
  return Control(ComboboxTagsInput<T>, options)
}
