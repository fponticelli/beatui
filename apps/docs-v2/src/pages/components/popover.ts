import { Popover, Button, Icon } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Popover',
  category: 'Overlays',
  component: 'Popover',
  description:
    'A positioned popover panel attached to a trigger element. Placed as a child of the trigger — not a wrapper.',
  icon: 'lucide:message-square-more',
  order: 9,
}

export default function PopoverPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Popover', signals =>
      Button(
        { variant: 'outline' },
        'Click me',
        Popover({
          ...signals,
          content: html.div(
            attr.class('p-4 max-w-xs'),
            html.h4(attr.class('font-semibold mb-2'), 'Popover Title'),
            html.p(
              attr.class('text-sm text-gray-500'),
              'This is the popover body. It can contain any content.'
            )
          ),
        } as never)
      )
    ),
    sections: [
      Section(
        'Basic Popover',
        () =>
          Button(
            { variant: 'filled', color: 'primary' },
            'Show Info',
            Popover({
              content: html.div(
                attr.class('p-4 max-w-xs'),
                html.h4(attr.class('font-semibold mb-2'), 'Information'),
                html.p(
                  attr.class('text-sm text-gray-500'),
                  'Popovers are great for contextual information, user onboarding hints, and rich tooltips.'
                )
              ),
              placement: 'bottom',
              showOn: 'click',
            })
          ),
        'A popover placed as a child of the trigger button. Press Escape or click outside to close.'
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
                Popover({
                  content: html.div(attr.class('p-3 text-sm'), 'Top popover'),
                  placement: 'top',
                })
              )
            ),
            html.div(),
            html.div(
              attr.class('flex justify-center'),
              Button(
                { variant: 'outline', size: 'sm' },
                'Left',
                Popover({
                  content: html.div(attr.class('p-3 text-sm'), 'Left popover'),
                  placement: 'left',
                })
              )
            ),
            html.div(),
            html.div(
              attr.class('flex justify-center'),
              Button(
                { variant: 'outline', size: 'sm' },
                'Right',
                Popover({
                  content: html.div(attr.class('p-3 text-sm'), 'Right popover'),
                  placement: 'right',
                })
              )
            ),
            html.div(),
            html.div(
              attr.class('flex justify-center'),
              Button(
                { variant: 'outline', size: 'sm' },
                'Bottom',
                Popover({
                  content: html.div(attr.class('p-3 text-sm'), 'Bottom popover'),
                  placement: 'bottom',
                })
              )
            ),
            html.div()
          ),
        'Popovers support all Floating UI placement positions.'
      ),
      Section(
        'Hover Trigger',
        () =>
          html.span(
            attr.class('inline-flex items-center gap-1 cursor-help'),
            'Hover for details',
            Icon({ icon: 'lucide:info', size: 'sm' }),
            Popover({
              content: html.div(
                attr.class('p-3 max-w-xs text-sm'),
                'Popovers can also be triggered on hover instead of click.'
              ),
              showOn: 'hover',
              placement: 'top',
            })
          ),
        'Set showOn to "hover" or "hover-focus" for automatic display on cursor entry.'
      ),
      Section(
        'Rich Content',
        () =>
          Button(
            { variant: 'outline' },
            'User Profile',
            Popover({
              content: html.div(
                attr.class('p-4 w-64'),
                html.div(
                  attr.class('flex items-center gap-3 mb-3'),
                  html.div(
                    attr.class(
                      'w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold'
                    ),
                    'JD'
                  ),
                  html.div(
                    html.div(attr.class('font-semibold'), 'John Doe'),
                    html.div(
                      attr.class('text-xs text-gray-500'),
                      'john@example.com'
                    )
                  )
                ),
                html.div(
                  attr.class('text-xs text-gray-500 border-t pt-3'),
                  'Member since January 2024'
                )
              ),
              placement: 'bottom-start',
              showOn: 'click',
            })
          ),
        'Popover content can be any TNode including complex layouts.'
      ),
    ],
  })
}
