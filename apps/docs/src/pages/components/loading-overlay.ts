import { LoadingOverlay, Button, Card } from '@tempots/beatui'
import { html, attr, prop, Prop, Value } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'LoadingOverlay',
  category: 'Feedback',
  component: 'LoadingOverlay',
  description:
    'A semi-transparent overlay with a centered loading spinner. Place inside a relatively-positioned container to cover its content while loading.',
  icon: 'lucide:loader-circle',
  order: 2,
}

export default function LoadingOverlayPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('LoadingOverlay', signals => {
      const visible = signals.visible as Prop<boolean>
      return html.div(
        attr.class('flex flex-col items-center gap-4 w-full'),
        html.div(
          attr.style('position: relative; min-height: 160px; width: 100%;'),
          attr.class(
            'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6'
          ),
          html.div(
            attr.class('space-y-2'),
            html.p(attr.class('font-medium'), 'Content underneath the overlay'),
            html.p(
              attr.class('text-sm text-gray-500'),
              'This content is hidden when the overlay is visible.'
            )
          ),
          LoadingOverlay({
            ...signals,
            visible,
          } as never)
        ),
        Button(
          {
            variant: 'filled',
            color: 'primary',
            onClick: () => visible.update(v => !v),
          },
          Value.map(visible, v => (v ? 'Hide Overlay' : 'Show Overlay')) as Value<string>
        )
      )
    }),
    sections: [
      Section(
        'Basic Usage',
        () => {
          const loading = prop(false)
          return html.div(
            attr.class('flex flex-col items-center gap-4 w-full max-w-sm'),
            html.div(
              attr.style('position: relative;'),
              attr.class(
                'w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6'
              ),
              html.p('Card content that gets covered while loading.'),
              LoadingOverlay({ visible: loading })
            ),
            Button(
              {
                variant: 'outline',
                onClick: () => loading.update(v => !v),
              },
              Value.map(loading, v => (v ? 'Hide' : 'Show Overlay')) as Value<string>
            )
          )
        },
        'Place LoadingOverlay inside a container with position: relative. When visible is false, the overlay is removed from the DOM entirely.'
      ),
      Section(
        'With Message',
        () => {
          const loading = prop(false)
          return html.div(
            attr.class('flex flex-col items-center gap-4 w-full max-w-sm'),
            html.div(
              attr.style('position: relative;'),
              attr.class(
                'w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6'
              ),
              html.p('Content beneath the overlay with a descriptive message.'),
              LoadingOverlay({ visible: loading, message: 'Saving changes...' })
            ),
            Button(
              {
                variant: 'outline',
                onClick: () => loading.update(v => !v),
              },
              Value.map(loading, v => (v ? 'Hide' : 'Show with Message')) as Value<string>
            )
          )
        },
        'Provide a message to display below the spinner for additional context.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4'),
            ...(['sm', 'md', 'lg', 'xl'] as const).map(size => {
              const loading = prop(true)
              return html.div(
                attr.class('flex flex-col items-center gap-2'),
                html.span(
                  attr.class('text-xs text-gray-500 font-mono'),
                  size
                ),
                html.div(
                  attr.style('position: relative; width: 100px; height: 80px;'),
                  attr.class(
                    'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                  ),
                  LoadingOverlay({ visible: loading, size })
                )
              )
            })
          ),
        'The size prop controls the spinner icon size. Default is lg.'
      ),
      Section(
        'Simulated Async Action',
        () => {
          const loading = prop(false)
          const handleLoad = () => {
            loading.set(true)
            setTimeout(() => loading.set(false), 2000)
          }
          return html.div(
            attr.class('flex flex-col items-center gap-4 w-full max-w-sm'),
            html.div(
              attr.style('position: relative;'),
              attr.class(
                'w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-2'
              ),
              html.p(attr.class('font-medium'), 'User profile'),
              html.p(attr.class('text-sm text-gray-500'), 'Name: Jane Doe'),
              html.p(attr.class('text-sm text-gray-500'), 'Email: jane@example.com'),
              LoadingOverlay({ visible: loading, message: 'Updating profile...' })
            ),
            Button(
              { variant: 'filled', color: 'primary', onClick: handleLoad },
              'Save Profile'
            )
          )
        },
        'Use LoadingOverlay to block interaction during async operations like form submissions.'
      ),
    ],
  })
}
