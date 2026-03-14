import {
  aria,
  attr,
  computedOf,
  Empty,
  Ensure,
  ForEach,
  Fragment,
  html,
  NotEmpty,
  on,
  OnDispose,
  OneOfType,
  prop,
  Renderable,
  Signal,
  style,
  TNode,
  Use,
  Value,
  When,
  WithElement,
} from '@tempots/dom'
import { ElementRect } from '@tempots/ui'
import { InputContainer, InputIcon } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { DropdownOption, Option } from './option'
import { Badge } from '../../data/badge'
import { Icon } from '../../data'
import { Flyout } from '../../navigation/flyout'
import { BeatUII18n } from '../../../beatui-i18n'
import {
  BaseControlOptions,
  ControlOptions,
  BaseControl,
  Control,
} from '../control'
import {
  containsValue,
  filterOptionsByQuery,
  getLabelByValue,
  removeValue,
  toggleValue,
} from './tag-utils'
import { sessionId } from '../../../utils/session-id'

/**
 * Options for the {@link MultiSelect} component.
 *
 * @typeParam T - The type of option values.
 */
export type MultiSelectOptions<T> = {
  /** The available dropdown options to choose from. */
  options: Value<DropdownOption<T>[]>
  /**
   * Custom equality function for comparing option values.
   * @default (a, b) => a === b
   */
  equality?: (a: T, b: T) => boolean
  /** Placeholder text shown when no values are selected. */
  placeholder?: Value<string>
  /** Placeholder text for the search input inside the dropdown. */
  searchPlaceholder?: Value<string>
  /** Custom filter function for matching options against the search query. */
  filter?: (q: string, opt: { label: string }) => boolean
  /**
   * Async option loader. When provided, called with the search query.
   * The returned options replace the static `options` in the dropdown.
   */
  loadOptions?: (query: string) => Promise<DropdownOption<T>[]>
  /** Debounce delay in ms for async loading. @default 300 */
  loadDebounce?: number
  /** Maximum number of values that can be selected. */
  maxSelection?: Value<number | undefined>
  /** Whether to show "Select all" / "Clear all" action buttons. @default false */
  showActions?: Value<boolean>
  /** Label for the "Select all" action. @default 'Select all' */
  selectAllLabel?: Value<string>
  /** Label for the "Clear all" action. @default 'Clear all' */
  clearAllLabel?: Value<string>
  /**
   * Custom option renderer. Receives the option and whether it is selected.
   * Return a TNode to replace the default option rendering.
   */
  renderOption?: (
    option: { value: T; label: string; disabled?: boolean },
    selected: Value<boolean>
  ) => TNode
} & InputOptions<T[]>

/**
 * A fully-featured multi-select dropdown component.
 *
 * Combines a dropdown flyout with searchable options, selected-value chips,
 * keyboard navigation, async loading, select/clear all actions, and max
 * selection limits. Uses proper ARIA combobox/listbox semantics.
 *
 * @typeParam T - The type of option values.
 * @param options - Configuration options for the multi-select.
 * @returns A renderable multi-select component.
 *
 * @example
 * ```ts
 * MultiSelect({
 *   value: prop<string[]>([]),
 *   options: [
 *     Option.value('react', 'React'),
 *     Option.value('vue', 'Vue'),
 *     Option.group('Backend', [
 *       Option.value('node', 'Node.js'),
 *       Option.value('deno', 'Deno'),
 *     ]),
 *   ],
 *   placeholder: 'Select frameworks...',
 *   searchPlaceholder: 'Search...',
 *   showActions: true,
 *   maxSelection: 3,
 *   onChange: tags => console.log('Selected:', tags),
 * })
 * ```
 */
