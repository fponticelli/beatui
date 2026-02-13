import { html, attr } from '@tempots/dom'
import {
  ScrollablePanel,
  Stack,
  Card,
  CommandPalette,
  Button,
} from '@tempots/beatui'

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
            (_open, _close) =>
              Button(
                { variant: 'filled', color: 'primary' },
                attr.id('open-basic-palette'),
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
          CommandPalette(
            { placeholder: 'Type a command...' },
            (_open, _close) =>
              Button(
                { variant: 'outline', color: 'primary' },
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
          CommandPalette(
            { placeholder: 'Search actions...' },
            (_open, _close) =>
              Button(
                { variant: 'light', color: 'primary' },
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
              CommandPalette({ size: 'md' }, (_open, _close) =>
                Button(
                  { variant: 'default', size: 'sm' },
                  html.span('Navigation')
                )
              )
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'File operations'),
              CommandPalette(
                { placeholder: 'Search files...' },
                (_open, _close) =>
                  Button(
                    { variant: 'default', size: 'sm' },
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
                (_open, _close) =>
                  Button(
                    { variant: 'default', size: 'sm' },
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
              'bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono'
            ),
            html.pre(
              attr.class('whitespace-pre-wrap'),
              `CommandPalette(
  { placeholder: 'Search...' },
  (_open, _close) =>
    Button({}, 'Open', on.click(() =>
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
    ))
)`
            )
          )
        )
      )
    ),
  })
}
