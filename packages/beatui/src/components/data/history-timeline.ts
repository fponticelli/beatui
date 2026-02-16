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
} from '@tempots/dom'
import { Icon } from './icon'
import { Button } from '../button/button'

export interface HistoryEntry {
  id: string
  /** Action label (e.g., "DELETED", "EDITED", "CREATED") */
  action: string
  /** Color for the action label and timeline dot */
  actionColor: string
  /** Icon for the timeline dot */
  icon: string
  /** Target name */
  target: string
  /** Icon for the target */
  targetIcon: string
  /** Actor info */
  actor: { name: string; initials: string }
  /** Timestamp string */
  time: string
  /** Detail text */
  detail: string
  /** Whether this entry can be restored */
  restorable?: boolean
  /** Callback for restore action */
  onRestore?: () => void
}

export interface HistoryTimelineOptions {
  entries: Value<HistoryEntry[]>
  filters?: { value: string; label: string }[]
}

export function HistoryTimeline(options: HistoryTimelineOptions): TNode {
  const { entries, filters } = options
  const activeFilter = prop('all')

  const filteredEntries = computedOf(
    entries,
    activeFilter
  )((allEntries, filter) => {
    if (filter === 'all') return allEntries
    return allEntries.filter(e => {
      const action = e.action.toLowerCase()
      switch (filter) {
        case 'deletions':
          return action.includes('delet')
        case 'edits':
          return action.includes('edit')
        case 'schema':
          return action.includes('schema')
        case 'restorable':
          return e.restorable === true
        default:
          return true
      }
    })
  })

  const defaultFilters = [
    { value: 'all', label: 'All' },
    { value: 'deletions', label: 'Deletions' },
    { value: 'edits', label: 'Edits' },
    { value: 'schema', label: 'Schema changes' },
    { value: 'restorable', label: 'Restorable' },
  ]

  const filterItems = filters ?? defaultFilters

  return html.div(
    attr.class('bc-history-timeline'),

    // Filter chips
    html.div(
      attr.class('bc-history-timeline__filters'),
      ...filterItems.map(f =>
        html.button(
          attr.type('button'),
          attr.class(
            computedOf(activeFilter)((active): string =>
              active === f.value
                ? 'bc-history-timeline__filter bc-history-timeline__filter--active'
                : 'bc-history-timeline__filter'
            )
          ),
          on.click(() => activeFilter.set(f.value)),
          f.label
        )
      )
    ),

    // Timeline entries
    html.div(
      attr.class('bc-history-timeline__list'),
      ForEach(filteredEntries, entry => {
        return html.div(
          attr.class('bc-history-timeline__entry'),

          // Timeline dot + line
          html.div(
            attr.class('bc-history-timeline__line'),
            html.div(
              attr.class('bc-history-timeline__dot'),
              attr.style(entry.map(e => `background: ${e.actionColor}`))
            )
          ),

          // Entry content
          html.div(
            attr.class('bc-history-timeline__content'),
            html.div(
              attr.class('bc-history-timeline__content-header'),
              html.span(
                attr.class('bc-history-timeline__action'),
                attr.style(entry.map(e => `color: ${e.actionColor}`)),
                entry.$.action
              ),
              html.span(attr.class('bc-history-timeline__time'), entry.$.time)
            ),
            html.div(
              attr.class('bc-history-timeline__target'),
              Icon({ icon: entry.$.targetIcon, size: 'xs' }),
              html.span(entry.$.target)
            ),
            html.div(attr.class('bc-history-timeline__detail'), entry.$.detail),
            html.div(
              attr.class('bc-history-timeline__footer'),
              html.div(
                attr.class('bc-history-timeline__actor'),
                html.div(
                  attr.class('bc-history-timeline__avatar'),
                  entry.$.actor.$.initials
                ),
                html.span(entry.$.actor.$.name)
              ),
              When(
                entry.map(e => e.restorable === true && e.onRestore != null),
                () =>
                  Button(
                    {
                      variant: 'outline',
                      size: 'xs',
                      onClick: () => entry.value.onRestore?.(),
                    },
                    Icon({ icon: 'lucide:rotate-ccw', size: 'xs' }),
                    'Restore'
                  )
              )
            )
          )
        )
      }),

      // Empty state
      When(
        computedOf(filteredEntries)(list => list.length === 0),
        () =>
          html.div(
            attr.class('bc-history-timeline__empty'),
            'No matching history entries'
          )
      )
    )
  )
}
