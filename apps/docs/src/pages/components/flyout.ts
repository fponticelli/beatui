import { Flyout, Button, Icon } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Flyout',
  category: 'Overlays',
  component: 'Flyout',
  description:
    'A positioned floating panel anchored to a trigger element, with configurable trigger modes, placement, delays, and animated transitions.',
  icon: 'lucide:panel-top-open',
  order: 6,
}

export default function FlyoutPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Flyout', signals =>
      Button(
        { variant: 'outline' },
        'Hover me',
        Flyout({
          placement: signals.placement,
          showDelay: signals.showDelay,
          hideDelay: signals.hideDelay,
          mainAxisOffset: signals.mainAxisOffset,
          crossAxisOffset: signals.crossAxisOffset,
          closable: signals.closable,
          content: () =>
            html.div(
              attr.class('p-4 max-w-52'),
              html.h4(attr.class('font-semibold mb-1'), 'Flyout Panel'),
              html.p(
                attr.class('text-sm text-gray-500'),
                'This floating panel is anchored to the trigger.'
              )
            ),
        })
      )
    ),
    sections: [
      Section(
        'Trigger Modes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4'),
            ...(['hover', 'focus', 'hover-focus', 'click'] as const).map(
              showOn =>
                Button(
                  { variant: 'light', size: 'sm' },
                  showOn,
                  Flyout({
                    content: () =>
                      html.div(
                        attr.class('p-3 text-sm'),
                        `Triggered by: ${showOn}`
                      ),
                    showOn,
                    placement: 'bottom',
                  })
                )
            )
          ),
        'Flyouts can appear on hover, focus, both, or click.'
      ),
      Section(
        'Placements',
        () =>
          html.div(
            attr.class('grid grid-cols-3 gap-4 max-w-xs mx-auto py-8'),
            html.div(),
            html.div(
              attr.class('flex justify-center'),
              Button(
                { variant: 'outline', size: 'sm' },
                'Top',
                Flyout({
                  content: () => html.div(attr.class('p-3 text-sm'), 'Top flyout'),
                  placement: 'top',
                  showOn: 'hover',
                })
              )
            ),
            html.div(),
            html.div(
              attr.class('flex justify-center'),
              Button(
                { variant: 'outline', size: 'sm' },
                'Left',
                Flyout({
                  content: () =>
                    html.div(attr.class('p-3 text-sm'), 'Left flyout'),
                  placement: 'left',
                  showOn: 'hover',
                })
              )
            ),
            html.div(),
            html.div(
              attr.class('flex justify-center'),
              Button(
                { variant: 'outline', size: 'sm' },
                'Right',
                Flyout({
                  content: () =>
                    html.div(attr.class('p-3 text-sm'), 'Right flyout'),
                  placement: 'right',
                  showOn: 'hover',
                })
              )
            ),
            html.div(),
            html.div(
              attr.class('flex justify-center'),
              Button(
                { variant: 'outline', size: 'sm' },
                'Bottom',
                Flyout({
                  content: () =>
                    html.div(attr.class('p-3 text-sm'), 'Bottom flyout'),
                  placement: 'bottom',
                  showOn: 'hover',
                })
              )
            ),
            html.div()
          ),
        'Flyouts support all positions relative to the trigger: top, bottom, left, right, and their variants.'
      ),
      Section(
        'Rich Content',
        () =>
          Button(
            { variant: 'filled', color: 'primary' },
            'View Details',
            Flyout({
              content: () =>
                html.div(
                  attr.class('p-4 w-64'),
                  html.div(
                    attr.class('flex items-center gap-2 mb-3'),
                    Icon({ icon: 'lucide:info', size: 'sm', color: 'primary' }),
                    html.h4(attr.class('font-semibold'), 'Product Details')
                  ),
                  html.p(
                    attr.class('text-sm text-gray-500 mb-3'),
                    'Flyout panels can contain any rich content including buttons, lists, and forms.'
                  ),
                  html.div(
                    attr.class('flex gap-2'),
                    Button({ variant: 'filled', size: 'xs', color: 'primary' }, 'Action'),
                    Button({ variant: 'outline', size: 'xs' }, 'Dismiss')
                  )
                ),
              placement: 'bottom',
              showOn: 'click',
            })
          ),
        'Flyout content can be any TNode, including interactive elements.'
      ),
    ],
  })
}
