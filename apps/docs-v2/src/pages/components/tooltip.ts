import { Tooltip, Button, Icon, Badge, Group } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Tooltip',
  category: 'Overlays',
  component: 'Tooltip',
  description: 'A small popup that shows contextual information on hover or focus.',
  icon: 'lucide:message-square',
  order: 3,
}

export default function TooltipPage() {
  return ComponentPage(meta, {
    // Tooltip is a child of the element it annotates
    playground: manualPlayground('Tooltip', signals =>
      Button(
        { variant: 'outline' },
        'Hover me',
        Tooltip({
          ...signals,
          content: 'This is a tooltip',
        } as never)
      )
    ),
    sections: [
      Section(
        'Placements',
        () =>
          html.div(
            attr.class('grid grid-cols-3 gap-4 max-w-lg mx-auto py-8'),
            html.div(),
            html.div(
              attr.class('flex justify-center'),
              Button(
                { variant: 'outline', size: 'sm' },
                'Top',
                Tooltip({ content: 'Placed at top', placement: 'top' })
              )
            ),
            html.div(),
            html.div(
              attr.class('flex justify-center'),
              Button(
                { variant: 'outline', size: 'sm' },
                'Left',
                Tooltip({ content: 'Placed at left', placement: 'left' })
              )
            ),
            html.div(),
            html.div(
              attr.class('flex justify-center'),
              Button(
                { variant: 'outline', size: 'sm' },
                'Right',
                Tooltip({ content: 'Placed at right', placement: 'right' })
              )
            ),
            html.div(),
            html.div(
              attr.class('flex justify-center'),
              Button(
                { variant: 'outline', size: 'sm' },
                'Bottom',
                Tooltip({ content: 'Placed at bottom', placement: 'bottom' })
              )
            ),
            html.div()
          ),
        'Tooltips can be placed on any side of the trigger element.'
      ),
      Section(
        'On Different Elements',
        () =>
          Group(
            attr.class('gap-4 flex-wrap'),
            Button(
              { variant: 'filled', color: 'primary' },
              'Button',
              Tooltip({ content: 'Button tooltip' })
            ),
            Badge(
              { variant: 'filled', color: 'info' },
              'Badge',
              Tooltip({ content: 'Badge info' })
            ),
            html.span(
              attr.class('cursor-help'),
              Icon({ icon: 'lucide:info', size: 'md' }),
              Tooltip({ content: 'Icon action' })
            )
          ),
        'Tooltips work with any element — just add Tooltip as a child.'
      ),
      Section(
        'Rich Content',
        () =>
          Button(
            { variant: 'outline' },
            'Rich Tooltip',
            Tooltip({
              content: html.div(
                html.div(attr.class('font-semibold'), 'Tooltip Title'),
                html.div(
                  attr.class('text-xs opacity-80'),
                  'Tooltips can contain rich HTML content.'
                )
              ),
            })
          ),
        'Tooltip content can be any TNode, not just text.'
      ),
    ],
  })
}
