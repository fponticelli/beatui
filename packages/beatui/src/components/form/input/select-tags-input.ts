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
import { InputContainer } from './input-container'
import { InputOptions } from './input-options'
import { Tag } from '../../data/tag'
import { Icon } from '@/components/data'
import { DropdownOption } from './option'
import { Menu, MenuSeparator } from '@/components/navigation/menu'
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

export type SelectTagsOptions<T> = {
  options: Value<DropdownOption<T>[]>
  equality?: (a: T, b: T) => boolean
  placeholder?: Value<string>
} & InputOptions<T[]>

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
    before: options.before ?? Icon({ icon: 'tabler:tags', color: 'neutral' }),
    input: Fragment(
      attr.class('bc-input-container__tags'),
      Chips({
        values: value,
        placeholder,
        options: allOptions,
        equality,
        disabled: options.disabled,
        onRemove: removeOne,
      }),
      menu
    ),
  })
}

export function BaseSelectTagsControl<T>(
  options: BaseControllerOptions<T[], SelectTagsOptions<T>>
) {
  return BaseControl(SelectTagsInput<T>, options)
}

export function SelectTagsControl<T>(
  options: ControllerOptions<T[], SelectTagsOptions<T>>
) {
  return Control(SelectTagsInput<T>, options)
}
