import {
  TNode,
  Value,
  attr,
  html,
  on,
  prop,
  computedOf,
  ForEach,
  When,
  Empty,
} from '@tempots/dom'
import { Icon } from '../data'

export interface BlockCommandItem {
  /** Icon name for the command */
  icon: string
  /** Display label */
  label: string
  /** Optional description text */
  description?: string
  /** Optional keyboard shortcut */
  shortcut?: string
  /** Callback when this command is selected */
  onSelect: () => void
}

export interface BlockCommandPaletteOptions {
  /** List of available commands */
  items: Value<BlockCommandItem[]>
  /** Callback when the palette should close */
  onClose: () => void
  /** Position (if absolute positioning is needed) */
  position?: Value<{ x: number; y: number }>
}

interface DisplayEntry {
  item: BlockCommandItem
  index: number
}

function buildDisplayEntries(
  items: BlockCommandItem[],
  query: string
): DisplayEntry[] {
  const lower = query.toLowerCase()
  const filtered = query
    ? items.filter(
        item =>
          item.label.toLowerCase().includes(lower) ||
          (item.description?.toLowerCase().includes(lower) ?? false)
      )
    : items

  return filtered.map((item, index) => ({ item, index }))
}

export function BlockCommandPalette(
  options: BlockCommandPaletteOptions
): TNode {
  const { items, onClose, position } = options
  const searchText = prop('')
  const selectedIndex = prop(0)

  // Reset selection when query changes
  searchText.on(() => selectedIndex.set(0))

  const displayEntries = computedOf(
    items,
    searchText
  )((allItems, query) => buildDisplayEntries(allItems, query ?? ''))

  const handleKeyDown = (e: KeyboardEvent) => {
    const entries = Value.get(displayEntries)
    const current = Value.get(selectedIndex)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        selectedIndex.set(Math.min(current + 1, entries.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        selectedIndex.set(Math.max(current - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        {
          const entry = entries.find(e => e.index === current)
          if (entry) {
            entry.item.onSelect()
            onClose()
          }
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  const positionStyle = position
    ? computedOf(position)(pos =>
        pos ? `position: absolute; left: ${pos.x}px; top: ${pos.y}px;` : ''
      )
    : undefined

  return html.div(
    attr.class('bc-block-command-palette'),
    positionStyle ? attr.style(positionStyle) : Empty,
    on.keydown(handleKeyDown),

    // Search header
    html.div(
      attr.class('bc-block-command-palette__search'),
      html.span(attr.class('bc-block-command-palette__search-prefix'), '/'),
      html.input(
        attr.class('bc-block-command-palette__search-input'),
        attr.type('text'),
        attr.placeholder('Type a command...'),
        attr.autofocus(true),
        attr.value(searchText),
        on.input((e: Event) => {
          searchText.set((e.target as HTMLInputElement).value)
          selectedIndex.set(0)
        })
      )
    ),

    // Command list
    html.div(
      attr.class('bc-block-command-palette__list'),
      ForEach(displayEntries, entrySignal => {
        const isSelected = computedOf(
          selectedIndex,
          entrySignal
        )((idx, e) => idx === e.index)

        return html.div(
          attr.class(
            Value.map(
              isSelected,
              sel =>
                `bc-block-command-palette__item${sel ? ' bc-block-command-palette__item--selected' : ''}`
            )
          ),
          on.click(() => {
            const entry = Value.get(entrySignal)
            entry.item.onSelect()
            onClose()
          }),
          on.mouseenter(() => {
            selectedIndex.set(Value.get(entrySignal).index)
          }),
          html.span(
            attr.class('bc-block-command-palette__item-icon'),
            Icon({
              icon: entrySignal.map(e => e.item.icon),
              size: 'sm',
              accessibility: 'decorative',
            })
          ),
          html.div(
            attr.class('bc-block-command-palette__item-content'),
            html.span(
              attr.class('bc-block-command-palette__item-label'),
              entrySignal.map(e => e.item.label)
            ),
            When(
              entrySignal.map(e => e.item.description != null),
              () =>
                html.span(
                  attr.class('bc-block-command-palette__item-desc'),
                  entrySignal.map(e => e.item.description ?? '')
                )
            )
          ),
          When(
            entrySignal.map(e => e.item.shortcut != null),
            () =>
              html.span(
                attr.class('bc-block-command-palette__item-shortcut'),
                entrySignal.map(e => e.item.shortcut ?? '')
              )
          )
        )
      })
    ),

    // Empty state
    When(
      computedOf(displayEntries)(entries => entries.length === 0),
      () =>
        html.div(
          attr.class('bc-block-command-palette__empty'),
          'No matching commands'
        )
    )
  )
}
