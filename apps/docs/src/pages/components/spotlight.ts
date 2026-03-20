import { Spotlight } from '@tempots/beatui'
import type { SpotlightItem } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'
import { Button, Icon } from '@tempots/beatui'

export const meta: ComponentPageMeta = {
  name: 'Spotlight',
  category: 'Overlays',
  component: 'Spotlight',
  description:
    'A unified search and command palette overlay with fuzzy search, section grouping, recent items, and a global hotkey (Mod+K).',
  icon: 'lucide:search',
  order: 13,
}

const sampleItems: SpotlightItem[] = [
  {
    id: 'new-file',
    label: 'New File',
    description: 'Create a new document',
    icon: 'lucide:file-plus',
    section: 'File',
    shortcut: ['Ctrl', 'N'],
    keywords: ['create', 'blank', 'new'],
    onSelect: () => console.log('new file'),
  },
  {
    id: 'open-file',
    label: 'Open File',
    description: 'Open an existing document',
    icon: 'lucide:folder-open',
    section: 'File',
    shortcut: ['Ctrl', 'O'],
    onSelect: () => console.log('open file'),
  },
  {
    id: 'save',
    label: 'Save',
    description: 'Save the current document',
    icon: 'lucide:save',
    section: 'File',
    shortcut: ['Ctrl', 'S'],
    onSelect: () => console.log('save'),
  },
  {
    id: 'find',
    label: 'Find and Replace',
    description: 'Search within the document',
    icon: 'lucide:search',
    section: 'Edit',
    shortcut: ['Ctrl', 'H'],
    onSelect: () => console.log('find'),
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Open application settings',
    icon: 'lucide:settings',
    section: 'Application',
    onSelect: () => console.log('settings'),
  },
  {
    id: 'theme',
    label: 'Toggle Theme',
    description: 'Switch between light and dark mode',
    icon: 'lucide:moon',
    section: 'Application',
    onSelect: () => console.log('theme'),
  },
  {
    id: 'docs',
    label: 'Documentation',
    description: 'View component documentation',
    icon: 'lucide:book-open',
    section: 'Help',
    keywords: ['help', 'guide', 'reference'],
    onSelect: () => console.log('docs'),
  },
]

const recentItems: SpotlightItem[] = [sampleItems[4], sampleItems[0]]

export default function SpotlightPage() {
  return ComponentPage(meta, {
    playground: Spotlight(
      {
        items: sampleItems,
        recentItems: prop(recentItems),
        hotkey: 'mod+k',
      },
      ctrl =>
        Button(
          {
            variant: 'outline',
            onClick: ctrl.open,
          },
          Icon({ icon: 'lucide:search', size: 'sm' }),
          'Open Spotlight',
          html.span(
            attr.class('ml-auto pl-4 flex gap-1'),
            html.kbd(attr.class('bc-kbd bc-kbd--size-xs'), 'Ctrl'),
            html.kbd(attr.class('bc-kbd bc-kbd--size-xs'), 'K')
          )
        )
    ),
    sections: [
      Section(
        'Basic Usage',
        () =>
          Spotlight(
            { items: sampleItems },
            ctrl =>
              Button(
                {
                  variant: 'filled',
                  color: 'primary',
                  onClick: ctrl.open,
                },
                Icon({ icon: 'lucide:search', size: 'sm' }),
                'Open Spotlight'
              )
          ),
        'Click the button or press Ctrl+K to open the spotlight. Type to fuzzy-search commands.'
      ),
      Section(
        'With Recent Items',
        () =>
          Spotlight(
            {
              items: sampleItems,
              recentItems: prop(recentItems),
            },
            ctrl =>
              Button(
                { variant: 'outline', onClick: ctrl.open },
                'Open with Recent Items'
              )
          ),
        'When the search query is empty, a "Recent" section is shown at the top with the provided recentItems.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ...(['sm', 'md', 'lg'] as const).map(size =>
              Spotlight(
                { items: sampleItems, size },
                ctrl =>
                  Button(
                    { variant: 'outline', size, onClick: ctrl.open },
                    `${size.toUpperCase()} spotlight`
                  )
              )
            )
          ),
        'The spotlight comes in three sizes: sm, md (default), and lg.'
      ),
      Section(
        'Custom Placeholder',
        () =>
          Spotlight(
            {
              items: sampleItems,
              placeholder: 'Search actions, files, and more...',
              emptyMessage: 'Nothing matched your search.',
            },
            ctrl =>
              Button(
                { variant: 'light', onClick: ctrl.open },
                'Custom Placeholder'
              )
          ),
        'Customize the search input placeholder and the empty state message.'
      ),
      Section(
        'With Keywords (Fuzzy Search)',
        () =>
          Spotlight(
            {
              items: sampleItems,
              placeholder: 'Try searching "help" or "crt"...',
            },
            ctrl =>
              Button(
                { variant: 'subtle', onClick: ctrl.open },
                'Fuzzy Search Demo'
              )
          ),
        'Items are matched using fuzzy search across label, description, and keywords. Try typing "help" to find Documentation (matched via keyword), or "crt" to find items with those letters in order.'
      ),
    ],
  })
}
