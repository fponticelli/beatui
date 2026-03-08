import { BlockCommandPalette } from '@tempots/beatui'
import type { BlockCommandItem } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'BlockCommandPalette',
  category: 'Overlays',
  component: 'BlockCommandPalette',
  description:
    'An inline block-level command palette with search filtering and keyboard navigation. Designed for slash-command menus in editors.',
  icon: 'lucide:terminal-square',
  order: 10,
}

const sampleItems: BlockCommandItem[] = [
  {
    icon: 'lucide:heading-1',
    label: 'Heading 1',
    description: 'Large heading',
    onSelect: () => console.log('heading 1'),
  },
  {
    icon: 'lucide:heading-2',
    label: 'Heading 2',
    description: 'Medium heading',
    onSelect: () => console.log('heading 2'),
  },
  {
    icon: 'lucide:text',
    label: 'Paragraph',
    description: 'Plain text block',
    onSelect: () => console.log('paragraph'),
  },
  {
    icon: 'lucide:list',
    label: 'Bullet List',
    description: 'Unordered list',
    shortcut: '- ',
    onSelect: () => console.log('bullet list'),
  },
  {
    icon: 'lucide:list-ordered',
    label: 'Numbered List',
    description: 'Ordered list',
    shortcut: '1. ',
    onSelect: () => console.log('numbered list'),
  },
  {
    icon: 'lucide:code',
    label: 'Code Block',
    description: 'Fenced code block',
    shortcut: '```',
    onSelect: () => console.log('code block'),
  },
  {
    icon: 'lucide:quote',
    label: 'Blockquote',
    description: 'Quote block',
    shortcut: '> ',
    onSelect: () => console.log('blockquote'),
  },
  {
    icon: 'lucide:image',
    label: 'Image',
    description: 'Insert an image',
    onSelect: () => console.log('image'),
  },
]

export default function BlockCommandPalettePage() {
  return ComponentPage(meta, {
    playground: html.div(
      attr.class('max-w-sm'),
      BlockCommandPalette({
        items: sampleItems,
        onClose: () => console.log('closed'),
      })
    ),
    sections: [
      Section(
        'Basic Usage',
        () =>
          html.div(
            attr.class('max-w-sm'),
            BlockCommandPalette({
              items: sampleItems,
              onClose: () => console.log('closed'),
            })
          ),
        'BlockCommandPalette renders inline (not as a modal overlay). Type to filter commands. Use Arrow keys to navigate and Enter to select. Escape calls onClose.'
      ),
      Section(
        'With Position',
        () =>
          html.div(
            attr.class('relative h-64 border border-gray-200 dark:border-gray-700 rounded-lg'),
            BlockCommandPalette({
              items: sampleItems.slice(0, 4),
              onClose: () => console.log('closed'),
              position: { x: 16, y: 16 },
            })
          ),
        'Pass a position prop to absolutely position the palette within a relative container. Useful for placing it at the cursor position in an editor.'
      ),
      Section(
        'Filtered Results',
        () => {
          const items: BlockCommandItem[] = [
            {
              icon: 'lucide:heading-1',
              label: 'Heading 1',
              description: 'Large section heading',
              onSelect: () => {},
            },
            {
              icon: 'lucide:heading-2',
              label: 'Heading 2',
              description: 'Medium section heading',
              onSelect: () => {},
            },
            {
              icon: 'lucide:text',
              label: 'Paragraph',
              description: 'Plain text',
              onSelect: () => {},
            },
          ]
          return html.div(
            attr.class('max-w-sm'),
            html.p(
              attr.class('text-xs text-gray-500 mb-2'),
              'Type "head" to see filtering in action.'
            ),
            BlockCommandPalette({
              items,
              onClose: () => {},
            })
          )
        },
        'Search filters on both label and description using case-insensitive substring matching. An empty state is shown when no commands match.'
      ),
    ],
  })
}