export function MultiSelect<T>(options: MultiSelectOptions<T>): TNode {
  const {
    value,
    options: staticOptions,
    equality = (a, b) => a === b,
    placeholder,
    searchPlaceholder,
    filter,
    loadOptions,
    loadDebounce = 300,
    maxSelection,
    showActions = false,
    selectAllLabel,
    clearAllLabel,
    renderOption,
  } = options

  const isOpen = prop(false)
  const query = prop('')
  const focusedIndex = prop(-1)
  const loading = prop(false)
  const asyncOptions = prop<DropdownOption<T>[] | null>(null)

  const dropdownId = sessionId('multi-select')
  const listboxId = sessionId('multi-select-listbox')

  let triggerElement: HTMLElement | undefined
  let searchInputElement: HTMLInputElement | undefined
  let listboxElement: HTMLElement | undefined
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  // The effective options: async-loaded if available, otherwise filtered static
  const effectiveOptions = computedOf(
    staticOptions,
    asyncOptions,
    query
  )((opts, async_, q) => {
    if (loadOptions && async_ != null) {
      return async_
    }
    return filterOptionsByQuery(opts, q, filter)
  })

  // All selectable values (flattened)
  const selectableValues = effectiveOptions.map(opts => Option.getValues(opts))

  // Reset focus when dropdown closes
  isOpen.onChange(open => {
    if (!open) {
      focusedIndex.set(-1)
      query.set('')
      asyncOptions.set(null)
    }
  })

  const removeOne = (v: T) => {
    const current = Value.get(value)
    options.onChange?.(removeValue(current, v, equality))
  }

  const toggleOne = (v: T) => {
    const current = Value.get(value)
    const max = Value.get(maxSelection)
    // If at max and trying to add, don't add
    if (
      max != null &&
      !containsValue(current, v, equality) &&
      current.length >= max
    ) {
      return
    }
    options.onChange?.(toggleValue(current, v, equality))
  }

  const selectAll = () => {
    const max = Value.get(maxSelection)
    const all = selectableValues.value
    const selected = max != null ? all.slice(0, max) : all
    options.onChange?.(selected)
  }

  const clearAll = () => {
    options.onChange?.([])
  }

  const selectedHas = (v: T): Value<boolean> =>
    computedOf(value)(vals => containsValue(vals, v, equality))

  // Async load handler
  const handleQueryChange = (q: string) => {
    query.set(q)
    if (loadOptions) {
      if (debounceTimer != null) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        loading.set(true)
        loadOptions(q)
          .then(result => {
            asyncOptions.set(result)
          })
          .finally(() => {
            loading.set(false)
          })
      }, loadDebounce)
    }
  }

  // Keyboard navigation
  const handleKeyDown = (ev: KeyboardEvent) => {
    const selectable = selectableValues.value
    switch (ev.key) {
      case 'ArrowDown': {
        ev.preventDefault()
        if (!isOpen.value) {
          isOpen.set(true)
          if (selectable.length > 0) {
            focusedIndex.set(0)
          }
          setTimeout(() => {
            requestAnimationFrame(() => searchInputElement?.focus())
          }, 0)
        } else {
          focusedIndex.set(
            Math.min(focusedIndex.value + 1, selectable.length - 1)
          )
        }
        break
      }
      case 'ArrowUp': {
        ev.preventDefault()
        if (isOpen.value) {
          focusedIndex.set(Math.max(focusedIndex.value - 1, 0))
        }
        break
      }
      case 'Enter': {
        ev.preventDefault()
        if (isOpen.value && focusedIndex.value >= 0) {
          const val = selectable[focusedIndex.value]
          if (val != null) toggleOne(val)
        } else if (!isOpen.value) {
          isOpen.set(true)
          if (selectable.length > 0) focusedIndex.set(0)
          setTimeout(() => {
            requestAnimationFrame(() => searchInputElement?.focus())
          }, 0)
        }
        break
      }
      case 'Escape': {
        if (isOpen.value) {
          ev.preventDefault()
          isOpen.set(false)
          triggerElement?.focus()
        }
        break
      }
      case 'Backspace': {
        // Remove last selected tag when search is empty
        if (query.value === '') {
          const current = Value.get(value)
          if (current.length > 0) {
            options.onChange?.(current.slice(0, -1))
          }
        }
        break
      }
      case ' ': {
        // If not in search input, toggle dropdown
        if (document.activeElement !== searchInputElement) {
          ev.preventDefault()
          isOpen.set(!isOpen.value)
          if (isOpen.value) {
            setTimeout(() => {
              requestAnimationFrame(() => searchInputElement?.focus())
            }, 0)
          }
        }
        break
      }
    }
  }

  // Focused value derived from index
  const focusedValue = computedOf(
    focusedIndex,
    selectableValues
  )((idx, vals): T | null => vals[idx] ?? null)

  // Render a single option item
  const renderOptionItem = (
    opt: { value: T; label: string; disabled?: boolean },
    depth: number
  ): TNode => {
    const selected = selectedHas(opt.value)
    const atMax = computedOf(
      value,
      maxSelection
    )((vals, max) => max != null && vals.length >= max)
    const isDisabled = computedOf(
      selected,
      atMax
    )((sel, max) => opt.disabled === true || (!sel && max))
    const isFocused = focusedValue.map(fv =>
      fv != null ? equality(fv, opt.value) : false
    )

    if (renderOption) {
      return html.div(
        attr.role('option'),
        attr.id(`multi-select-option-${String(opt.value)}`),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        aria.selected(selected as any),
        aria.disabled(isDisabled),
        attr.class(
          computedOf(
            isFocused,
            selected
          )((f, s) => {
            const cls = ['bc-multi-select__option']
            if (f) cls.push('bc-multi-select__option--focused')
            if (s) cls.push('bc-multi-select__option--selected')
            if (depth > 0) cls.push('bc-multi-select__option--grouped')
            return cls.join(' ')
          })
        ),
        on.click(() => toggleOne(opt.value)),
        renderOption(opt, selected)
      )
    }

    return html.div(
      attr.role('option'),
      attr.id(`multi-select-option-${String(opt.value)}`),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      aria.selected(selected as any),
      aria.disabled(isDisabled),
      attr.class(
        computedOf(
          isFocused,
          selected
        )((f, s) => {
          const cls = ['bc-multi-select__option']
          if (f) cls.push('bc-multi-select__option--focused')
          if (s) cls.push('bc-multi-select__option--selected')
          if (depth > 0) cls.push('bc-multi-select__option--grouped')
          return cls.join(' ')
        })
      ),
      on.click(() => toggleOne(opt.value)),
      html.span(
        attr.class('bc-multi-select__option-check'),
        When(selected, () =>
          Icon({ icon: 'ph:check-bold', size: 'xs', color: 'primary' })
        )
      ),
      html.span(attr.class('bc-multi-select__option-label'), opt.label)
    )
  }

  // Render a dropdown option (value, group, or break)
  const renderDropdownOption = (
    optSignal: Signal<DropdownOption<T>>
  ): Renderable =>
    Ensure(optSignal as Signal<DropdownOption<T> | undefined>, opt =>
      OneOfType(opt, {
        value: v =>
          renderOptionItem(
            {
              value: v.value.value,
              label: v.value.label,
              disabled: v.value.disabled,
            },
            0
          ),
        group: v =>
          html.div(
            attr.class('bc-multi-select__group'),
            html.div(attr.class('bc-multi-select__group-label'), v.$.group),
            ForEach(
              v.$.options as Value<DropdownOption<T>[]>,
              (childSignal: Signal<DropdownOption<T>>) =>
                Ensure(
                  childSignal as Signal<DropdownOption<T> | undefined>,
                  childOpt =>
                    OneOfType(childOpt, {
                      value: cv =>
                        renderOptionItem(
                          {
                            value: cv.value.value,
                            label: cv.value.label,
                            disabled: cv.value.disabled,
                          },
                          1
                        ),
                      group: () => Empty,
                      break: () =>
                        html.div(attr.class('bc-multi-select__separator')),
                    })
                )
            )
          ),
        break: () => html.div(attr.class('bc-multi-select__separator')),
      })
    )

  // Chips for selected values
  const chips = NotEmpty(
    value,
    () =>
      ForEach(value, item =>
        Badge(
          {
            variant: 'light',
            onClose: () => removeOne(item.value),
            disabled: options.disabled,
          },
          computedOf(
            item,
            staticOptions
          )((it, opts) => getLabelByValue(opts, it as T, equality))
        )
      ),
    () => html.span(attr.class('bc-input-container__placeholder'), placeholder)
  )

  return InputContainer(
    {
      ...options,
      before:
        options.before ??
        InputIcon({ icon: 'tabler:list-check', color: 'neutral' }),
      input: Fragment(
        attr.class('bc-input-container__tags bc-multi-select__tags'),
        chips,
        Icon(
          { icon: 'ph:caret-up-down-bold', color: 'neutral', size: 'xs' },
          attr.class('bc-multi-select__arrow')
        )
      ),
    },
    ElementRect(rect =>
      Fragment(
        WithElement(el => {
          triggerElement = el
          const handleClick = () => {
            if (isOpen.value) {
              isOpen.set(false)
            } else {
              isOpen.set(true)
              if (selectableValues.value.length > 0) {
                focusedIndex.set(0)
              }
              setTimeout(() => {
                requestAnimationFrame(() => searchInputElement?.focus())
              }, 0)
            }
          }
          el.addEventListener('keydown', handleKeyDown)
          el.addEventListener('click', handleClick)
          return OnDispose(() => {
            el.removeEventListener('keydown', handleKeyDown)
            el.removeEventListener('click', handleClick)
            if (debounceTimer != null) clearTimeout(debounceTimer)
          })
        }),
        CommonInputAttributes(options),
        attr.id(dropdownId),
        attr.tabindex(0),
        aria.controls(listboxId),
        aria.expanded(isOpen as Value<boolean | 'undefined'>),
        attr.class('bc-multi-select'),
        attr.role('combobox'),
        aria.activedescendant(
          computedOf(
            isOpen,
            focusedValue
          )((open, focused): string =>
            open && focused != null
              ? `multi-select-option-${String(focused)}`
              : ''
          )
        ),
        options.onBlur != null
          ? on.blur(() => {
              requestAnimationFrame(() => {
                if (
                  !listboxElement?.contains(document.activeElement) &&
                  !triggerElement?.contains(document.activeElement)
                ) {
                  isOpen.set(false)
                  options.onBlur!()
                }
              })
            })
          : Empty,

        Flyout({
          content: () =>
            html.div(
              WithElement(el => {
                listboxElement = el
              }),
              style.minWidth(rect.$.width.map(w => `${w - 10}px`)),
              attr.class('bc-multi-select__dropdown'),

              // Search input
              html.input(
                WithElement(el => {
                  searchInputElement = el as HTMLInputElement
                }),
                attr.type('text'),
                attr.class('bc-multi-select__search'),
                attr.placeholder(
                  computedOf(
                    searchPlaceholder,
                    placeholder
                  )((sph, ph) => sph ?? ph ?? 'Search...')
                ),
                attr.value(query),
                on.input(e => {
                  const target = e.target as HTMLInputElement
                  handleQueryChange(target.value)
                }),
                on.keydown(ev => {
                  // Let arrow keys and enter propagate for navigation
                  if (
                    ev.key === 'ArrowUp' ||
                    ev.key === 'ArrowDown' ||
                    ev.key === 'Enter'
                  ) {
                    handleKeyDown(ev)
                  } else if (ev.key === 'Escape') {
                    handleKeyDown(ev)
                  } else if (ev.key === 'Backspace' && query.value === '') {
                    handleKeyDown(ev)
                  }
                })
              ),

              // Actions bar (select all / clear all)
              When(showActions, () =>
                html.div(
                  attr.class('bc-multi-select__actions'),
                  html.button(
                    attr.type('button'),
                    attr.class('bc-multi-select__action'),
                    on.click(ev => {
                      ev.stopPropagation()
                      selectAll()
                    }),
                    selectAllLabel ?? 'Select all'
                  ),
                  html.span(attr.class('bc-multi-select__action-sep'), '|'),
                  html.button(
                    attr.type('button'),
                    attr.class('bc-multi-select__action'),
                    on.click(ev => {
                      ev.stopPropagation()
                      clearAll()
                    }),
                    clearAllLabel ?? 'Clear all'
                  )
                )
              ),

              // Loading indicator
              When(loading, () =>
                html.div(
                  attr.class('bc-multi-select__loading'),
                  Use(BeatUII18n, t => t.$.loadingShort)
                )
              ),

              // Options listbox
              html.div(
                attr.role('listbox'),
                attr.id(listboxId),
                aria.labelledby(dropdownId),
                WithElement(el => {
                  el.setAttribute('aria-multiselectable', 'true')
                }),
                attr.class('bc-multi-select__listbox'),

                When(
                  computedOf(
                    effectiveOptions,
                    loading
                  )((opts, l) => !l && opts.length === 0),
                  () =>
                    html.div(
                      attr.class('bc-multi-select__empty'),
                      Use(BeatUII18n, t => t.$.noResults)
                    )
                ),

                ForEach(effectiveOptions, renderDropdownOption)
              ),

              // Selection count
              When(
                computedOf(value)(v => v.length > 0),
                () =>
                  html.div(
                    attr.class('bc-multi-select__footer'),
                    computedOf(
                      value,
                      maxSelection
                    )((vals, max) =>
                      max != null
                        ? `${vals.length} / ${max} selected`
                        : `${vals.length} selected`
                    )
                  )
              )
            ),
          mainAxisOffset: 0,
          placement: 'bottom-start',
          hasPopup: 'listbox',
          open: isOpen,
          showOn: 'never',
          showDelay: 0,
          hideDelay: 0,
          closable: true,
        })
      )
    )
  )
}

/**
 * A base form control wrapper for {@link MultiSelect} using a raw controller.
 *
 * @typeParam T - The type of option values.
 * @param options - Base controller options for the multi-select control.
 * @returns A renderable form control component.
 */
export function BaseMultiSelectControl<T>(
  options: BaseControlOptions<T[], MultiSelectOptions<T>>
) {
  return BaseControl(MultiSelect<T>, options)
}

/**
 * A full form control wrapper for {@link MultiSelect} with label, error, and description support.
 *
 * @typeParam T - The type of option values.
 * @param options - Controller options for the multi-select control.
 * @returns A renderable form control component with wrapper.
 */
export function MultiSelectControl<T>(
  options: ControlOptions<T[], MultiSelectOptions<T>>
) {
  return Control(MultiSelect<T>, options)
}
