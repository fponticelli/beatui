import { html, attr, prop } from '@tempots/dom'
import { BlockCommandPalette, BlockCommandItem } from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { SectionBlock } from '../views/section'

const sampleCommands: BlockCommandItem[] = [
  {
    icon: 'lucide:heading-1',
    label: 'Heading 1',
    description: 'Large section heading',
    shortcut: '#',
    onSelect: () => console.log('Heading 1 selected'),
  },
  {
    icon: 'lucide:heading-2',
    label: 'Heading 2',
    description: 'Medium section heading',
    shortcut: '##',
    onSelect: () => console.log('Heading 2 selected'),
  },
  {
    icon: 'lucide:heading-3',
    label: 'Heading 3',
    description: 'Small section heading',
    shortcut: '###',
    onSelect: () => console.log('Heading 3 selected'),
  },
  {
    icon: 'lucide:list',
    label: 'Bullet List',
    description: 'Simple unordered list',
    shortcut: '-',
    onSelect: () => console.log('Bullet list selected'),
  },
  {
    icon: 'lucide:list-ordered',
    label: 'Numbered List',
    description: 'Ordered numbered list',
    shortcut: '1.',
    onSelect: () => console.log('Numbered list selected'),
  },
  {
    icon: 'lucide:quote',
    label: 'Quote',
    description: 'Block quotation',
    shortcut: '>',
    onSelect: () => console.log('Quote selected'),
  },
  {
    icon: 'lucide:code',
    label: 'Code Block',
    description: 'Fenced code block',
    shortcut: '```',
    onSelect: () => console.log('Code block selected'),
  },
  {
    icon: 'lucide:table',
    label: 'Table',
    description: 'Insert a table',
    onSelect: () => console.log('Table selected'),
  },
  {
    icon: 'lucide:image',
    label: 'Image',
    description: 'Embed an image',
    onSelect: () => console.log('Image selected'),
  },
]

export default function BlockCommandPalettePage() {
  return WidgetPage({
    id: 'block-command-palette',
    title: 'Block Command Palette',
    description: 'Inline command palette for block-type insertion.',
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),
      SectionBlock(
        'Default',
        html.div(
          attr.style('position: relative; height: 360px'),
          BlockCommandPalette({
            items: prop(sampleCommands),
            onClose: () => console.log('Palette closed'),
            position: prop({ x: 20, y: 10 }),
          })
        )
      )
    ),
  })
}
