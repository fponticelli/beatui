import { CommandPalette, Button, Icon } from '@tempots/beatui'
import type { CommandPaletteItem } from '@tempots/beatui'
import { html, attr, Value } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'CommandPalette',
  category: 'Overlays',
  component: 'CommandPalette',
  description:
    'A searchable command menu overlay for quickly finding and executing actions, with keyboard navigation and section grouping.',
  icon: 'lucide:terminal',
  order: 7,
}

const sampleCommands: CommandPaletteItem[] = [
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

export default function CommandPalettePage() {
  return ComponentPage(meta, {
    playground: manualPlayground('CommandPalette', signals =>
      CommandPalette(
        {
          placeholder: signals.placeholder as Value<string>,
          emptyMessage: signals.emptyMessage as Value<string>,
          size: signals.size as Value<'sm' | 'md' | 'lg'>,
        },
        (open, _close) =>
          Button(
            {
              variant: 'outline',
              onClick: () => open(sampleCommands),
            },
            Icon({ icon: 'lucide:search', size: 'sm' }),
            'Open Command Palette'
          )
      )
    ),
    sections: [
      Section(
        'Basic Usage',
        () =>
          CommandPalette(
            {},
            (open, _close) =>
              Button(
                {
                  variant: 'filled',
                  color: 'primary',
                  onClick: () => open(sampleCommands),
                },
                Icon({ icon: 'lucide:terminal', size: 'sm' }),
                'Open Palette'
              )
          ),
        'Click the button or press Ctrl+K to open the command palette. Type to search.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ...(['sm', 'md', 'lg'] as const).map(size =>
              CommandPalette(
                { size },
                (open, _close) =>
                  Button(
                    {
                      variant: 'outline',
                      size,
                      onClick: () => open(sampleCommands),
                    },
                    `${size.toUpperCase()} palette`
                  )
              )
            )
          ),
        'The command palette comes in three sizes.'
      ),
      Section(
        'Custom Placeholder',
        () =>
          CommandPalette(
            { placeholder: 'Search actions...' },
            (open, _close) =>
              Button(
                {
                  variant: 'light',
                  onClick: () => open(sampleCommands),
                },
                'Custom Placeholder'
              )
          ),
        'Customize the search input placeholder text.'
      ),
    ],
  })
}
