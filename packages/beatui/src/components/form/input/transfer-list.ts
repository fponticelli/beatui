import {
  aria,
  attr,
  computedOf,
  html,
  on,
  prop,
  TNode,
  Use,
  Value,
  ForEach,
  When,
  Empty,
} from '@tempots/dom'
import { ControlSize } from '../../theme'
import { ThemeColorName } from '../../../tokens'
import { Icon } from '../../data/icon'
import { Button } from '../../button/button'
import { TextInput } from './text-input'
import { BeatUII18n } from '../../../beatui-i18n'

/** Configuration options for the {@link TransferList} component. */
export interface TransferListOptions<T> {
  /** Items available for selection (left panel). */
  available: Value<T[]>
  /** Items currently selected (right panel). */
  selected: Value<T[]>
  /** Callback invoked with the new selected items array after a transfer. */
  onChange: (selected: T[]) => void
  /** Render function for each item. */
  renderItem: (item: T) => TNode
  /** Extract a unique key from an item. */
  keyOf: (item: T) => string
  /** Extract searchable text from an item. Defaults to {@link keyOf}. */
  searchField?: (item: T) => string
  /** Whether to show search inputs on each panel. @default false */
  searchable?: Value<boolean>
  /** Whether the component is disabled. @default false */
  disabled?: Value<boolean>
  /** Size variant. @default 'md' */
  size?: Value<ControlSize>
  /** Theme color. @default 'primary' */
  color?: Value<ThemeColorName>
}

function generateTransferListClasses(
  size: ControlSize,
  disabled: boolean
): string {
  const cls = ['bc-transfer-list', `bc-transfer-list--size-${size}`]
  if (disabled) cls.push('bc-transfer-list--disabled')
  return cls.join(' ')
}

/**
 * A dual-list component for transferring items between "available" and
 * "selected" lists. Generic in `T` with user-provided render and key functions.
 *
 * Supports multi-select via checkboxes, move-selected / move-all actions
 * in both directions, and optional search filtering per panel.
 *
 * @typeParam T - The item type
 * @param options - Configuration for the transfer list
 * @returns A transfer list element
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { TransferList } from '@tempots/beatui'
 *
 * const available = prop(['Apple', 'Banana', 'Cherry', 'Date'])
 * const selected = prop<string[]>([])
 *
 * TransferList({
 *   available,
 *   selected,
 *   onChange: v => selected.set(v),
 *   renderItem: item => html.span(item),
 *   keyOf: item => item,
 *   searchable: true,
 * })
 * ```
 */
