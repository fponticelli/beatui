import { html, attr, on } from '@tempots/dom'
import {
  ScrollablePanel,
  Stack,
  Card,
  CommandPalette,
  CommandPaletteItem,
  Button,
} from '@tempots/beatui'

const basicItems: CommandPaletteItem[] = [
  {
    id: 'new-file',
    label: 'New File',
    icon: 'mdi:file-plus',
    shortcut: ['Ctrl', 'N'],
    onSelect: () => console.log('New File'),
  },
  {
    id: 'open-file',
    label: 'Open File',
    icon: 'mdi:folder-open',
    shortcut: ['Ctrl', 'O'],
    onSelect: () => console.log('Open File'),
  },
  {
    id: 'save',
    label: 'Save',
    icon: 'mdi:content-save',
    shortcut: ['Ctrl', 'S'],
    onSelect: () => console.log('Save'),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'mdi:cog',
    shortcut: ['Ctrl', ','],
    onSelect: () => console.log('Settings'),
  },
]

const sectionItems: CommandPaletteItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'mdi:home',
    section: 'Navigation',
    onSelect: () => console.log('Home'),
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'mdi:view-dashboard',
    section: 'Navigation',
    onSelect: () => console.log('Dashboard'),
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: 'mdi:folder-multiple',
    section: 'Navigation',
    onSelect: () => console.log('Projects'),
  },
  {
    id: 'new-project',
    label: 'New Project',
    icon: 'mdi:plus',
    section: 'Actions',
    onSelect: () => console.log('New Project'),
  },
  {
    id: 'import',
    label: 'Import',
    icon: 'mdi:import',
    section: 'Actions',
    onSelect: () => console.log('Import'),
  },
  {
    id: 'export',
    label: 'Export',
    icon: 'mdi:export',
    section: 'Actions',
    onSelect: () => console.log('Export'),
  },
]

const shortcutItems: CommandPaletteItem[] = [
  {
    id: 'cut',
    label: 'Cut',
    icon: 'mdi:content-cut',
    shortcut: ['Ctrl', 'X'],
    onSelect: () => console.log('Cut'),
  },
  {
    id: 'copy',
    label: 'Copy',
    icon: 'mdi:content-copy',
    shortcut: ['Ctrl', 'C'],
    onSelect: () => console.log('Copy'),
  },
  {
    id: 'paste',
    label: 'Paste',
    icon: 'mdi:content-paste',
    shortcut: ['Ctrl', 'V'],
    onSelect: () => console.log('Paste'),
  },
  {
    id: 'undo',
    label: 'Undo',
    icon: 'mdi:undo',
    shortcut: ['Ctrl', 'Z'],
    onSelect: () => console.log('Undo'),
  },
  {
    id: 'redo',
    label: 'Redo',
    icon: 'mdi:redo',
    shortcut: ['Ctrl', 'Shift', 'Z'],
    onSelect: () => console.log('Redo'),
  },
]

const navItems: CommandPaletteItem[] = [
  {
    id: 'go-home',
    label: 'Go to Home',
    icon: 'mdi:home',
    onSelect: () => console.log('Go to Home'),
  },
  {
    id: 'go-dashboard',
    label: 'Go to Dashboard',
    icon: 'mdi:view-dashboard',
    onSelect: () => console.log('Go to Dashboard'),
  },
  {
    id: 'go-settings',
    label: 'Go to Settings',
    icon: 'mdi:cog',
    onSelect: () => console.log('Go to Settings'),
  },
]

const fileItems: CommandPaletteItem[] = [
  {
    id: 'f-new',
    label: 'New File',
    icon: 'mdi:file-plus',
    onSelect: () => console.log('New File'),
  },
  {
    id: 'f-open',
    label: 'Open File',
    icon: 'mdi:folder-open',
    onSelect: () => console.log('Open File'),
  },
  {
    id: 'f-save',
    label: 'Save File',
    icon: 'mdi:content-save',
    onSelect: () => console.log('Save File'),
  },
]

