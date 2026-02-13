import {
  attr,
  ForEach,
  Fragment,
  html,
  on,
  TNode,
  Value,
  computedOf,
  aria,
  NotEmpty,
} from '@tempots/dom'
import { InputContainer, InputIcon } from './input-container'
import { InputOptions } from './input-options'
import { Tag } from '../../data/tag'
import { DropdownOption } from './option'
import { Menu, MenuSeparator } from '../../navigation/menu'
import {
  BaseControllerOptions,
  ControllerOptions,
  BaseControl,
  Control,
} from '../control'
import {
  getLabelByValue,
  removeValue,
  toggleValue,
  containsValue,
} from './tag-utils'

/**
 * Options for the {@link SelectTagsInput} component.
 * Combines tag selection with a click-to-open dropdown menu.
 *
 * @typeParam T - The type of tag values.
 */
export type SelectTagsOptions<T> = {
  /** The available dropdown options to choose from. */
  options: Value<DropdownOption<T>[]>
  /**
   * Custom equality function for comparing option values.
   * @default (a, b) => a === b
   */
  equality?: (a: T, b: T) => boolean
  /** Placeholder text shown when no tags are selected. */
  placeholder?: Value<string>
} & InputOptions<T[]>

/**
 * Renders selected values as removable tag chips with labels resolved from
 * dropdown options. Shows a placeholder when no values are selected.
 *
 * @typeParam T - The type of tag values.
 * @param opts - Options for the chips display.
 * @returns A renderable chips component.
 *
 * @example
 * ```ts
 * Chips({
 *   values: prop(['react']),
 *   options: [{ type: 'value', value: 'react', label: 'React' }],
 *   equality: (a, b) => a === b,
 *   onRemove: v => console.log('Remove:', v),
 * })
 * ```
 */
export function Chips<T>(opts: {
  values: Value<T[]>
  placeholder?: Value<string>
  options: Value<DropdownOption<T>[]>
  equality: (a: T, b: T) => boolean
  disabled?: Value<boolean>
  onRemove: (v: T) => void
}) {
  const { values, options, equality, disabled, onRemove } = opts
  return NotEmpty(
    values,
    () =>
      ForEach(values, item =>
        Tag({
          value: computedOf(
            item,
            options
          )((it, opts) => getLabelByValue(opts, it as T, equality)),
          onClose: () => onRemove(item.value),
          disabled,
        })
      ),
    () =>
      html.span(attr.class('bc-input-container__placeholder'), opts.placeholder)
  )
}

/**
 * A multi-select tag input with a click-to-open dropdown menu.
 *
 * Selected values are displayed as removable chips. Clicking the input area
 * opens a dropdown menu where items can be toggled on/off. Supports grouped
 * options and custom equality comparisons.
 *
 * @typeParam T - The type of tag values.
 * @param options - Configuration options for the select tags input.
 * @returns A renderable select tags input component.
 *
 * @example
 * ```ts
 * SelectTagsInput({
 *   value: prop<string[]>([]),
 *   options: [
 *     { type: 'value', value: 'red', label: 'Red' },
 *     { type: 'value', value: 'blue', label: 'Blue' },
 *     { type: 'value', value: 'green', label: 'Green' },
 *   ],
 *   placeholder: 'Select colors...',
 *   onChange: tags => console.log('Selected:', tags),
 * })
 * ```
 */
export function SelectTagsInput<T>(options: SelectTagsOptions<T>) {
  const {
    value,
    options: allOptions,
    equality = (a, b) => a === b,
    placeholder,
  } = options

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

  // Menu builder
  const menu = Menu({
    items: () => {
      const opts = Value.get(allOptions)
      const items: TNode[] = []
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
                // skip breaks inside groups for simplicity
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
    showOn: 'click',
    closable: true,
  })

  return InputContainer({
    ...options,
    before:
      options.before ?? InputIcon({ icon: 'tabler:tags', color: 'neutral' }),
    input: Fragment(
      attr.class('bc-input-container__tags'),
      menu,
      Chips({
        values: value,
        placeholder,
        options: allOptions,
        equality,
        disabled: options.disabled,
        onRemove: removeOne,
      })
      // html.div(
      //   attr.class('bc-input-container__tags-selector'),
      //   InputIcon({
      //     icon: 'line-md:plus',
      //     color: 'neutral',
      //     size: 'sm',
      //   }),
      //   menu
      // )
    ),
    after: InputIcon({
      icon: 'line-md:plus',
      color: 'neutral',
      size: 'sm',
    }),
  })
}

/**
 * A base form control wrapper for {@link SelectTagsInput} using a raw controller.
 *
 * @typeParam T - The type of tag values.
 * @param options - Base controller options for the select tags control.
 * @returns A renderable form control component.
 */
export function BaseSelectTagsControl<T>(
  options: BaseControllerOptions<T[], SelectTagsOptions<T>>
) {
  return BaseControl(SelectTagsInput<T>, options)
}

/**
 * A full form control wrapper for {@link SelectTagsInput} with label, error, and description support.
 *
 * @typeParam T - The type of tag values.
 * @param options - Controller options for the select tags control.
 * @returns A renderable form control component with wrapper.
 */
export function SelectTagsControl<T>(
  options: ControllerOptions<T[], SelectTagsOptions<T>>
) {
  return Control(SelectTagsInput<T>, options)
}
