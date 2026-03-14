import { Kbd } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import {
  ComponentPage,
  autoPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Kbd',
  category: 'Data Display',
  component: 'Kbd',
  description:
    'A styled keyboard key indicator for displaying keyboard shortcuts with a 3D pressed appearance.',
  icon: 'lucide:keyboard',
  order: 5,
}

export default function KbdPage() {
  return ComponentPage(meta, {
    playground: autoPlayground(
      'Kbd',
      props => Kbd(props, 'Enter'),
      { childrenCode: "'Enter'" }
    ),
    sections: [
      ...AutoSections('Kbd', props => Kbd(props, 'K')),
      Section(
        'Common Keys',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-2 items-center'),
            Kbd({}, 'Ctrl'),
            Kbd({}, '⌘'),
            Kbd({}, '⌥'),
            Kbd({}, '⇧'),
            Kbd({}, 'Tab'),
            Kbd({}, 'Esc'),
            Kbd({}, 'Enter'),
            Kbd({}, 'Space'),
            Kbd({}, 'Backspace'),
            Kbd({}, 'Delete'),
            Kbd({}, '↑'),
            Kbd({}, '↓'),
            Kbd({}, '←'),
            Kbd({}, '→')
          ),
        'Kbd works with any key label including symbols, modifier keys, and arrow keys.'
      ),
      Section(
        'Shortcut Combinations',
        () =>
          html.div(
            attr.class('flex flex-col gap-4'),
            html.div(
              attr.class('flex items-center gap-1'),
              Kbd({}, 'Ctrl'),
              html.span('+'),
              Kbd({}, 'C')
            ),
            html.div(
              attr.class('flex items-center gap-1'),
              Kbd({}, '⌘'),
              html.span('+'),
              Kbd({}, 'K')
            ),
            html.div(
              attr.class('flex items-center gap-1'),
              Kbd({}, 'Ctrl'),
              html.span('+'),
              Kbd({}, '⇧'),
              html.span('+'),
              Kbd({}, 'P')
            ),
            html.div(
              attr.class('flex items-center gap-1'),
              Kbd({}, '⌥'),
              html.span('+'),
              Kbd({}, 'F4')
            )
          ),
        'Combine multiple Kbd elements with a separator to represent key combinations.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3 items-end'),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              Kbd({ size: 'xs' }, 'Esc'),
              html.span(attr.class('text-xs text-gray-500'), 'xs')
            ),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              Kbd({ size: 'sm' }, 'Esc'),
              html.span(attr.class('text-xs text-gray-500'), 'sm')
            ),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              Kbd({ size: 'md' }, 'Esc'),
              html.span(attr.class('text-xs text-gray-500'), 'md')
            )
          ),
        'Three size variants are available: xs (12px), sm (14px, default), md (16px).'
      ),
      Section(
        'In Context',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 text-sm'),
            html.p(
              'Press ',
              Kbd({}, '⌘'),
              ' + ',
              Kbd({}, 'K'),
              ' to open the command palette.'
            ),
            html.p(
              'Use ',
              Kbd({}, '↑'),
              ' and ',
              Kbd({}, '↓'),
              ' to navigate results, then ',
              Kbd({}, 'Enter'),
              ' to confirm.'
            ),
            html.p(
              'Hit ',
              Kbd({}, 'Esc'),
              ' at any time to dismiss.'
            )
          ),
        'Kbd elements integrate naturally within prose text to annotate keyboard shortcuts.'
      ),
    ],
  })
}
