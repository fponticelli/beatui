import { html, attr, prop } from '@tempots/dom'
import {
  Tooltip,
  Button,
  Stack,
  Group,
  Icon,
  NativeSelect,
  Label,
  Option,
  SelectOption,
  TooltipTrigger,
} from '@tempots/beatui'
import { Placement } from '@tempots/ui'
import { WidgetPage } from '../views/widget-page'
import { ControlsHeader } from '../views/controls-header'
import { SectionBlock } from '../views/section'

export default function TooltipsPage() {
  const placement = prop<Placement>('top')
  const showOn = prop<TooltipTrigger>('hover-focus')

  return WidgetPage({
    id: 'tooltips',
    title: 'Tooltips',
    description: 'Contextual information on hover or focus.',
    controls: ControlsHeader(
      Stack(
        Label('Placement'),
        NativeSelect({
          options: [
            Option.value('top', 'Top'),
            Option.value('right', 'Right'),
            Option.value('bottom', 'Bottom'),
            Option.value('left', 'Left'),
          ] as SelectOption<Placement>[],
          value: placement,
          onChange: placement.set,
        }),
      ),
      Stack(
        Label('Trigger'),
        NativeSelect({
          options: [
            Option.value('hover', 'Hover'),
            Option.value('focus', 'Focus'),
            Option.value('hover-focus', 'Hover & Focus'),
            Option.value('click', 'Click'),
          ] as SelectOption<TooltipTrigger>[],
          value: showOn,
          onChange: showOn.set,
        }),
      ),
    ),
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      SectionBlock(
        'Basic Tooltip',
        Group(
          attr.class('justify-center py-8'),
          Button(
            { variant: 'filled', color: 'primary' },
            'Hover me',
            Tooltip({ content: 'This is a basic tooltip!', placement, showOn }),
          ),
        ),
      ),

      SectionBlock(
        'Tooltip Actions',
        Group(
          attr.class('gap-4'),
          Button(
            { variant: 'outline' },
            Icon({ icon: 'lucide:save', size: 'sm' }),
            'Save',
            Tooltip({ content: 'Save your work', placement: 'top', showOn }),
          ),
          Button(
            { variant: 'outline' },
            Icon({ icon: 'lucide:pencil', size: 'sm' }),
            'Edit',
            Tooltip({ content: 'Edit selected item', placement: 'top', showOn }),
          ),
          Button(
            { variant: 'outline', color: 'danger' },
            Icon({ icon: 'lucide:trash-2', size: 'sm' }),
            'Delete',
            Tooltip({ content: 'Permanently delete', placement: 'top', showOn }),
          ),
        ),
      ),

      SectionBlock(
        'Placement Grid',
        html.div(
          attr.class('grid grid-cols-3 gap-4 max-w-sm mx-auto py-4'),
          html.div(),
          Button({ variant: 'light', size: 'sm' }, 'Top', Tooltip({ content: 'Top tooltip', placement: 'top', showOn })),
          html.div(),
          Button({ variant: 'light', size: 'sm' }, 'Left', Tooltip({ content: 'Left tooltip', placement: 'left', showOn })),
          html.div(),
          Button({ variant: 'light', size: 'sm' }, 'Right', Tooltip({ content: 'Right tooltip', placement: 'right', showOn })),
          html.div(),
          Button({ variant: 'light', size: 'sm' }, 'Bottom', Tooltip({ content: 'Bottom tooltip', placement: 'bottom', showOn })),
          html.div(),
        ),
      ),

      SectionBlock(
        'Rich Content',
        Group(
          attr.class('justify-center py-4'),
          Button(
            { variant: 'filled', color: 'secondary' },
            'Rich Tooltip',
            Tooltip({
              content: html.div(
                attr.class('space-y-2 p-1'),
                html.div(attr.class('font-semibold'), 'Rich Tooltip'),
                html.div('Custom HTML content with formatting.'),
                html.div(attr.class('text-xs opacity-75'), 'Keyboard shortcut: Ctrl+K'),
              ),
              placement: 'top',
              showOn,
            }),
          ),
        ),
      ),
    ),
  })
}
