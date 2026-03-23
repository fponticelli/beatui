import { Spotlight, Button, Icon } from '@tempots/beatui'
import type { SpotlightItem } from '@tempots/beatui'
import { html, attr, Value } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Spotlight',
  category: 'Overlays',
  component: 'Spotlight',
  description:
    'A searchable command/search overlay with fuzzy search, keyboard navigation, section grouping, recent items, and a global hotkey.',
  icon: 'lucide:search',
  order: 7,
}

const sampleCommands: SpotlightItem[] = [
  {
    id: 'new-file',
    label: 'New File',
    description: 'Create a new document',
    icon: 'lucide:file-plus',
    section: 'File',
    shortcut: ['Ctrl', 'N'],
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
]

export default function SpotlightPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Spotlight', signals =>
      Spotlight(
        {
          items: sampleCommands,
          placeholder: signals.placeholder as Value<string>,
          emptyMessage: signals.emptyMessage as Value<string>,
          size: signals.size as Value<'sm' | 'md' | 'lg'>,
        },
        ctrl =>
          Button(
            {
              variant: 'outline',
              onClick: ctrl.open,
            },
            Icon({ icon: 'lucide:search', size: 'sm' }),
            'Open Spotlight'
          )
      )
    ),
    sections: [
      Section(
        'Basic Usage',
        () =>
          Spotlight(
            { items: sampleCommands },
            ctrl =>
              Button(
                {
                  variant: 'filled',
                  color: 'primary',
                  onClick: ctrl.open,
                },
                Icon({ icon: 'lucide:terminal', size: 'sm' }),
                'Open Spotlight'
              )
          ),
        'Click the button or press Ctrl+K to open the spotlight. Type to fuzzy-search commands.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ...(['sm', 'md', 'lg'] as const).map(size =>
              Spotlight(
                { items: sampleCommands, size },
                ctrl =>
                  Button(
                    {
                      variant: 'outline',
                      size,
                      onClick: ctrl.open,
                    },
                    `${size.toUpperCase()} spotlight`
                  )
              )
            )
          ),
        'The spotlight comes in three sizes.'
      ),
      Section(
        'Custom Placeholder',
        () =>
          Spotlight(
            { items: sampleCommands, placeholder: 'Search actions...' },
            ctrl =>
              Button(
                {
                  variant: 'light',
                  onClick: ctrl.open,
                },
                'Custom Placeholder'
              )
          ),
        'Customize the search input placeholder text.'
      ),
    ],
  })
}