export function TransferList<T>(options: TransferListOptions<T>): TNode {
  const {
    available,
    selected,
    onChange,
    renderItem,
    keyOf,
    searchField,
    searchable = false,
    disabled = false,
    size = 'md',
    color = 'primary',
  } = options

  const leftChecked = prop<Set<string>>(new Set())
  const rightChecked = prop<Set<string>>(new Set())
  const leftSearch = prop('')
  const rightSearch = prop('')

  const toggleCheck = (checked: typeof leftChecked, key: string) => {
    const s = new Set(checked.value)
    if (s.has(key)) s.delete(key)
    else s.add(key)
    checked.set(s)
  }

  const searchFn = searchField ?? keyOf

  return Use(BeatUII18n, t => {
    // Move checked items from left to right
    const moveRight = () => {
      if (Value.get(disabled)) return
      const keys = leftChecked.value
      if (keys.size === 0) return
      const avail = Value.get(available)
      const sel = Value.get(selected)
      const toMove = avail.filter(item => keys.has(keyOf(item)))
      onChange([...sel, ...toMove])
      leftChecked.set(new Set())
    }

    // Move all from left to right
    const moveAllRight = () => {
      if (Value.get(disabled)) return
      const toMove = Value.get(leftItems)
      const sel = Value.get(selected)
      onChange([...sel, ...toMove])
      leftChecked.set(new Set())
    }

    // Move checked items from right to left
    const moveLeft = () => {
      if (Value.get(disabled)) return
      const keys = rightChecked.value
      if (keys.size === 0) return
      const sel = Value.get(selected)
      onChange(sel.filter(item => !keys.has(keyOf(item))))
      rightChecked.set(new Set())
    }

    // Move all from right to left
    const moveAllLeft = () => {
      if (Value.get(disabled)) return
      const visibleKeys = new Set(Value.get(rightItems).map(keyOf))
      const sel = Value.get(selected)
      onChange(sel.filter(item => !visibleKeys.has(keyOf(item))))
      rightChecked.set(new Set())
    }

    // Compute visible items for left panel (available minus selected)
    const leftItems = computedOf(
      available,
      selected,
      leftSearch
    )((avail, sel, search) => {
      const selectedKeys = new Set(sel.map(keyOf))
      const visible = avail.filter(item => !selectedKeys.has(keyOf(item)))
      if (!search) return visible
      const lower = search.toLowerCase()
      return visible.filter(item =>
        searchFn(item).toLowerCase().includes(lower)
      )
    })

    const rightItems = computedOf(
      selected,
      rightSearch
    )((sel, search) => {
      if (!search) return sel
      const lower = search.toLowerCase()
      return sel.filter(item => searchFn(item).toLowerCase().includes(lower))
    })

    const hasLeftChecked = Value.map(leftChecked, s => s.size > 0)
    const hasRightChecked = Value.map(rightChecked, s => s.size > 0)

    const renderPanel = (
      label: Value<string>,
      searchPlaceholder: Value<string>,
      items: Value<T[]>,
      checked: typeof leftChecked,
      search: typeof leftSearch
    ) =>
      html.div(
        attr.class('bc-transfer-list__panel'),
        html.div(
          attr.class('bc-transfer-list__panel-header'),
          html.span(attr.class('bc-transfer-list__panel-title'), label)
        ),
        When(
          searchable,
          () =>
            html.div(
              attr.class('bc-transfer-list__search'),
              TextInput({
                value: search,
                onInput: v => search.set(v),
                placeholder: searchPlaceholder,
                size: 'xs',
              })
            )
        ),
        html.div(
          attr.class('bc-transfer-list__items'),
          attr.role('listbox'),
          aria.label(label),
          ForEach(items, itemSignal => {
            const item = Value.get(itemSignal)
            const key = keyOf(item)
            const isChecked = Value.map(checked, (s): boolean => s.has(key))

            return html.div(
              attr.class(
                Value.map(isChecked, (c): string =>
                  c
                    ? 'bc-transfer-list__item bc-transfer-list__item--selected'
                    : 'bc-transfer-list__item'
                )
              ),
              attr.role('option'),
              aria.selected(
                Value.map(isChecked, (v): boolean | 'undefined' =>
                  v ? true : 'undefined'
                )
              ),
              on.click(() => {
                if (!Value.get(disabled)) toggleCheck(checked, key)
              }),
              html.span(
                attr.class('bc-transfer-list__item-check'),
                Icon({
                  icon: Value.map(isChecked, (c): string =>
                    c ? 'ri:checkbox-fill' : 'mdi:checkbox-blank-outline'
                  ),
                  size: 'sm',
                  accessibility: 'decorative',
                })
              ),
              html.span(
                attr.class('bc-transfer-list__item-content'),
                renderItem(item)
              )
            )
          })
        )
      )

    return html.div(
      attr.class(computedOf(size, disabled)(generateTransferListClasses)),
      attr.role('group'),
      // Left panel
      renderPanel(
        t.$.transferList.$.available,
        t.$.transferList.$.searchAvailable,
        leftItems,
        leftChecked,
        leftSearch
      ),
      // Action buttons
      html.div(
        attr.class('bc-transfer-list__actions'),
        Button(
          {
            variant: 'outline',
            size: 'sm',
            color,
            disabled: Value.map(hasLeftChecked, (h): boolean => !h),
            onClick: moveRight,
          },
          aria.label(t.$.transferList.$.moveRight),
          Icon({ icon: 'lucide:chevron-right', size: 'xs' })
        ),
        Button(
          {
            variant: 'outline',
            size: 'sm',
            color,
            disabled,
            onClick: moveAllRight,
          },
          aria.label(t.$.transferList.$.moveAllRight),
          Icon({ icon: 'lucide:chevrons-right', size: 'xs' })
        ),
        Button(
          {
            variant: 'outline',
            size: 'sm',
            color,
            disabled,
            onClick: moveAllLeft,
          },
          aria.label(t.$.transferList.$.moveAllLeft),
          Icon({ icon: 'lucide:chevrons-left', size: 'xs' })
        ),
        Button(
          {
            variant: 'outline',
            size: 'sm',
            color,
            disabled: Value.map(hasRightChecked, (h): boolean => !h),
            onClick: moveLeft,
          },
          aria.label(t.$.transferList.$.moveLeft),
          Icon({ icon: 'lucide:chevron-left', size: 'xs' })
        )
      ),
      // Right panel
      renderPanel(
        t.$.transferList.$.selected,
        t.$.transferList.$.searchSelected,
        rightItems,
        rightChecked,
        rightSearch
      )
    )
  })
}
