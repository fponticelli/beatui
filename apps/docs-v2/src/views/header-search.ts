import { html, attr, OnDispose } from '@tempots/dom'
import {
  CommandPalette,
  CommandPaletteItem,
  Kbd,
  Button,
  Icon,
} from '@tempots/beatui'
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
  return API_ICON[entry.icon] ?? 'lucide:code-2'
}

let cachedItems: CommandPaletteItem[] | null = null

async function buildItems(): Promise<CommandPaletteItem[]> {
  if (cachedItems) return cachedItems
  const index = await loadSearchIndex()
  cachedItems = index.map(entry => ({
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
  return cachedItems
}

export function HeaderSearch() {
  return CommandPalette(
    { placeholder: 'Search components & API...', size: 'lg' },
    open => {
      const trigger = () => {
        buildItems().then(items => open(items))
      }

      const handleKeydown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault()
          trigger()
        }
      }
      document.addEventListener('keydown', handleKeydown)

      return html.div(
        OnDispose(() => document.removeEventListener('keydown', handleKeydown)),
        Button(
          {
            variant: 'default',
            size: 'md',
            onClick: trigger,
          },
          attr.class('gap-2'),
          Icon({
            icon: 'mdi:magnify',
            size: 'sm',
            accessibility: 'decorative',
          }),
          html.span(
            attr.class(
              'text-gray-500 dark:text-gray-400 text-xs hidden sm:inline min-w-24 text-left'
            ),
            'Search ...'
          ),
          html.span(
            attr.class('hidden sm:inline'),
            Kbd({ size: 'xs' }, '\u2318K')
          )
        )
      )
    }
  )
}
