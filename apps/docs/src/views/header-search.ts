import { html, attr, prop } from '@tempots/dom'
import {
  Spotlight,
  Kbd,
  Button,
  Icon,
} from '@tempots/beatui'
import type { SpotlightItem } from '@tempots/beatui'
import { NavigationService } from '@tempots/ui'
import { loadSearchIndex } from '../search/search-index'
import type { SearchEntry } from '../search/search-index'
import { categories } from '../registry/page-registry'

const categoryIconMap = new Map(categories.map(c => [c.name, c.icon]))

const API_ICON: Record<string, string> = {
  function: 'lucide:function-square',
  interface: 'lucide:braces',
  class: 'lucide:box',
  type: 'lucide:type',
  variable: 'lucide:variable',
  enum: 'lucide:list',
  namespace: 'lucide:folder',
  symbol: 'lucide:code-2',
}

function iconForEntry(entry: SearchEntry): string {
  if (entry.type === 'component') {
    return categoryIconMap.get(entry.category) ?? 'lucide:component'
  }
  if (entry.type === 'guide') {
    return 'lucide:book-text'
  }
  return API_ICON[entry.icon] ?? 'lucide:code-2'
}

const items = prop<SpotlightItem[]>([])
let loaded = false

function ensureItems() {
  if (loaded) return
  loaded = true
  loadSearchIndex().then(index => {
    items.set(
      index.map(entry => ({
        id: `${entry.type}:${entry.url}`,
        label: entry.name,
        description: entry.description,
        section: entry.category,
        icon: iconForEntry(entry),
        onSelect: () => {
          NavigationService.navigate(entry.url, {
            viewTransition: true,
          })
        },
      }))
    )
  })
}

export function HeaderSearch() {
  ensureItems()

  return Spotlight(
    {
      items,
      placeholder: 'Search components & API...',
      size: 'lg',
      hotkey: 'mod+k',
    },
    ctrl =>
      Button(
        {
          variant: 'default',
          size: 'md',
          onClick: ctrl.open,
        },
        attr.class('gap-2'),
        Icon({
          icon: 'mdi:magnify',
          size: 'sm',
          accessibility: 'decorative',
        }),
        html.span(
          attr.class(
            'text-gray-600 dark:text-gray-400 text-xs hidden sm:inline min-w-24 text-left'
          ),
          'Search ...'
        ),
        html.span(
          attr.class('hidden sm:inline [&_.bc-kbd]:text-gray-600'),
          Kbd({ size: 'xs' }, '\u2318K')
        )
      )
  )
}