const settingsItems: CommandPaletteItem[] = [
  {
    id: 's-theme',
    label: 'Theme',
    icon: 'mdi:palette',
    description: 'Change the application theme',
    onSelect: () => console.log('Theme'),
  },
  {
    id: 's-language',
    label: 'Language',
    icon: 'mdi:translate',
    description: 'Change the display language',
    onSelect: () => console.log('Language'),
  },
  {
    id: 's-notifications',
    label: 'Notifications',
    icon: 'mdi:bell',
    description: 'Configure notification preferences',
    onSelect: () => console.log('Notifications'),
  },
]

export default function CommandPalettePage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-4 p-4 h-full overflow-auto'),

      // Basic command palette
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(
            attr.class('text-xl font-semibold'),
            'CommandPalette – Basic'
          ),
          html.p(
            attr.class('text-sm text-gray-600'),
            'A searchable command menu for quick access to actions and navigation.'
          ),
          CommandPalette(
            { placeholder: 'Search commands...' },
            (open, _close) =>
              Button(
                { variant: 'filled', color: 'primary' },
                attr.id('open-basic-palette'),
                on.click(() => open(basicItems)),
                'Open Command Palette'
              )
          )
        )
      ),

      // With sections and icons
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'With Sections & Icons'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Organize commands into sections with icons for better discoverability.'
          ),
          CommandPalette({ placeholder: 'Type a command...' }, (open, _close) =>
            Button(
              { variant: 'outline', color: 'primary' },
              on.click(() => open(sectionItems)),
              html.span('Open Navigation Menu')
            )
          )
        )
      ),

      // With shortcuts
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(
            attr.class('text-lg font-semibold'),
            'With Keyboard Shortcuts'
          ),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Display keyboard shortcuts alongside commands.'
          ),
          CommandPalette({ placeholder: 'Search actions...' }, (open, _close) =>
            Button(
              { variant: 'light', color: 'primary' },
              on.click(() => open(shortcutItems)),
              html.span('Open Actions Menu')
            )
          )
        )
      ),

      // Usage examples
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Usage Examples'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Common patterns for command palette implementations.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Navigation commands'),
              CommandPalette({ size: 'md' }, (open, _close) =>
                Button(
                  { variant: 'default', size: 'sm' },
                  on.click(() => open(navItems)),
                  html.span('Navigation')
                )
              )
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'File operations'),
              CommandPalette(
                { placeholder: 'Search files...' },
                (open, _close) =>
                  Button(
                    { variant: 'default', size: 'sm' },
                    on.click(() => open(fileItems)),
                    html.span('File Operations')
                  )
              )
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(
                attr.class('text-sm font-medium'),
                'Settings and preferences'
              ),
              CommandPalette(
                { placeholder: 'Search settings...' },
                (open, _close) =>
                  Button(
                    { variant: 'default', size: 'sm' },
                    on.click(() => open(settingsItems)),
                    html.span('Settings')
                  )
              )
            )
          )
        )
      ),

      // Note about implementation
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Implementation Note'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'The CommandPalette uses a render prop pattern. Pass items to the open() function when the trigger is clicked. Items can have sections, icons, descriptions, and keyboard shortcuts.'
          ),
          html.div(
            attr.class(
              'bg-gray-100 beatui-dark:bg-gray-800 p-4 rounded-lg text-sm font-mono'
            ),
            html.pre(
              attr.class('whitespace-pre-wrap'),
              `CommandPalette(
  { placeholder: 'Search...' },
  (open, _close) =>
    Button(
      {},
      on.click(() =>
        open([
          {
            id: 'new',
            label: 'New File',
            icon: 'mdi:file-plus',
            section: 'File',
            shortcut: ['Ctrl', 'N'],
            onSelect: () => console.log('New file')
          },
          // ... more items
        ])
      ),
      'Open'
    )
)`
            )
          )
        )
      )
    ),
  })
}
