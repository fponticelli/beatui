import { Ribbon } from '@tempots/beatui'
import { html, attr, TNode } from '@tempots/dom'
import {
  ComponentPage,
  autoPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Ribbon',
  category: 'Tables & Media',
  component: 'Ribbon',
  description:
    'A diagonal corner ribbon for labeling cards or containers with status tags like "New", "Sale", or "Featured".',
  icon: 'lucide:tag',
  order: 6,
}

function CardWithRibbon(...children: TNode[]) {
  return html.div(
    attr.class('relative w-40 h-32 border rounded-lg bg-gray-50 dark:bg-gray-800 overflow-hidden flex items-center justify-center text-sm text-gray-500'),
    ...children
  )
}

export default function RibbonPage() {
  return ComponentPage(meta, {
    playground: autoPlayground('Ribbon', props =>
      CardWithRibbon(
        Ribbon(props as never, 'New'),
        'Card content'
      )
    ),
    sections: [
      ...AutoSections('Ribbon', props =>
        CardWithRibbon(
          Ribbon(props as never, 'New'),
          'Card'
        )
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4'),
            CardWithRibbon(
              Ribbon({ color: 'primary' }, 'New'),
              'Primary'
            ),
            CardWithRibbon(
              Ribbon({ color: 'success' }, 'Sale'),
              'Success'
            ),
            CardWithRibbon(
              Ribbon({ color: 'danger' }, 'Hot'),
              'Danger'
            ),
            CardWithRibbon(
              Ribbon({ color: 'warning' }, 'Beta'),
              'Warning'
            ),
            CardWithRibbon(
              Ribbon({ color: 'secondary' }, 'Pro'),
              'Secondary'
            )
          ),
        'Use any theme color to convey the semantic meaning of the ribbon label.'
      ),
      Section(
        'Corner Positions',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4'),
            CardWithRibbon(
              Ribbon({ corner: 'top-end', color: 'primary' }, 'Top End'),
              'top-end'
            ),
            CardWithRibbon(
              Ribbon({ corner: 'top-start', color: 'success' }, 'Top Start'),
              'top-start'
            ),
            CardWithRibbon(
              Ribbon({ corner: 'bottom-end', color: 'warning' }, 'Btm End'),
              'bottom-end'
            ),
            CardWithRibbon(
              Ribbon({ corner: 'bottom-start', color: 'danger' }, 'Btm Start'),
              'bottom-start'
            )
          ),
        'Position the ribbon at any of the four corners of the parent container.'
      ),
      Section(
        'Angle Variations',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4'),
            CardWithRibbon(
              Ribbon({ angle: 30, color: 'primary' }, '30°'),
              '30 deg'
            ),
            CardWithRibbon(
              Ribbon({ angle: 45, color: 'info' }, '45°'),
              '45 deg'
            ),
            CardWithRibbon(
              Ribbon({ angle: 60, color: 'success' }, '60°'),
              '60 deg'
            )
          ),
        'Adjust the rotation angle (in degrees) to control the ribbon\'s diagonal slope.'
      ),
      Section(
        'On a Card',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6'),
            html.div(
              attr.class('relative w-56 border rounded-xl overflow-hidden shadow-sm'),
              Ribbon({ color: 'danger', corner: 'top-end' }, 'Sale'),
              html.div(
                attr.class('h-28 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400'),
                'Product image'
              ),
              html.div(
                attr.class('p-3'),
                html.p(attr.class('font-semibold text-sm'), 'Wireless Headphones'),
                html.p(attr.class('text-xs text-gray-400'), '$59.99 (was $89.99)')
              )
            ),
            html.div(
              attr.class('relative w-56 border rounded-xl overflow-hidden shadow-sm'),
              Ribbon({ color: 'primary', corner: 'top-end' }, 'New'),
              html.div(
                attr.class('h-28 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400'),
                'Product image'
              ),
              html.div(
                attr.class('p-3'),
                html.p(attr.class('font-semibold text-sm'), 'Mechanical Keyboard'),
                html.p(attr.class('text-xs text-gray-400'), '$129.99')
              )
            )
          ),
        'The parent container must have position: relative (or overflow: hidden) for the ribbon to be clipped and positioned correctly.'
      ),
    ],
  })
}
