import {
  aria,
  attr,
  computedOf,
  dataAttr,
  html,
  on,
  OnDispose,
  prop,
  TNode,
  Use,
  Value,
  MapSignal,
  Fragment,
  WithElement,
} from '@tempots/dom'
import { ControlSize } from '../../theme'
import { Icon } from '../../data/icon'
import { BeatUII18n } from '../../../beatui-i18n'

/** Visual variant for the sortable list items. */
export type SortableListVariant = 'bordered' | 'card' | 'plain'

/** Configuration options for the {@link SortableList} component. */
export interface SortableListOptions<T> {
  /** The ordered list of items. */
  items: Value<T[]>
  /** Callback invoked with the reordered list after a drag-and-drop or keyboard reorder. */
  onChange: (items: T[]) => void
  /**
   * Render function for each item. The `handle` TNode is a drag grip
   * that should be placed inside the returned element to serve as the
   * drag handle. Only the handle initiates drag — the rest of the item
   * content remains interactive.
   */
  renderItem: (item: T, handle: TNode) => TNode
  /** Extract a unique key from an item (used for identity). */
  keyOf: (item: T) => string
  /** Whether drag-and-drop is disabled. @default false */
  disabled?: Value<boolean>
  /** Size variant. @default 'md' */
  size?: Value<ControlSize>
  /** Additional CSS class(es) applied to the list container. */
  class?: Value<string>
  /**
   * Visual variant for items.
   * - `'bordered'` — border around each item (default)
   * - `'card'` — elevated card with shadow, no border
   * - `'plain'` — no border, no background — items blend into the page
   * @default 'bordered'
   */
  variant?: Value<SortableListVariant>
  /** Gap between items. Mapped to CSS spacing tokens. @default 'md' */
  gap?: Value<ControlSize>
  /**
   * Iconify icon identifier for the drag handle.
   * @default 'lucide:grip-vertical'
   */
  handleIcon?: Value<string>
}

function generateSortableListClasses(
  size: ControlSize,
  disabled: boolean,
  variant: SortableListVariant,
  gap: ControlSize,
  extraClass: string
): string {
  const cls = [
    'bc-sortable-list',
    `bc-sortable-list--size-${size}`,
    `bc-sortable-list--variant-${variant}`,
    `bc-sortable-list--gap-${gap}`,
  ]
  if (disabled) cls.push('bc-sortable-list--disabled')
  if (extraClass) cls.push(extraClass)
  return cls.join(' ')
}

/**
 * A drag-and-drop reorderable list.
 *
 * Each item receives a drag handle TNode that the consumer places inside
 * their render function. Dragging initiates only from the handle. Items
 * can also be reordered via keyboard using Alt+ArrowUp / Alt+ArrowDown.
 *
 * @typeParam T - The item type
 * @param options - Configuration for the sortable list
 * @returns A sortable list element
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { SortableList } from '@tempots/beatui'
 *
 * const items = prop(['Apple', 'Banana', 'Cherry'])
 * SortableList({
 *   items,
 *   onChange: v => items.set(v),
 *   renderItem: (item, handle) =>
 *     html.div(attr.class('flex items-center gap-2'), handle, item),
 *   keyOf: item => item,
 * })
 * ```
 */
