import { html, attr, prop } from '@tempots/dom'
import {
  CommandPalette,
  CommandPaletteItem,
  Icon,
  Button,
} from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { ControlsHeader } from '../views/controls-header'
import { ControlSwitch } from '../views/control-helpers'
import { SectionBlock } from '../views/section'

const sampleCommands: CommandPaletteItem[] = [
  {
    id: 'new-file',
    label: 'New File',
    description: 'Create a new file',
    icon: 'lucide:file-plus',
    shortcut: ['Ctrl', 'N'],
    section: 'File',
    onSelect: () => console.log('New file'),
  },
  {
    id: 'open-file',
    label: 'Open File',
    description: 'Open an existing file',
    icon: 'lucide:folder-open',
    shortcut: ['Ctrl', 'O'],
    section: 'File',
    onSelect: () => console.log('Open file'),
  },
  {
    id: 'save-file',
    label: 'Save File',
    description: 'Save current file',
    icon: 'lucide:save',
    shortcut: ['Ctrl', 'S'],
    section: 'File',
    onSelect: () => console.log('Save file'),
  },
  {
    id: 'cut',
    label: 'Cut',
    description: 'Cut selected text',
    icon: 'lucide:scissors',
    shortcut: ['Ctrl', 'X'],
    section: 'Edit',
    onSelect: () => console.log('Cut'),
  },
  {
    id: 'copy',
    label: 'Copy',
    description: 'Copy selected text',
    icon: 'lucide:copy',
    shortcut: ['Ctrl', 'C'],
    section: 'Edit',
    onSelect: () => console.log('Copy'),
  },
  {
    id: 'paste',
    label: 'Paste',
    description: 'Paste from clipboard',
    icon: 'lucide:clipboard',
    shortcut: ['Ctrl', 'V'],
    section: 'Edit',
    onSelect: () => console.log('Paste'),
  },
  {
    id: 'find',
    label: 'Find',
    description: 'Search in file',
    icon: 'lucide:search',
    shortcut: ['Ctrl', 'F'],
    section: 'Search',
    onSelect: () => console.log('Find'),
  },
  {
    id: 'replace',
    label: 'Replace',
    description: 'Find and replace',
    icon: 'lucide:replace',
    shortcut: ['Ctrl', 'H'],
    section: 'Search',
    onSelect: () => console.log('Replace'),
  },
]

export default function CommandPalettePage() {
  return WidgetPage({
    id: 'command-palette',
    title: 'Command Palette',
    description: 'Searchable command palette for quick actions.',
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),
      SectionBlock(
        'Default',
        html.div(
          attr.style('padding: 20px 0; display: flex; justify-content: center'),
          CommandPalette({ size: 'md' }, (open, close) =>
            Button({ variant: 'filled', onClick: () => open(sampleCommands) }, 'Open Command Palette')
          )
        )
      )
    ),
  })
}
