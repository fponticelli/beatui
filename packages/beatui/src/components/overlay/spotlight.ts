import {
  aria,
  attr,
  computedOf,
  ForEach,
  html,
  on,
  OnDispose,
  prop,
  Renderable,
  Signal,
  TNode,
  Use,
  Value,
  When,
  WithElement,
} from '@tempots/dom'
import { Icon } from '../data/icon'
import { FocusTrap } from '../../utils/focus-trap'
import { sessionId } from '../../utils/session-id'
import { Overlay } from './overlay'
import { BeatUII18n } from '../../beatui-i18n'

export interface SpotlightItem {
  id: string
  label: string
  description?: string
  icon?: string
  shortcut?: string[]
  section?: string
  /** Extra terms for fuzzy search */
  keywords?: string[]
  onSelect: () => void
}

export interface SpotlightOptions {
  items: Value<SpotlightItem[]>
  onSelect?: (item: SpotlightItem) => void
  placeholder?: Value<string>
  emptyMessage?: Value<string>
  /** @default 'md' */
  size?: Value<'sm' | 'md' | 'lg'>
  recentItems?: Value<SpotlightItem[]>
  /** @default 'mod+k' */
  hotkey?: string
  /** @default 'body' */
  container?: 'body' | 'element'
}

export interface SpotlightController {
  open: (items?: SpotlightItem[]) => void
  close: () => void
  isOpen: Signal<boolean>
}

/**
 * A flat display entry for rendering spotlight results.
 * Each entry corresponds to one item, with an optional section header
 * rendered above it if it's the first item in its section.
 */
interface DisplayEntry {
  item: SpotlightItem
  globalIndex: number
  /** Non-empty only for the first item in a section group */
  sectionStart: string | undefined
}

/**
 * Fuzzy-search: check if each character of `query` appears in order
 * within `text`. Returns a score (lower = tighter match = better).
 * Returns -1 if no match.
 */
function fuzzyScore(query: string, text: string): number {
  if (!query) return 0
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  let textIdx = 0
  let lastMatchIdx = -1
  let score = 0

  for (let i = 0; i < lowerQuery.length; i++) {
    const ch = lowerQuery[i]
    const matchIdx = lowerText.indexOf(ch, textIdx)
    if (matchIdx === -1) return -1
    // Penalize gaps between matches
    if (lastMatchIdx !== -1) {
      score += matchIdx - lastMatchIdx - 1
    }
    lastMatchIdx = matchIdx
    textIdx = matchIdx + 1
  }
  return score
}

function buildDisplayEntries(
  items: SpotlightItem[],
  query: string,
  recentItems: SpotlightItem[],
  recentLabel: string
): DisplayEntry[] {
  if (!query) {
    // Show recent items when no query
    if (recentItems.length > 0) {
      const result: DisplayEntry[] = []
      for (let i = 0; i < recentItems.length; i++) {
        result.push({
          item: recentItems[i],
          globalIndex: i,
          sectionStart: i === 0 ? recentLabel : undefined,
        })
      }
      return result
    }
    // No query and no recent: show all items grouped by section
    return buildGroupedEntries(items, 0)
  }

  // Fuzzy filter and score
  const scored: Array<{ item: SpotlightItem; score: number }> = []
  for (const item of items) {
    const searchText = [
      item.label,
      item.description ?? '',
      ...(item.keywords ?? []),
    ].join(' ')
    const score = fuzzyScore(query, searchText)
    if (score !== -1) {
      scored.push({ item, score })
    }
  }

  // Sort by score ascending (lower = tighter)
  scored.sort((a, b) => a.score - b.score)

  const result: DisplayEntry[] = []
  let globalIndex = 0
  for (const { item } of scored) {
    result.push({
      item,
      globalIndex: globalIndex++,
      sectionStart: undefined,
    })
  }
  return result
}