export function SortableList<T>(options: SortableListOptions<T>): TNode {
  const {
    items,
    onChange,
    renderItem,
    keyOf,
    disabled = false,
    size = 'md',
    class: extraClass = '',
    variant = 'bordered',
    gap = 'md',
    handleIcon = 'lucide:grip-vertical',
  } = options

  const dragFromIndex = prop<number | null>(null)
  const dragOverIndex = prop<number | null>(null)
  const handleArmedIndex = prop<number | null>(null)

  let listEl: HTMLElement | null = null
  let focusTargetKey: string | null = null

  function moveItemByKeyboard(fromIndex: number, toIndex: number) {
    const currentItems = Value.get(items)
    if (toIndex < 0 || toIndex >= currentItems.length) return
    const arr = [...currentItems]
    const [moved] = arr.splice(fromIndex, 1)
    arr.splice(toIndex, 0, moved)
    focusTargetKey = keyOf(moved)
    onChange(arr)
    requestAnimationFrame(() => {
      if (listEl && focusTargetKey) {
        const allItems = listEl.querySelectorAll('[data-key]')
        for (const el of allItems) {
          if (el.getAttribute('data-key') === focusTargetKey) {
            ;(el as HTMLElement).focus()
            break
          }
        }
        focusTargetKey = null
      }
    })
  }

  return Use(BeatUII18n, t => {
    return html.div(
      attr.class(
        computedOf(
          size,
          disabled,
          variant,
          gap,
          extraClass
        )(generateSortableListClasses)
      ),
      attr.role('list'),
      aria.label(t.$.sortableList.$.dragHandle),
      WithElement(el => {
        listEl = el as HTMLElement
        const onMouseUp = () => handleArmedIndex.set(null)
        document.addEventListener('mouseup', onMouseUp)
        return OnDispose(() => {
          listEl = null
          document.removeEventListener('mouseup', onMouseUp)
        })
      }),
      MapSignal(Value.toSignal(items), itemsList =>
        Fragment(
          ...itemsList.map((item, index) => {
            const key = keyOf(item)
            const isDragging = Value.map(
              dragFromIndex,
              (from): boolean => from === index
            )
            const isDropTarget = Value.map(
              dragOverIndex,
              (over): boolean => over === index
            )

            const itemClass = computedOf(
              isDragging,
              isDropTarget
            )((dragging, dropTarget): string => {
              const cls = ['bc-sortable-list__item']
              if (dragging) cls.push('bc-sortable-list__item--dragging')
              if (dropTarget) cls.push('bc-sortable-list__item--drop-target')
              return cls.join(' ')
            })

            const handle = html.span(
              attr.class('bc-sortable-list__handle'),
              attr.title(t.$.sortableList.$.dragHandle),
              on.mousedown(e => {
                if (Value.get(disabled)) return
                e.stopPropagation()
                handleArmedIndex.set(index)
              }),
              Icon({
                icon: handleIcon,
                size: 'sm',
              })
            )

            return html.div(
              attr.class(itemClass),
              attr.role('listitem'),
              attr.tabindex(Value.map(disabled, (d): number => (d ? -1 : 0))),
              attr.draggable(
                computedOf(
                  disabled,
                  Value.map(handleArmedIndex, a => a === index)
                )((d, armed) => (d ? undefined : armed ? 'true' : undefined))
              ),
              dataAttr('key', key),
              on.keydown(e => {
                if (Value.get(disabled)) return
                if (e.altKey && e.key === 'ArrowUp') {
                  e.preventDefault()
                  moveItemByKeyboard(index, index - 1)
                } else if (e.altKey && e.key === 'ArrowDown') {
                  e.preventDefault()
                  moveItemByKeyboard(index, index + 1)
                }
              }),
              on.dragstart(e => {
                if (Value.get(disabled)) return
                dragFromIndex.set(index)
                if (e.dataTransfer) {
                  e.dataTransfer.effectAllowed = 'move'
                  e.dataTransfer.setData('text/plain', String(index))
                }
              }),
              on.dragover(e => {
                e.preventDefault()
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
                dragOverIndex.set(index)
              }),
              on.dragleave(() => {
                if (dragOverIndex.value === index) {
                  dragOverIndex.set(null)
                }
              }),
              on.drop(e => {
                e.preventDefault()
                const from = dragFromIndex.value
                if (from != null && from !== index) {
                  const arr = [...Value.get(items)]
                  const [moved] = arr.splice(from, 1)
                  arr.splice(index, 0, moved)
                  onChange(arr)
                }
                dragFromIndex.set(null)
                dragOverIndex.set(null)
              }),
              on.dragend(() => {
                dragFromIndex.set(null)
                dragOverIndex.set(null)
                handleArmedIndex.set(null)
              }),
              renderItem(item, handle)
            )
          })
        )
      )
    )
  })
}
