import { html, attr } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Kbd } from '@tempots/beatui'

export default function KbdPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-4 p-4 h-full overflow-auto'),

      // Basic usage
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(
            attr.class('text-xl font-semibold'),
            'Kbd – Keyboard Shortcuts'
          ),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Display keyboard shortcuts with styled key indicators.'
          ),
          html.div(
            attr.class('flex flex-wrap gap-2 items-center'),
            Kbd({}, 'Ctrl'),
            Kbd({}, 'Alt'),
            Kbd({}, 'Shift'),
            Kbd({}, 'Enter'),
            Kbd({}, 'Esc'),
            Kbd({}, 'Space'),
            Kbd({}, '⌘'),
            Kbd({}, '⌥'),
            Kbd({}, '⇧')
          )
        )
      ),

      // Sizes
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Sizes'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Keyboard keys come in three sizes: xs, sm, and md.'
          ),
          html.div(
            attr.class('flex flex-wrap gap-3 items-center'),
            html.div(
              attr.class('flex items-center gap-2'),
              html.span(attr.class('text-sm'), 'XS:'),
              Kbd({ size: 'xs' }, 'Ctrl'),
              html.span('+'),
              Kbd({ size: 'xs' }, 'C')
            ),
            html.div(
              attr.class('flex items-center gap-2'),
              html.span(attr.class('text-sm'), 'SM (default):'),
              Kbd({ size: 'sm' }, 'Ctrl'),
              html.span('+'),
              Kbd({ size: 'sm' }, 'C')
            ),
            html.div(
              attr.class('flex items-center gap-2'),
              html.span(attr.class('text-sm'), 'MD:'),
              Kbd({ size: 'md' }, 'Ctrl'),
              html.span('+'),
              Kbd({ size: 'md' }, 'C')
            )
          )
        )
      ),

      // Common shortcuts
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Common Shortcuts'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Examples of common keyboard shortcuts.'
          ),
          html.div(
            attr.class('space-y-3'),
            html.div(
              attr.class('flex items-center gap-2'),
              html.span(attr.class('text-sm w-32'), 'Copy:'),
              Kbd({}, 'Ctrl'),
              html.span('+'),
              Kbd({}, 'C')
            ),
            html.div(
              attr.class('flex items-center gap-2'),
              html.span(attr.class('text-sm w-32'), 'Paste:'),
              Kbd({}, 'Ctrl'),
              html.span('+'),
              Kbd({}, 'V')
            ),
            html.div(
              attr.class('flex items-center gap-2'),
              html.span(attr.class('text-sm w-32'), 'Save:'),
              Kbd({}, 'Ctrl'),
              html.span('+'),
              Kbd({}, 'S')
            ),
            html.div(
              attr.class('flex items-center gap-2'),
              html.span(attr.class('text-sm w-32'), 'Command Palette:'),
              Kbd({}, '⌘'),
              html.span('+'),
              Kbd({}, 'K')
            ),
            html.div(
              attr.class('flex items-center gap-2'),
              html.span(attr.class('text-sm w-32'), 'Undo:'),
              Kbd({}, 'Ctrl'),
              html.span('+'),
              Kbd({}, 'Z')
            ),
            html.div(
              attr.class('flex items-center gap-2'),
              html.span(attr.class('text-sm w-32'), 'Redo:'),
              Kbd({}, 'Ctrl'),
              html.span('+'),
              Kbd({}, 'Shift'),
              html.span('+'),
              Kbd({}, 'Z')
            )
          )
        )
      ),

      // In context
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'In Context'),
          html.p(
            attr.class('text-sm text-gray-600'),
            'Keyboard shortcuts displayed within help text.'
          ),
          html.div(
            attr.class('space-y-3 text-sm'),
            html.p(
              'Press ',
              Kbd({ size: 'xs' }, 'Ctrl'),
              ' + ',
              Kbd({ size: 'xs' }, 'S'),
              ' to save your changes.'
            ),
            html.p(
              'Use ',
              Kbd({ size: 'xs' }, '⌘'),
              ' + ',
              Kbd({ size: 'xs' }, 'K'),
              ' to open the command palette.'
            ),
            html.p(
              'Press ',
              Kbd({ size: 'xs' }, 'Esc'),
              ' to close the dialog.'
            ),
            html.p(
              'Navigate with ',
              Kbd({ size: 'xs' }, '↑'),
              ' and ',
              Kbd({ size: 'xs' }, '↓'),
              ' arrow keys.'
            )
          )
        )
      )
    ),
  })
}