function buildGroupedEntries(
  items: SpotlightItem[],
  startIndex: number
): DisplayEntry[] {
  const groups = new Map<string, SpotlightItem[]>()
  for (const item of items) {
    const section = item.section ?? ''
    if (!groups.has(section)) groups.set(section, [])
    groups.get(section)!.push(item)
  }

  const result: DisplayEntry[] = []
  let globalIndex = startIndex
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

/**
 * A unified search/command palette with fuzzy search, section grouping,
 * recent items, and a global hotkey (default: Mod+K).
 *
 * Returns a tuple of the rendered TNode and a controller for programmatic
 * open/close and access to the open state signal.
 *
 * @example
 * ```typescript
 * const [node, controller] = createSpotlight(
 *   { items: myItems },
 *   ctrl => Button({ onClick: ctrl.open }, 'Open Spotlight')
 * )
 * ```
 */
export function createSpotlight(
  options: SpotlightOptions,
  children: (controller: SpotlightController) => TNode
): [TNode, SpotlightController] {
  const {
    items,
    onSelect,
    placeholder,
    emptyMessage,
    size = 'md',
    recentItems,
    hotkey = 'mod+k',
    container = 'body',
  } = options

  const isOpen = prop(false)

  // We need to store the open/close callbacks from the Overlay once rendered.
  // Use a ref-like pattern: mutable closure variables set during render.
  let overlayOpen: ((items?: SpotlightItem[]) => void) | null = null
  let overlayClose: (() => void) | null = null

  const controller: SpotlightController = {
    open: (openItems?: SpotlightItem[]) => overlayOpen?.(openItems),
    close: () => overlayClose?.(),
    isOpen,
  }

  const node: TNode = Use(BeatUII18n, t =>
    Overlay((openOverlay, closeOverlay) => {
      const resolvedPlaceholder =
        placeholder ?? t.$.spotlight.map(s => s.placeholder)
      const resolvedEmptyMessage =
        emptyMessage ?? t.$.spotlight.map(s => s.noResults)
      const recentLabel = t.$.spotlight.map(s => s.recentItems)

      const openSpotlight = (openItems?: SpotlightItem[]) => {
        isOpen.set(true)

        const currentItems = openItems ?? Value.get(items)
        const currentRecent = recentItems ? Value.get(recentItems) : []

        const query = prop('')
        const selectedIndex = prop(0)

        // Reset selection when query changes
        query.on(() => selectedIndex.set(0))

        const paletteId = sessionId('spotlight')
        const inputId = `${paletteId}-input`

        const displayEntries = computedOf(
          query,
          items,
          recentItems ?? prop([]),
          recentLabel
        )((q, allItems, recent, label) => {
          const effectiveItems = openItems ?? allItems
          return buildDisplayEntries(effectiveItems, q ?? '', recent, label)
        })

        const isEmpty = displayEntries.map(entries => entries.length === 0)

        const content = html.div(
          attr.class(
            Value.map(
              size,
              (s): string => `bc-spotlight bc-spotlight--size-${s ?? 'md'}`
            )
          ),
          attr.role('dialog'),
          aria.modal(true),
          aria.label(resolvedPlaceholder),
          on.mousedown(e => e.stopPropagation()),

          FocusTrap({
            escapeDeactivates: false,
            initialFocus: () => document.getElementById(inputId),
          }),

          // Header with search input
          html.div(
            attr.class('bc-spotlight__header'),
            html.span(
              attr.class('bc-spotlight__search-icon'),
              Icon({
                icon: 'mdi:magnify',
                size: 'md',
                accessibility: 'decorative',
              })
            ),
            html.input(
              attr.class('bc-spotlight__input'),
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
                        onSelect?.(entry.item)
                        entry.item.onSelect()
                        closeOverlay()
                        isOpen.set(false)
                      }
                    }
                    break
                  case 'Escape':
                    e.preventDefault()
                    closeOverlay()
                    isOpen.set(false)
                    break
                }
              })
            ),
            // Close hint
            html.span(
              attr.class('bc-spotlight__close-hint'),
              html.kbd(attr.class('bc-kbd bc-kbd--size-xs'), 'Esc')
            )
          ),

          // Results body
          html.div(
            attr.class('bc-spotlight__results'),
            attr.role('listbox'),
            When(
              isEmpty,
              () =>
                html.div(
                  attr.class('bc-spotlight__empty'),
                  resolvedEmptyMessage
                ),
              () =>
                ForEach(displayEntries, entrySignal => {
                  const isSelected = computedOf(
                    selectedIndex,
                    entrySignal
                  )((idx, e) => idx === e.globalIndex)

                  return html.div(
                    attr.class('bc-spotlight__section'),
                    // Section header (first item in a named section)
                    When(
                      entrySignal.map(e => e.sectionStart != null),
                      () =>
                        html.div(
                          attr.class('bc-spotlight__section-title'),
                          entrySignal.map(e => e.sectionStart ?? '')
                        )
                    ),
                    // Item
                    html.div(
                      attr.class(
                        Value.map(
                          isSelected,
                          (sel): string =>
                            `bc-spotlight__item${sel ? ' bc-spotlight__item--active' : ''}`
                        )
                      ),
                      attr.role('option'),
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      aria.selected(isSelected as any),
                      on.click(() => {
                        const entry = Value.get(entrySignal)
                        onSelect?.(entry.item)
                        entry.item.onSelect()
                        closeOverlay()
                        isOpen.set(false)
                      }),
                      on.mouseenter(() => {
                        selectedIndex.set(Value.get(entrySignal).globalIndex)
                      }),
                      When(
                        entrySignal.map(e => e.item.icon != null),
                        () =>
                          html.span(
                            attr.class('bc-spotlight__item-icon'),
                            Icon({
                              icon: entrySignal.map(e => e.item.icon ?? ''),
                              size: 'sm',
                              accessibility: 'decorative',
                            })
                          )
                      ),
                      html.span(
                        attr.class('bc-spotlight__item-content'),
                        html.span(
                          attr.class('bc-spotlight__item-label'),
                          entrySignal.map(e => e.item.label)
                        ),
                        When(
                          entrySignal.map(e => e.item.description != null),
                          () =>
                            html.span(
                              attr.class('bc-spotlight__item-description'),
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
                            attr.class('bc-spotlight__item-shortcut'),
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
          effect: 'opaque',
          container,
          content,
          onClickOutside: () => {
            closeOverlay()
            isOpen.set(false)
          },
          onEscape: () => {
            isOpen.set(false)
            closeOverlay()
          },
        })

        // Use initial values for non-reactive open call
        void currentItems
        void currentRecent
      }

      overlayOpen = openSpotlight
      overlayClose = () => {
        closeOverlay()
        isOpen.set(false)
      }

      // Register global hotkey
      const hotkeyNode = WithElement(() => {
        const isMod = hotkey.startsWith('mod+') || hotkey.startsWith('ctrl+')
        const key = hotkey.split('+').pop() ?? 'k'

        const handleKeydown = (e: KeyboardEvent) => {
          const modPressed = e.metaKey || e.ctrlKey
          if (
            isMod &&
            modPressed &&
            e.key.toLowerCase() === key.toLowerCase()
          ) {
            e.preventDefault()
            if (!Value.get(isOpen)) {
              openSpotlight()
            } else {
              closeOverlay()
              isOpen.set(false)
            }
          }
        }

        document.addEventListener('keydown', handleKeydown)
        return OnDispose(() => {
          document.removeEventListener('keydown', handleKeydown)
        })
      })

      return [hotkeyNode, children(controller)] as unknown as TNode
    })
  )

  return [node, controller]
}

/**
 * Convenience Renderable wrapper around `createSpotlight`.
 *
 * @example
 * ```typescript
 * Spotlight(
 *   { items: myItems },
 *   ctrl => Button({ onClick: ctrl.open }, 'Open')
 * )
 * ```
 */
export function Spotlight(
  options: SpotlightOptions,
  children: (controller: SpotlightController) => TNode
): Renderable {
  const [node] = createSpotlight(options, children)
  return node as Renderable
}
