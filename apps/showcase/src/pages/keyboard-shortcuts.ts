import { html, attr } from '@tempots/dom'
import { Kbd } from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { Section, SectionStack } from '../views/section'

export default function KeyboardShortcutsPage() {
  return WidgetPage({
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Styled keyboard key indicators.',
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      Section(
        'Basic Keys',
        Kbd({}, 'Ctrl'),
        Kbd({}, 'Alt'),
        Kbd({}, 'Shift'),
        Kbd({}, 'Enter'),
        Kbd({}, 'Esc'),
        Kbd({}, 'Space'),
        Kbd({}, '⌘'),
        Kbd({}, '⌥'),
        Kbd({}, '⇧'),
      ),

      SectionStack(
        'Sizes',
        ...(['xs', 'sm', 'md'] as const).map(sz =>
          html.div(
            attr.class('flex items-center gap-2'),
            html.span(attr.class('text-sm w-8'), sz.toUpperCase()),
            Kbd({ size: sz }, 'Ctrl'),
            html.span('+'),
            Kbd({ size: sz }, 'C'),
          )
        ),
      ),

      SectionStack(
        'Common Shortcuts',
        html.div(attr.class('flex items-center gap-2'), html.span(attr.class('text-sm w-36'), 'Copy:'), Kbd({}, 'Ctrl'), html.span('+'), Kbd({}, 'C')),
        html.div(attr.class('flex items-center gap-2'), html.span(attr.class('text-sm w-36'), 'Paste:'), Kbd({}, 'Ctrl'), html.span('+'), Kbd({}, 'V')),
        html.div(attr.class('flex items-center gap-2'), html.span(attr.class('text-sm w-36'), 'Save:'), Kbd({}, 'Ctrl'), html.span('+'), Kbd({}, 'S')),
        html.div(attr.class('flex items-center gap-2'), html.span(attr.class('text-sm w-36'), 'Undo:'), Kbd({}, 'Ctrl'), html.span('+'), Kbd({}, 'Z')),
        html.div(attr.class('flex items-center gap-2'), html.span(attr.class('text-sm w-36'), 'Redo:'), Kbd({}, 'Ctrl'), html.span('+'), Kbd({}, 'Shift'), html.span('+'), Kbd({}, 'Z')),
        html.div(attr.class('flex items-center gap-2'), html.span(attr.class('text-sm w-36'), 'Command Palette:'), Kbd({}, '⌘'), html.span('+'), Kbd({}, 'K')),
      ),

      SectionStack(
        'In Context',
        html.p(attr.class('text-sm'), 'Press ', Kbd({ size: 'xs' }, 'Ctrl'), ' + ', Kbd({ size: 'xs' }, 'S'), ' to save your changes.'),
        html.p(attr.class('text-sm'), 'Use ', Kbd({ size: 'xs' }, '⌘'), ' + ', Kbd({ size: 'xs' }, 'K'), ' to open the command palette.'),
        html.p(attr.class('text-sm'), 'Press ', Kbd({ size: 'xs' }, 'Esc'), ' to close the dialog.'),
        html.p(attr.class('text-sm'), 'Navigate with ', Kbd({ size: 'xs' }, '↑'), ' and ', Kbd({ size: 'xs' }, '↓'), ' arrow keys.'),
      ),
    ),
  })
}
