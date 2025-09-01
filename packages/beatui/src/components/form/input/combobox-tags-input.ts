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
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { InputOptions } from './input-options'
import { Icon } from '@/components/data'
import { DropdownOption } from './option'
import { Menu, MenuSeparator } from '@/components/navigation/menu'
import { BeatUII18n } from '@/beatui-i18n'
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
import { AutoFocus } from '@tempots/ui'

export type ComboboxTagsOptions<T> = {
  options: Value<DropdownOption<T>[]>
  equality?: (a: T, b: T) => boolean
  placeholder?: Value<string>
  searchPlaceholder?: Value<string>
  filter?: (q: string, opt: { label: string }) => boolean
} & InputOptions<T[]>

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
      // Search input
      items.push(
        html.div(
          attr.class('bc-dropdown__search'),
          html.input(
            AutoFocus(),
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
          )
        )
      )

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
    showOn: 'click',
    closable: true,
  })

  return InputContainer(
    {
      ...options,
      before: options.before ?? Icon({ icon: 'tabler:tags', color: 'neutral' }),
      input: Fragment(
        attr.class('bc-input-container__tags'),
        Chips({
          values: value,
          options: allOptions,
          placeholder,
          equality,
          disabled: options.disabled,
          onRemove: removeOne,
        })
      ),
    },
    menu
  )
}

export function BaseComboboxTagsControl<T>(
  options: BaseControllerOptions<T[], ComboboxTagsOptions<T>>
) {
  return BaseControl(ComboboxTagsInput<T>, options)
}

export function ComboboxTagsControl<T>(
  options: ControllerOptions<T[], ComboboxTagsOptions<T>>
) {
  return Control(ComboboxTagsInput<T>, options)
}
