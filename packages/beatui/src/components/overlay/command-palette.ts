import {
  aria,
  attr,
  computedOf,
  ForEach,
  html,
  on,
  prop,
  Renderable,
  TNode,
  Use,
  Value,
  When,
} from '@tempots/dom'
import { Icon } from '../data/icon'
import { FocusTrap } from '../../utils/focus-trap'
import { sessionId } from '../../utils/session-id'
import { Overlay } from './overlay'
import { BeatUII18n } from '../../beatui-i18n'

export interface CommandPaletteItem {
  id: string
  label: string
  description?: string
  icon?: string
  shortcut?: string[] // e.g., ['Ctrl', 'K'] — rendered as Kbd elements
  section?: string // group label
  onSelect: () => void
}

export interface CommandPaletteOptions {
  placeholder?: Value<string> // search input placeholder, default: 'Type a command...'
  emptyMessage?: Value<string> // shown when no results, default: 'No results found'
  size?: Value<'sm' | 'md' | 'lg'> // default: 'md'
  container?: 'body' | 'element' // default: 'body'
}

/**
 * A flat display entry for rendering command palette results.
 * Each entry corresponds to one item, with an optional section header
 * rendered above it if it's the first item in its section.
 */
interface DisplayEntry {
  item: CommandPaletteItem
  globalIndex: number
  /** Non-empty only for the first item in a section group */
  sectionStart: string | undefined
}

function buildDisplayEntries(
  items: CommandPaletteItem[],
  query: string
): DisplayEntry[] {
  const lower = query.toLowerCase()
  const filtered = lower
    ? items.filter(
        item =>
          item.label.toLowerCase().includes(lower) ||
          item.description?.toLowerCase().includes(lower)
      )
    : items

  // Group by section preserving order
  const groups = new Map<string, CommandPaletteItem[]>()
  for (const item of filtered) {
    const section = item.section ?? ''
    if (!groups.has(section)) groups.set(section, [])
    groups.get(section)!.push(item)
  }

  const result: DisplayEntry[] = []
  let globalIndex = 0
  for (const [section, sectionItems] of groups) {
    for (let i = 0; i < sectionItems.length; i++) {
      result.push({
        item: sectionItems[i],
        globalIndex: globalIndex++,
        sectionStart: i === 0 && section ? section : undefined,
      })
    }
  }
  return result
}

export function CommandPalette(
  options: CommandPaletteOptions,
  fn: (open: (items: CommandPaletteItem[]) => void, close: () => void) => TNode
): Renderable {
  const { placeholder, emptyMessage, size = 'md', container = 'body' } = options

  return Use(BeatUII18n, t =>
    Overlay((openOverlay, closeOverlay) => {
      const resolvedPlaceholder = placeholder ?? t.$.typeACommand
      const resolvedEmptyMessage = emptyMessage ?? t.$.noResultsFound
      const open = (items: CommandPaletteItem[]) => {
        const query = prop('')
        const selectedIndex = prop(0)

        // Reset selection when query changes
        query.on(() => selectedIndex.set(0))

        const paletteId = sessionId('command-palette')
        const inputId = `${paletteId}-input`

        // Flat display entries computed from query only (not selectedIndex)
        const displayEntries = query.map(q =>
          buildDisplayEntries(items, q ?? '')
        )
        const isEmpty = displayEntries.map(entries => entries.length === 0)

        const content = html.div(
          attr.class(
            Value.map(
              size,
              s => `bc-command-palette bc-command-palette--size-${s ?? 'md'}`
            )
          ),
          attr.role('dialog'),
          aria.modal(true),
          aria.label(t.$.commandPalette),
          on.mousedown(e => e.stopPropagation()),

          FocusTrap({
            escapeDeactivates: false,
            initialFocus: () => document.getElementById(inputId),
          }),

          // Header with search
          html.div(
            attr.class('bc-command-palette__header'),
            html.span(
              attr.class('bc-command-palette__search-icon'),
              Icon({
                icon: 'mdi:magnify',
                size: 'md',
                accessibility: 'decorative',
              })
            ),
            html.input(
              attr.class('bc-command-palette__input'),
              attr.type('text'),
              attr.id(inputId),
              attr.placeholder(resolvedPlaceholder),
              attr.autocomplete('off'),
              on.input(e => {
                query.set((e.target as HTMLInputElement).value)
              }),
              on.keydown((e: KeyboardEvent) => {
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
                      const entry = entries.find(
                        en => en.globalIndex === current
                      )
                      if (entry) {
                        entry.item.onSelect()
                        closeOverlay()
                      }
                    }
                    break
                }
              })
            )
          ),

          // Body with results
          html.div(
            attr.class('bc-command-palette__body'),
            When(
              isEmpty,
              () =>
                html.div(
                  attr.class('bc-command-palette__empty'),
                  resolvedEmptyMessage
                ),
              () =>
                ForEach(displayEntries, entrySignal => {
                  const isSelected = computedOf(
                    selectedIndex,
                    entrySignal
                  )((idx, e) => idx === e.globalIndex)

                  return html.div(
                    attr.class('bc-command-palette__section'),
                    // Section header (only for the first item in a section)
                    When(
                      entrySignal.map(e => e.sectionStart != null),
                      () =>
                        html.div(
                          attr.class('bc-command-palette__section-title'),
                          entrySignal.map(e => e.sectionStart ?? '')
                        )
                    ),
                    // Item
                    html.div(
                      attr.class(
                        Value.map(
                          isSelected,
                          sel =>
                            `bc-command-palette__item${sel ? ' bc-command-palette__item--selected' : ''}`
                        )
                      ),
                      attr.role('option'),
                      aria.selected(isSelected),
                      on.click(() => {
                        Value.get(entrySignal).item.onSelect()
                        closeOverlay()
                      }),
                      on.mouseenter(() => {
                        selectedIndex.set(Value.get(entrySignal).globalIndex)
                      }),
                      When(
                        entrySignal.map(e => e.item.icon != null),
                        () =>
                          html.span(
                            attr.class('bc-command-palette__item-icon'),
                            Icon({
                              icon: entrySignal.map(e => e.item.icon ?? ''),
                              size: 'sm',
                              accessibility: 'decorative',
                            })
                          )
                      ),
                      html.span(
                        attr.class('bc-command-palette__item-content'),
                        html.span(
                          attr.class('bc-command-palette__item-label'),
                          entrySignal.map(e => e.item.label)
                        ),
                        When(
                          entrySignal.map(e => e.item.description != null),
                          () =>
                            html.span(
                              attr.class(
                                'bc-command-palette__item-description'
                              ),
                              entrySignal.map(e => e.item.description ?? '')
                            )
                        )
                      ),
                      When(
                        entrySignal.map(
                          e =>
                            e.item.shortcut != null &&
                            e.item.shortcut.length > 0
                        ),
                        () =>
                          html.span(
                            attr.class('bc-command-palette__item-shortcut'),
                            ForEach(
                              entrySignal.map(e => e.item.shortcut ?? []),
                              keySignal =>
                                html.kbd(
                                  attr.class('bc-kbd bc-kbd--size-xs'),
                                  keySignal
                                )
                            )
                          )
                      )
                    )
                  )
                })
            )
          )
        )

        openOverlay({
          mode: 'capturing',
          effect: 'transparent',
          container,
          content,
          onClickOutside: closeOverlay,
          onEscape: closeOverlay,
        })
      }

      return fn(open, closeOverlay)
    })
  )
}
